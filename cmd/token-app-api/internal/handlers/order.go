package handlers

import (
	"github.com/yourusername/project/cmd/github.com/yourusername/project/internal/interfaces"
	"github.com/yourusername/project/pkg/response"

	"github.com/gin-gonic/gin"
)

// ==================== Order Handlers ====================
type OrderHandlers struct {
	orderService interfaces.OrderServiceInterface
}

func NewOrderHandlers(orderService interfaces.OrderServiceInterface) *OrderHandlers {
	return &OrderHandlers{orderService: orderService}
}

// CreateOrderRequest 建立訂單請求
type CreateOrderRequest struct {
	UserID string `json:"user_id" binding:"required" example:"user_Alice"`
}

// CreateOrder godoc
// @Summary 建立訂單
// @Description 為使用者建立新訂單
// @Tags orders
// @Accept json
// @Produce json
// @Security Bearer
// @Param order body CreateOrderRequest true "訂單資訊"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Router /api/v1/orders [post]
func (r *OrderHandlers) CreateOrder(c *gin.Context) {
	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	orderID, err := r.orderService.CreateOrder(req.UserID)
	if err != nil {
		response.InternalError(c, "建立訂單失敗: "+err.Error())
		return
	}

	response.Success(c, gin.H{
		"order_id": orderID,
	})
}

// GetOrder godoc
// @Summary 取得訂單
// @Description 根據訂單 ID 取得訂單資訊
// @Tags orders
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "訂單 ID"
// @Success 200 {object} response.Response
// @Router /api/v1/orders/{id} [get]
func (r *OrderHandlers) GetOrder(c *gin.Context) {
	orderID := c.Param("id")

	response.Success(c, gin.H{
		"order_id": orderID,
	})
}
