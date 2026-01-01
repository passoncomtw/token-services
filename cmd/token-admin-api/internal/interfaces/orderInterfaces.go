package interfaces

import (
	"passontw-backend-services/pkg/models"

	"github.com/gin-gonic/gin"
)

// ==================== Order 介面定義 ====================

// OrderListItemResponse 訂單列表項目回應
type OrderListItemResponse struct {
	ID                  string                 `json:"id"`
	CreatedAt           string                 `json:"createdAt"`
	Status              int                    `json:"status"`
	CancelReason        *string                `json:"cancelReason"`
	Amount              float64                `json:"amount"`
	FinishAt            *int64                 `json:"finishAt"`
	Sender              map[string]interface{} `json:"sender"`
	SenderBankcard      map[string]interface{} `json:"senderBankcard"`
	BeneficiaryBankcard map[string]interface{} `json:"beneficiaryBankcard"`
	Beneficiary         OrderUserInfo          `json:"beneficiary"`
}

// OrderDetailResponse 訂單詳細回應
type OrderDetailResponse struct {
	ID           string                 `json:"id"`
	Status       int                    `json:"status"`
	CancelReason *string                `json:"cancelReason"`
	Amount       float64                `json:"amount"`
	FinishAt     *int64                 `json:"finishAt"`
	PendingOrder map[string]interface{} `json:"pendingOrder"`
	User         map[string]interface{} `json:"user"`
	BankCard     map[string]interface{} `json:"bankcard"`
	CreateAt     string                 `json:"createAt"`
}

// OrderListResponse 訂單列表回應
type OrderListResponse struct {
	Count int64                    `json:"count"`
	Rows  []*OrderListItemResponse `json:"rows"`
}

// OrderListQuery 訂單列表查詢參數
type OrderListQuery struct {
	Account      string   `form:"account"`
	Payer        string   `form:"payer"`
	CancelReason string   `form:"cancelReason"`
	StartAt      string   `form:"startAt"`
	EndAt        string   `form:"endAt"`
	Type         *int     `form:"type"`
	OrderID      string   `form:"orderId"`
	Status       *int     `form:"status"`
	MinAmount    *float64 `form:"minAmount"`
	MaxAmount    *float64 `form:"maxAmount"`
	UserID       *int     `form:"userId"`
	FinishAtType string   `form:"finishAtType"` // overdue, notOverdue
	Page         int      `form:"page" binding:"omitempty,min=1"`
	Size         int      `form:"size" binding:"omitempty,min=1,max=100"`
}

// CancelOrderRequest 取消訂單請求
type CancelOrderRequest struct {
	CancelReason string `json:"cancelReason" binding:"required"`
}

// OrderServiceInterface 訂單服務介面
type OrderServiceInterface interface {
	GetList(query *OrderListQuery) ([]*OrderListItemResponse, int64, error)
	Complete(orderID string) (*OrderDetailResponse, error)
	Cancel(orderID string, req *CancelOrderRequest) (*OrderDetailResponse, error)
}

// OrderHandlersInterface 訂單處理器介面
type OrderHandlersInterface interface {
	GetList(c *gin.Context)
	Complete(c *gin.Context)
	Cancel(c *gin.Context)
}

// ConvertToOrderListItemResponse 將 model 轉換為列表項目回應格式
func ConvertToOrderListItemResponse(order *models.Order) *OrderListItemResponse {
	resp := &OrderListItemResponse{
		ID:                  order.ID.String(),
		CreatedAt:           order.CreatedAt.Format("2006-01-02 15:04:05"),
		Status:              order.Status,
		CancelReason:        order.CancelReason,
		Amount:              order.Amount,
		Sender:              make(map[string]interface{}),
		SenderBankcard:      make(map[string]interface{}),
		BeneficiaryBankcard: make(map[string]interface{}),
	}

	// 完成時間
	if order.FinishAt != nil {
		timestamp := order.FinishAt.Unix()
		resp.FinishAt = &timestamp
	}

	// 使用者資訊
	if order.User != nil {
		resp.Beneficiary = OrderUserInfo{
			ID:      order.User.ID,
			Name:    order.User.Name,
			Account: order.User.Account,
		}
	}

	return resp
}

// ConvertToOrderDetailResponse 將 model 轉換為詳細回應格式
func ConvertToOrderDetailResponse(order *models.Order) *OrderDetailResponse {
	resp := &OrderDetailResponse{
		ID:           order.ID.String(),
		Status:       order.Status,
		CancelReason: order.CancelReason,
		Amount:       order.Amount,
		PendingOrder: make(map[string]interface{}),
		User:         make(map[string]interface{}),
		BankCard:     make(map[string]interface{}),
		CreateAt:     order.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	// 完成時間
	if order.FinishAt != nil {
		timestamp := order.FinishAt.Unix()
		resp.FinishAt = &timestamp
	}

	return resp
}
