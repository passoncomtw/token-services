package models

import (
	"time"
)

/**
 * @brief Bank 銀行資料模型
 * @description 對應資料庫 banks 表
 */
type Bank struct {
	ID        int        `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	Status    int        `gorm:"column:status;not null" json:"status"` // 0: 正常, 1: 停用, 2: 凍結
	BankName  string     `gorm:"column:bank_name;type:varchar(255);not null" json:"bank_name"`
	BankCode  string     `gorm:"column:bank_code;type:varchar(255);not null" json:"bank_code"`
	CreatedAt time.Time  `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
	UpdatedAt time.Time  `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
	DeletedAt *time.Time `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (Bank) TableName() string {
	return "banks"
}
