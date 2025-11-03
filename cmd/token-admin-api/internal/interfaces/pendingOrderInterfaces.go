package interfaces

import (
	"token-services/pkg/models"

	"github.com/gin-gonic/gin"
)

// ==================== PendingOrder 介面定義 ====================

// PendingOrderListQuery 掛單列表查詢參數
type PendingOrderListQuery struct {
	PendingOrderID string `form:"pendingOrderId"`
	StartAt        string `form:"startAt"`
	EndAt          string `form:"endAt"`
	Account        string `form:"account"`
	MinAmount      *int64 `form:"minAmount"`
	MaxAmount      *int64 `form:"maxAmount"`
	MinBalance     *int64 `form:"minBalance"`
	MaxBalance     *int64 `form:"maxBalance"`
	UserID         *int   `form:"userId"`
	Type           *int   `form:"type"`
	Status         *int   `form:"status"`
	Page           int    `form:"page" binding:"omitempty,min=1"`
	Size           int    `form:"size" binding:"omitempty,min=1,max=100"`
}

// PendingOrderServiceInterface 掛單服務介面
type PendingOrderServiceInterface interface {
	GetList(query *PendingOrderListQuery) (*PendingOrderListResponse, error)
	Stop(pendingOrderID string) error
	Open(pendingOrderID string) error
	Cancel(pendingOrderID string) error
	Delete(pendingOrderID string) error
}

// PendingOrderHandlersInterface 掛單處理器介面
type PendingOrderHandlersInterface interface {
	GetList(c *gin.Context)
	Stop(c *gin.Context)
	Open(c *gin.Context)
	Cancel(c *gin.Context)
	Delete(c *gin.Context)
}

// ConvertToPendingOrderResponse 將 model 轉換為掛單回應格式
func ConvertToPendingOrderResponse(po *models.PendingOrder) *PendingOrderResponse {
	resp := &PendingOrderResponse{
		ID:                 po.ID.String(),
		Type:               po.Type,
		Status:             po.Status,
		Amount:             po.Amount,
		MinAmount:          po.MinAmount,
		Balance:            po.Balance,
		TransactionMinutes: po.TransactionMinutes,
		User:               make(map[string]interface{}),
		BankCard:           make(map[string]interface{}),
		CreateAt:           po.CreatedAt.Format("2006-01-02 15:04:05"),
		CancelAmount:       po.CancelAmount,
		ProcessAmount:      po.ProcessAmount,
		DoneAmount:         po.DoneAmount,
		CancelCount:        po.CancelCount,
		DoneCount:          po.DoneCount,
		ProcessCount:       po.ProcessCount,
	}

	// 使用者資訊
	if po.User != nil {
		resp.User = map[string]interface{}{
			"id":      po.User.ID,
			"name":    po.User.Name,
			"account": po.User.Account,
		}
	}

	// 銀行卡資訊
	if po.BankCard != nil {
		resp.BankCard = map[string]interface{}{
			"id":         po.BankCard.ID,
			"cardNumber": po.BankCard.CardNumber,
			"name":       po.BankCard.Name,
		}
	}

	return resp
}
