package server

import (
	"github.com/yourusername/project/cmd/github.com/yourusername/project/internal/interfaces"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// Router 路由管理器
type Router struct {
	healthHandlers interfaces.HealthHandlersInterface
	authHandlers   interfaces.AuthHandlersInterface
	userHandlers   interfaces.UserHandlersInterface
	orderHandlers  interfaces.OrderHandlersInterface
}

/**
 * @brief 建立新的 Router 實例
 * @param healthHandlers 健康檢查處理器
 * @param authHandlers 認證處理器
 * @param userHandlers 使用者處理器
 * @param orderHandlers 訂單處理器
 * @return Router 指標
 */
func NewRouter(
	healthHandlers interfaces.HealthHandlersInterface,
	authHandlers interfaces.AuthHandlersInterface,
	userHandlers interfaces.UserHandlersInterface,
	orderHandlers interfaces.OrderHandlersInterface,
) *Router {
	return &Router{
		healthHandlers: healthHandlers,
		authHandlers:   authHandlers,
		userHandlers:   userHandlers,
		orderHandlers:  orderHandlers,
	}
}

/**
 * @brief 設定路由
 * @param engine Gin 引擎
 */
func (r *Router) SetupRoutes(engine *gin.Engine) {
	// Health check
	engine.GET("/health", r.healthHandlers.HealthCheck)

	// Swagger UI
	engine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API v1
	v1 := engine.Group("/api/v1")
	{
		// Auth routes (無需驗證)
		auth := v1.Group("/auth")
		{
			auth.POST("/login", r.authHandlers.Login)
			auth.POST("/logout", r.authHandlers.Logout)
		}

		// 需要 JWT 驗證的路由
		authorized := v1.Group("")
		authorized.Use(r.authHandlers.JWTAuthMiddleware())
		{
			// User routes
			users := authorized.Group("/users")
			{
				users.POST("", r.userHandlers.CreateUser)
				users.GET("/:id", r.userHandlers.GetUser)
			}

			// Order routes
			orders := authorized.Group("/orders")
			{
				orders.POST("", r.orderHandlers.CreateOrder)
				orders.GET("/:id", r.orderHandlers.GetOrder)
			}
		}
	}
}
