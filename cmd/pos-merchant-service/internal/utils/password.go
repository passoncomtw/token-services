package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPin 使用 bcrypt 加密 PIN
func HashPin(pin string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(pin), bcrypt.DefaultCost)
	return string(bytes), err
}

// VerifyPin 驗證 PIN 是否正確
func VerifyPin(pin, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pin))
	return err == nil
}
