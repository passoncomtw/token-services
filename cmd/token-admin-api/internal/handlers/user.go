package handlers

import (
	"strconv"

	"passontw-backend-services/cmd/token-admin-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// UserHandlers 使用者處理器
type UserHandlers struct {
	service interfaces.UserServiceInterface
	logger  logger.Logger
}

// NewUserHandlers 建立新的使用者處理器
func NewUserHandlers(service interfaces.UserServiceInterface, log logger.Logger) *UserHandlers {
	return &UserHandlers{
		service: service,
		logger:  log.With(zap.String("handler", "UserHandlers")),
	}
}

// GetList godoc
// @Summary 使用者列表
// @Description 取得使用者列表，支援分頁和多種過濾條件
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param account query string false "使用者帳號"
// @Param email query string false "使用者信箱"
// @Param name query string false "使用者暱稱"
// @Param status query int false "會員狀態，0=停用, 1=啟用"
// @Param orderStatus query int false "掛單狀態，0=凍結, 1=啟用"
// @Param transactionStatus query int false "交易狀態，0=凍結, 1=啟用"
// @Param isMerchant query bool false "是否為商家"
// @Param page query int false "頁數" default(1)
// @Param size query int false "每頁資訊" default(10)
// @Success 200 {object} response.Response{data=[]interfaces.UserBasicResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users [get]
func (h *UserHandlers) GetList(c *gin.Context) {
	var query interfaces.UserListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	users, err := h.service.GetList(&query)
	if err != nil {
		response.InternalError(c, "取得使用者列表失敗")
		return
	}

	response.Success(c, users)
}

// Create godoc
// @Summary 新增使用者(商家)
// @Description 新增使用者，可包含商家資訊
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param body body interfaces.CreateUserRequest true "使用者資料"
// @Success 200 {object} response.Response{data=interfaces.UserBasicResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users [post]
func (h *UserHandlers) Create(c *gin.Context) {
	var req interfaces.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	user, err := h.service.Create(&req)
	if err != nil {
		if err.Error() == "帳號已存在" {
			response.BadRequest(c, err.Error())
			return
		}
		response.InternalError(c, "新增使用者失敗")
		return
	}

	response.Success(c, user)
}

// GetDetail godoc
// @Summary 取得使用者詳細資訊
// @Description 取得使用者詳細資訊，包含商家和錢包資料
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param userId path int true "使用者 ID"
// @Success 200 {object} response.Response{data=interfaces.UserDetailResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/{userId} [get]
func (h *UserHandlers) GetDetail(c *gin.Context) {
	idStr := c.Param("userId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "使用者 ID 格式錯誤")
		return
	}

	user, err := h.service.GetDetail(id)
	if err != nil {
		if err.Error() == "使用者不存在" {
			response.NotFound(c, "使用者不存在")
			return
		}
		response.InternalError(c, "取得使用者資訊失敗")
		return
	}

	response.Success(c, user)
}

// Update godoc
// @Summary 編輯使用者(商家)
// @Description 編輯使用者資訊，包含商家資料
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param userId path int true "使用者 ID"
// @Param body body interfaces.UpdateUserRequest true "使用者資料"
// @Success 200 {object} response.Response{data=interfaces.UserBasicResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/{userId} [put]
func (h *UserHandlers) Update(c *gin.Context) {
	idStr := c.Param("userId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "使用者 ID 格式錯誤")
		return
	}

	var req interfaces.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	user, err := h.service.Update(id, &req)
	if err != nil {
		if err.Error() == "使用者不存在" {
			response.NotFound(c, "使用者不存在")
			return
		}
		response.InternalError(c, "編輯使用者失敗")
		return
	}

	response.Success(c, user)
}

// Unlock godoc
// @Summary 解鎖使用者
// @Description 解鎖使用者，將所有狀態設為啟用
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param userId path int true "使用者 ID"
// @Success 200 {object} response.Response{data=interfaces.UserDetailResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/{userId}/unlock [put]
func (h *UserHandlers) Unlock(c *gin.Context) {
	idStr := c.Param("userId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "使用者 ID 格式錯誤")
		return
	}

	user, err := h.service.Unlock(id)
	if err != nil {
		if err.Error() == "使用者不存在" {
			response.NotFound(c, "使用者不存在")
			return
		}
		response.InternalError(c, "解鎖使用者失敗")
		return
	}

	response.Success(c, user)
}

// UpdateLoginPassword godoc
// @Summary 編輯使用者登入密碼
// @Description 編輯指定使用者的登入密碼
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param userId path int true "使用者 ID"
// @Param body body interfaces.UpdateLoginPasswordRequest true "密碼資料"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/{userId}/login/password [put]
func (h *UserHandlers) UpdateLoginPassword(c *gin.Context) {
	idStr := c.Param("userId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "使用者 ID 格式錯誤")
		return
	}

	var req interfaces.UpdateLoginPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	if err := h.service.UpdateLoginPassword(id, &req); err != nil {
		if err.Error() == "使用者不存在" {
			response.NotFound(c, "使用者不存在")
			return
		}
		if err.Error() == "舊密碼錯誤" {
			response.BadRequest(c, "舊密碼錯誤")
			return
		}
		response.InternalError(c, "更新密碼失敗")
		return
	}

	response.Success(c, nil)
}

// UpdateTransactionPassword godoc
// @Summary 編輯使用者交易密碼
// @Description 編輯指定使用者的交易密碼
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param userId path int true "使用者 ID"
// @Param body body interfaces.UpdateTransactionPasswordRequest true "密碼資料"
// @Success 200 {object} response.Response{data=interfaces.UserDetailResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/{userId}/transaction/password [put]
func (h *UserHandlers) UpdateTransactionPassword(c *gin.Context) {
	idStr := c.Param("userId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "使用者 ID 格式錯誤")
		return
	}

	var req interfaces.UpdateTransactionPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	user, err := h.service.UpdateTransactionPassword(id, &req)
	if err != nil {
		if err.Error() == "使用者不存在" {
			response.NotFound(c, "使用者不存在")
			return
		}
		response.InternalError(c, "更新交易密碼失敗")
		return
	}

	response.Success(c, user)
}

// UpdateOwnLoginPassword godoc
// @Summary 編輯自己的登入密碼
// @Description 編輯當前登入使用者的登入密碼
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param body body interfaces.UpdateLoginPasswordRequest true "密碼資料"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/login/password [put]
func (h *UserHandlers) UpdateOwnLoginPassword(c *gin.Context) {
	// TODO: 從 JWT token 取得當前使用者 ID
	// 目前暫時使用固定 ID 1 作為示範
	userID := 1

	var req interfaces.UpdateLoginPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	if err := h.service.UpdateLoginPassword(userID, &req); err != nil {
		if err.Error() == "使用者不存在" {
			response.NotFound(c, "使用者不存在")
			return
		}
		if err.Error() == "舊密碼錯誤" {
			response.BadRequest(c, "舊密碼錯誤")
			return
		}
		response.InternalError(c, "更新密碼失敗")
		return
	}

	response.Success(c, nil)
}

// GetBankCards godoc
// @Summary 取得使用者銀行卡列表
// @Description 取得指定使用者的銀行卡列表
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param userId path int true "使用者 ID"
// @Param page query int false "頁數" default(1)
// @Param size query int false "每頁資訊" default(10)
// @Success 200 {object} response.Response{data=[]interfaces.BankCardResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/{userId}/bankcards [get]
func (h *UserHandlers) GetBankCards(c *gin.Context) {
	idStr := c.Param("userId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "使用者 ID 格式錯誤")
		return
	}

	var query interfaces.PaginationQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	bankCards, err := h.service.GetBankCards(id, &query)
	if err != nil {
		if err.Error() == "使用者不存在" {
			response.NotFound(c, "使用者不存在")
			return
		}
		response.InternalError(c, "取得銀行卡列表失敗")
		return
	}

	response.Success(c, bankCards)
}

// GetOrders godoc
// @Summary 取得使用者訂單列表
// @Description 取得指定使用者的訂單列表
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param userId path int true "使用者 ID"
// @Success 200 {object} response.Response{data=[]interfaces.OrderResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/{userId}/orders [get]
func (h *UserHandlers) GetOrders(c *gin.Context) {
	idStr := c.Param("userId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "使用者 ID 格式錯誤")
		return
	}

	orders, err := h.service.GetOrders(id)
	if err != nil {
		if err.Error() == "使用者不存在" {
			response.NotFound(c, "使用者不存在")
			return
		}
		response.InternalError(c, "取得訂單列表失敗")
		return
	}

	response.Success(c, orders)
}

// GetPendingOrders godoc
// @Summary 取得使用者掛單列表
// @Description 取得指定使用者的掛單列表
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param userId path int true "使用者 ID"
// @Param page query int false "頁數" default(1)
// @Param size query int false "每頁資訊" default(10)
// @Success 200 {object} response.Response{data=interfaces.PendingOrderListResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/{userId}/pending/orders [get]
func (h *UserHandlers) GetPendingOrders(c *gin.Context) {
	idStr := c.Param("userId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "使用者 ID 格式錯誤")
		return
	}

	var query interfaces.PaginationQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	pendingOrders, err := h.service.GetPendingOrders(id, &query)
	if err != nil {
		if err.Error() == "使用者不存在" {
			response.NotFound(c, "使用者不存在")
			return
		}
		response.InternalError(c, "取得掛單列表失敗")
		return
	}

	response.Success(c, pendingOrders)
}
