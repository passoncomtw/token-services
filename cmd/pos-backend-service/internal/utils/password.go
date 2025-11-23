package utils

import (
	"golang.org/x/crypto/bcrypt"
)

const BcryptCost = 12

// HashPassword 將明文密碼加密
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), BcryptCost)
	return string(hash), err
}

// CheckPassword 驗證密碼是否正確
func CheckPassword(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
