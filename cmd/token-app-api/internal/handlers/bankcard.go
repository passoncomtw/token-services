package handlers

import (
	"strconv"

	"passontw-backend-services/cmd/token-app-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/response"

	"github.com/gin-gonic/gin"
)

type BankCardHandlers struct {
	bankCardService interfaces.BankCardServiceInterface
	logger          logger.Logger
}

func NewBankCardHandlers(bankCardService interfaces.BankCardServiceInterface, logger logger.Logger) *BankCardHandlers {
	return &BankCardHandlers{
		bankCardService: bankCardService,
		logger:          logger,
	}
}

// ==================== BankCard Handlers ====================

// GetBankCards godoc
// @Summary 取回銀行卡列表
// @Description 取回使用者的銀行卡列表
// @Tags 銀行卡
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} response.Response{data=[]interfaces.BankCardDetail}
// @Failure 401 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /bankcards [get]
func (h *BankCardHandlers) GetBankCards(c *gin.Context) {
	userID := c.GetInt("user_id")

	bankCards, err := h.bankCardService.GetBankCards(userID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.SuccessWithMessage(c, bankCards)
}

// CreateBankCard godoc
// @Summary 新增銀行卡
// @Description 新增銀行卡
// @Tags 銀行卡
// @Accept json
// @Produce json
// @Security Bearer
// @Param data body interfaces.CreateBankCardRequest true "銀行卡資訊"
// @Success 200 {object} response.Response{data=interfaces.BankCardDetail}
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Router /bankcards [post]
func (h *BankCardHandlers) CreateBankCard(c *gin.Context) {
	userID := c.GetInt("user_id")

	var req interfaces.CreateBankCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c)
		return
	}

	bankCard, err := h.bankCardService.CreateBankCard(userID, &req)
	if err != nil {
		response.BadRequest(c)
		return
	}

	response.SuccessWithMessage(c, bankCard)
}

// UpdateBankCard godoc
// @Summary 編輯銀行卡
// @Description 編輯銀行卡資訊
// @Tags 銀行卡
// @Accept json
// @Produce json
// @Security Bearer
// @Param bankcard_id path int true "銀行卡 ID"
// @Param data body interfaces.UpdateBankCardRequest true "更新資訊"
// @Success 200 {object} response.Response{data=interfaces.BankCardDetail}
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /bankcards/{bankcard_id} [put]
func (h *BankCardHandlers) UpdateBankCard(c *gin.Context) {
	userID := c.GetInt("user_id")

	bankcardID, err := strconv.Atoi(c.Param("bankcard_id"))
	if err != nil {
		response.BadRequest(c)
		return
	}

	var req interfaces.UpdateBankCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c)
		return
	}

	bankCard, err := h.bankCardService.UpdateBankCard(userID, bankcardID, &req)
	if err != nil {
		response.BadRequest(c)
		return
	}

	response.SuccessWithMessage(c, bankCard)
}

// DeleteBankCard godoc
// @Summary 刪除銀行卡
// @Description 刪除銀行卡
// @Tags 銀行卡
// @Accept json
// @Produce json
// @Security Bearer
// @Param bankcard_id path int true "銀行卡 ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /bankcards/{bankcard_id} [delete]
func (h *BankCardHandlers) DeleteBankCard(c *gin.Context) {
	userID := c.GetInt("user_id")

	bankcardID, err := strconv.Atoi(c.Param("bankcard_id"))
	if err != nil {
		response.BadRequest(c)
		return
	}

	if err := h.bankCardService.DeleteBankCard(userID, bankcardID); err != nil {
		response.BadRequest(c)
		return
	}

	response.SuccessWithMessage(c, nil)
}
