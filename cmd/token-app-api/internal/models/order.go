package models

import (
	"time"

	"github.com/yourusername/project/pkg/snowflake"

	"gorm.io/gorm"
)

/**
 * @brief Order 訂單資料模型
 * @description 對應資料庫 orders 表
 * @note ID 使用雪花演算法生成
 */
type Order struct {
	ID        int64     `gorm:"column:id;primaryKey" json:"id"`
	UserID    string    `gorm:"column:user_id;type:varchar(100);index;not null" json:"user_id"`
	CreatedAt time.Time `gorm:"column:created_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (Order) TableName() string {
	return "orders"
}

/**
 * @brief BeforeCreate GORM Hook - 在建立訂單前自動生成 Snowflake ID
 * @param tx GORM 資料庫事務
 * @return error 錯誤訊息
 */
func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == 0 {
		o.ID = snowflake.GenerateID()
	}
	return nil
}
