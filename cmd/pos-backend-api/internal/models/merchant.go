package models

import "time"

type Merchant struct {
	MerchantID   string    `json:"merchant_id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	MerchantName string    `json:"merchant_name" gorm:"not null"`
	Category     string    `json:"category" gorm:"not null"`
	Status       string    `json:"status" gorm:"default:'offline';check:status IN ('online', 'offline')"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (Merchant) TableName() string {
	return "merchants"
}
