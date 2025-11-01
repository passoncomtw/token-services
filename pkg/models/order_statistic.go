package models

import (
	"time"
)

/**
 * @brief OrderStatistic 訂單統計資料模型
 * @description 對應資料庫 order_statistics 表
 */
type OrderStatistic struct {
	ID                        int        `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID                    *int       `gorm:"column:user_id" json:"user_id,omitempty"`
	SuccessfulWithdrawalCount int        `gorm:"column:successful_withdrawal_count;not null" json:"successful_withdrawal_count"`
	SuccessfulCommentsCount   int        `gorm:"column:successful_comments_count;not null" json:"successful_comments_count"`
	FailCommentsCount         int        `gorm:"column:fail_comments_count;not null" json:"fail_comments_count"`
	AverageTransactionTime    time.Time  `gorm:"column:average_transaction_time;type:timestamptz;not null" json:"average_transaction_time"`
	CreatedAt                 time.Time  `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
	UpdatedAt                 time.Time  `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
	DeletedAt                 *time.Time `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`

	// 關聯
	User *User `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (OrderStatistic) TableName() string {
	return "order_statistics"
}
