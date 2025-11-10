package handlers

import (
	"passontw-backend-services/cmd/token-app-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/response"

	"github.com/gin-gonic/gin"
)

type AuthHandlers struct {
	authService interfaces.AuthServiceInterface
	logger      logger.Logger
}

func NewAuthHandlers(authService interfaces.AuthServiceInterface, logger logger.Logger) *AuthHandlers {
	return &AuthHandlers{
		authService: authService,
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
		token := c.GetHeader("Authorization")
		if token == "" {
			response.Unauthorized(c, "未提供認證 token")
			c.Abort()
			return
		}

		// 驗證 token（這裡簡化處理，實際應該解析 JWT）
		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		}

		// TODO: 實作真正的 JWT 驗證邏輯
		// 這裡暫時只檢查 token 不為空
		if token == "" {
			response.Unauthorized(c, "無效的認證 token")
			c.Abort()
			return
		}

		c.Next()
	}
}
