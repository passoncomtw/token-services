package interfaces

// ==================== 認證相關 ====================
type LoginRequest struct {
	Account           string `json:"account" binding:"required"`
	Password          string `json:"password" binding:"required"`
	NotificationToken string `json:"notificationToken"`
}

type LoginResponse struct {
	AccessToken string      `json:"access_token"`
	ExpireIn    int64       `json:"expireIn"`
	User        *UserDetail `json:"user"`
}

// 認證服務介面
type AuthServiceInterface interface {
	Login(req *LoginRequest) (*LoginResponse, error)
	Logout() error
}

// ==================== 使用者相關 ====================
type RegisterRequest struct {
	Type            int    `json:"type" binding:"required"`                             // 0: 一般使用者, 1: 平台使用者
	Account         string `json:"account" binding:"required"`
	Name            string `json:"name" binding:"required"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=6,max=20"`
	TransactionCode string `json:"transactionCode" binding:"required,min=6,max=20"`
	ReferralCode    string `json:"referralCode"`
}

type UpdateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email" binding:"email"`
}

type UpdateLoginPasswordRequest struct {
	Password    string `json:"password" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6,max=20"`
}

type UpdateTransactionCodeRequest struct {
	Password    string `json:"password" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6,max=20"`
}

type UserDetail struct {
	ID           int              `json:"id"`
	Type         int              `json:"type"`
	Account      string           `json:"account"`
	Name         string           `json:"name"`
	Email        string           `json:"email"`
	CreateAt     string           `json:"createAt"`
	ReferralCode string           `json:"referralCode"`
	Wallet       *WalletDetail    `json:"wallet,omitempty"`
	ReferralUser *ReferralUser    `json:"referralUser,omitempty"`
}

type ReferralUser struct {
	ID      int    `json:"id"`
	Type    int    `json:"type"`
	Account string `json:"account"`
	Name    string `json:"name"`
	Email   string `json:"email"`
}

type WalletDetail struct {
	Status             int     `json:"status"`
	UsefulBalance      float64 `json:"usefulBalance"`
	GuaranteedBalance  float64 `json:"guaranteedBalance"`
	FreezeBalance      float64 `json:"freezeBalance"`
}

// 使用者服務介面
type UserServiceInterface interface {
	// 註冊
	Register(req *RegisterRequest) (*UserDetail, error)
	
	// 取回使用者資訊
	GetUser(userID int) (*UserDetail, error)
	
	// 更新使用者資訊
	UpdateUser(userID int, req *UpdateUserRequest) (*UserDetail, error)
	
	// 更新登入密碼
	UpdateLoginPassword(userID int, req *UpdateLoginPasswordRequest) error
	
	// 更新交易密碼
	UpdateTransactionCode(userID int, req *UpdateTransactionCodeRequest) error
	
	// 自動儲值（測試用）
	StoreValue(userID int) (*UserDetail, error)
}

// ==================== 銀行相關 ====================
type BankDetail struct {
	ID       int    `json:"id"`
	BankName string `json:"bankName"`
	BankCode string `json:"bankCode"`
}

// 銀行服務介面
type BankServiceInterface interface {
	// 取回銀行列表
	GetBanks() ([]*BankDetail, error)
}

// ==================== 銀行卡相關 ====================
type CreateBankCardRequest struct {
	Name       string `json:"name" binding:"required"`
	CardNumber string `json:"cardNumber" binding:"required"`
	BankID     int    `json:"bankId" binding:"required"`
	BranchName string `json:"branchName"`
	Status     int    `json:"status"` // 0: 正常, 1: 停用, 2: 凍結
}

type UpdateBankCardRequest struct {
	CardNumber string `json:"cardNumber"`
	BankID     int    `json:"bankId"`
	BranchName string `json:"branchName"`
}

type BankCardDetail struct {
	ID         int         `json:"id"`
	CreatedAt  string      `json:"createdAt"`
	Name       string      `json:"name"`
	CardNumber string      `json:"cardNumber"`
	BankID     int         `json:"bankId"`
	BranchName string      `json:"branchName"`
	Status     int         `json:"status"` // 0: 正常, 1: 停用, 2: 凍結
	Bank       *BankDetail `json:"bank,omitempty"`
}

// 銀行卡服務介面
type BankCardServiceInterface interface {
	// 取回使用者的銀行卡列表
	GetBankCards(userID int) ([]*BankCardDetail, error)
	
	// 新增銀行卡
	CreateBankCard(userID int, req *CreateBankCardRequest) (*BankCardDetail, error)
	
	// 更新銀行卡
	UpdateBankCard(userID int, bankcardID int, req *UpdateBankCardRequest) (*BankCardDetail, error)
	
	// 刪除銀行卡
	DeleteBankCard(userID int, bankcardID int) error
}

// ==================== 掛單相關 ====================
type CreatePendingOrderRequest struct {
	BankCardID         int    `json:"bankcardId" binding:"required"`
	Type               int    `json:"type" binding:"required"` // 0: 買幣, 1: 賣幣
	Amount             float64 `json:"amount" binding:"required,gt=0"`
	MinAmount          float64 `json:"minAmount" binding:"required,gt=0"`
	TransactionMinutes int    `json:"transactionMinutes" binding:"required,gt=0"`
	TransactionCode    string `json:"transactionCode" binding:"required"`
}

type PendingOrderFilter struct {
	Type    *int     `form:"type"`    // 0: 買幣, 1: 賣幣
	Balance *float64 `form:"balance"` // 餘額篩選
	Page    int      `form:"page"`
	Size    int      `form:"size"`
}

type PendingOrderDetail struct {
	ID                 string       `json:"id"`
	IsSplit            bool         `json:"isSplit"`
	Type               int          `json:"type"`
	Status             int          `json:"status"`
	Amount             float64      `json:"amount"`
	MinAmount          float64      `json:"minAmount"`
	Balance            float64      `json:"balance"`
	TransactionMinutes int          `json:"transactionMinutes"`
	User               *SimpleUser  `json:"user"`
	BankCard           *BankCardDetail `json:"bankcard,omitempty"`
	CreatedAt          string       `json:"createdAt"`
	CancelAmount       float64      `json:"cancelAmount,omitempty"`
	DoneAmount         float64      `json:"doneAmount,omitempty"`
	ProcessAmount      float64      `json:"processAmount,omitempty"`
	ProcessCount       int          `json:"processCount,omitempty"`
	DoneCount          int          `json:"doneCount,omitempty"`
	CancelCount        int          `json:"cancelCount,omitempty"`
}

type SimpleUser struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type UserPendingOrdersResponse struct {
	Buy  *PendingOrderDetail `json:"buy,omitempty"`
	Sell *PendingOrderDetail `json:"sell,omitempty"`
}

type PendingOrderListResponse struct {
	Rows  []*PendingOrderDetail `json:"rows"`
	Page  int                   `json:"page"`
	Size  int                   `json:"size"`
	Total int64                 `json:"total"`
}

// 掛單服務介面
type PendingOrderServiceInterface interface {
	// 取回掛單列表
	GetPendingOrders(filter *PendingOrderFilter) (*PendingOrderListResponse, error)
	
	// 取回掛單詳情
	GetPendingOrder(pendingOrderID string) (*PendingOrderDetail, error)
	
	// 建立掛單
	CreatePendingOrder(userID int, req *CreatePendingOrderRequest) (*PendingOrderDetail, error)
	
	// 刪除掛單
	DeletePendingOrder(userID int, pendingOrderID string) error
	
	// 凍結掛單
	LockPendingOrder(userID int, pendingOrderID string) error
	
	// 解除凍結掛單
	UnlockPendingOrder(userID int, pendingOrderID string) error
	
	// 取回使用者自己的掛單
	GetUserPendingOrders(userID int) (*UserPendingOrdersResponse, error)
}

// ==================== 訂單相關 ====================
type CreateOrderRequest struct {
	BeneficiaryBankCardID int     `json:"beneficiaryBankcardId" binding:"required"`
	OrderID               string  `json:"orderId" binding:"required"` // 掛單 ID
	Amount                float64 `json:"amount" binding:"required,gt=0"`
	TransactionCode       string  `json:"transactionCode" binding:"required"`
}

type OrderDetail struct {
	ID           string          `json:"id"`
	Status       int             `json:"status"`
	Amount       float64         `json:"amount"`
	CancelReason string          `json:"cancelReason,omitempty"`
	FinishAt     string          `json:"finishAt,omitempty"`
	User         *SimpleUser     `json:"user"`
	BankCard     *BankCardDetail `json:"bankcard,omitempty"`
	PendingOrder *PendingOrderDetail `json:"pendingOrder,omitempty"`
	CreatedAt    string          `json:"createdAt"`
}

type OrderListResponse struct {
	Rows  []*OrderDetail `json:"rows"`
	Page  int            `json:"page"`
	Size  int            `json:"size"`
	Total int64          `json:"total"`
}

type RejectOrderRequest struct {
	CancelReason string `json:"cancelReason" binding:"required"`
}

// 訂單服務介面
type OrderServiceInterface interface {
	// 取回訂單列表
	GetOrders(userID int, page, size int) (*OrderListResponse, error)
	
	// 建立訂單
	CreateOrder(userID int, req *CreateOrderRequest) (*OrderDetail, error)
	
	// 標記已付款
	MarkAsPaid(userID int, orderID string) (*OrderDetail, error)
	
	// 放行
	ApplyOrder(userID int, orderID string) (*OrderDetail, error)
	
	// 取消訂單
	RejectOrder(userID int, orderID string, req *RejectOrderRequest) (*OrderDetail, error)
}
