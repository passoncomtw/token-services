package middleware

import (
	"strings"

	"passontw-backend-services/pkg/auth"
	"passontw-backend-services/pkg/response"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware JWT 認證中間件
type AuthMiddleware struct {
	jwtConfig *auth.Config
}

// NewAuthMiddleware 建立新的認證中間件
func NewAuthMiddleware(jwtConfig *auth.Config) *AuthMiddleware {
	return &AuthMiddleware{
		jwtConfig: jwtConfig,
	}
}

// Authenticate 認證中間件處理函數
func (m *AuthMiddleware) Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 從 Header 取得 Authorization token
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "缺少認證 token")
			c.Abort()
			return
		}

		// 檢查 Bearer token 格式
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Unauthorized(c, "認證 token 格式錯誤")
			c.Abort()
			return
		}

		tokenString := parts[1]

		// 驗證 token
		claims, err := auth.ValidateToken(m.jwtConfig, tokenString)
		if err != nil {
			response.Unauthorized(c, "無效的認證 token")
			c.Abort()
			return
		}

		// 將使用者資訊存入 context
		c.Set("user_id", claims.UserID)
		c.Set("account", claims.Account)

		c.Next()
	}
}

// GetUserID 從 context 取得使用者 ID
func GetUserID(c *gin.Context) (int, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}

	id, ok := userID.(int)
	return id, ok
}

// GetAccount 從 context 取得使用者帳號
func GetAccount(c *gin.Context) (string, bool) {
	account, exists := c.Get("account")
	if !exists {
		return "", false
	}

	acc, ok := account.(string)
	return acc, ok
}
