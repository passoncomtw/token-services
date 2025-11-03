package interfaces

import "github.com/gin-gonic/gin"

// HealthHandlersInterface 健康檢查處理器介面
type HealthHandlersInterface interface {
	HealthCheck(c *gin.Context)
}

// AuthHandlersInterface 認證處理器介面
type AuthHandlersInterface interface {
	Login(c *gin.Context)
	Logout(c *gin.Context)
	JWTAuthMiddleware() gin.HandlerFunc
}

// UserHandlersInterface 使用者處理器介面
type UserHandlersInterface interface {
	Register(c *gin.Context)
	GetUser(c *gin.Context)
	UpdateUser(c *gin.Context)
	UpdateLoginPassword(c *gin.Context)
	UpdateTransactionCode(c *gin.Context)
	StoreValue(c *gin.Context)
}

// BankHandlersInterface 銀行處理器介面
type BankHandlersInterface interface {
	GetBanks(c *gin.Context)
}

// BankCardHandlersInterface 銀行卡處理器介面
type BankCardHandlersInterface interface {
	GetBankCards(c *gin.Context)
	CreateBankCard(c *gin.Context)
	UpdateBankCard(c *gin.Context)
	DeleteBankCard(c *gin.Context)
}
