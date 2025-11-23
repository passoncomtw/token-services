package middleware

import (
	"net/http"
	"strings"

	"passontw-backend-services/cmd/pos-backend-service/internal/config"
	"passontw-backend-services/cmd/pos-backend-service/internal/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success":    false,
				"message":    "未提供授權 token",
				"error_code": "NO_TOKEN",
			})
			return
		}
		token := strings.TrimPrefix(header, "Bearer ")
		claims, err := utils.ValidateToken(cfg.JWT.Secret, token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success":    false,
				"message":    "Token 無效",
				"error_code": "INVALID_TOKEN",
			})
			return
		}
		// 將 claims 存入 context
		c.Set("user_claims", claims)
		c.Next()
	}
}
