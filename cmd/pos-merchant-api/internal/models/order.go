package models

import (
	"encoding/json"
	"time"
)

// Order 訂單主檔
// 對應資料表：orders
type Order struct {
	OrderID           string          `gorm:"column:order_id;primaryKey" json:"order_id"`
	OrderNumber       string          `gorm:"column:order_number;unique" json:"order_number"`
	MerchantID        string          `gorm:"column:merchant_id" json:"merchant_id"`
	StaffID           string          `gorm:"column:staff_id" json:"staff_id"`
	OriginalAmount    float64         `gorm:"column:original_amount" json:"original_amount"`
	DiscountAmount    float64         `gorm:"column:discount_amount" json:"discount_amount"`
	FinalAmount       float64         `gorm:"column:final_amount" json:"final_amount"`
	CashReceived      float64         `gorm:"column:cash_received" json:"cash_received"`
	ChangeAmount      float64         `gorm:"column:change_amount" json:"change_amount"`
	AppliedPromotions json.RawMessage `gorm:"type:jsonb;column:applied_promotions" json:"applied_promotions"`
	ItemCount         int             `gorm:"column:item_count" json:"item_count"`
	Status            string          `gorm:"column:status" json:"status"`
	PaymentMethod     string          `gorm:"column:payment_method" json:"payment_method"`
	CreatedAt         time.Time       `gorm:"column:created_at" json:"created_at"`
	OrderItems        []OrderItem     `gorm:"foreignKey:OrderID;references:OrderID" json:"items"`
}

func (Order) TableName() string {
	return "orders"
}

// OrderItem 訂單明細
// 對應資料表：order_items
type OrderItem struct {
	ItemID         string          `gorm:"column:item_id;primaryKey" json:"item_id"`
	OrderID        string          `gorm:"column:order_id" json:"order_id"`
	ProductID      string          `gorm:"column:product_id" json:"product_id"`
	Name           string          `gorm:"column:name" json:"name"`
	Quantity       int             `gorm:"column:quantity" json:"quantity"`
	Price          float64         `gorm:"column:price" json:"price"`
	Customizations json.RawMessage `gorm:"type:jsonb;column:customizations" json:"customizations"`
	TotalPrice     float64         `gorm:"column:total_price" json:"total_price"`
}

func (OrderItem) TableName() string {
	return "order_items"
}
