package handlers

import (
	"net/http"
	"strconv"

	"passontw-backend-services/cmd/token-app-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

/**
 * @brief OrderHandlers 訂單處理器
 */
type OrderHandlers struct {
	service interfaces.OrderServiceInterface
	logger  logger.Logger
}

/**
 * @brief NewOrderHandlers 建立訂單處理器實例
 */
func NewOrderHandlers(
	service interfaces.OrderServiceInterface,
	logger logger.Logger,
) interfaces.OrderHandlersInterface {
	return &OrderHandlers{
		service: service,
		logger:  logger,
	}
}

// GetOrders godoc
// @Summary 取回訂單列表
// @Description 取回使用者的訂單列表（支援分頁）
// @Tags 訂單
// @Accept json
// @Produce json
// @Param size query int false "取回幾筆資料" default(10)
// @Param page query int false "取為第幾頁的資料" default(1)
// @Security Bearer
// @Success 200 {object} map[string]interface{} "取回列表成功"
// @Failure 400 {object} map[string]interface{} "請求參數錯誤"
// @Failure 401 {object} map[string]interface{} "未授權"
// @Failure 500 {object} map[string]interface{} "伺服器錯誤"
// @Router /orders [get]
func (h *OrderHandlers) GetOrders(c *gin.Context) {
	// TODO: 從 JWT token 中取得使用者 ID
	// userID := c.GetInt("user_id")
	userID := 1 // 暫時使用固定值

	// 取得分頁參數
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))

	result, err := h.service.GetOrders(userID, page, size)
	if err != nil {
		h.logger.Error("取回訂單列表失敗", zap.Error(err), zap.Int("userID", userID))
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "取回訂單列表失敗",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "取回列表成功",
		"data":    result,
	})
}

// CreateOrder godoc
// @Summary 建立訂單
// @Description 建立一筆新的訂單
// @Tags 訂單
// @Accept json
// @Produce json
// @Param data body interfaces.CreateOrderRequest true "訂單資料"
// @Security Bearer
// @Success 200 {object} map[string]interface{} "新增成功"
// @Failure 400 {object} map[string]interface{} "請求參數錯誤"
// @Failure 401 {object} map[string]interface{} "未授權"
// @Failure 500 {object} map[string]interface{} "伺服器錯誤"
// @Router /orders [post]
func (h *OrderHandlers) CreateOrder(c *gin.Context) {
	// TODO: 從 JWT token 中取得使用者 ID
	// userID := c.GetInt("user_id")
	userID := 1 // 暫時使用固定值

	var req interfaces.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "請求參數錯誤",
			"error":   err.Error(),
		})
		return
	}

	result, err := h.service.CreateOrder(userID, &req)
	if err != nil {
		h.logger.Error("建立訂單失敗", zap.Error(err), zap.Int("userID", userID))
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "新增成功",
		"data":    result,
	})
}

// MarkAsPaid godoc
// @Summary 付款已完成
// @Description 標記訂單為已付款狀態
// @Tags 訂單
// @Accept json
// @Produce json
// @Param order_id path string true "交易 Id"
// @Security Bearer
// @Success 200 {object} map[string]interface{} "付款已完成"
// @Failure 400 {object} map[string]interface{} "請求參數錯誤"
// @Failure 401 {object} map[string]interface{} "未授權"
// @Failure 404 {object} map[string]interface{} "訂單不存在"
// @Failure 500 {object} map[string]interface{} "伺服器錯誤"
// @Router /orders/{order_id}/paid [put]
func (h *OrderHandlers) MarkAsPaid(c *gin.Context) {
	// TODO: 從 JWT token 中取得使用者 ID
	// userID := c.GetInt("user_id")
	userID := 1 // 暫時使用固定值

	orderID := c.Param("order_id")
	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "訂單 ID 不能為空",
		})
		return
	}

	result, err := h.service.MarkAsPaid(userID, orderID)
	if err != nil {
		h.logger.Error("標記已付款失敗", zap.Error(err), zap.Int("userID", userID), zap.String("orderID", orderID))
		statusCode := http.StatusInternalServerError
		if err.Error() == "訂單不存在或無權操作" || err.Error() == "訂單 ID 格式錯誤" {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "付款已完成",
		"data":    result,
	})
}

// ApplyOrder godoc
// @Summary 放行
// @Description 賣家確認收款並放行訂單
// @Tags 訂單
// @Accept json
// @Produce json
// @Param order_id path string true "交易 Id"
// @Security Bearer
// @Success 200 {object} map[string]interface{} "放行成功"
// @Failure 400 {object} map[string]interface{} "請求參數錯誤"
// @Failure 401 {object} map[string]interface{} "未授權"
// @Failure 404 {object} map[string]interface{} "訂單不存在"
// @Failure 500 {object} map[string]interface{} "伺服器錯誤"
// @Router /orders/{order_id}/apply [put]
func (h *OrderHandlers) ApplyOrder(c *gin.Context) {
	// TODO: 從 JWT token 中取得使用者 ID
	// userID := c.GetInt("user_id")
	userID := 1 // 暫時使用固定值

	orderID := c.Param("order_id")
	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "訂單 ID 不能為空",
		})
		return
	}

	result, err := h.service.ApplyOrder(userID, orderID)
	if err != nil {
		h.logger.Error("放行失敗", zap.Error(err), zap.Int("userID", userID), zap.String("orderID", orderID))
		statusCode := http.StatusInternalServerError
		if err.Error() == "訂單不存在" || err.Error() == "訂單 ID 格式錯誤" || err.Error() == "無權操作此訂單" {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "放行成功",
		"data":    result,
	})
}

// RejectOrder godoc
// @Summary 取消訂單
// @Description 買家或賣家取消訂單
// @Tags 訂單
// @Accept json
// @Produce json
// @Param order_id path string true "交易 Id"
// @Param data body interfaces.RejectOrderRequest true "取消原因"
// @Security Bearer
// @Success 200 {object} map[string]interface{} "取消訂單成功"
// @Failure 400 {object} map[string]interface{} "請求參數錯誤"
// @Failure 401 {object} map[string]interface{} "未授權"
// @Failure 404 {object} map[string]interface{} "訂單不存在"
// @Failure 500 {object} map[string]interface{} "伺服器錯誤"
// @Router /orders/{order_id}/reject [put]
func (h *OrderHandlers) RejectOrder(c *gin.Context) {
	// TODO: 從 JWT token 中取得使用者 ID
	// userID := c.GetInt("user_id")
	userID := 1 // 暫時使用固定值

	orderID := c.Param("order_id")
	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "訂單 ID 不能為空",
		})
		return
	}

	var req interfaces.RejectOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "請求參數錯誤",
			"error":   err.Error(),
		})
		return
	}

	result, err := h.service.RejectOrder(userID, orderID, &req)
	if err != nil {
		h.logger.Error("取消訂單失敗", zap.Error(err), zap.Int("userID", userID), zap.String("orderID", orderID))
		statusCode := http.StatusInternalServerError
		if err.Error() == "訂單不存在" || err.Error() == "訂單 ID 格式錯誤" || err.Error() == "無權操作此訂單" {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "取消訂單成功",
		"data":    result,
	})
}

