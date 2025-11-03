package handlers

import (
	"github.com/yourusername/project/cmd/github.com/yourusername/project/internal/interfaces"
	"github.com/yourusername/project/pkg/response"

	"github.com/gin-gonic/gin"
)

// ==================== User Handlers ====================
type UserHandlers struct {
	userService interfaces.UserServiceInterface
}

func NewUserHandlers(userService interfaces.UserServiceInterface) *UserHandlers {
	return &UserHandlers{userService: userService}
}

// CreateUserRequest 建立使用者請求
type CreateUserRequest struct {
	Name string `json:"name" binding:"required" example:"Alice"`
}

// CreateUser godoc
// @Summary 建立使用者
// @Description 建立新的使用者
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param user body CreateUserRequest true "使用者資訊"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Router /api/v1/users [post]
func (u *UserHandlers) CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	userID := u.userService.CreateUser(req.Name)
	response.Success(c, gin.H{
		"user_id": userID,
	})
}

// GetUser godoc
// @Summary 取得使用者
// @Description 根據使用者 ID 取得使用者資訊
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "使用者 ID"
// @Success 200 {object} response.Response
// @Router /api/v1/users/{id} [get]
func (u *UserHandlers) GetUser(c *gin.Context) {
	userID := c.Param("id")
	orderCount := u.userService.GetOrderCount(userID)

	response.Success(c, gin.H{
		"user_id":     userID,
		"order_count": orderCount,
	})
}
