package models

import (
	"time"
)

/**
 * @brief BankCard 銀行卡資料模型
 * @description 對應資料庫 bank_cards 表
 */
type BankCard struct {
	ID         int        `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID     *int       `gorm:"column:user_id" json:"user_id,omitempty"`
	BankID     *int       `gorm:"column:bank_id" json:"bank_id,omitempty"`
	Name       string     `gorm:"column:name;type:varchar(255);not null" json:"name"`               // 銀行卡擁有者姓名
	CardNumber string     `gorm:"column:card_number;type:varchar(255);not null" json:"card_number"` // 銀行卡號
	Status     string     `gorm:"column:status;type:varchar(255);not null" json:"status"`           // 0: 正常, 1: 停用, 2: 凍結
	BranchName string     `gorm:"column:branch_name;type:varchar(255);not null" json:"branch_name"` // 分行名稱
	CreatedAt  time.Time  `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
	UpdatedAt  time.Time  `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
	DeletedAt  *time.Time `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`

	// 關聯
	User *User `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
	Bank *Bank `gorm:"foreignKey:BankID;references:ID" json:"bank,omitempty"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (BankCard) TableName() string {
	return "bank_cards"
}
