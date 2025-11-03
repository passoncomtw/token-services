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
