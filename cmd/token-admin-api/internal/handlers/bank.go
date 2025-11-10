package handlers

import (
	"strconv"

	"passontw-backend-services/cmd/token-admin-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// BankHandlers 銀行處理器
type BankHandlers struct {
	service interfaces.BankServiceInterface
	logger  logger.Logger
}

// NewBankHandlers 建立新的銀行處理器
func NewBankHandlers(service interfaces.BankServiceInterface, log logger.Logger) *BankHandlers {
	return &BankHandlers{
		service: service,
		logger:  log.With(zap.String("handler", "BankHandlers")),
	}
}

// GetList godoc
// @Summary 銀行列表
// @Description 取得所有銀行列表
// @Tags 銀行
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} response.Response{data=[]interfaces.BankResponse}
// @Failure 500 {object} response.ErrorResponse
// @Router /banks [get]
func (h *BankHandlers) GetList(c *gin.Context) {
	banks, err := h.service.GetList()
	if err != nil {
		response.InternalError(c, "取得銀行列表失敗")
		return
	}

	response.Success(c, banks)
}

// Create godoc
// @Summary 新增銀行
// @Description 新增銀行
// @Tags 銀行
// @Accept json
// @Produce json
// @Security Bearer
// @Param body body interfaces.CreateBankRequest true "銀行資料"
// @Success 200 {object} response.Response{data=interfaces.BankResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /banks [post]
func (h *BankHandlers) Create(c *gin.Context) {
	var req interfaces.CreateBankRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	bank, err := h.service.Create(&req)
	if err != nil {
		if err.Error() == "銀行代碼已存在" {
			response.BadRequest(c, err.Error())
			return
		}
		response.InternalError(c, "新增銀行失敗")
		return
	}

	response.Success(c, bank)
}

// Update godoc
// @Summary 編輯銀行
// @Description 編輯銀行資訊
// @Tags 銀行
// @Accept json
// @Produce json
// @Security Bearer
// @Param bankId path int true "銀行 ID"
// @Param body body interfaces.UpdateBankRequest true "銀行資料"
// @Success 200 {object} response.Response{data=interfaces.BankResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /banks/{bankId} [put]
func (h *BankHandlers) Update(c *gin.Context) {
	idStr := c.Param("bankId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "銀行 ID 格式錯誤")
		return
	}

	var req interfaces.UpdateBankRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "請求參數錯誤")
		return
	}

	bank, err := h.service.Update(id, &req)
	if err != nil {
		if err.Error() == "銀行不存在" {
			response.NotFound(c, "銀行不存在")
			return
		}
		if err.Error() == "銀行代碼已被使用" {
			response.BadRequest(c, err.Error())
			return
		}
		response.InternalError(c, "編輯銀行失敗")
		return
	}

	response.Success(c, bank)
}
