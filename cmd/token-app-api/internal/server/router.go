package server

import (
	"token-services/cmd/token-app-api/internal/interfaces"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// Router 路由管理器
type Router struct {
	healthHandlers interfaces.HealthHandlersInterface
	authHandlers   interfaces.AuthHandlersInterface
	userHandlers   interfaces.UserHandlersInterface
}

/**
 * @brief 建立新的 Router 實例
 * @param healthHandlers 健康檢查處理器
 * @param authHandlers 認證處理器
 * @param userHandlers 使用者處理器
 * @return Router 指標
 */
func NewRouter(
	healthHandlers interfaces.HealthHandlersInterface,
	authHandlers interfaces.AuthHandlersInterface,
	userHandlers interfaces.UserHandlersInterface,
) *Router {
	return &Router{
		healthHandlers: healthHandlers,
		authHandlers:   authHandlers,
		userHandlers:   userHandlers,
	}
}

/**
 * @brief 設定路由
 * @param engine Gin 引擎
 */
func (r *Router) SetupRoutes(engine *gin.Engine) {
	// Health check
	engine.GET("/health", r.healthHandlers.HealthCheck)
	engine.GET("/health-check", r.healthHandlers.HealthCheck)

	// Swagger UI
	engine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Auth routes (無需驗證)
	auth := engine.Group("/auth")
	{
		auth.POST("/login", r.authHandlers.Login)
		auth.POST("/logout", r.authHandlers.Logout)
	}

	// User routes
	users := engine.Group("/users")
	{
		// 公開端點
		users.POST("", r.userHandlers.Register)                        // 註冊
		users.GET("/:user_id", r.userHandlers.GetUser)                 // 取回使用者資訊
		users.POST("/:user_id/store/value", r.userHandlers.StoreValue) // 自動儲值（測試用）

		// 需要認證的端點
		authenticated := users.Group("")
		authenticated.Use(r.authHandlers.JWTAuthMiddleware())
		{
			authenticated.PUT("/:user_id", r.userHandlers.UpdateUser)                  // 更新使用者資訊
			authenticated.PUT("/login/password", r.userHandlers.UpdateLoginPassword)   // 更新登入密碼
			authenticated.PUT("/transaction/password", r.userHandlers.UpdateTransactionCode) // 更新交易密碼
		}
	}
}
