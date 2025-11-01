package models

import (
	"time"
)

/**
 * @brief BackendUser 後台使用者資料模型
 * @description 對應資料庫 backend_users 表
 */
type BackendUser struct {
	ID        int        `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	ActorID   *int       `gorm:"column:actor_id" json:"actor_id,omitempty"`
	CreatedAt time.Time  `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
	UpdatedAt time.Time  `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
	DeletedAt *time.Time `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`
	Status    int        `gorm:"column:status;not null" json:"status"` // 使用者狀態
	Name      string     `gorm:"column:name;type:varchar(255);not null" json:"name"`
	Account   string     `gorm:"column:account;type:varchar(255);not null;uniqueIndex:backend_users_account_key" json:"account"`
	Password  string     `gorm:"column:password;type:varchar(255);not null" json:"-"`

	// 關聯
	Actor *BackendActor `gorm:"foreignKey:ActorID;references:ID" json:"actor,omitempty"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (BackendUser) TableName() string {
	return "backend_users"
}
