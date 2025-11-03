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
 * @brief OrderService 訂單服務
 */
type OrderService struct {
	db     *gorm.DB
	logger logger.Logger
}

/**
 * @brief NewOrderService 建立訂單服務實例
 */
func NewOrderService(db *gorm.DB, logger logger.Logger) interfaces.OrderServiceInterface {
	return &OrderService{
		db:     db,
		logger: logger,
	}
}

/**
 * @brief GetOrders 取回訂單列表
 */
func (s *OrderService) GetOrders(userID int, page, size int) (*interfaces.OrderListResponse, error) {
	// 預設分頁參數
	if page < 1 {
		page = 1
	}
	if size < 1 {
		size = 10
	}
	if size > 100 {
		size = 100
	}

	// 計算總數
	var total int64
	query := s.db.Model(&models.Order{}).Where("user_id = ? AND deleted_at IS NULL", userID)
	if err := query.Count(&total).Error; err != nil {
		s.logger.Error("計算訂單總數失敗", zap.Error(err))
		return nil, err
	}

	// 取回資料
	var orders []*models.Order
	offset := (page - 1) * size
	if err := s.db.
		Preload("User").
		Preload("BankCard").
		Preload("BankCard.Bank").
		Preload("PendingOrder").
		Preload("PendingOrder.User").
		Preload("PendingOrder.BankCard").
		Preload("PendingOrder.BankCard.Bank").
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Order("created_at DESC").
		Limit(size).
		Offset(offset).
		Find(&orders).Error; err != nil {
		s.logger.Error("取回訂單列表失敗", zap.Error(err))
		return nil, err
	}

	// 轉換為回應格式
	rows := make([]*interfaces.OrderDetail, 0, len(orders))
	for _, order := range orders {
		rows = append(rows, s.convertToOrderDetail(order))
	}

	return &interfaces.OrderListResponse{
		Rows:  rows,
		Page:  page,
		Size:  size,
		Total: total,
	}, nil
}

/**
 * @brief CreateOrder 建立訂單
 */
func (s *OrderService) CreateOrder(userID int, req *interfaces.CreateOrderRequest) (*interfaces.OrderDetail, error) {
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

	// 解析掛單 ID
	pendingOrderID, err := uuid.Parse(req.OrderID)
	if err != nil {
		return nil, errors.New("掛單 ID 格式錯誤")
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
	if err := tx.Where("id = ? AND deleted_at IS NULL AND status = 0", pendingOrderID).First(&pendingOrder).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("掛單不存在或已暫停")
		}
		return nil, err
	}

	// 驗證不能與自己的掛單交易
	if pendingOrder.UserID != nil && *pendingOrder.UserID == userID {
		tx.Rollback()
		return nil, errors.New("不能與自己的掛單交易")
	}

	// 驗證金額
	if req.Amount < float64(pendingOrder.MinAmount) {
		tx.Rollback()
		return nil, errors.New("交易金額不能小於最小金額")
	}

	if req.Amount > float64(pendingOrder.Balance) {
		tx.Rollback()
		return nil, errors.New("交易金額超過掛單剩餘額度")
	}

	// 驗證受益人銀行卡
	var bankCard models.BankCard
	if err := tx.Where("id = ? AND user_id = ? AND deleted_at IS NULL", req.BeneficiaryBankCardID, userID).First(&bankCard).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("銀行卡不存在或無權操作")
		}
		return nil, err
	}

	// 取得使用者錢包
	var wallet models.Wallet
	if err := tx.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("錢包不存在")
		}
		return nil, err
	}

	// 如果是買幣（掛單 type=1），買家需要有足夠的可用餘額來凍結
	if pendingOrder.Type == 1 {
		if wallet.UsefulBalance < req.Amount {
			tx.Rollback()
			return nil, errors.New("可用餘額不足")
		}

		// 凍結買家金額
		wallet.UsefulBalance -= req.Amount
		wallet.FreezeBalance += req.Amount

		if err := tx.Save(&wallet).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("更新錢包失敗: %w", err)
		}
	}

	// 更新掛單餘額和統計
	amountInt := int64(req.Amount)
	pendingOrder.Balance -= amountInt
	pendingOrder.ProcessAmount += amountInt
	pendingOrder.ProcessCount += 1

	if err := tx.Save(&pendingOrder).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("更新掛單失敗: %w", err)
	}

	// 計算預期完成時間
	expectedFinishAt := time.Now().Add(time.Duration(pendingOrder.TransactionMinutes) * time.Minute)

	// 建立訂單
	order := &models.Order{
		ID:               uuid.New(),
		UserID:           userID,
		PendingOrderID:   pendingOrderID,
		BankCardID:       req.BeneficiaryBankCardID,
		Status:           0, // 0: 等待匯款
		Amount:           req.Amount,
		ExpectedFinishAt: expectedFinishAt,
	}

	if err := tx.Create(order).Error; err != nil {
		tx.Rollback()
		s.logger.Error("建立訂單失敗", zap.Error(err))
		return nil, fmt.Errorf("建立訂單失敗: %w", err)
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
		Preload("PendingOrder").
		Preload("PendingOrder.User").
		Preload("PendingOrder.BankCard").
		Preload("PendingOrder.BankCard.Bank").
		Where("id = ?", order.ID).
		First(order).Error; err != nil {
		return nil, err
	}

	return s.convertToOrderDetail(order), nil
}

/**
 * @brief MarkAsPaid 標記已付款
 */
func (s *OrderService) MarkAsPaid(userID int, orderID string) (*interfaces.OrderDetail, error) {
	// 解析 UUID
	id, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("訂單 ID 格式錯誤")
	}

	// 查詢訂單
	var order models.Order
	if err := s.db.Where("id = ? AND user_id = ? AND deleted_at IS NULL", id, userID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("訂單不存在或無權操作")
		}
		return nil, err
	}

	// 檢查訂單狀態
	if order.Status != 0 {
		return nil, errors.New("訂單狀態不正確")
	}

	// 更新狀態為 1（已匯款未放行）
	if err := s.db.Model(&order).Update("status", 1).Error; err != nil {
		s.logger.Error("標記已付款失敗", zap.Error(err))
		return nil, fmt.Errorf("標記已付款失敗: %w", err)
	}

	// 重新查詢完整資料
	if err := s.db.
		Preload("User").
		Preload("BankCard").
		Preload("BankCard.Bank").
		Preload("PendingOrder").
		Preload("PendingOrder.User").
		Preload("PendingOrder.BankCard").
		Preload("PendingOrder.BankCard.Bank").
		Where("id = ?", order.ID).
		First(&order).Error; err != nil {
		return nil, err
	}

	return s.convertToOrderDetail(&order), nil
}

/**
 * @brief ApplyOrder 放行
 */
func (s *OrderService) ApplyOrder(userID int, orderID string) (*interfaces.OrderDetail, error) {
	// 解析 UUID
	id, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("訂單 ID 格式錯誤")
	}

	// 開始交易
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 查詢訂單
	var order models.Order
	if err := tx.
		Preload("PendingOrder").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&order).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("訂單不存在")
		}
		return nil, err
	}

	// 驗證權限：只有掛單創建者可以放行
	if order.PendingOrder == nil || order.PendingOrder.UserID == nil || *order.PendingOrder.UserID != userID {
		tx.Rollback()
		return nil, errors.New("無權操作此訂單")
	}

	// 檢查訂單狀態
	if order.Status != 1 {
		tx.Rollback()
		return nil, errors.New("訂單狀態不正確")
	}

	// 更新訂單狀態為 2（已放行）
	now := time.Now()
	if err := tx.Model(&order).Updates(map[string]interface{}{
		"status":    2,
		"finish_at": now,
	}).Error; err != nil {
		tx.Rollback()
		s.logger.Error("放行訂單失敗", zap.Error(err))
		return nil, fmt.Errorf("放行訂單失敗: %w", err)
	}

	// 更新掛單統計
	var pendingOrder models.PendingOrder
	if err := tx.Where("id = ?", order.PendingOrderID).First(&pendingOrder).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	amountInt := int64(order.Amount)
	pendingOrder.ProcessAmount -= amountInt
	pendingOrder.DoneAmount += amountInt
	pendingOrder.ProcessCount -= 1
	pendingOrder.DoneCount += 1

	if err := tx.Save(&pendingOrder).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("更新掛單失敗: %w", err)
	}

	// 處理金額轉移
	// 買家錢包
	var buyerWallet models.Wallet
	if err := tx.Where("user_id = ?", order.UserID).First(&buyerWallet).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 賣家錢包
	if pendingOrder.UserID == nil {
		tx.Rollback()
		return nil, errors.New("掛單創建者不存在")
	}
	var sellerWallet models.Wallet
	if err := tx.Where("user_id = ?", *pendingOrder.UserID).First(&sellerWallet).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 根據掛單類型處理金額
	if pendingOrder.Type == 0 {
		// 買幣掛單：賣家（掛單者）的凍結金額轉給買家（訂單創建者）
		sellerWallet.FreezeBalance -= order.Amount
		buyerWallet.UsefulBalance += order.Amount
	} else {
		// 賣幣掛單：買家（訂單創建者）的凍結金額轉給賣家（掛單者）
		buyerWallet.FreezeBalance -= order.Amount
		sellerWallet.UsefulBalance += order.Amount
	}

	if err := tx.Save(&buyerWallet).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("更新買家錢包失敗: %w", err)
	}

	if err := tx.Save(&sellerWallet).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("更新賣家錢包失敗: %w", err)
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
		Preload("PendingOrder").
		Preload("PendingOrder.User").
		Preload("PendingOrder.BankCard").
		Preload("PendingOrder.BankCard.Bank").
		Where("id = ?", order.ID).
		First(&order).Error; err != nil {
		return nil, err
	}

	return s.convertToOrderDetail(&order), nil
}

/**
 * @brief RejectOrder 取消訂單
 */
func (s *OrderService) RejectOrder(userID int, orderID string, req *interfaces.RejectOrderRequest) (*interfaces.OrderDetail, error) {
	// 解析 UUID
	id, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("訂單 ID 格式錯誤")
	}

	// 開始交易
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 查詢訂單
	var order models.Order
	if err := tx.
		Preload("PendingOrder").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&order).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("訂單不存在")
		}
		return nil, err
	}

	// 驗證權限：訂單創建者或掛單創建者都可以取消
	isPendingOrderOwner := order.PendingOrder != nil && order.PendingOrder.UserID != nil && *order.PendingOrder.UserID == userID
	isOrderOwner := order.UserID == userID

	if !isPendingOrderOwner && !isOrderOwner {
		tx.Rollback()
		return nil, errors.New("無權操作此訂單")
	}

	// 檢查訂單狀態（只有狀態 0 或 1 可以取消）
	if order.Status != 0 && order.Status != 1 {
		tx.Rollback()
		return nil, errors.New("訂單狀態不正確，無法取消")
	}

	// 決定取消狀態：3: 買家已取消, 4: 賣家已取消
	cancelStatus := 3
	if isPendingOrderOwner {
		cancelStatus = 4
	}

	// 更新訂單狀態
	if err := tx.Model(&order).Updates(map[string]interface{}{
		"status":        cancelStatus,
		"cancel_reason": req.CancelReason,
	}).Error; err != nil {
		tx.Rollback()
		s.logger.Error("取消訂單失敗", zap.Error(err))
		return nil, fmt.Errorf("取消訂單失敗: %w", err)
	}

	// 更新掛單統計
	var pendingOrder models.PendingOrder
	if err := tx.Where("id = ?", order.PendingOrderID).First(&pendingOrder).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	amountInt := int64(order.Amount)
	pendingOrder.Balance += amountInt
	pendingOrder.ProcessAmount -= amountInt
	pendingOrder.CancelAmount += amountInt
	pendingOrder.ProcessCount -= 1
	pendingOrder.CancelCount += 1

	if err := tx.Save(&pendingOrder).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("更新掛單失敗: %w", err)
	}

	// 解凍金額
	// 買家錢包
	var buyerWallet models.Wallet
	if err := tx.Where("user_id = ?", order.UserID).First(&buyerWallet).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// 根據掛單類型解凍
	if pendingOrder.Type == 1 {
		// 賣幣掛單：解凍買家的金額
		buyerWallet.FreezeBalance -= order.Amount
		buyerWallet.UsefulBalance += order.Amount

		if err := tx.Save(&buyerWallet).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("更新買家錢包失敗: %w", err)
		}
	}
	// 如果是買幣掛單（type=0），賣家的凍結金額在掛單中，不需要在這裡處理

	// 提交交易
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("提交交易失敗: %w", err)
	}

	// 重新查詢完整資料
	if err := s.db.
		Preload("User").
		Preload("BankCard").
		Preload("BankCard.Bank").
		Preload("PendingOrder").
		Preload("PendingOrder.User").
		Preload("PendingOrder.BankCard").
		Preload("PendingOrder.BankCard.Bank").
		Where("id = ?", order.ID).
		First(&order).Error; err != nil {
		return nil, err
	}

	return s.convertToOrderDetail(&order), nil
}

/**
 * @brief convertToOrderDetail 轉換 Order 模型為 OrderDetail
 */
func (s *OrderService) convertToOrderDetail(order *models.Order) *interfaces.OrderDetail {
	detail := &interfaces.OrderDetail{
		ID:        order.ID.String(),
		Status:    order.Status,
		Amount:    order.Amount,
		CreatedAt: order.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	// 取消原因
	if order.CancelReason != nil {
		detail.CancelReason = *order.CancelReason
	}

	// 完成時間
	if order.FinishAt != nil {
		detail.FinishAt = order.FinishAt.Format("2006-01-02 15:04:05")
	}

	// 使用者資訊
	if order.User != nil {
		detail.User = &interfaces.SimpleUser{
			ID:   order.User.ID,
			Name: order.User.Name,
		}
	}

	// 銀行卡資訊
	if order.BankCard != nil {
		bankID := 0
		if order.BankCard.BankID != nil {
			bankID = *order.BankCard.BankID
		}

		status := 0
		if order.BankCard.Status != "" {
			fmt.Sscanf(order.BankCard.Status, "%d", &status)
		}

		detail.BankCard = &interfaces.BankCardDetail{
			ID:         order.BankCard.ID,
			CreatedAt:  order.BankCard.CreatedAt.Format("2006-01-02 15:04:05"),
			Name:       order.BankCard.Name,
			CardNumber: order.BankCard.CardNumber,
			BankID:     bankID,
			BranchName: order.BankCard.BranchName,
			Status:     status,
		}

		if order.BankCard.Bank != nil {
			detail.BankCard.Bank = &interfaces.BankDetail{
				ID:       order.BankCard.Bank.ID,
				BankName: order.BankCard.Bank.BankName,
				BankCode: order.BankCard.Bank.BankCode,
			}
		}
	}

	// 掛單資訊
	if order.PendingOrder != nil {
		po := order.PendingOrder
		detail.PendingOrder = &interfaces.PendingOrderDetail{
			ID:                 po.ID.String(),
			IsSplit:            po.IsSplit,
			Type:               po.Type,
			Status:             po.Status,
			Amount:             float64(po.Amount),
			MinAmount:          float64(po.MinAmount),
			Balance:            float64(po.Balance),
			TransactionMinutes: po.TransactionMinutes,
			CreatedAt:          po.CreatedAt.Format("2006-01-02 15:04:05"),
			CancelAmount:       float64(po.CancelAmount),
			DoneAmount:         float64(po.DoneAmount),
			ProcessAmount:      float64(po.ProcessAmount),
			ProcessCount:       po.ProcessCount,
			DoneCount:          po.DoneCount,
			CancelCount:        po.CancelCount,
		}

		if po.User != nil {
			detail.PendingOrder.User = &interfaces.SimpleUser{
				ID:   po.User.ID,
				Name: po.User.Name,
			}
		}

		if po.BankCard != nil {
			bankID := 0
			if po.BankCard.BankID != nil {
				bankID = *po.BankCard.BankID
			}

			status := 0
			if po.BankCard.Status != "" {
				fmt.Sscanf(po.BankCard.Status, "%d", &status)
			}

			detail.PendingOrder.BankCard = &interfaces.BankCardDetail{
				ID:         po.BankCard.ID,
				CreatedAt:  po.BankCard.CreatedAt.Format("2006-01-02 15:04:05"),
				Name:       po.BankCard.Name,
				CardNumber: po.BankCard.CardNumber,
				BankID:     bankID,
				BranchName: po.BankCard.BranchName,
				Status:     status,
			}

			if po.BankCard.Bank != nil {
				detail.PendingOrder.BankCard.Bank = &interfaces.BankDetail{
					ID:       po.BankCard.Bank.ID,
					BankName: po.BankCard.Bank.BankName,
					BankCode: po.BankCard.Bank.BankCode,
				}
			}
		}
	}

	return detail
}

var OrderModule = fx.Module("order",
	fx.Provide(fx.Annotate(NewOrderService, fx.As(new(interfaces.OrderServiceInterface)))),
)

