package interfaces

// ==================== 介面定義 ====================

// LoginUser 登入使用者資訊
type LoginUser struct {
	ID          int      `json:"id"`
	Type        int      `json:"type"`
	Account     string   `json:"account"`
	Name        string   `json:"name"`
	CreateAt    int64    `json:"createAt"`
	Permissions []string `json:"permissions"`
}

// LoginResponse 登入回應
type LoginResponse struct {
	AccessToken string    `json:"access_token"`
	ExpireIn    int64     `json:"expireIn"`
	User        LoginUser `json:"user"`
}

// AuthServiceInterface 認證服務介面
type AuthServiceInterface interface {
	Login(account, password string) (*LoginResponse, error)
	Logout() error
}
