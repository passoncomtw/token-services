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

// OrderService 訂單服務
type OrderService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewOrderService 建立新的訂單服務
func NewOrderService(db *gorm.DB, log logger.Logger) *OrderService {
	return &OrderService{
		db:     db,
		logger: log.With(zap.String("service", "OrderService")),
	}
}

// GetList 取得訂單列表
func (s *OrderService) GetList(query *interfaces.OrderListQuery) (*interfaces.OrderListResponse, error) {
	// 設定預設值
	if query.Page == 0 {
		query.Page = 1
	}
	if query.Size == 0 {
		query.Size = 10
	}

	// 建立基礎查詢
	db := s.db.Model(&models.Order{})

	// 訂單 ID 過濾
	if query.OrderID != "" {
		// 嘗試解析為 UUID
		if orderUUID, err := uuid.Parse(query.OrderID); err == nil {
			db = db.Where("orders.id = ?", orderUUID)
		}
	}

	// 狀態過濾
	if query.Status != nil {
		db = db.Where("orders.status = ?", *query.Status)
	}

	// 金額範圍過濾
	if query.MinAmount != nil {
		db = db.Where("orders.amount >= ?", *query.MinAmount)
	}
	if query.MaxAmount != nil {
		db = db.Where("orders.amount <= ?", *query.MaxAmount)
	}

	// 取消原因過濾
	if query.CancelReason != "" {
		db = db.Where("orders.cancel_reason LIKE ?", "%"+query.CancelReason+"%")
	}

	// 時間範圍過濾
	if query.StartAt != "" {
		if startTime, err := time.Parse("2006-01-02 15:04:05", query.StartAt); err == nil {
			db = db.Where("orders.created_at >= ?", startTime)
		}
	}
	if query.EndAt != "" {
		if endTime, err := time.Parse("2006-01-02 15:04:05", query.EndAt); err == nil {
			db = db.Where("orders.created_at <= ?", endTime)
		}
	}

	// 交易時間類型過濾
	if query.FinishAtType != "" {
		now := time.Now()
		if query.FinishAtType == "overdue" {
			// 逾期：expected_finish_at < now 且 finish_at IS NULL
			db = db.Where("orders.expected_finish_at < ? AND orders.finish_at IS NULL", now)
		} else if query.FinishAtType == "notOverdue" {
			// 未逾期：expected_finish_at >= now 或 finish_at IS NOT NULL
			db = db.Where("orders.expected_finish_at >= ? OR orders.finish_at IS NOT NULL", now)
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

	// 付款人/收款人過濾（需要 JOIN user 表）
	if query.Payer != "" {
		db = db.Joins("User").Where("User.name LIKE ?", "%"+query.Payer+"%")
	}

	// 掛單類型過濾（需要 JOIN pending_orders 表）
	if query.Type != nil {
		db = db.Joins("PendingOrder").Where("PendingOrder.type = ?", *query.Type)
	}

	// 查詢總數
	var count int64
	countDB := db.Session(&gorm.Session{})
	if err := countDB.Count(&count).Error; err != nil {
		return nil, err
	}

	// 分頁查詢
	offset := (query.Page - 1) * query.Size
	var orders []models.Order
	if err := db.Preload("User").Preload("PendingOrder").Preload("BankCard").
		Order("orders.created_at DESC").
		Offset(offset).Limit(query.Size).
		Find(&orders).Error; err != nil {
		return nil, err
	}

	// 轉換為回應格式
	var rows []*interfaces.OrderListItemResponse
	for _, order := range orders {
		rows = append(rows, interfaces.ConvertToOrderListItemResponse(&order))
	}

	return &interfaces.OrderListResponse{
		Count: count,
		Rows:  rows,
	}, nil
}

// Complete 完成訂單
func (s *OrderService) Complete(orderID string) (*interfaces.OrderDetailResponse, error) {
	// 解析 UUID
	orderUUID, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("訂單 ID 格式錯誤")
	}

	// 查詢訂單
	var order models.Order
	if err := s.db.First(&order, "id = ?", orderUUID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("訂單不存在")
		}
		return nil, err
	}

	// 檢查訂單狀態
	if order.Status == 2 {
		return nil, errors.New("訂單已完成")
	}
	if order.Status == 3 || order.Status == 4 {
		return nil, errors.New("訂單已取消")
	}

	// 使用事務更新訂單狀態
	err = s.db.Transaction(func(tx *gorm.DB) error {
		// 更新訂單狀態為已放行（2）
		now := time.Now()
		order.Status = 2
		order.FinishAt = &now

		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		// TODO: 這裡可以添加其他業務邏輯，例如：
		// - 更新錢包餘額
		// - 更新掛單狀態
		// - 記錄交易日誌等

		return nil
	})

	if err != nil {
		return nil, err
	}

	// 重新載入訂單資料
	if err := s.db.Preload("User").Preload("PendingOrder").Preload("BankCard").
		First(&order, "id = ?", orderUUID).Error; err != nil {
		return nil, err
	}

	return interfaces.ConvertToOrderDetailResponse(&order), nil
}

// Cancel 取消訂單
func (s *OrderService) Cancel(orderID string, req *interfaces.CancelOrderRequest) (*interfaces.OrderDetailResponse, error) {
	// 解析 UUID
	orderUUID, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("訂單 ID 格式錯誤")
	}

	// 查詢訂單
	var order models.Order
	if err := s.db.First(&order, "id = ?", orderUUID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("訂單不存在")
		}
		return nil, err
	}

	// 檢查訂單狀態
	if order.Status == 2 {
		return nil, errors.New("訂單已完成，無法取消")
	}
	if order.Status == 3 || order.Status == 4 {
		return nil, errors.New("訂單已取消")
	}

	// 使用事務取消訂單
	err = s.db.Transaction(func(tx *gorm.DB) error {
		// 更新訂單狀態為已取消（3 或 4，這裡使用 3 代表管理員取消）
		order.Status = 3
		order.CancelReason = &req.CancelReason

		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		// TODO: 這裡可以添加其他業務邏輯，例如：
		// - 退還保證金
		// - 更新掛單狀態
		// - 發送通知等

		return nil
	})

	if err != nil {
		return nil, err
	}

	// 重新載入訂單資料
	if err := s.db.Preload("User").Preload("PendingOrder").Preload("BankCard").
		First(&order, "id = ?", orderUUID).Error; err != nil {
		return nil, err
	}

	return interfaces.ConvertToOrderDetailResponse(&order), nil
}

// OrderModule FX module
var OrderModule = fx.Module("order",
	fx.Provide(fx.Annotate(NewOrderService, fx.As(new(interfaces.OrderServiceInterface)))),
)
