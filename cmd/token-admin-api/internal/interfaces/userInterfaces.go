package interfaces

import (
	"encoding/json"

	"passontw-backend-services/pkg/models"

	"github.com/gin-gonic/gin"
)

// ==================== User 介面定義 ====================

// MerchantInfo 商家資訊
type MerchantInfo struct {
	CreateAt          int64                    `json:"createAt"`
	Contactor         string                   `json:"contactor"`
	Telegram          string                   `json:"telegram"`
	BuyFeeType        int                      `json:"buyFeeType"`
	SellFeeType       int                      `json:"sellFeeType"`
	BuyPercentageFee  map[string]interface{}   `json:"buyPercentageFee"`
	SellPercentageFee map[string]interface{}   `json:"sellPercentageFee"`
	BuyLadderFee      []map[string]interface{} `json:"buyLadderFee"`
	SellLadderFee     []map[string]interface{} `json:"sellLadderFee"`
}

// WalletInfo 錢包資訊
type WalletInfo struct {
	ID                int     `json:"id"`
	Status            int     `json:"status"`
	UsefulBalance     float64 `json:"usefulBalance"`
	GuaranteedBalance float64 `json:"guaranteedBalance"`
	FreezeBalance     float64 `json:"freezeBalance"`
	CreateAt          string  `json:"createAt"`
}

// UserBasicResponse 使用者基本回應
type UserBasicResponse struct {
	ID       int           `json:"id"`
	Type     int           `json:"type"`
	Account  string        `json:"account"`
	Name     string        `json:"name"`
	CreateAt int64         `json:"createAt"`
	Merchant *MerchantInfo `json:"merchant"`
}

// UserDetailResponse 使用者詳細回應
type UserDetailResponse struct {
	ID                int           `json:"id"`
	Type              int           `json:"type"`
	Account           string        `json:"account"`
	Name              string        `json:"name"`
	CreateAt          int64         `json:"createAt"`
	Status            int           `json:"status"`
	OrderStatus       int           `json:"orderStatus"`
	TransactionStatus int           `json:"transactionStatus"`
	Phone             *string       `json:"phone"`
	Markup            *string       `json:"markup"`
	Merchant          *MerchantInfo `json:"merchant"`
	Wallet            *WalletInfo   `json:"wallet"`
}

// UserListQuery 使用者列表查詢參數
type UserListQuery struct {
	Account           string `form:"account"`
	Email             string `form:"email"`
	Name              string `form:"name"`
	Status            *int   `form:"status"`
	OrderStatus       *int   `form:"orderStatus"`
	TransactionStatus *int   `form:"transactionStatus"`
	IsMerchant        *bool  `form:"isMerchant"`
	Page              int    `form:"page" binding:"omitempty,min=1"`
	Size              int    `form:"size" binding:"omitempty,min=1,max=100"`
}

// CreateUserRequest 新增使用者請求
type CreateUserRequest struct {
	Type              int                      `json:"type" binding:"required,oneof=0 1"`
	Account           string                   `json:"account" binding:"required"`
	Name              string                   `json:"name" binding:"required"`
	Password          string                   `json:"password" binding:"required,min=6,max=20"`
	TransactionCode   string                   `json:"transactionCode" binding:"required,len=4"`
	Referrer          string                   `json:"referrer" binding:"omitempty"`
	Contactor         string                   `json:"contactor" binding:"omitempty"`
	Telegram          string                   `json:"telegram" binding:"omitempty"`
	BuyFeeType        int                      `json:"buyFeeType" binding:"omitempty,oneof=0 1"`
	SellFeeType       int                      `json:"sellFeeType" binding:"omitempty,oneof=0 1"`
	BuyPercentageFee  map[string]interface{}   `json:"buyPercentageFee" binding:"omitempty"`
	SellPercentageFee map[string]interface{}   `json:"sellPercentageFee" binding:"omitempty"`
	BuyLadderFee      []map[string]interface{} `json:"buyLadderFee" binding:"omitempty"`
	SellLadderFee     []map[string]interface{} `json:"sellLadderFee" binding:"omitempty"`
}

// UpdateUserRequest 編輯使用者請求
type UpdateUserRequest struct {
	Phone             *string                  `json:"phone" binding:"omitempty"`
	Status            int                      `json:"status" binding:"omitempty,oneof=0 1"`
	OrderStatus       int                      `json:"orderStatus" binding:"omitempty,oneof=0 1"`
	TransactionStatus int                      `json:"transactionStatus" binding:"omitempty,oneof=0 1"`
	Type              int                      `json:"type" binding:"omitempty,oneof=0 1"`
	Name              string                   `json:"name" binding:"omitempty"`
	Contactor         string                   `json:"contactor" binding:"omitempty"`
	Telegram          string                   `json:"telegram" binding:"omitempty"`
	BuyFeeType        int                      `json:"buyFeeType" binding:"omitempty,oneof=0 1"`
	SellFeeType       int                      `json:"sellFeeType" binding:"omitempty,oneof=0 1"`
	BuyPercentageFee  map[string]interface{}   `json:"buyPercentageFee" binding:"omitempty"`
	SellPercentageFee map[string]interface{}   `json:"sellPercentageFee" binding:"omitempty"`
	BuyLadderFee      []map[string]interface{} `json:"buyLadderFee" binding:"omitempty"`
	SellLadderFee     []map[string]interface{} `json:"sellLadderFee" binding:"omitempty"`
}

// UpdateLoginPasswordRequest 更新登入密碼請求
type UpdateLoginPasswordRequest struct {
	Password    string `json:"password" binding:"required,min=6,max=20"`
	NewPassword string `json:"newPassword" binding:"required,min=6,max=20"`
}

// UpdateTransactionPasswordRequest 更新交易密碼請求
type UpdateTransactionPasswordRequest struct {
	Password string `json:"password" binding:"required,len=4"`
}

// BankCardResponse 銀行卡回應
type BankCardResponse struct {
	ID         int    `json:"id"`
	CreateAt   string `json:"createAt"`
	Name       string `json:"name"`
	CardNumber string `json:"cardNumber"`
	BranchName string `json:"branchName"`
	Status     string `json:"status"`
	BankID     int    `json:"bankId"`
	BankName   string `json:"bankName,omitempty"`
	BankCode   string `json:"bankCode,omitempty"`
}

// OrderUserInfo 訂單中的使用者資訊
type OrderUserInfo struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Account string `json:"account"`
}

// OrderResponse 訂單回應
type OrderResponse struct {
	ID           string                 `json:"id"`
	Status       int                    `json:"status"`
	CancelReason *string                `json:"cancelReason"`
	Amount       float64                `json:"amount"`
	FinishAt     *int64                 `json:"finishAt"`
	PendingOrder map[string]interface{} `json:"pendingOrder"`
	User         OrderUserInfo          `json:"user"`
	BankCard     map[string]interface{} `json:"bankcard"`
	CreateAt     string                 `json:"createAt"`
}

// PendingOrderResponse 掛單回應
type PendingOrderResponse struct {
	ID                 string                 `json:"id"`
	Type               int                    `json:"type"`
	Status             int                    `json:"status"`
	Amount             int64                  `json:"amount"`
	MinAmount          int64                  `json:"minAmount"`
	Balance            int64                  `json:"balance"`
	TransactionMinutes int                    `json:"transactionMinutes"`
	User               map[string]interface{} `json:"user"`
	BankCard           map[string]interface{} `json:"bankcard"`
	CreateAt           string                 `json:"createAt"`
	CancelAmount       int64                  `json:"cancelAmount"`
	ProcessAmount      int64                  `json:"processAmount"`
	DoneAmount         int64                  `json:"doneAmount"`
	CancelCount        int                    `json:"cancelCount"`
	DoneCount          int                    `json:"doneCount"`
	ProcessCount       int                    `json:"processCount"`
}

// PendingOrderListResponse 掛單列表回應
type PendingOrderListResponse struct {
	Count int64                   `json:"count"`
	Rows  []*PendingOrderResponse `json:"rows"`
}

// PaginationQuery 分頁查詢參數
type PaginationQuery struct {
	Page int `form:"page" binding:"omitempty,min=1"`
	Size int `form:"size" binding:"omitempty,min=1,max=100"`
}

// UserServiceInterface 使用者服務介面
type UserServiceInterface interface {
	GetList(query *UserListQuery) ([]*UserBasicResponse, error)
	Create(req *CreateUserRequest) (*UserBasicResponse, error)
	GetDetail(id int) (*UserDetailResponse, error)
	Update(id int, req *UpdateUserRequest) (*UserBasicResponse, error)
	Unlock(id int) (*UserDetailResponse, error)
	UpdateLoginPassword(id int, req *UpdateLoginPasswordRequest) error
	UpdateTransactionPassword(id int, req *UpdateTransactionPasswordRequest) (*UserDetailResponse, error)
	GetBankCards(userID int, query *PaginationQuery) ([]*BankCardResponse, error)
	GetOrders(userID int) ([]*OrderResponse, error)
	GetPendingOrders(userID int, query *PaginationQuery) (*PendingOrderListResponse, error)
}

// UserHandlersInterface 使用者處理器介面
type UserHandlersInterface interface {
	GetList(c *gin.Context)
	Create(c *gin.Context)
	GetDetail(c *gin.Context)
	Update(c *gin.Context)
	Unlock(c *gin.Context)
	UpdateLoginPassword(c *gin.Context)
	UpdateTransactionPassword(c *gin.Context)
	UpdateOwnLoginPassword(c *gin.Context)
	GetBankCards(c *gin.Context)
	GetOrders(c *gin.Context)
	GetPendingOrders(c *gin.Context)
}

// ConvertToUserBasicResponse 將 model 轉換為基本回應格式
func ConvertToUserBasicResponse(user *models.User) *UserBasicResponse {
	resp := &UserBasicResponse{
		ID:       user.ID,
		Type:     user.Type,
		Account:  user.Account,
		Name:     user.Name,
		CreateAt: user.CreatedAt.Unix(),
	}

	// 如果有商家資訊
	if user.Merchant != nil {
		resp.Merchant = ConvertToMerchantInfo(user.Merchant)
	}

	return resp
}

// ConvertToUserDetailResponse 將 model 轉換為詳細回應格式
func ConvertToUserDetailResponse(user *models.User) *UserDetailResponse {
	resp := &UserDetailResponse{
		ID:                user.ID,
		Type:              user.Type,
		Account:           user.Account,
		Name:              user.Name,
		CreateAt:          user.CreatedAt.Unix(),
		Status:            user.Status,
		OrderStatus:       user.OrderStatus,
		TransactionStatus: user.TransactionStatus,
	}

	// 處理 NullString
	if user.Phone.Valid {
		resp.Phone = &user.Phone.String
	}
	if user.Markup.Valid {
		resp.Markup = &user.Markup.String
	}

	// 商家資訊
	if user.Merchant != nil {
		resp.Merchant = ConvertToMerchantInfo(user.Merchant)
	}

	// 錢包資訊
	if user.Wallet != nil {
		resp.Wallet = ConvertToWalletInfo(user.Wallet)
	}

	return resp
}

// ConvertToMerchantInfo 將 merchant model 轉換為回應格式
func ConvertToMerchantInfo(merchant *models.Merchant) *MerchantInfo {
	info := &MerchantInfo{
		CreateAt:    merchant.CreatedAt.Unix(),
		Contactor:   merchant.Contactor,
		Telegram:    merchant.Telegram,
		BuyFeeType:  merchant.BuyFeeType,
		SellFeeType: merchant.SellFeeType,
	}

	// 轉換 JSONRawMessage 為 map
	if len(merchant.BuyPercentageFee) > 0 {
		var buyPercentageFee map[string]interface{}
		_ = json.Unmarshal(merchant.BuyPercentageFee, &buyPercentageFee)
		info.BuyPercentageFee = buyPercentageFee
	}
	if len(merchant.SellPercentageFee) > 0 {
		var sellPercentageFee map[string]interface{}
		_ = json.Unmarshal(merchant.SellPercentageFee, &sellPercentageFee)
		info.SellPercentageFee = sellPercentageFee
	}
	if len(merchant.BuyLadderFee) > 0 {
		var buyLadderFee []map[string]interface{}
		_ = json.Unmarshal(merchant.BuyLadderFee, &buyLadderFee)
		info.BuyLadderFee = buyLadderFee
	}
	if len(merchant.SellLadderFee) > 0 {
		var sellLadderFee []map[string]interface{}
		_ = json.Unmarshal(merchant.SellLadderFee, &sellLadderFee)
		info.SellLadderFee = sellLadderFee
	}

	return info
}

// ConvertToWalletInfo 將 wallet model 轉換為回應格式
func ConvertToWalletInfo(wallet *models.Wallet) *WalletInfo {
	return &WalletInfo{
		ID:                wallet.ID,
		Status:            wallet.Status,
		UsefulBalance:     wallet.UsefulBalance,
		GuaranteedBalance: wallet.GuaranteedBalance,
		FreezeBalance:     wallet.FreezeBalance,
		CreateAt:          wallet.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}
