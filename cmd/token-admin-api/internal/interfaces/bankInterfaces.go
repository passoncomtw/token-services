package interfaces

import (
	"token-admin-api/pkg/models"

	"github.com/gin-gonic/gin"
)

// ==================== Bank 介面定義 ====================

// BankResponse 銀行回應
type BankResponse struct {
	ID       int    `json:"id"`
	BankName string `json:"bankName"`
	BankCode string `json:"bankCode"`
	Status   int    `json:"status"`
}

// CreateBankRequest 新增銀行請求
type CreateBankRequest struct {
	BankName string `json:"bankName" binding:"required"`
	BankCode string `json:"bankCode" binding:"required"`
}

// UpdateBankRequest 編輯銀行請求
type UpdateBankRequest struct {
	BankName string `json:"bankName" binding:"required"`
	BankCode string `json:"bankCode" binding:"required"`
}

// BankServiceInterface 銀行服務介面
type BankServiceInterface interface {
	GetList() ([]*BankResponse, error)
	Create(req *CreateBankRequest) (*BankResponse, error)
	Update(id int, req *UpdateBankRequest) (*BankResponse, error)
}

// BankHandlersInterface 銀行處理器介面
type BankHandlersInterface interface {
	GetList(c *gin.Context)
	Create(c *gin.Context)
	Update(c *gin.Context)
}

// ConvertToBankResponse 將 model 轉換為回應格式
func ConvertToBankResponse(bank *models.Bank) *BankResponse {
	return &BankResponse{
		ID:       bank.ID,
		BankName: bank.BankName,
		BankCode: bank.BankCode,
		Status:   bank.Status,
	}
}

