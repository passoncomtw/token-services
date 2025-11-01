package models

import (
	"time"
)

/**
 * @brief Wallet 錢包資料模型
 * @description 對應資料庫 wallets 表
 */
type Wallet struct {
	ID                int        `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID            *int       `gorm:"column:user_id" json:"user_id,omitempty"`
	Status            int        `gorm:"column:status;not null" json:"status"`
	UsefulBalance     float64    `gorm:"column:useful_balance;not null" json:"useful_balance"`
	GuaranteedBalance float64    `gorm:"column:guaranteed_balance;not null" json:"guaranteed_balance"`
	FreezeBalance     float64    `gorm:"column:freeze_balance;not null" json:"freeze_balance"`
	CreatedAt         time.Time  `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
	UpdatedAt         time.Time  `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
	DeletedAt         *time.Time `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`

	// 關聯
	User *User `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (Wallet) TableName() string {
	return "wallets"
}
