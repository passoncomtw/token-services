package models

import (
	"passontw-backend-services/cmd/pos-merchant-service/internal/utils"

	"gorm.io/gorm"
)

type User struct {
	UserID     string `gorm:"column:user_id" json:"user_id"`
	MerchantID string `gorm:"column:merchant_id" json:"merchant_id"`
	Username   string `gorm:"column:username" json:"username"`
	Email      string `gorm:"column:email" json:"email"`
	PinHash    string `gorm:"column:pin_hash" json:"-"`
	Role       string `gorm:"column:role" json:"role"`
	IsActive   bool   `gorm:"column:is_active" json:"is_active"`
}

func (User) TableName() string {
	return "users"
}

// FindActiveUserByUsername 查詢啟用中的用戶
func FindActiveUserByUsername(db *gorm.DB, username string) (*User, error) {
	var user User
	err := db.Where("username = ? AND is_active = ?", username, true).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindActiveUserByEncryptedPin 以加密 pin 查詢啟用用戶
func FindActiveUserByEncryptedPin(db *gorm.DB, encryptedPin string) (*User, error) {
	var user User
	err := db.Where("pin_hash = ? AND is_active = ?", encryptedPin, true).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindActiveUserByPin 以明文 pin 使用 bcrypt 驗證，找到即回傳 user
func FindActiveUserByPin(db *gorm.DB, pin string) (*User, error) {
	var users []User
	if err := db.Where("is_active = ?", true).Find(&users).Error; err != nil {
		return nil, err
	}
	for _, user := range users {
		if utils.VerifyPin(pin, user.PinHash) {
			return &user, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

// UpdateUserPin 更新用戶的 PIN
func UpdateUserPin(db *gorm.DB, userID, newPinHash string) error {
	return db.Model(&User{}).
		Where("user_id = ? AND is_active = ?", userID, true).
		Update("pin_hash", newPinHash).Error
}
