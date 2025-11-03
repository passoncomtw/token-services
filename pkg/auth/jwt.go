package auth

import (
	"errors"
	"time"

	"token-services/pkg/config"

	"github.com/golang-jwt/jwt/v5"
)

// Claims JWT claims 結構
type Claims struct {
	UserID  int    `json:"user_id"`
	Account string `json:"account"`
	jwt.RegisteredClaims
}

// Config JWT 配置
type Config struct {
	Secret         string
	ExpirationTime time.Duration
}

/**
 * @brief 從統一配置載入 JWT 配置
 * @param cfg 應用程式配置
 * @return *Config
 */
func NewConfigFromAppConfig(cfg *config.Config) *Config {
	return &Config{
		Secret:         cfg.JWTSecret,
		ExpirationTime: cfg.JWTExpirationTime,
	}
}

// GenerateToken 生成 JWT token
func GenerateToken(config *Config, userID int, account string) (string, error) {
	claims := &Claims{
		UserID:  userID,
		Account: account,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(config.ExpirationTime)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.Secret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken 驗證 JWT token
func ValidateToken(config *Config, tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// 驗證簽名方法
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(config.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
