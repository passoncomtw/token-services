package interfaces

import (
	"passontw-backend-services/pkg/models"

	"github.com/gin-gonic/gin"
)

// ==================== BankCard 介面定義 ====================

// BankCardDetailResponse 銀行卡詳細回應
type BankCardDetailResponse struct {
	ID         int    `json:"id"`
	CreateAt   string `json:"createAt"`
	Name       string `json:"name"`
	CardNumber string `json:"cardNumber"`
	BranchName string `json:"branchName"`
	Status     string `json:"status"`
	BankID     int    `json:"bankId"`
	BankName   string `json:"bankName,omitempty"`
	BankCode   string `json:"bankCode,omitempty"`
	Account    string `json:"account,omitempty"`
}

// BankCardListResponse 銀行卡列表回應
type BankCardListResponse struct {
	Count int64                     `json:"count"`
	Rows  []*BankCardDetailResponse `json:"rows"`
}

// BankCardListQuery 銀行卡列表查詢參數
type BankCardListQuery struct {
	CardNumber string `form:"cardNumber"`
	BankCode   string `form:"bankCode"`
	BranchName string `form:"branchName"`
	BankName   string `form:"bankName"`
	Name       string `form:"name"`
	Account    string `form:"account"`
	Page       int    `form:"page" binding:"required,min=1"`
	Size       int    `form:"size" binding:"required,min=1,max=100"`
}

// BankCardServiceInterface 銀行卡服務介面
type BankCardServiceInterface interface {
	GetList(query *BankCardListQuery) ([]*BankCardDetailResponse, int64, error)
	GetDetail(id int) (*BankCardDetailResponse, error)
}

// BankCardHandlersInterface 銀行卡處理器介面
type BankCardHandlersInterface interface {
	GetList(c *gin.Context)
	GetDetail(c *gin.Context)
}

// ConvertToBankCardDetailResponse 將 model 轉換為詳細回應格式
func ConvertToBankCardDetailResponse(card *models.BankCard) *BankCardDetailResponse {
	resp := &BankCardDetailResponse{
		ID:         card.ID,
		CreateAt:   card.CreatedAt.Format("2006-01-02 15:04:05"),
		Name:       card.Name,
		CardNumber: card.CardNumber,
		BranchName: card.BranchName,
		Status:     card.Status,
	}

	// 銀行資訊
	if card.BankID != nil {
		resp.BankID = *card.BankID
	}
	if card.Bank != nil {
		resp.BankName = card.Bank.BankName
		resp.BankCode = card.Bank.BankCode
	}

	// 使用者資訊
	if card.User != nil {
		resp.Account = card.User.Account
	}

	return resp
}
