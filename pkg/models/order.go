package models

import (
	"time"

	"github.com/google/uuid"
)

/**
 * @brief Order 訂單資料模型
 * @description 對應資料庫 orders 表
 */
type Order struct {
	ID               uuid.UUID  `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	UserID           int        `gorm:"column:user_id;not null" json:"user_id"`
	PendingOrderID   uuid.UUID  `gorm:"column:pending_order_id;type:uuid;not null" json:"pending_order_id"`
	BankCardID       int        `gorm:"column:bank_card_id;not null" json:"bank_card_id"`
	Status           int        `gorm:"column:status;not null" json:"status"`
	Amount           float64    `gorm:"column:amount;not null" json:"amount"`
	CancelReason     *string    `gorm:"column:cancel_reason;type:varchar(255)" json:"cancel_reason,omitempty"`
	ExpectedFinishAt time.Time  `gorm:"column:expected_finish_at;type:timestamptz;not null" json:"expected_finish_at"`
	FinishAt         *time.Time `gorm:"column:finish_at;type:timestamptz" json:"finish_at,omitempty"`
	CreatedAt        time.Time  `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
	UpdatedAt        time.Time  `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
	DeletedAt        *time.Time `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`

	// 關聯
	User         *User         `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
	PendingOrder *PendingOrder `gorm:"foreignKey:PendingOrderID;references:ID" json:"pending_order,omitempty"`
	BankCard     *BankCard     `gorm:"foreignKey:BankCardID;references:ID" json:"bank_card,omitempty"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (Order) TableName() string {
	return "orders"
}
