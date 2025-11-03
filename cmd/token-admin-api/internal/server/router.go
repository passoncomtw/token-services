package server

import (
	"token-admin-api/cmd/token-admin-api/internal/interfaces"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// Router 路由管理器
type Router struct {
	healthHandlers       interfaces.HealthHandlersInterface
	authHandlers         interfaces.AuthHandlersInterface
	backendActorHandlers interfaces.BackendActorHandlersInterface
}

/**
 * @brief 建立新的 Router 實例
 * @param healthHandlers 健康檢查處理器
 * @param authHandlers 認證處理器
 * @param backendActorHandlers 後台角色處理器
 * @return Router 指標
 */
func NewRouter(
	healthHandlers interfaces.HealthHandlersInterface,
	authHandlers interfaces.AuthHandlersInterface,
	backendActorHandlers interfaces.BackendActorHandlersInterface,
) *Router {
	return &Router{
		healthHandlers:       healthHandlers,
		authHandlers:         authHandlers,
		backendActorHandlers: backendActorHandlers,
	}
}

/**
 * @brief 設定路由
 * @param engine Gin 引擎
 */
func (r *Router) SetupRoutes(engine *gin.Engine) {
	// Health check
	engine.GET("/health-check", r.healthHandlers.HealthCheck)

	// Swagger UI
	engine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Auth routes (無需驗證)
	engine.POST("/auth/login", r.authHandlers.Login)
	engine.POST("/auth/logout", r.authHandlers.Logout)

	// Backend Actor routes (需要驗證)
	// TODO: 添加 JWT 驗證中間件
	engine.GET("/backendactors", r.backendActorHandlers.GetAll)
	engine.POST("/backendactors", r.backendActorHandlers.Create)
	engine.GET("/backendactors/permissions", r.backendActorHandlers.GetPermissions)
}
