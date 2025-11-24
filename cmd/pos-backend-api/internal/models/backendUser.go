package models

import "time"

type BackendUser struct {
	UserID       string    `json:"user_id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	Name         string    `json:"name" gorm:"not null"`
	Account      string    `json:"account" gorm:"unique;not null"`
	PasswordHash string    `json:"-" gorm:"not null"`
	Email        string    `json:"email"`
	Role         string    `json:"role" gorm:"default:'admin'"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (BackendUser) TableName() string {
	return "backend_users"
}
