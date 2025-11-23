package handlers

import (
	"net/http"
	"passontw-backend-services/cmd/pos-merchant-service/internal/services"
	"passontw-backend-services/cmd/pos-merchant-service/internal/utils"

	"github.com/gin-gonic/gin"
)

// CreateOrderHandler 建立訂單
// @Summary 建立訂單
// @Description 建立新訂單，處理結帳邏輯
// @Tags Order
// @Accept json
// @Produce json
// @Param request body services.CreateOrderRequest true "訂單資訊"
// @Success 201 {object} utils.SuccessResponse "訂單建立成功"
// @Failure 400 {object} utils.ErrorResponse "請求參數錯誤"
// @Failure 401 {object} utils.ErrorResponse "未授權"
// @Failure 404 {object} utils.ErrorResponse "商品不存在"
// @Failure 409 {object} utils.ErrorResponse "實收金額不足"
// @Failure 500 {object} utils.ErrorResponse "系統錯誤"
// @Security BearerAuth
// @Router /api/orders [post]
func CreateOrderHandler(orderSvc *services.OrderService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req services.CreateOrderRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.RespondWithError(c, utils.NewAPIError(utils.ErrorCodeInvalidRequest, "請求參數錯誤", http.StatusBadRequest, err))
			return
		}

		claims, exists := c.Get("user_claims")
		if !exists {
			utils.RespondWithError(c, utils.ErrUnauthorized)
			return
		}
		customClaims, ok := claims.(*utils.CustomClaims)
		if !ok {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		order, err := orderSvc.CreateOrder(c.Request.Context(), customClaims.MerchantID, customClaims.UserID, &req)
		if err != nil {
			msg := err.Error()
			if msg == "訂單商品不能為空" {
				utils.RespondWithError(c, utils.NewAPIError(utils.ErrorCodeInvalidRequest, msg, http.StatusBadRequest, err))
				return
			}
			if msg == "實收金額不足" {
				utils.RespondWithError(c, utils.NewAPIError("INSUFFICIENT_CASH", msg, http.StatusConflict, err))
				return
			}
			if msg == "商家 ID 格式錯誤" || msg[:6] == "商品ID" || msg[:6] == "商品 I" {
				utils.RespondWithError(c, utils.NewAPIError(utils.ErrorCodeInvalidRequest, msg, http.StatusBadRequest, err))
				return
			}
			if msg[:4] == "商品不存在" {
				utils.RespondWithError(c, utils.NewAPIError(utils.ErrorCodeProductNotFound, msg, http.StatusNotFound, err))
				return
			}
			if msg[:4] == "商品已下架" {
				utils.RespondWithError(c, utils.NewAPIError(utils.ErrorCodeProductNotFound, msg, http.StatusNotFound, err))
				return
			}
			utils.RespondWithError(c, utils.WrapInternalError(err))
			return
		}

		utils.RespondWithSuccess(c, "訂單建立成功", order)
	}
}

// GetOrderHandler 查詢訂單
// @Summary 查詢訂單
// @Description 查詢單一訂單資訊
// @Tags Order
// @Accept json
// @Produce json
// @Param id path string true "訂單 ID"
// @Success 200 {object} utils.SuccessResponse "查詢成功"
// @Failure 401 {object} utils.ErrorResponse "未授權"
// @Failure 404 {object} utils.ErrorResponse "訂單不存在"
// @Failure 500 {object} utils.ErrorResponse "系統錯誤"
// @Security BearerAuth
// @Router /api/orders/{id} [get]
func GetOrderHandler(orderSvc *services.OrderService) gin.HandlerFunc {
	return func(c *gin.Context) {
		orderID := c.Param("id")
		if orderID == "" {
			utils.RespondWithError(c, utils.NewAPIError(utils.ErrorCodeInvalidRequest, "訂單 ID 必填", http.StatusBadRequest, nil))
			return
		}
		claims, exists := c.Get("user_claims")
		if !exists {
			utils.RespondWithError(c, utils.ErrUnauthorized)
			return
		}
		customClaims, ok := claims.(*utils.CustomClaims)
		if !ok {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}
		order, err := orderSvc.GetOrderByID(c.Request.Context(), orderID, customClaims.MerchantID)
		if err != nil {
			utils.RespondWithError(c, utils.NewAPIError("ORDER_NOT_FOUND", "訂單不存在", http.StatusNotFound, err))
			return
		}
		utils.RespondWithSuccess(c, "查詢成功", order)
	}
}
