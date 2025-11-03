package server

import (
	"token-admin-api/cmd/token-admin-api/internal/interfaces"
	"token-admin-api/pkg/middleware"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// Router 路由管理器
type Router struct {
	healthHandlers       interfaces.HealthHandlersInterface
	authHandlers         interfaces.AuthHandlersInterface
	backendActorHandlers interfaces.BackendActorHandlersInterface
	backendUserHandlers  interfaces.BackendUserHandlersInterface
	userHandlers         interfaces.UserHandlersInterface
	bankHandlers         interfaces.BankHandlersInterface
	bankCardHandlers     interfaces.BankCardHandlersInterface
	orderHandlers        interfaces.OrderHandlersInterface
	pendingOrderHandlers interfaces.PendingOrderHandlersInterface
	authMiddleware       *middleware.AuthMiddleware
}

/**
 * @brief 建立新的 Router 實例
 * @param healthHandlers 健康檢查處理器
 * @param authHandlers 認證處理器
 * @param backendActorHandlers 後台角色處理器
 * @param backendUserHandlers 後台使用者處理器
 * @param userHandlers 使用者處理器
 * @param bankHandlers 銀行處理器
 * @param bankCardHandlers 銀行卡處理器
 * @param orderHandlers 訂單處理器
 * @param pendingOrderHandlers 掛單處理器
 * @param authMiddleware 認證中間件
 * @return Router 指標
 */
func NewRouter(
	healthHandlers interfaces.HealthHandlersInterface,
	authHandlers interfaces.AuthHandlersInterface,
	backendActorHandlers interfaces.BackendActorHandlersInterface,
	backendUserHandlers interfaces.BackendUserHandlersInterface,
	userHandlers interfaces.UserHandlersInterface,
	bankHandlers interfaces.BankHandlersInterface,
	bankCardHandlers interfaces.BankCardHandlersInterface,
	orderHandlers interfaces.OrderHandlersInterface,
	pendingOrderHandlers interfaces.PendingOrderHandlersInterface,
	authMiddleware *middleware.AuthMiddleware,
) *Router {
	return &Router{
		healthHandlers:       healthHandlers,
		authHandlers:         authHandlers,
		backendActorHandlers: backendActorHandlers,
		backendUserHandlers:  backendUserHandlers,
		userHandlers:         userHandlers,
		bankHandlers:         bankHandlers,
		bankCardHandlers:     bankCardHandlers,
		orderHandlers:        orderHandlers,
		pendingOrderHandlers: pendingOrderHandlers,
		authMiddleware:       authMiddleware,
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

	// 建立需要認證的路由組
	authenticated := engine.Group("")
	authenticated.Use(r.authMiddleware.Authenticate())
	{
		// Backend Actor routes
		authenticated.GET("/backendactors", r.backendActorHandlers.GetAll)
		authenticated.POST("/backendactors", r.backendActorHandlers.Create)
		authenticated.GET("/backendactors/permissions", r.backendActorHandlers.GetPermissions)

		// Backend User routes
		authenticated.GET("/backendusers", r.backendUserHandlers.GetList)
		authenticated.POST("/backendusers", r.backendUserHandlers.Create)
		authenticated.PUT("/backendusers/:backendUserId", r.backendUserHandlers.Update)
		authenticated.DELETE("/backendusers/:backendUserId", r.backendUserHandlers.Delete)

		// User routes
		authenticated.GET("/users", r.userHandlers.GetList)
		authenticated.POST("/users", r.userHandlers.Create)
		authenticated.GET("/users/:userId", r.userHandlers.GetDetail)
		authenticated.PUT("/users/:userId", r.userHandlers.Update)
		authenticated.PUT("/users/:userId/unlock", r.userHandlers.Unlock)
		authenticated.PUT("/users/:userId/login/password", r.userHandlers.UpdateLoginPassword)
		authenticated.PUT("/users/:userId/transaction/password", r.userHandlers.UpdateTransactionPassword)
		authenticated.PUT("/users/login/password", r.userHandlers.UpdateOwnLoginPassword)
		authenticated.GET("/users/:userId/bankcards", r.userHandlers.GetBankCards)
		authenticated.GET("/users/:userId/orders", r.userHandlers.GetOrders)
		authenticated.GET("/users/:userId/pending/orders", r.userHandlers.GetPendingOrders)

		// Bank routes
		authenticated.GET("/banks", r.bankHandlers.GetList)
		authenticated.POST("/banks", r.bankHandlers.Create)
		authenticated.PUT("/banks/:bankId", r.bankHandlers.Update)

		// BankCard routes
		authenticated.GET("/bankcards", r.bankCardHandlers.GetList)
		authenticated.GET("/bankcards/:bankcardId", r.bankCardHandlers.GetDetail)

		// Order routes
		authenticated.GET("/orders", r.orderHandlers.GetList)
		authenticated.PUT("/orders/:orderId", r.orderHandlers.Complete)
		authenticated.PUT("/orders/:orderId/cancel", r.orderHandlers.Cancel)

		// Pending Order routes
		authenticated.GET("/pending/orders", r.pendingOrderHandlers.GetList)
		authenticated.PUT("/pending/orders/:pendingOrderId/stop", r.pendingOrderHandlers.Stop)
		authenticated.PUT("/pending/orders/:pendingOrderId/open", r.pendingOrderHandlers.Open)
		authenticated.PUT("/pending/orders/:pendingOrderId/cancel", r.pendingOrderHandlers.Cancel)
		authenticated.DELETE("/pending/orders/:pendingOrderId", r.pendingOrderHandlers.Delete)
	}
}
