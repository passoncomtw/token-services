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
	// TODO: 從 JWT token 中取得使用者 ID
	// userID := c.GetInt("user_id")
	userID := 1 // 暫時使用固定值

	bankCards, err := h.bankCardService.GetBankCards(userID)
	if err != nil {
		response.InternalError(c, "取回銀行卡列表失敗")
		return
	}

	response.SuccessWithMessage(c, "取回列表成功", bankCards)
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
	// TODO: 從 JWT token 中取得使用者 ID
	// userID := c.GetInt("user_id")
	userID := 1 // 暫時使用固定值

	var req interfaces.CreateBankCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤: "+err.Error())
		return
	}

	bankCard, err := h.bankCardService.CreateBankCard(userID, &req)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.SuccessWithMessage(c, "新增成功", bankCard)
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
	// TODO: 從 JWT token 中取得使用者 ID
	// userID := c.GetInt("user_id")
	userID := 1 // 暫時使用固定值

	bankcardID, err := strconv.Atoi(c.Param("bankcard_id"))
	if err != nil {
		response.BadRequest(c, "無效的銀行卡 ID")
		return
	}

	var req interfaces.UpdateBankCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤: "+err.Error())
		return
	}

	bankCard, err := h.bankCardService.UpdateBankCard(userID, bankcardID, &req)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.SuccessWithMessage(c, "新增成功", bankCard)
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
	// TODO: 從 JWT token 中取得使用者 ID
	// userID := c.GetInt("user_id")
	userID := 1 // 暫時使用固定值

	bankcardID, err := strconv.Atoi(c.Param("bankcard_id"))
	if err != nil {
		response.BadRequest(c, "無效的銀行卡 ID")
		return
	}

	if err := h.bankCardService.DeleteBankCard(userID, bankcardID); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.SuccessWithMessage(c, "刪除成功", nil)
}

