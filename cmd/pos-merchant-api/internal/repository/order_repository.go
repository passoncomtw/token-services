package repository

import (
	"passontw-backend-services/cmd/pos-merchant-api/internal/models"

	"gorm.io/gorm"
)

// OrderRepository 處理訂單資料存取
// 負責 orders 與 order_items 的新增與查詢
type OrderRepository struct {
	DB *gorm.DB
}

// NewOrderRepository 創建新的 OrderRepository 實例
func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{
		DB: db,
	}
}

// CreateOrder 建立訂單（含明細）
func (r *OrderRepository) CreateOrder(order *models.Order) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(order).Error; err != nil {
			return err
		}
		for i := range order.OrderItems {
			order.OrderItems[i].OrderID = order.OrderID
			if err := tx.Create(&order.OrderItems[i]).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// GetOrderByID 依據訂單 ID 與商家 ID 查詢訂單（含明細）
func (r *OrderRepository) GetOrderByID(orderID, merchantID string) (*models.Order, error) {
	var order models.Order
	err := r.DB.Preload("OrderItems").Where("order_id = ? AND merchant_id = ?", orderID, merchantID).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}
