package admin

import (
	"net/http"

	"passontw-backend-services/cmd/pos-backend-service/internal/models"
	"passontw-backend-services/cmd/pos-backend-service/internal/services"
	"passontw-backend-services/pkg/logger"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	AuthService *services.AuthService
	Logger      logger.Logger
}

func NewAuthHandler(authService *services.AuthService, lgr logger.Logger) *AuthHandler {
	return &AuthHandler{
		AuthService: authService,
		Logger:      lgr,
	}
}

// Login godoc
// @Summary 管理員登入
// @Description 管理員帳號密碼登入，回傳 JWT Token
// @Tags admin-auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "登入資訊"
// @Success 200 {object} models.LoginResponse "登入成功"
// @Failure 401 {object} models.ErrorResponse "帳號或密碼錯誤"
// @Router /api/admin/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success:   false,
			Message:   "帳號或密碼錯誤",
			ErrorCode: "INVALID_CREDENTIALS",
		})
		return
	}
	user, token, err := h.AuthService.Login(req.Account, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success:   false,
			Message:   "帳號或密碼錯誤",
			ErrorCode: "INVALID_CREDENTIALS",
		})
		return
	}
	c.JSON(http.StatusOK, models.LoginResponse{
		Success: true,
		Message: "登入成功",
		Data: models.LoginData{
			AccessToken: token,
			TokenType:   "Bearer",
			User: models.UserDTO{
				UserID:  user.UserID,
				Account: user.Account,
				Name:    user.Name,
				Role:    user.Role,
				Email:   user.Email,
			},
		},
	})
}

// Logout godoc
// @Summary 管理員登出
// @Description 管理員登出，前端清除本地 Token，後端僅回傳成功訊息
// @Tags admin-auth
// @Security BearerAuth
// @Produce json
// @Success 200 {object} map[string]interface{} "登出成功"
// @Failure 401 {object} models.ErrorResponse "Token 無效"
// @Router /api/admin/auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "登出成功",
	})
}
