package handlers

import (
	"token-services/cmd/token-admin-api/internal/interfaces"
	"token-services/pkg/logger"
	"token-services/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// PendingOrderHandlers 掛單處理器
type PendingOrderHandlers struct {
	service interfaces.PendingOrderServiceInterface
	logger  logger.Logger
}

// NewPendingOrderHandlers 建立新的掛單處理器
func NewPendingOrderHandlers(service interfaces.PendingOrderServiceInterface, log logger.Logger) *PendingOrderHandlers {
	return &PendingOrderHandlers{
		service: service,
		logger:  log.With(zap.String("handler", "PendingOrderHandlers")),
	}
}

// GetList godoc
// @Summary 掛單列表
// @Description 取得掛單列表，支援多種過濾條件和分頁
// @Tags 掛單
// @Accept json
// @Produce json
// @Security Bearer
// @Param pendingOrderId query string false "掛單 ID (UUID)"
// @Param startAt query string false "開始的時間，格式: 2021-04-01 00:00:00"
// @Param endAt query string false "結束的時間，格式: 2021-04-02 00:00:00"
// @Param account query string false "建立掛單的使用者 account"
// @Param minAmount query int false "最小的數量"
// @Param maxAmount query int false "最大的數量"
// @Param minBalance query int false "最小的餘額"
// @Param maxBalance query int false "最大的餘額"
// @Param userId query int false "建立掛單的使用者id"
// @Param type query int false "類型，0 = 買幣, 1 = 賣幣"
// @Param status query int false "掛單狀態，0 = 掛單中, 1 = 暫停掛單, 2 = 取消掛單, 3 = 已刪除掛單"
// @Param page query int false "頁數" default(1)
// @Param size query int false "每頁數量" default(10)
// @Success 200 {object} response.Response{data=interfaces.PendingOrderListResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /pending/orders [get]
func (h *PendingOrderHandlers) GetList(c *gin.Context) {
	var query interfaces.PendingOrderListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	result, err := h.service.GetList(&query)
	if err != nil {
		response.InternalError(c, "取得掛單列表失敗")
		return
	}

	response.Success(c, result)
}

// Stop godoc
// @Summary 暫停掛單
// @Description 將掛單狀態更新為暫停
// @Tags 掛單
// @Accept json
// @Produce json
// @Security Bearer
// @Param pendingOrderId path string true "掛單 ID (UUID)"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /pending/orders/{pendingOrderId}/stop [put]
func (h *PendingOrderHandlers) Stop(c *gin.Context) {
	pendingOrderID := c.Param("pendingOrderId")

	err := h.service.Stop(pendingOrderID)
	if err != nil {
		switch err.Error() {
		case "掛單 ID 格式錯誤":
			response.BadRequest(c, err.Error())
		case "掛單不存在":
			response.NotFound(c, err.Error())
		case "掛單已暫停", "掛單已取消或刪除":
			response.BadRequest(c, err.Error())
		default:
			response.InternalError(c, "暫停掛單失敗")
		}
		return
	}

	response.Success(c, nil)
}

// Open godoc
// @Summary 開啟掛單
// @Description 將掛單狀態更新為開啟（掛單中）
// @Tags 掛單
// @Accept json
// @Produce json
// @Security Bearer
// @Param pendingOrderId path string true "掛單 ID (UUID)"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /pending/orders/{pendingOrderId}/open [put]
func (h *PendingOrderHandlers) Open(c *gin.Context) {
	pendingOrderID := c.Param("pendingOrderId")

	err := h.service.Open(pendingOrderID)
	if err != nil {
		switch err.Error() {
		case "掛單 ID 格式錯誤":
			response.BadRequest(c, err.Error())
		case "掛單不存在":
			response.NotFound(c, err.Error())
		case "掛單已開啟", "掛單已取消或刪除":
			response.BadRequest(c, err.Error())
		default:
			response.InternalError(c, "開啟掛單失敗")
		}
		return
	}

	response.Success(c, nil)
}

// Cancel godoc
// @Summary 取消掛單
// @Description 取消掛單
// @Tags 掛單
// @Accept json
// @Produce json
// @Security Bearer
// @Param pendingOrderId path string true "掛單 ID (UUID)"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /pending/orders/{pendingOrderId}/cancel [put]
func (h *PendingOrderHandlers) Cancel(c *gin.Context) {
	pendingOrderID := c.Param("pendingOrderId")

	err := h.service.Cancel(pendingOrderID)
	if err != nil {
		switch err.Error() {
		case "掛單 ID 格式錯誤":
			response.BadRequest(c, err.Error())
		case "掛單不存在":
			response.NotFound(c, err.Error())
		case "掛單已取消", "掛單已刪除":
			response.BadRequest(c, err.Error())
		default:
			response.InternalError(c, "取消掛單失敗")
		}
		return
	}

	response.Success(c, nil)
}

// Delete godoc
// @Summary 刪除掛單
// @Description 刪除掛單（軟刪除）
// @Tags 掛單
// @Accept json
// @Produce json
// @Security Bearer
// @Param pendingOrderId path string true "掛單 ID (UUID)"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /pending/orders/{pendingOrderId} [delete]
func (h *PendingOrderHandlers) Delete(c *gin.Context) {
	pendingOrderID := c.Param("pendingOrderId")

	err := h.service.Delete(pendingOrderID)
	if err != nil {
		switch err.Error() {
		case "掛單 ID 格式錯誤":
			response.BadRequest(c, err.Error())
		case "掛單不存在":
			response.NotFound(c, err.Error())
		default:
			response.InternalError(c, "刪除掛單失敗")
		}
		return
	}

	response.Success(c, nil)
}
