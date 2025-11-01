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
	CreateUser(c *gin.Context)
	GetUser(c *gin.Context)
}

// OrderHandlersInterface 訂單處理器介面
type OrderHandlersInterface interface {
	CreateOrder(c *gin.Context)
	GetOrder(c *gin.Context)
}
