package middleware

import (
	"net/http"
	"strings"

	"passontw-backend-services/cmd/pos-merchant-service/internal/config"
	"passontw-backend-services/cmd/pos-merchant-service/internal/utils"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware 驗證 JWT Token，驗證失敗則回傳 401
func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			noTokenErr := utils.NewAPIError(
				utils.ErrorCodeUnauthorized,
				"未提供授權 token",
				http.StatusUnauthorized,
				nil,
			)
			utils.RespondWithError(c, noTokenErr)
			c.Abort()
			return
		}

		token := strings.TrimPrefix(header, "Bearer ")
		claims, err := utils.ValidateToken(cfg.GetJWTSecret(), token)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			c.Abort()
			return
		}

		// 將 claims 存入 context
		c.Set("user_claims", claims)
		c.Next()
	}
}
