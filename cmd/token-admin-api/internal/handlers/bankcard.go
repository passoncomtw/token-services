package handlers

import (
	"strconv"

	"token-admin-api/cmd/token-admin-api/internal/interfaces"
	"token-admin-api/pkg/logger"
	"token-admin-api/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// BankCardHandlers 銀行卡處理器
type BankCardHandlers struct {
	service interfaces.BankCardServiceInterface
	logger  logger.Logger
}

// NewBankCardHandlers 建立新的銀行卡處理器
func NewBankCardHandlers(service interfaces.BankCardServiceInterface, log logger.Logger) *BankCardHandlers {
	return &BankCardHandlers{
		service: service,
		logger:  log.With(zap.String("handler", "BankCardHandlers")),
	}
}

// GetList godoc
// @Summary 銀行卡列表
// @Description 取得銀行卡列表，支援多種過濾條件和分頁
// @Tags 銀行卡
// @Accept json
// @Produce json
// @Security Bearer
// @Param cardNumber query string false "銀行卡卡號"
// @Param bankCode query string false "銀行代碼"
// @Param branchName query string false "開戶支行"
// @Param bankName query string false "開戶行"
// @Param name query string false "銀行卡使用者姓名"
// @Param account query string false "銀行卡使用者帳號"
// @Param page query int true "頁數" default(1)
// @Param size query int true "每頁筆數" default(10)
// @Success 200 {object} response.Response{data=interfaces.BankCardListResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /bankcards [get]
func (h *BankCardHandlers) GetList(c *gin.Context) {
	var query interfaces.BankCardListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	result, err := h.service.GetList(&query)
	if err != nil {
		response.InternalError(c, "取得銀行卡列表失敗")
		return
	}

	response.Success(c, result)
}

// GetDetail godoc
// @Summary 銀行卡詳細資訊
// @Description 取得指定銀行卡的詳細資訊
// @Tags 銀行卡
// @Accept json
// @Produce json
// @Security Bearer
// @Param bankcardId path int true "銀行卡 ID"
// @Success 200 {object} response.Response{data=interfaces.BankCardDetailResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /bankcards/{bankcardId} [get]
func (h *BankCardHandlers) GetDetail(c *gin.Context) {
	idStr := c.Param("bankcardId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "銀行卡 ID 格式錯誤")
		return
	}

	bankCard, err := h.service.GetDetail(id)
	if err != nil {
		if err.Error() == "銀行卡不存在" {
			response.NotFound(c, "銀行卡不存在")
			return
		}
		response.InternalError(c, "取得銀行卡資訊失敗")
		return
	}

	response.Success(c, bankCard)
}

