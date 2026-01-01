package handlers

import (
	"passontw-backend-services/cmd/token-admin-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// OrderHandlers 訂單處理器
type OrderHandlers struct {
	service interfaces.OrderServiceInterface
	logger  logger.Logger
}

// NewOrderHandlers 建立新的訂單處理器
func NewOrderHandlers(service interfaces.OrderServiceInterface, log logger.Logger) *OrderHandlers {
	return &OrderHandlers{
		service: service,
		logger:  log.With(zap.String("handler", "OrderHandlers")),
	}
}

// GetList godoc
// @Summary 訂單列表
// @Description 取得訂單列表，支援多種過濾條件和分頁
// @Tags 訂單
// @Accept json
// @Produce json
// @Security Bearer
// @Param account query string false "使用者的帳號"
// @Param payer query string false "收款人/付款人的暱稱"
// @Param cancelReason query string false "取消的理由"
// @Param startAt query string false "搜尋訂單建立的時間區段 startAt，格式: 2021-04-01 09:00:00"
// @Param endAt query string false "搜尋訂單建立的時間區段 endAt，格式: 2021-12-02 19:00:00"
// @Param type query int false "交易類型，0 = 買幣, 1 = 賣幣"
// @Param orderId query string false "訂單編號"
// @Param status query int false "訂單狀態，0 = 等待匯款, 1 = 已匯款未放行, 2 = 已放行, 3 = 買家已取消, 4 = 賣家已取消"
// @Param minAmount query number false "最低金額的數量"
// @Param maxAmount query number false "最高金額數量"
// @Param userId query int false "建立訂單的使用者id"
// @Param finishAtType query string false "交易時間，沒有值代表全部，overdue = 逾期, notOverdue = 未逾期"
// @Param page query int false "頁數" default(1)
// @Param size query int false "每頁數量" default(10)
// @Success 200 {object} response.Response{data=interfaces.OrderListResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /orders [get]
func (h *OrderHandlers) GetList(c *gin.Context) {
	var query interfaces.OrderListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.BadRequest(c)
		return
	}

	result, err := h.service.GetList(&query)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.Success(c, result)
}

// Complete godoc
// @Summary 完成訂單
// @Description 將訂單狀態更新為已完成
// @Tags 訂單
// @Accept json
// @Produce json
// @Security Bearer
// @Param orderId path string true "訂單 ID (UUID)"
// @Success 200 {object} response.Response{data=interfaces.OrderDetailResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /orders/{orderId} [put]
func (h *OrderHandlers) Complete(c *gin.Context) {
	orderID := c.Param("orderId")

	order, err := h.service.Complete(orderID)
	if err != nil {
		switch err.Error() {
		case "訂單 ID 格式錯誤":
			response.BadRequest(c)
		case "訂單不存在":
			response.NotFound(c)
		case "訂單已完成", "訂單已取消":
			response.BadRequest(c)
		default:
			response.InternalError(c)
		}
		return
	}

	response.Success(c, order)
}

// Cancel godoc
// @Summary 取消訂單
// @Description 取消訂單並記錄取消原因
// @Tags 訂單
// @Accept json
// @Produce json
// @Security Bearer
// @Param orderId path string true "訂單 ID (UUID)"
// @Param body body interfaces.CancelOrderRequest true "取消原因"
// @Success 200 {object} response.Response{data=interfaces.OrderDetailResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /orders/{orderId}/cancel [put]
func (h *OrderHandlers) Cancel(c *gin.Context) {
	orderID := c.Param("orderId")

	var req interfaces.CancelOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c)
		return
	}

	order, err := h.service.Cancel(orderID, &req)
	if err != nil {
		switch err.Error() {
		case "訂單 ID 格式錯誤":
			response.BadRequest(c)
		case "訂單不存在":
			response.NotFound(c)
		case "訂單已完成，無法取消", "訂單已取消":
			response.BadRequest(c)
		default:
			response.InternalError(c)
		}
		return
	}

	response.Success(c, order)
}
