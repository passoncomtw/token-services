package middlewares

import (
	"net/http"
	"strings"

	"passontw-backend-services/pkg/auth"
	"passontw-backend-services/pkg/config"

	"github.com/gin-gonic/gin"
)

// ==================== Middleware ====================
type AuthMiddlewares struct {
	jwtConfig *auth.Config
}

func NewAuthMiddlewares(cfg *config.Config) *AuthMiddlewares {
	return &AuthMiddlewares{
		jwtConfig: auth.NewConfigFromAppConfig(cfg),
	}
}

// JWTAuthMiddleware JWT 驗證中間件
func (r *AuthMiddlewares) JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "未提供認證 token"})
			c.Abort()
			return
		}

		// 檢查 Bearer 格式
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "認證格式錯誤"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// 驗證 token
		claims, err := auth.ValidateToken(r.jwtConfig, tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "無效的 token"})
			c.Abort()
			return
		}

		// 將使用者資訊存入 context
		c.Set("user_id", claims.UserID)
		c.Set("account", claims.Account)

		c.Next()
	}
}
