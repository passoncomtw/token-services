package handlers

import (
	"token-admin-api/cmd/token-admin-api/internal/interfaces"
	"token-admin-api/pkg/response"

	"github.com/gin-gonic/gin"
)

type AuthHandlers struct {
	authService interfaces.AuthServiceInterface
}

func NewAuthHandlers(authService interfaces.AuthServiceInterface) *AuthHandlers {
	return &AuthHandlers{authService: authService}
}

// ==================== Auth Handlers ====================

// LoginRequest 登入請求
type LoginRequest struct {
	Account  string `json:"account" binding:"required" example:"admin"`
	Password string `json:"password" binding:"required" example:"a12345678"`
}

// Login godoc
// @Summary 使用者登入
// @Description 使用帳號密碼登入，成功後返回 JWT token
// @Tags 使用者驗證
// @Accept json
// @Produce json
// @Param credentials body LoginRequest true "登入資訊"
// @Success 200 {object} response.Response{data=interfaces.LoginResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Router /auth/login [post]
func (r *AuthHandlers) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	loginResponse, err := r.authService.Login(req.Account, req.Password)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.Success(c, loginResponse)
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

	// 只返回 success: true
	response.Success(c, nil)
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
