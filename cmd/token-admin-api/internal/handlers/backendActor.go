package handlers

import (
	"passontw-backend-services/cmd/token-admin-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// BackendActorHandlers 後台角色處理器
type BackendActorHandlers struct {
	service interfaces.BackendActorServiceInterface
	logger  logger.Logger
}

// NewBackendActorHandlers 建立新的後台角色處理器
func NewBackendActorHandlers(service interfaces.BackendActorServiceInterface, log logger.Logger) *BackendActorHandlers {
	return &BackendActorHandlers{
		service: service,
		logger:  log.With(zap.String("handler", "BackendActorHandlers")),
	}
}

// GetAll godoc
// @Summary 取回角色列表
// @Description 取回所有後台角色列表
// @Tags 後台角色
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} response.ListResponseWithoutPagination{items=[]interfaces.BackendActorResponse}
// @Failure 500 {object} response.ErrorResponse
// @Router /backendactors [get]
func (h *BackendActorHandlers) GetAll(c *gin.Context) {
	actors, err := h.service.GetAll()
	if err != nil {
		response.InternalError(c)
		return
	}

	response.GetListResponseWithoutPagination(c, actors)
}

// Create godoc
// @Summary 新增後台角色
// @Description 新增後台角色
// @Tags 後台角色
// @Accept json
// @Produce json
// @Security Bearer
// @Param body body interfaces.CreateBackendActorRequest true "角色資料"
// @Success 200 {object} response.Response{data=interfaces.BackendActorResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /backendactors [post]
func (h *BackendActorHandlers) Create(c *gin.Context) {
	var req interfaces.CreateBackendActorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c)
		return
	}

	actor, err := h.service.Create(&req)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.Success(c, actor)
}

// GetPermissions godoc
// @Summary 取回所有的權限
// @Description 取回所有的權限樹狀結構
// @Tags 後台角色
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} response.ListResponseWithoutPagination{items=interfaces.PermissionNode}
// @Failure 500 {object} response.ErrorResponse
// @Router /backendactors/permissions [get]
func (h *BackendActorHandlers) GetPermissions(c *gin.Context) {
	permissions, err := h.service.GetPermissions()
	if err != nil {
		response.InternalError(c)
		return
	}

	response.GetListResponseWithoutPagination(c, permissions)
}
