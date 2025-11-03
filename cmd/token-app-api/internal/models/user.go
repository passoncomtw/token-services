package models

import (
	"time"
)

/**
 * @brief User 使用者資料模型
 * @description 對應資料庫 users 表
 */
type User struct {
	ID        uint      `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"column:name;type:varchar(100);not null" json:"name"`
	Account   string    `gorm:"column:account;type:varchar(100);uniqueIndex;not null" json:"account"`
	Password  string    `gorm:"column:password;type:varchar(255);not null" json:"-"`
	CreatedAt time.Time `gorm:"column:created_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (User) TableName() string {
	return "users"
}
