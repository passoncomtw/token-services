package interfaces

// ==================== 認證相關 ====================
type LoginRequest struct {
	Account           string `json:"account" binding:"required" example:"user001"`         // 帳號
	Password          string `json:"password" binding:"required" example:"password123"`    // 密碼
	NotificationToken string `json:"notificationToken" example:"firebase_token_abc123xyz"` // 推播通知 Token（可選）
}

type LoginResponse struct {
	AccessToken string      `json:"access_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` // JWT Token
	ExpireIn    int64       `json:"expireIn" example:"86400"`                                       // Token 有效期（秒）
	User        *UserDetail `json:"user"`                                                           // 使用者資訊
}

// 認證服務介面
type AuthServiceInterface interface {
	Login(req *LoginRequest) (*LoginResponse, error)
	Logout() error
}

// ==================== 使用者相關 ====================
type RegisterRequest struct {
	Type            int    `json:"type" binding:"required" example:"0"`                              // 使用者類型：0=一般使用者, 1=平台使用者
	Account         string `json:"account" binding:"required" example:"user001"`                     // 帳號
	Name            string `json:"name" binding:"required" example:"王小明"`                            // 姓名
	Email           string `json:"email" binding:"required,email" example:"user001@example.com"`     // 電子郵件
	Password        string `json:"password" binding:"required,min=6,max=20" example:"password123"`   // 登入密碼（6-20 字元）
	TransactionCode string `json:"transactionCode" binding:"required,min=6,max=20" example:"123456"` // 交易密碼（6-20 字元）
	ReferralCode    string `json:"referralCode" example:"REF001"`                                    // 推薦碼（可選）
}

type UpdateUserRequest struct {
	Name  string `json:"name" example:"王小明"`                                   // 姓名
	Email string `json:"email" binding:"email" example:"newemail@example.com"` // 電子郵件
}

type UpdateLoginPasswordRequest struct {
	Password    string `json:"password" binding:"required" example:"oldpassword123"`             // 舊密碼
	NewPassword string `json:"newPassword" binding:"required,min=6,max=20" example:"newpass456"` // 新密碼（6-20 字元）
}

type UpdateTransactionCodeRequest struct {
	Password    string `json:"password" binding:"required" example:"oldpassword123"`         // 登入密碼
	NewPassword string `json:"newPassword" binding:"required,min=6,max=20" example:"654321"` // 新交易密碼（6-20 字元）
}

type UserDetail struct {
	ID           int           `json:"id" example:"1"`                          // 使用者 ID
	Type         int           `json:"type" example:"0"`                        // 使用者類型：0=一般使用者, 1=平台使用者
	Account      string        `json:"account" example:"user001"`               // 帳號
	Name         string        `json:"name" example:"王小明"`                      // 姓名
	Email        string        `json:"email" example:"user001@example.com"`     // 電子郵件
	CreateAt     string        `json:"createAt" example:"2024-01-01T00:00:00Z"` // 建立時間
	ReferralCode string        `json:"referralCode" example:"REF001"`           // 推薦碼
	Wallet       *WalletDetail `json:"wallet,omitempty"`                        // 錢包資訊
	ReferralUser *ReferralUser `json:"referralUser,omitempty"`                  // 推薦人資訊
}

type ReferralUser struct {
	ID      int    `json:"id" example:"2"`                       // 推薦人 ID
	Type    int    `json:"type" example:"0"`                     // 推薦人類型
	Account string `json:"account" example:"referrer001"`        // 推薦人帳號
	Name    string `json:"name" example:"李推薦"`                   // 推薦人姓名
	Email   string `json:"email" example:"referrer@example.com"` // 推薦人電子郵件
}

type WalletDetail struct {
	Status            int     `json:"status" example:"0"`                  // 錢包狀態：0=正常, 1=凍結
	UsefulBalance     float64 `json:"usefulBalance" example:"10000.50"`    // 可用餘額
	GuaranteedBalance float64 `json:"guaranteedBalance" example:"5000.00"` // 保證金餘額
	FreezeBalance     float64 `json:"freezeBalance" example:"1000.00"`     // 凍結餘額
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
	ID       int    `json:"id" example:"1"`          // 銀行 ID
	BankName string `json:"bankName" example:"台灣銀行"` // 銀行名稱
	BankCode string `json:"bankCode" example:"004"`  // 銀行代碼
}

// 銀行服務介面
type BankServiceInterface interface {
	// 取回銀行列表
	GetBanks() ([]*BankDetail, error)
}

// ==================== 銀行卡相關 ====================
type CreateBankCardRequest struct {
	Name       string `json:"name" binding:"required" example:"王小明"`                    // 持卡人姓名
	CardNumber string `json:"cardNumber" binding:"required" example:"1234567890123456"` // 銀行卡號
	BankID     int    `json:"bankId" binding:"required" example:"1"`                    // 銀行 ID
	BranchName string `json:"branchName" example:"台北分行"`                                // 分行名稱（可選）
	Status     int    `json:"status" example:"0"`                                       // 狀態：0=正常, 1=停用, 2=凍結
}

type UpdateBankCardRequest struct {
	CardNumber string `json:"cardNumber" example:"9876543210987654"` // 銀行卡號
	BankID     int    `json:"bankId" example:"2"`                    // 銀行 ID
	BranchName string `json:"branchName" example:"新竹分行"`             // 分行名稱
}

type BankCardDetail struct {
	ID         int         `json:"id" example:"1"`                           // 銀行卡 ID
	CreatedAt  string      `json:"createdAt" example:"2024-01-01T00:00:00Z"` // 建立時間
	Name       string      `json:"name" example:"王小明"`                       // 持卡人姓名
	CardNumber string      `json:"cardNumber" example:"1234567890123456"`    // 銀行卡號
	BankID     int         `json:"bankId" example:"1"`                       // 銀行 ID
	BranchName string      `json:"branchName" example:"台北分行"`                // 分行名稱
	Status     int         `json:"status" example:"0"`                       // 狀態：0=正常, 1=停用, 2=凍結
	Bank       *BankDetail `json:"bank,omitempty"`                           // 銀行資訊
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
	BankCardID         int     `json:"bankcardId" binding:"required" example:"1"`               // 銀行卡 ID
	Type               int     `json:"type" binding:"required" example:"0"`                     // 掛單類型：0=買幣, 1=賣幣
	Amount             float64 `json:"amount" binding:"required,gt=0" example:"10000.00"`       // 掛單金額
	MinAmount          float64 `json:"minAmount" binding:"required,gt=0" example:"1000.00"`     // 最小交易金額
	TransactionMinutes int     `json:"transactionMinutes" binding:"required,gt=0" example:"30"` // 交易時限（分鐘）
	TransactionCode    string  `json:"transactionCode" binding:"required" example:"123456"`     // 交易密碼
}

type PendingOrderFilter struct {
	Type    *int     `form:"type" example:"0"`       // 掛單類型：0=買幣, 1=賣幣
	Balance *float64 `form:"balance" example:"5000"` // 餘額篩選
	Page    int      `form:"page" example:"1"`       // 頁碼
	Size    int      `form:"size" example:"20"`      // 每頁筆數
}

type PendingOrderDetail struct {
	ID                 string          `json:"id" example:"PO20240101001"`                // 掛單 ID
	IsSplit            bool            `json:"isSplit" example:"false"`                   // 是否可拆分
	Type               int             `json:"type" example:"0"`                          // 掛單類型：0=買幣, 1=賣幣
	Status             int             `json:"status" example:"0"`                        // 狀態：0=進行中, 1=已暫停, 2=已完成, 3=已取消
	Amount             float64         `json:"amount" example:"10000.00"`                 // 掛單金額
	MinAmount          float64         `json:"minAmount" example:"1000.00"`               // 最小交易金額
	Balance            float64         `json:"balance" example:"8000.00"`                 // 剩餘金額
	TransactionMinutes int             `json:"transactionMinutes" example:"30"`           // 交易時限（分鐘）
	User               *SimpleUser     `json:"user"`                                      // 掛單者資訊
	BankCard           *BankCardDetail `json:"bankcard,omitempty"`                        // 銀行卡資訊
	CreatedAt          string          `json:"createdAt" example:"2024-01-01T00:00:00Z"`  // 建立時間
	CancelAmount       float64         `json:"cancelAmount,omitempty" example:"500.00"`   // 取消金額
	DoneAmount         float64         `json:"doneAmount,omitempty" example:"1500.00"`    // 已完成金額
	ProcessAmount      float64         `json:"processAmount,omitempty" example:"1000.00"` // 處理中金額
	ProcessCount       int             `json:"processCount,omitempty" example:"2"`        // 處理中訂單數
	DoneCount          int             `json:"doneCount,omitempty" example:"3"`           // 已完成訂單數
	CancelCount        int             `json:"cancelCount,omitempty" example:"1"`         // 已取消訂單數
}

type SimpleUser struct {
	ID   int    `json:"id" example:"1"`     // 使用者 ID
	Name string `json:"name" example:"王小明"` // 使用者姓名
}

type UserPendingOrdersResponse struct {
	Buy  *PendingOrderDetail `json:"buy,omitempty"`  // 買幣掛單
	Sell *PendingOrderDetail `json:"sell,omitempty"` // 賣幣掛單
}

type PendingOrderListResponse struct {
	Rows  []*PendingOrderDetail `json:"rows"`               // 掛單列表
	Page  int                   `json:"page" example:"1"`   // 當前頁碼
	Size  int                   `json:"size" example:"20"`  // 每頁筆數
	Total int64                 `json:"total" example:"50"` // 總筆數
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
	BeneficiaryBankCardID int     `json:"beneficiaryBankcardId" binding:"required" example:"1"` // 受益人銀行卡 ID
	OrderID               string  `json:"orderId" binding:"required" example:"PO20240101001"`   // 掛單 ID
	Amount                float64 `json:"amount" binding:"required,gt=0" example:"5000.00"`     // 交易金額
	TransactionCode       string  `json:"transactionCode" binding:"required" example:"123456"`  // 交易密碼
}

type OrderDetail struct {
	ID           string              `json:"id" example:"ORD20240101001"`                       // 訂單 ID
	Status       int                 `json:"status" example:"0"`                                // 訂單狀態：0=待付款, 1=已付款, 2=已完成, 3=已取消
	Amount       float64             `json:"amount" example:"5000.00"`                          // 交易金額
	CancelReason string              `json:"cancelReason,omitempty" example:"買家取消交易"`           // 取消原因
	FinishAt     string              `json:"finishAt,omitempty" example:"2024-01-01T01:00:00Z"` // 完成時間
	User         *SimpleUser         `json:"user"`                                              // 下單者資訊
	BankCard     *BankCardDetail     `json:"bankcard,omitempty"`                                // 銀行卡資訊
	PendingOrder *PendingOrderDetail `json:"pendingOrder,omitempty"`                            // 關聯掛單資訊
	CreatedAt    string              `json:"createdAt" example:"2024-01-01T00:00:00Z"`          // 建立時間
}

type OrderListResponse struct {
	Rows  []*OrderDetail `json:"rows"`                // 訂單列表
	Page  int            `json:"page" example:"1"`    // 當前頁碼
	Size  int            `json:"size" example:"20"`   // 每頁筆數
	Total int64          `json:"total" example:"100"` // 總筆數
}

type RejectOrderRequest struct {
	CancelReason string `json:"cancelReason" binding:"required" example:"無法在時限內完成付款"` // 取消原因
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
