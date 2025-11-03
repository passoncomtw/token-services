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
}

/**
 * @brief 建立新的 Router 實例
 * @param healthHandlers 健康檢查處理器
 * @param authHandlers 認證處理器
 * @return Router 指標
 */
func NewRouter(
	healthHandlers interfaces.HealthHandlersInterface,
	authHandlers interfaces.AuthHandlersInterface,
) *Router {
	return &Router{
		healthHandlers: healthHandlers,
		authHandlers:   authHandlers,
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
	}
}
