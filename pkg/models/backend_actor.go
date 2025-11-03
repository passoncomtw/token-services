package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// JSONStringArray 用於處理 PostgreSQL JSON 陣列
type JSONStringArray []string

// Scan implements sql.Scanner interface
func (j *JSONStringArray) Scan(value interface{}) error {
	if value == nil {
		*j = []string{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, j)
}

// Value implements driver.Valuer interface
func (j JSONStringArray) Value() (driver.Value, error) {
	if len(j) == 0 {
		return json.Marshal([]string{})
	}
	return json.Marshal(j)
}

// PermissionsJSON 用於處理巢狀的 permissions JSON 物件
type PermissionsJSON map[string]interface{}

// Scan implements sql.Scanner interface
func (p *PermissionsJSON) Scan(value interface{}) error {
	if value == nil {
		*p = make(PermissionsJSON)
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, p)
}

// Value implements driver.Valuer interface
func (p PermissionsJSON) Value() (driver.Value, error) {
	if len(p) == 0 {
		return json.Marshal(map[string]interface{}{})
	}
	return json.Marshal(p)
}

/**
 * @brief BackendActor 後台角色資料模型
 * @description 對應資料庫 backend_actors 表
 */
type BackendActor struct {
	ID          int             `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	CreatedAt   time.Time       `gorm:"column:created_at;type:timestamptz;not null" json:"-"`
	UpdatedAt   time.Time       `gorm:"column:updated_at;type:timestamptz;not null" json:"-"`
	DeletedAt   *time.Time      `gorm:"column:deleted_at;type:timestamptz" json:"-"`
	Name        string          `gorm:"column:name;type:varchar(255);not null" json:"name"`
	Markup      string          `gorm:"column:markup;type:varchar(255);not null" json:"markup"`
	Permissions PermissionsJSON `gorm:"column:permissions;type:json;not null" json:"permissions"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (BackendActor) TableName() string {
	return "backend_actors"
}
