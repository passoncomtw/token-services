package handlers

import (
	"net/http"

	"passontw-backend-services/cmd/token-app-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

/**
 * @brief PendingOrderHandlers 掛單處理器
 */
type PendingOrderHandlers struct {
	service interfaces.PendingOrderServiceInterface
	logger  logger.Logger
}

/**
 * @brief NewPendingOrderHandlers 建立掛單處理器實例
 */
func NewPendingOrderHandlers(
	service interfaces.PendingOrderServiceInterface,
	logger logger.Logger,
) interfaces.PendingOrderHandlersInterface {
	return &PendingOrderHandlers{
		service: service,
		logger:  logger,
	}
}

// GetPendingOrders godoc
// @Summary 取回掛單列表
// @Description 取回掛單列表（可以依類型和餘額篩選，支援分頁）
// @Tags 掛單
// @Accept json
// @Produce json
// @Param type query int false "掛單類型: 0: 買幣, 1: 賣幣"
// @Param balance query number false "掛單的餘額搜尋"
// @Param size query int false "取回幾筆資料" default(10)
// @Param page query int false "取為第幾頁的資料" default(1)
// @Success 200 {object} interfaces.PendingOrderListSuccessResponse "取回列表成功"
// @Failure 400 {object} interfaces.ErrorResponse "請求參數錯誤"
// @Failure 500 {object} interfaces.ErrorResponse "伺服器錯誤"
// @Router /pending/orders [get]
func (h *PendingOrderHandlers) GetPendingOrders(c *gin.Context) {
	var filter interfaces.PendingOrderFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "請求參數錯誤",
			"error":   err.Error(),
		})
		return
	}

	result, err := h.service.GetPendingOrders(&filter)
	if err != nil {
		h.logger.Error("取回掛單列表失敗", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "取回掛單列表失敗",
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

// GetPendingOrder godoc
// @Summary 取回掛單詳情
// @Description 取回單一掛單的詳細資訊
// @Tags 掛單
// @Accept json
// @Produce json
// @Param pendingorder_id path string true "掛單 Id"
// @Security Bearer
// @Success 200 {object} interfaces.PendingOrderDetailSuccessResponse "取回掛單詳情成功"
// @Failure 400 {object} interfaces.ErrorResponse "請求參數錯誤"
// @Failure 404 {object} interfaces.ErrorResponse "掛單不存在"
// @Failure 500 {object} interfaces.ErrorResponse "伺服器錯誤"
// @Router /pending/orders/{pendingorder_id} [get]
func (h *PendingOrderHandlers) GetPendingOrder(c *gin.Context) {
	pendingOrderID := c.Param("pendingorder_id")
	if pendingOrderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "掛單 ID 不能為空",
		})
		return
	}

	result, err := h.service.GetPendingOrder(pendingOrderID)
	if err != nil {
		h.logger.Error("取回掛單詳情失敗", zap.Error(err), zap.String("id", pendingOrderID))
		statusCode := http.StatusInternalServerError
		if err.Error() == "掛單不存在" || err.Error() == "掛單 ID 格式錯誤" {
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
		"data":    result,
	})
}

// CreatePendingOrder godoc
// @Summary 建立掛單
// @Description 建立一筆新的掛單（買幣或賣幣）
// @Tags 掛單
// @Accept json
// @Produce json
// @Param data body interfaces.CreatePendingOrderRequest true "掛單資料"
// @Security Bearer
// @Success 200 {object} interfaces.PendingOrderDetailSuccessResponse "新增掛單成功"
// @Failure 400 {object} interfaces.ErrorResponse "請求參數錯誤"
// @Failure 401 {object} interfaces.ErrorResponse "未授權"
// @Failure 500 {object} interfaces.ErrorResponse "伺服器錯誤"
// @Router /pending/orders [post]
func (h *PendingOrderHandlers) CreatePendingOrder(c *gin.Context) {
	userID := c.GetInt("user_id")

	var req interfaces.CreatePendingOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "請求參數錯誤",
			"error":   err.Error(),
		})
		return
	}

	result, err := h.service.CreatePendingOrder(userID, &req)
	if err != nil {
		h.logger.Error("建立掛單失敗", zap.Error(err), zap.Int("userID", userID))
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "新增掛單成功",
		"data":    result,
	})
}

// DeletePendingOrder godoc
// @Summary 刪除掛單
// @Description 刪除指定的掛單
// @Tags 掛單
// @Accept json
// @Produce json
// @Param pendingorder_id path string true "掛單 Id"
// @Security Bearer
// @Success 200 {object} interfaces.SuccessResponse "刪除掛單成功"
// @Failure 400 {object} interfaces.ErrorResponse "請求參數錯誤"
// @Failure 401 {object} interfaces.ErrorResponse "未授權"
// @Failure 404 {object} interfaces.ErrorResponse "掛單不存在"
// @Failure 500 {object} interfaces.ErrorResponse "伺服器錯誤"
// @Router /pending/orders/{pendingorder_id} [delete]
func (h *PendingOrderHandlers) DeletePendingOrder(c *gin.Context) {
	userID := c.GetInt("user_id")

	pendingOrderID := c.Param("pendingorder_id")
	if pendingOrderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "掛單 ID 不能為空",
		})
		return
	}

	err := h.service.DeletePendingOrder(userID, pendingOrderID)
	if err != nil {
		h.logger.Error("刪除掛單失敗", zap.Error(err), zap.Int("userID", userID), zap.String("id", pendingOrderID))
		statusCode := http.StatusInternalServerError
		if err.Error() == "掛單不存在或無權操作" || err.Error() == "掛單 ID 格式錯誤" {
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
		"message": "刪除掛單成功",
	})
}

// LockPendingOrder godoc
// @Summary 凍結掛單
// @Description 暫停指定的掛單
// @Tags 掛單
// @Accept json
// @Produce json
// @Param pendingorder_id path string true "掛單 Id"
// @Security Bearer
// @Success 200 {object} interfaces.SuccessResponse "凍結掛單成功"
// @Failure 400 {object} interfaces.ErrorResponse "請求參數錯誤"
// @Failure 401 {object} interfaces.ErrorResponse "未授權"
// @Failure 404 {object} interfaces.ErrorResponse "掛單不存在"
// @Failure 500 {object} interfaces.ErrorResponse "伺服器錯誤"
// @Router /pending/orders/{pendingorder_id}/lock [put]
func (h *PendingOrderHandlers) LockPendingOrder(c *gin.Context) {
	userID := c.GetInt("user_id")

	pendingOrderID := c.Param("pendingorder_id")
	if pendingOrderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "掛單 ID 不能為空",
		})
		return
	}

	err := h.service.LockPendingOrder(userID, pendingOrderID)
	if err != nil {
		h.logger.Error("凍結掛單失敗", zap.Error(err), zap.Int("userID", userID), zap.String("id", pendingOrderID))
		statusCode := http.StatusInternalServerError
		if err.Error() == "掛單不存在或無權操作" || err.Error() == "掛單 ID 格式錯誤" {
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
		"message": "凍結掛單成功",
	})
}

// UnlockPendingOrder godoc
// @Summary 解除凍結掛單
// @Description 恢復指定掛單的交易
// @Tags 掛單
// @Accept json
// @Produce json
// @Param pendingorder_id path string true "掛單 Id"
// @Security Bearer
// @Success 200 {object} interfaces.SuccessResponse "解除凍結掛單成功"
// @Failure 400 {object} interfaces.ErrorResponse "請求參數錯誤"
// @Failure 401 {object} interfaces.ErrorResponse "未授權"
// @Failure 404 {object} interfaces.ErrorResponse "掛單不存在"
// @Failure 500 {object} interfaces.ErrorResponse "伺服器錯誤"
// @Router /pending/orders/{pendingorder_id}/unlock [put]
func (h *PendingOrderHandlers) UnlockPendingOrder(c *gin.Context) {
	userID := c.GetInt("user_id")

	pendingOrderID := c.Param("pendingorder_id")
	if pendingOrderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "掛單 ID 不能為空",
		})
		return
	}

	err := h.service.UnlockPendingOrder(userID, pendingOrderID)
	if err != nil {
		h.logger.Error("解除凍結掛單失敗", zap.Error(err), zap.Int("userID", userID), zap.String("id", pendingOrderID))
		statusCode := http.StatusInternalServerError
		if err.Error() == "掛單不存在或無權操作" || err.Error() == "掛單 ID 格式錯誤" {
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
		"message": "解除凍結掛單成功",
	})
}

// GetUserPendingOrders godoc
// @Summary 取回使用者自己建立的掛單
// @Description 透過 JWT token 中的 user_id 取回使用者自己建立的買幣和賣幣掛單
// @Tags 使用者
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} interfaces.UserPendingOrdersSuccessResponse "取回成功"
// @Failure 401 {object} interfaces.ErrorResponse "未授權"
// @Failure 500 {object} interfaces.ErrorResponse "伺服器錯誤"
// @Router /users/pending/orders [get]
func (h *PendingOrderHandlers) GetUserPendingOrders(c *gin.Context) {
	userID := c.GetInt("user_id")

	result, err := h.service.GetUserPendingOrders(userID)
	if err != nil {
		h.logger.Error("取回使用者掛單失敗", zap.Error(err), zap.Int("userID", userID))
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "取回使用者掛單失敗",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}
