package handlers

import (
	"strconv"

	"passontw-backend-services/cmd/token-app-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/response"

	"github.com/gin-gonic/gin"
)

type UserHandlers struct {
	userService interfaces.UserServiceInterface
	logger      logger.Logger
}

func NewUserHandlers(userService interfaces.UserServiceInterface, logger logger.Logger) *UserHandlers {
	return &UserHandlers{
		userService: userService,
		logger:      logger,
	}
}

// ==================== User Handlers ====================

// Register godoc
// @Summary 使用者註冊
// @Description 使用者註冊
// @Tags 使用者
// @Accept json
// @Produce json
// @Param data body interfaces.RegisterRequest true "註冊資訊"
// @Success 200 {object} response.Response{data=interfaces.UserDetail}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users [post]
func (h *UserHandlers) Register(c *gin.Context) {
	var req interfaces.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c)
		return
	}

	user, err := h.userService.Register(&req)
	if err != nil {
		response.BadRequest(c)
		return
	}

	response.SuccessWithMessage(c, user)
}

// GetUser godoc
// @Summary 顯示使用者資訊
// @Description 顯示使用者資訊
// @Tags 使用者
// @Accept json
// @Produce json
// @Param user_id path int true "使用者 ID"
// @Success 200 {object} response.Response{data=interfaces.UserDetail}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /users/{user_id} [get]
func (h *UserHandlers) GetUser(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		response.BadRequest(c)
		return
	}

	user, err := h.userService.GetUser(userID)
	if err != nil {
		response.NotFound(c)
		return
	}

	response.SuccessWithMessage(c, user)
}

// UpdateUser godoc
// @Summary 編輯使用者資訊
// @Description 編輯使用者資訊
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param user_id path int true "使用者 ID"
// @Param data body interfaces.UpdateUserRequest true "更新資訊"
// @Success 200 {object} response.Response{data=interfaces.UserDetail}
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /users/{user_id} [put]
func (h *UserHandlers) UpdateUser(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		response.BadRequest(c)
		return
	}

	// TODO: 驗證使用者只能更新自己的資訊
	// currentUserID := c.GetInt("user_id")
	// if currentUserID != userID {
	//     response.Forbidden(c)
	//     return
	// }

	var req interfaces.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c)
		return
	}

	user, err := h.userService.UpdateUser(userID, &req)
	if err != nil {
		response.BadRequest(c)
		return
	}

	response.SuccessWithMessage(c, user)
}

// UpdateLoginPassword godoc
// @Summary 編輯使用者登入密碼
// @Description 編輯使用者登入密碼
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param data body interfaces.UpdateLoginPasswordRequest true "密碼資訊"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Router /users/login/password [put]
func (h *UserHandlers) UpdateLoginPassword(c *gin.Context) {
	userID := c.GetInt("user_id")

	var req interfaces.UpdateLoginPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c)
		return
	}

	if err := h.userService.UpdateLoginPassword(userID, &req); err != nil {
		response.BadRequest(c)
		return
	}

	response.SuccessWithMessage(c, nil)
}

// UpdateTransactionCode godoc
// @Summary 編輯使用者交易密碼
// @Description 編輯使用者交易密碼
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param data body interfaces.UpdateTransactionCodeRequest true "交易密碼資訊"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Router /users/transaction/password [put]
func (h *UserHandlers) UpdateTransactionCode(c *gin.Context) {
	userID := c.GetInt("user_id")

	var req interfaces.UpdateTransactionCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c)
		return
	}

	if err := h.userService.UpdateTransactionCode(userID, &req); err != nil {
		response.BadRequest(c)
		return
	}

	response.SuccessWithMessage(c, nil)
}

// StoreValue godoc
// @Summary 自動儲值一千塊
// @Description 自動儲值一千塊（測試用）
// @Tags 使用者
// @Accept json
// @Produce json
// @Param user_id path int true "使用者 ID"
// @Success 200 {object} response.Response{data=interfaces.UserDetail}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /users/{user_id}/store/value [post]
func (h *UserHandlers) StoreValue(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		response.BadRequest(c)
		return
	}

	user, err := h.userService.StoreValue(userID)
	if err != nil {
		response.BadRequest(c)
		return
	}

	response.SuccessWithMessage(c, user)
}
