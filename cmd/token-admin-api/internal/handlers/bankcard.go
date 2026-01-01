package handlers

import (
	"strconv"

	"passontw-backend-services/cmd/token-admin-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/response"

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
// @Param page query int false "頁數" default(1)
// @Param size query int false "每頁筆數" default(10)
// @Success 200 {object} response.ListResponse{items=[]interfaces.BankCardDetailResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /bankcards [get]
func (h *BankCardHandlers) GetList(c *gin.Context) {
	var query interfaces.BankCardListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.BadRequest(c)
		return
	}

	bankCards, totalCount, err := h.service.GetList(&query)
	if err != nil {
		response.InternalError(c)
		return
	}

	// 設定預設值
	if query.Page == 0 {
		query.Page = 1
	}
	if query.Size == 0 {
		query.Size = 10
	}

	pagination := response.Pagination{
		TotalCount: int(totalCount),
		Page:       query.Page,
		Size:       query.Size,
	}

	response.GetListResponse(c, bankCards, pagination)
}

// GetDetail godoc
// @Summary 銀行卡詳細資訊
// @Description 取得指定銀行卡的詳細資訊
// @Tags 銀行卡
// @Accept json
// @Produce json
// @Security Bearer
// @Param bankcardId path int true "銀行卡 ID" default(1)
// @Success 200 {object} response.Response{data=interfaces.BankCardDetailResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /bankcards/{bankcardId} [get]
func (h *BankCardHandlers) GetDetail(c *gin.Context) {
	idStr := c.Param("bankcardId")

	// 使用 ParseInt 來更好地處理大數字和範圍檢查
	id64, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		h.logger.Error("無效的銀行卡 ID 格式", zap.String("id", idStr), zap.Error(err))
		response.BadRequest(c)
		return
	}

	// 轉換為 int（已確保在 int32 範圍內）
	id := int(id64)

	// 驗證 ID 範圍（必須大於 0）
	if id < 1 {
		h.logger.Error("銀行卡 ID 必須大於 0", zap.String("id", idStr))
		response.BadRequest(c)
		return
	}

	bankCard, err := h.service.GetDetail(id)
	if err != nil {
		if err.Error() == "銀行卡不存在" {
			response.NotFound(c)
			return
		}
		h.logger.Error("取得銀行卡詳細資訊失敗", zap.Int("id", id), zap.Error(err))
		response.InternalErrorWithDetail(c, err)
		return
	}

	response.Success(c, bankCard)
}
