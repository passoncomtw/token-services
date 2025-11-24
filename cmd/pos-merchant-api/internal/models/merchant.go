package models

import (
	"time"

	"gorm.io/gorm"
)

// Merchant 商家資訊模型
type Merchant struct {
	MerchantID   string    `gorm:"column:merchant_id;primaryKey" json:"merchant_id"`
	MerchantName string    `gorm:"column:merchant_name;not null" json:"merchant_name"`
	Address      string    `gorm:"column:address" json:"address"`
	Phone        string    `gorm:"column:phone" json:"phone"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at" json:"updated_at"`
}

// TableName 指定資料表名稱
func (Merchant) TableName() string {
	return "merchant_info"
}

// GetMerchantByID 根據商家 ID 查詢商家資訊
func GetMerchantByID(db *gorm.DB, merchantID string) (*Merchant, error) {
	var merchant Merchant
	err := db.Where("merchant_id = ?", merchantID).First(&merchant).Error
	if err != nil {
		return nil, err
	}
	return &merchant, nil
}
