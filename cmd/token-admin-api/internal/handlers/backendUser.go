package handlers

import (
	"strconv"

	"token-services/cmd/token-admin-api/internal/interfaces"
	"token-services/pkg/logger"
	"token-services/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// BackendUserHandlers 後台使用者處理器
type BackendUserHandlers struct {
	service interfaces.BackendUserServiceInterface
	logger  logger.Logger
}

// NewBackendUserHandlers 建立新的後台使用者處理器
func NewBackendUserHandlers(service interfaces.BackendUserServiceInterface, log logger.Logger) *BackendUserHandlers {
	return &BackendUserHandlers{
		service: service,
		logger:  log.With(zap.String("handler", "BackendUserHandlers")),
	}
}

// GetList godoc
// @Summary 後台使用者列表
// @Description 取得後台使用者列表，支援分頁和過濾
// @Tags 後台使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param account query string false "後台使用者帳號"
// @Param name query string false "後台使用者暱稱"
// @Param status query int false "帳號狀態，0=啟用, 1=停用"
// @Param page query int false "頁數" default(1)
// @Param size query int false "每頁資訊" default(10)
// @Success 200 {object} response.Response{data=[]interfaces.BackendUserResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /backendusers [get]
func (h *BackendUserHandlers) GetList(c *gin.Context) {
	var query interfaces.BackendUserListQuery
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
// @Summary 新增後台使用者
// @Description 新增後台使用者
// @Tags 後台使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param body body interfaces.CreateBackendUserRequest true "使用者資料"
// @Success 200 {object} response.Response{data=interfaces.BackendUserResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /backendusers [post]
func (h *BackendUserHandlers) Create(c *gin.Context) {
	var req interfaces.CreateBackendUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	user, err := h.service.Create(&req)
	if err != nil {
		if err.Error() == "帳號已存在" || err.Error() == "角色不存在" {
			response.BadRequest(c, err.Error())
			return
		}
		response.InternalError(c, "新增使用者失敗")
		return
	}

	response.Success(c, user)
}

// Update godoc
// @Summary 編輯後台使用者
// @Description 編輯後台使用者
// @Tags 後台使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param backendUserId path int true "使用者 ID"
// @Param body body interfaces.UpdateBackendUserRequest true "使用者資料"
// @Success 200 {object} response.Response{data=interfaces.BackendUserResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /backendusers/{backendUserId} [put]
func (h *BackendUserHandlers) Update(c *gin.Context) {
	idStr := c.Param("backendUserId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "使用者 ID 格式錯誤")
		return
	}

	var req interfaces.UpdateBackendUserRequest
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
		if err.Error() == "帳號已被使用" || err.Error() == "角色不存在" {
			response.BadRequest(c, err.Error())
			return
		}
		response.InternalError(c, "編輯使用者失敗")
		return
	}

	response.Success(c, user)
}

// Delete godoc
// @Summary 刪除後台使用者
// @Description 刪除後台使用者
// @Tags 後台使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Param backendUserId path int true "使用者 ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /backendusers/{backendUserId} [delete]
func (h *BackendUserHandlers) Delete(c *gin.Context) {
	idStr := c.Param("backendUserId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "使用者 ID 格式錯誤")
		return
	}

	if err := h.service.Delete(id); err != nil {
		if err.Error() == "使用者不存在" {
			response.NotFound(c, "使用者不存在")
			return
		}
		response.InternalError(c, "刪除使用者失敗")
		return
	}

	response.Success(c, nil)
}
