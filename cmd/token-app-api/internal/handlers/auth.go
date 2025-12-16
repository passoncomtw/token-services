package handlers

import (
	"strings"

	"passontw-backend-services/cmd/token-app-api/internal/interfaces"
	"passontw-backend-services/pkg/auth"
	"passontw-backend-services/pkg/config"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/response"

	"github.com/gin-gonic/gin"
)

type AuthHandlers struct {
	authService interfaces.AuthServiceInterface
	jwtConfig   *auth.Config
	logger      logger.Logger
}

func NewAuthHandlers(authService interfaces.AuthServiceInterface, cfg *config.Config, logger logger.Logger) *AuthHandlers {
	return &AuthHandlers{
		authService: authService,
		jwtConfig:   auth.NewConfigFromAppConfig(cfg),
		logger:      logger,
	}
}

// ==================== Auth Handlers ====================

// Login godoc
// @Summary 使用者登入
// @Description 使用帳號密碼登入，成功後返回 JWT token
// @Tags 使用者驗證
// @Accept json
// @Produce json
// @Param credentials body interfaces.LoginRequest true "登入資訊"
// @Success 200 {object} response.Response{data=interfaces.LoginResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Router /auth/login [post]
func (r *AuthHandlers) Login(c *gin.Context) {
	var req interfaces.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	loginResponse, err := r.authService.Login(&req)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.SuccessWithMessage(c, "登入成功", loginResponse)
}

// Logout godoc
// @Summary 使用者登出
// @Description 登出當前使用者（客戶端需自行刪除 token）
// @Tags 使用者驗證
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} response.Response
// @Failure 500 {object} response.ErrorResponse
// @Router /auth/logout [post]
func (r *AuthHandlers) Logout(c *gin.Context) {
	if err := r.authService.Logout(); err != nil {
		response.InternalError(c, "登出失敗")
		return
	}

	response.SuccessWithMessage(c, "登出成功", nil)
}

// JWTAuthMiddleware JWT 認證中間件
func (h *AuthHandlers) JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 從 Header 取得 token
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "未提供認證 token")
			c.Abort()
			return
		}

		// 檢查 Bearer 格式
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Unauthorized(c, "認證格式錯誤")
			c.Abort()
			return
		}

		tokenString := parts[1]

		// 驗證 token
		claims, err := auth.ValidateToken(h.jwtConfig, tokenString)
		if err != nil {
			response.Unauthorized(c, "無效的 token")
			c.Abort()
			return
		}

		// 將使用者資訊存入 context
		c.Set("user_id", claims.UserID)
		c.Set("account", claims.Account)

		c.Next()
	}
}
