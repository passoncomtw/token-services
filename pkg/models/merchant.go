package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// JSONRawMessage 用於處理 PostgreSQL JSON 類型
type JSONRawMessage json.RawMessage

// Scan implements sql.Scanner interface
func (j *JSONRawMessage) Scan(value interface{}) error {
	if value == nil {
		*j = JSONRawMessage("{}")
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	*j = JSONRawMessage(bytes)
	return nil
}

// Value implements driver.Valuer interface
func (j JSONRawMessage) Value() (driver.Value, error) {
	if len(j) == 0 {
		return []byte("{}"), nil
	}
	return []byte(j), nil
}

/**
 * @brief Merchant 商家資料模型
 * @description 對應資料庫 merchants 表
 */
type Merchant struct {
	ID                int            `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID            *int           `gorm:"column:user_id" json:"user_id,omitempty"`
	Telegram          string         `gorm:"column:telegram;type:varchar(255);not null" json:"telegram"`   // Telegram id
	Contactor         string         `gorm:"column:contactor;type:varchar(255);not null" json:"contactor"` // 聯絡人
	BuyFeeType        int            `gorm:"column:buy_fee_type;not null" json:"buy_fee_type"`             // 0: 百分比, 1: 階梯型
	SellFeeType       int            `gorm:"column:sell_fee_type;not null" json:"sell_fee_type"`           // 0: 百分比, 1: 階梯型
	BuyPercentageFee  JSONRawMessage `gorm:"column:buy_percentage_fee;type:json;not null" json:"buy_percentage_fee"`
	BuyLadderFee      JSONRawMessage `gorm:"column:buy_ladder_fee;type:json;not null" json:"buy_ladder_fee"`
	SellPercentageFee JSONRawMessage `gorm:"column:sell_percentage_fee;type:json;not null" json:"sell_percentage_fee"`
	SellLadderFee     JSONRawMessage `gorm:"column:sell_ladder_fee;type:json;not null" json:"sell_ladder_fee"`
	CreatedAt         time.Time      `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
	UpdatedAt         time.Time      `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
	DeletedAt         *time.Time     `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`

	// 關聯
	User *User `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (Merchant) TableName() string {
	return "merchants"
}
