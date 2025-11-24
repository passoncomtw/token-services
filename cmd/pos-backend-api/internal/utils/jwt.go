package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
	UserID  string `json:"user_id"`
	Account string `json:"account"`
	Name    string `json:"name"`
	Role    string `json:"role"`
	Email   string `json:"email"`
	jwt.RegisteredClaims
}

// GenerateToken 產生 JWT Token
func GenerateToken(secret string, userID, account, name, role, email string) (string, error) {
	claims := CustomClaims{
		UserID:  userID,
		Account: account,
		Name:    name,
		Role:    role,
		Email:   email,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt: jwt.NewNumericDate(time.Now()),
			Issuer:   "pos-backend-api",
			// 不設定 ExpiresAt，永不過期
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidateToken 驗證 JWT Token 並回傳 claims
func ValidateToken(secret, tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, jwt.ErrTokenInvalidClaims
}
