package interfaces

// ==================== 介面定義 ====================
type LoginResponse struct {
	Token   string `json:"token"`
	UserID  int    `json:"user_id"`
	Account string `json:"account"`
	Name    string `json:"name"`
}

// 認證服務介面
type AuthServiceInterface interface {
	Login(account, password string) (*LoginResponse, error)
	Logout() error
}

type UserServiceInterface interface {
	CreateUser(name string) string
	GetOrderCount(userId string) int
}

type OrderServiceInterface interface {
	CreateOrder(userId string) (string, error)
	GetUserName(userId string) string
}
