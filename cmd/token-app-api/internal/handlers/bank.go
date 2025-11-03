package handlers

import (
	"token-services/cmd/token-app-api/internal/interfaces"
	"token-services/pkg/logger"
	"token-services/pkg/response"

	"github.com/gin-gonic/gin"
)

type BankHandlers struct {
	bankService interfaces.BankServiceInterface
	logger      logger.Logger
}

func NewBankHandlers(bankService interfaces.BankServiceInterface, logger logger.Logger) *BankHandlers {
	return &BankHandlers{
		bankService: bankService,
		logger:      logger,
	}
}

// ==================== Bank Handlers ====================

// GetBanks godoc
// @Summary 取回銀行列表
// @Description 取回所有可用銀行列表
// @Tags 銀行
// @Accept json
// @Produce json
// @Success 200 {object} response.Response{data=[]interfaces.BankDetail}
// @Failure 500 {object} response.ErrorResponse
// @Router /banks [get]
func (h *BankHandlers) GetBanks(c *gin.Context) {
	banks, err := h.bankService.GetBanks()
	if err != nil {
		response.InternalError(c, "取回銀行列表失敗")
		return
	}

	response.SuccessWithMessage(c, "取回列表成功", banks)
}

