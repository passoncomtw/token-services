package services

import (
	"errors"
	"fmt"
	"time"

	"token-services/cmd/token-app-api/internal/interfaces"
	"token-services/pkg/logger"
	"token-services/pkg/models"

	"github.com/google/uuid"
	"go.uber.org/fx"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

/**
 * @brief PendingOrderService 掛單服務
 */
type PendingOrderService struct {
	db     *gorm.DB
	logger logger.Logger
}

/**
 * @brief NewPendingOrderService 建立掛單服務實例
 */
func NewPendingOrderService(db *gorm.DB, logger logger.Logger) interfaces.PendingOrderServiceInterface {
	return &PendingOrderService{
		db:     db,
		logger: logger,
	}
}

/**
 * @brief GetPendingOrders 取回掛單列表
 */
func (s *PendingOrderService) GetPendingOrders(filter *interfaces.PendingOrderFilter) (*interfaces.PendingOrderListResponse, error) {
	// 預設分頁參數
	page := filter.Page
	if page < 1 {
		page = 1
	}
	size := filter.Size
	if size < 1 {
		size = 10
	}
	if size > 100 {
		size = 100
	}

	// 建立查詢
	query := s.db.Model(&models.PendingOrder{}).Where("deleted_at IS NULL")

	// 類型篩選
	if filter.Type != nil {
		query = query.Where("type = ?", *filter.Type)
	}

	// 餘額篩選
	if filter.Balance != nil {
		balanceInt := int64(*filter.Balance)
		query = query.Where("balance >= ?", balanceInt)
	}

	// 只顯示狀態 0（掛賣中）的掛單
	query = query.Where("status = ?", 0)

	// 計算總數
	var total int64
	if err := query.Count(&total).Error; err != nil {
		s.logger.Error("計算掛單總數失敗", zap.Error(err))
		return nil, err
	}

	// 取回資料
	var pendingOrders []*models.PendingOrder
	offset := (page - 1) * size
	if err := query.
		Preload("User").
		Preload("BankCard").
		Preload("BankCard.Bank").
		Order("created_at DESC").
		Limit(size).
		Offset(offset).
		Find(&pendingOrders).Error; err != nil {
		s.logger.Error("取回掛單列表失敗", zap.Error(err))
		return nil, err
	}

	// 轉換為回應格式
	rows := make([]*interfaces.PendingOrderDetail, 0, len(pendingOrders))
	for _, po := range pendingOrders {
		rows = append(rows, s.convertToPendingOrderDetail(po, false))
	}

	return &interfaces.PendingOrderListResponse{
		Rows:  rows,
		Page:  page,
		Size:  size,
		Total: total,
	}, nil
}

/**
 * @brief GetPendingOrder 取回掛單詳情
 */
func (s *PendingOrderService) GetPendingOrder(pendingOrderID string) (*interfaces.PendingOrderDetail, error) {
	// 解析 UUID
	id, err := uuid.Parse(pendingOrderID)
	if err != nil {
		return nil, errors.New("掛單 ID 格式錯誤")
	}

	// 查詢掛單
	var pendingOrder models.PendingOrder
	if err := s.db.
		Preload("User").
		Preload("BankCard").
		Preload("BankCard.Bank").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&pendingOrder).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("掛單不存在")
		}
		s.logger.Error("取回掛單詳情失敗", zap.Error(err), zap.String("id", pendingOrderID))
		return nil, err
	}

	return s.convertToPendingOrderDetail(&pendingOrder, true), nil
}

/**
 * @brief CreatePendingOrder 建立掛單
 */
func (s *PendingOrderService) CreatePendingOrder(userID int, req *interfaces.CreatePendingOrderRequest) (*interfaces.PendingOrderDetail, error) {
	// 驗證交易密碼
	var user models.User
	if err := s.db.Where("id = ? AND deleted_at IS NULL", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	// 檢查交易密碼
	if err := bcrypt.CompareHashAndPassword([]byte(user.TransactionCode), []byte(req.TransactionCode)); err != nil {
		return nil, errors.New("交易密碼錯誤")
	}

	// 驗證銀行卡
	var bankCard models.BankCard
	if err := s.db.
		Preload("Bank").
		Where("id = ? AND user_id = ? AND deleted_at IS NULL", req.BankCardID, userID).
		First(&bankCard).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("銀行卡不存在或無權操作")
		}
		return nil, err
	}

	// 驗證金額
	if req.MinAmount > req.Amount {
		return nil, errors.New("最小金額不能大於掛單金額")
	}

	// 開始交易
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 取得使用者錢包
	var wallet models.Wallet
	if err := tx.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("錢包不存在")
		}
		return nil, err
	}

	// 如果是賣幣（type=1），需要凍結金額
	if req.Type == 1 {
		// 轉換為 int64（以分為單位）
		amountInt := int64(req.Amount)

		// 檢查可用餘額
		if wallet.UsefulBalance < float64(amountInt) {
			tx.Rollback()
			return nil, errors.New("可用餘額不足")
		}

		// 凍結金額
		wallet.UsefulBalance -= float64(amountInt)
		wallet.FreezeBalance += float64(amountInt)

		if err := tx.Save(&wallet).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("更新錢包失敗: %w", err)
		}
	}

	// 建立掛單
	bankCardIDPtr := &req.BankCardID
	userIDPtr := &userID
	pendingOrder := &models.PendingOrder{
		ID:                 uuid.New(),
		UserID:             userIDPtr,
		BankCardID:         bankCardIDPtr,
		Type:               req.Type,
		Status:             0, // 0: 掛賣中
		TransactionMinutes: req.TransactionMinutes,
		MinAmount:          int64(req.MinAmount),
		Amount:             int64(req.Amount),
		Balance:            int64(req.Amount),
		ProcessAmount:      0,
		CancelAmount:       0,
		DoneAmount:         0,
		ProcessCount:       0,
		CancelCount:        0,
		DoneCount:          0,
		IsSplit:            true, // 預設可以拆單
	}

	if err := tx.Create(pendingOrder).Error; err != nil {
		tx.Rollback()
		s.logger.Error("建立掛單失敗", zap.Error(err))
		return nil, fmt.Errorf("建立掛單失敗: %w", err)
	}

	// 提交交易
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("提交交易失敗: %w", err)
	}

	// 重新查詢完整資料
	if err := s.db.
		Preload("User").
		Preload("BankCard").
		Preload("BankCard.Bank").
		Where("id = ?", pendingOrder.ID).
		First(pendingOrder).Error; err != nil {
		return nil, err
	}

	return s.convertToPendingOrderDetail(pendingOrder, true), nil
}

/**
 * @brief DeletePendingOrder 刪除掛單
 */
func (s *PendingOrderService) DeletePendingOrder(userID int, pendingOrderID string) error {
	// 解析 UUID
	id, err := uuid.Parse(pendingOrderID)
	if err != nil {
		return errors.New("掛單 ID 格式錯誤")
	}

	// 開始交易
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 查詢掛單
	var pendingOrder models.PendingOrder
	if err := tx.Where("id = ? AND user_id = ? AND deleted_at IS NULL", id, userID).First(&pendingOrder).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			return errors.New("掛單不存在或無權操作")
		}
		return err
	}

	// TODO: 檢查是否有進行中的訂單
	// 如果有進行中的訂單，不能刪除

	// 如果是賣幣（type=1），需要解凍金額
	if pendingOrder.Type == 1 && pendingOrder.Balance > 0 {
		var wallet models.Wallet
		if err := tx.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
			tx.Rollback()
			return err
		}

		// 解凍餘額
		balance := float64(pendingOrder.Balance)
		wallet.FreezeBalance -= balance
		wallet.UsefulBalance += balance

		if err := tx.Save(&wallet).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("更新錢包失敗: %w", err)
		}
	}

	// 軟刪除掛單
	now := time.Now()
	if err := tx.Model(&pendingOrder).Update("deleted_at", now).Error; err != nil {
		tx.Rollback()
		s.logger.Error("刪除掛單失敗", zap.Error(err))
		return fmt.Errorf("刪除掛單失敗: %w", err)
	}

	// 提交交易
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("提交交易失敗: %w", err)
	}

	return nil
}

/**
 * @brief LockPendingOrder 凍結掛單
 */
func (s *PendingOrderService) LockPendingOrder(userID int, pendingOrderID string) error {
	// 解析 UUID
	id, err := uuid.Parse(pendingOrderID)
	if err != nil {
		return errors.New("掛單 ID 格式錯誤")
	}

	// 查詢掛單
	var pendingOrder models.PendingOrder
	if err := s.db.Where("id = ? AND user_id = ? AND deleted_at IS NULL", id, userID).First(&pendingOrder).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("掛單不存在或無權操作")
		}
		return err
	}

	// 檢查狀態
	if pendingOrder.Status == 1 {
		return errors.New("掛單已經被凍結")
	}

	// 更新狀態為 1（已暫停掛賣）
	if err := s.db.Model(&pendingOrder).Update("status", 1).Error; err != nil {
		s.logger.Error("凍結掛單失敗", zap.Error(err))
		return fmt.Errorf("凍結掛單失敗: %w", err)
	}

	return nil
}

/**
 * @brief UnlockPendingOrder 解除凍結掛單
 */
func (s *PendingOrderService) UnlockPendingOrder(userID int, pendingOrderID string) error {
	// 解析 UUID
	id, err := uuid.Parse(pendingOrderID)
	if err != nil {
		return errors.New("掛單 ID 格式錯誤")
	}

	// 查詢掛單
	var pendingOrder models.PendingOrder
	if err := s.db.Where("id = ? AND user_id = ? AND deleted_at IS NULL", id, userID).First(&pendingOrder).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("掛單不存在或無權操作")
		}
		return err
	}

	// 檢查狀態
	if pendingOrder.Status != 1 {
		return errors.New("掛單未被凍結")
	}

	// 更新狀態為 0（掛賣中）
	if err := s.db.Model(&pendingOrder).Update("status", 0).Error; err != nil {
		s.logger.Error("解除凍結掛單失敗", zap.Error(err))
		return fmt.Errorf("解除凍結掛單失敗: %w", err)
	}

	return nil
}

/**
 * @brief GetUserPendingOrders 取回使用者自己的掛單
 */
func (s *PendingOrderService) GetUserPendingOrders(userID int) (*interfaces.UserPendingOrdersResponse, error) {
	var pendingOrders []*models.PendingOrder

	// 查詢使用者的掛單（買幣和賣幣各一筆最新的）
	if err := s.db.
		Preload("User").
		Preload("BankCard").
		Preload("BankCard.Bank").
		Where("user_id = ? AND deleted_at IS NULL AND status IN (0, 1)", userID).
		Order("created_at DESC").
		Find(&pendingOrders).Error; err != nil {
		s.logger.Error("取回使用者掛單失敗", zap.Error(err))
		return nil, err
	}

	response := &interfaces.UserPendingOrdersResponse{}

	// 分類為買幣和賣幣
	for _, po := range pendingOrders {
		detail := s.convertToPendingOrderDetail(po, true)
		if po.Type == 0 && response.Buy == nil {
			response.Buy = detail
		} else if po.Type == 1 && response.Sell == nil {
			response.Sell = detail
		}

		// 如果已經找到買幣和賣幣各一筆，就跳出
		if response.Buy != nil && response.Sell != nil {
			break
		}
	}

	return response, nil
}

/**
 * @brief convertToPendingOrderDetail 轉換 PendingOrder 模型為 PendingOrderDetail
 * @param po PendingOrder 模型
 * @param includeStats 是否包含統計資訊
 */
func (s *PendingOrderService) convertToPendingOrderDetail(po *models.PendingOrder, includeStats bool) *interfaces.PendingOrderDetail {
	detail := &interfaces.PendingOrderDetail{
		ID:                 po.ID.String(),
		IsSplit:            po.IsSplit,
		Type:               po.Type,
		Status:             po.Status,
		Amount:             float64(po.Amount),
		MinAmount:          float64(po.MinAmount),
		Balance:            float64(po.Balance),
		TransactionMinutes: po.TransactionMinutes,
		CreatedAt:          po.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	// 使用者資訊
	if po.User != nil {
		detail.User = &interfaces.SimpleUser{
			ID:   po.User.ID,
			Name: po.User.Name,
		}
	}

	// 銀行卡資訊
	if po.BankCard != nil {
		bankID := 0
		if po.BankCard.BankID != nil {
			bankID = *po.BankCard.BankID
		}

		status := 0
		if po.BankCard.Status != "" {
			fmt.Sscanf(po.BankCard.Status, "%d", &status)
		}

		detail.BankCard = &interfaces.BankCardDetail{
			ID:         po.BankCard.ID,
			CreatedAt:  po.BankCard.CreatedAt.Format("2006-01-02 15:04:05"),
			Name:       po.BankCard.Name,
			CardNumber: po.BankCard.CardNumber,
			BankID:     bankID,
			BranchName: po.BankCard.BranchName,
			Status:     status,
		}

		// 銀行資訊
		if po.BankCard.Bank != nil {
			detail.BankCard.Bank = &interfaces.BankDetail{
				ID:       po.BankCard.Bank.ID,
				BankName: po.BankCard.Bank.BankName,
				BankCode: po.BankCard.Bank.BankCode,
			}
		}
	}

	// 統計資訊
	if includeStats {
		detail.CancelAmount = float64(po.CancelAmount)
		detail.DoneAmount = float64(po.DoneAmount)
		detail.ProcessAmount = float64(po.ProcessAmount)
		detail.ProcessCount = po.ProcessCount
		detail.DoneCount = po.DoneCount
		detail.CancelCount = po.CancelCount
	}

	return detail
}

var PendingOrderModule = fx.Module("pendingorder",
	fx.Provide(fx.Annotate(NewPendingOrderService, fx.As(new(interfaces.PendingOrderServiceInterface)))),
)
