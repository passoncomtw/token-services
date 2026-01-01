package services

import (
	"errors"
	"time"

	"passontw-backend-services/cmd/token-admin-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/models"

	"github.com/google/uuid"
	"go.uber.org/fx"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// PendingOrderService 掛單服務
type PendingOrderService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewPendingOrderService 建立新的掛單服務
func NewPendingOrderService(db *gorm.DB, log logger.Logger) *PendingOrderService {
	return &PendingOrderService{
		db:     db,
		logger: log.With(zap.String("service", "PendingOrderService")),
	}
}

// GetList 取得掛單列表
func (s *PendingOrderService) GetList(query *interfaces.PendingOrderListQuery) ([]*interfaces.PendingOrderResponse, int64, error) {
	// 設定預設值
	if query.Page == 0 {
		query.Page = 1
	}
	if query.Size == 0 {
		query.Size = 10
	}

	// 建立基礎查詢
	db := s.db.Model(&models.PendingOrder{})

	// 掛單 ID 過濾
	if query.PendingOrderID != "" {
		if poUUID, err := uuid.Parse(query.PendingOrderID); err == nil {
			db = db.Where("pending_orders.id = ?", poUUID)
		}
	}

	// 類型過濾
	if query.Type != nil {
		db = db.Where("pending_orders.type = ?", *query.Type)
	}

	// 狀態過濾
	if query.Status != nil {
		db = db.Where("pending_orders.status = ?", *query.Status)
	}

	// 金額範圍過濾
	if query.MinAmount != nil {
		db = db.Where("pending_orders.amount >= ?", *query.MinAmount)
	}
	if query.MaxAmount != nil {
		db = db.Where("pending_orders.amount <= ?", *query.MaxAmount)
	}

	// 餘額範圍過濾
	if query.MinBalance != nil {
		db = db.Where("pending_orders.balance >= ?", *query.MinBalance)
	}
	if query.MaxBalance != nil {
		db = db.Where("pending_orders.balance <= ?", *query.MaxBalance)
	}

	// 時間範圍過濾
	if query.StartAt != "" {
		if startTime, err := time.Parse("2006-01-02 15:04:05", query.StartAt); err == nil {
			db = db.Where("pending_orders.created_at >= ?", startTime)
		}
	}
	if query.EndAt != "" {
		if endTime, err := time.Parse("2006-01-02 15:04:05", query.EndAt); err == nil {
			db = db.Where("pending_orders.created_at <= ?", endTime)
		}
	}

	// 使用者相關過濾
	if query.Account != "" || query.UserID != nil {
		db = db.Joins("User")
		if query.Account != "" {
			db = db.Where("User.account LIKE ?", "%"+query.Account+"%")
		}
		if query.UserID != nil {
			db = db.Where("User.id = ?", *query.UserID)
		}
	}

	// 查詢總數
	var totalCount int64
	countDB := db.Session(&gorm.Session{})
	if err := countDB.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	// 分頁查詢
	offset := (query.Page - 1) * query.Size
	var pendingOrders []models.PendingOrder
	if err := db.Preload("User").Preload("BankCard").
		Order("pending_orders.created_at DESC").
		Offset(offset).Limit(query.Size).
		Find(&pendingOrders).Error; err != nil {
		return nil, 0, err
	}

	// 轉換為回應格式
	var rows []*interfaces.PendingOrderResponse
	for _, po := range pendingOrders {
		rows = append(rows, interfaces.ConvertToPendingOrderResponse(&po))
	}

	return rows, totalCount, nil
}

// Stop 暫停掛單
func (s *PendingOrderService) Stop(pendingOrderID string) error {
	// 解析 UUID
	poUUID, err := uuid.Parse(pendingOrderID)
	if err != nil {
		return errors.New("掛單 ID 格式錯誤")
	}

	// 查詢掛單
	var pendingOrder models.PendingOrder
	if err := s.db.First(&pendingOrder, "id = ?", poUUID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("掛單不存在")
		}
		return err
	}

	// 檢查掛單狀態
	if pendingOrder.Status == 1 {
		return errors.New("掛單已暫停")
	}
	if pendingOrder.Status == 2 || pendingOrder.Status == 3 {
		return errors.New("掛單已取消或刪除")
	}

	// 更新狀態為暫停（1）
	pendingOrder.Status = 1
	return s.db.Save(&pendingOrder).Error
}

// Open 開啟掛單
func (s *PendingOrderService) Open(pendingOrderID string) error {
	// 解析 UUID
	poUUID, err := uuid.Parse(pendingOrderID)
	if err != nil {
		return errors.New("掛單 ID 格式錯誤")
	}

	// 查詢掛單
	var pendingOrder models.PendingOrder
	if err := s.db.First(&pendingOrder, "id = ?", poUUID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("掛單不存在")
		}
		return err
	}

	// 檢查掛單狀態
	if pendingOrder.Status == 0 {
		return errors.New("掛單已開啟")
	}
	if pendingOrder.Status == 2 || pendingOrder.Status == 3 {
		return errors.New("掛單已取消或刪除")
	}

	// 更新狀態為掛單中（0）
	pendingOrder.Status = 0
	return s.db.Save(&pendingOrder).Error
}

// Cancel 取消掛單
func (s *PendingOrderService) Cancel(pendingOrderID string) error {
	// 解析 UUID
	poUUID, err := uuid.Parse(pendingOrderID)
	if err != nil {
		return errors.New("掛單 ID 格式錯誤")
	}

	// 查詢掛單
	var pendingOrder models.PendingOrder
	if err := s.db.First(&pendingOrder, "id = ?", poUUID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("掛單不存在")
		}
		return err
	}

	// 檢查掛單狀態
	if pendingOrder.Status == 2 {
		return errors.New("掛單已取消")
	}
	if pendingOrder.Status == 3 {
		return errors.New("掛單已刪除")
	}

	// 使用事務取消掛單
	err = s.db.Transaction(func(tx *gorm.DB) error {
		// 更新狀態為取消（2）
		pendingOrder.Status = 2

		if err := tx.Save(&pendingOrder).Error; err != nil {
			return err
		}

		// TODO: 這裡可以添加其他業務邏輯，例如：
		// - 退還保證金
		// - 發送通知等

		return nil
	})

	return err
}

// Delete 刪除掛單（軟刪除）
func (s *PendingOrderService) Delete(pendingOrderID string) error {
	// 解析 UUID
	poUUID, err := uuid.Parse(pendingOrderID)
	if err != nil {
		return errors.New("掛單 ID 格式錯誤")
	}

	// 查詢掛單
	var pendingOrder models.PendingOrder
	if err := s.db.First(&pendingOrder, "id = ?", poUUID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("掛單不存在")
		}
		return err
	}

	// 檢查掛單狀態（可以刪除任何狀態的掛單）
	// 如果需要限制，可以添加狀態檢查

	// 軟刪除掛單（GORM 會自動設置 DeletedAt）
	return s.db.Delete(&pendingOrder).Error
}

// PendingOrderModule FX module
var PendingOrderModule = fx.Module("pendingOrder",
	fx.Provide(fx.Annotate(NewPendingOrderService, fx.As(new(interfaces.PendingOrderServiceInterface)))),
)
