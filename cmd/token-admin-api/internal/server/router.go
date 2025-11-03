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
	backendUserHandlers  interfaces.BackendUserHandlersInterface
	userHandlers         interfaces.UserHandlersInterface
	bankHandlers         interfaces.BankHandlersInterface
	bankCardHandlers     interfaces.BankCardHandlersInterface
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
) *Router {
	return &Router{
		healthHandlers:       healthHandlers,
		authHandlers:         authHandlers,
		backendActorHandlers: backendActorHandlers,
		backendUserHandlers:  backendUserHandlers,
		userHandlers:         userHandlers,
		bankHandlers:         bankHandlers,
		bankCardHandlers:     bankCardHandlers,
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

	// Backend User routes (需要驗證)
	// TODO: 添加 JWT 驗證中間件
	engine.GET("/backendusers", r.backendUserHandlers.GetList)
	engine.POST("/backendusers", r.backendUserHandlers.Create)
	engine.PUT("/backendusers/:backendUserId", r.backendUserHandlers.Update)
	engine.DELETE("/backendusers/:backendUserId", r.backendUserHandlers.Delete)

	// User routes (需要驗證)
	// TODO: 添加 JWT 驗證中間件
	engine.GET("/users", r.userHandlers.GetList)
	engine.POST("/users", r.userHandlers.Create)
	engine.GET("/users/:userId", r.userHandlers.GetDetail)
	engine.PUT("/users/:userId", r.userHandlers.Update)
	engine.PUT("/users/:userId/unlock", r.userHandlers.Unlock)
	engine.PUT("/users/:userId/login/password", r.userHandlers.UpdateLoginPassword)
	engine.PUT("/users/:userId/transaction/password", r.userHandlers.UpdateTransactionPassword)
	engine.PUT("/users/login/password", r.userHandlers.UpdateOwnLoginPassword)
	engine.GET("/users/:userId/bankcards", r.userHandlers.GetBankCards)
	engine.GET("/users/:userId/orders", r.userHandlers.GetOrders)
	engine.GET("/users/:userId/pending/orders", r.userHandlers.GetPendingOrders)

	// Bank routes (需要驗證)
	// TODO: 添加 JWT 驗證中間件
	engine.GET("/banks", r.bankHandlers.GetList)
	engine.POST("/banks", r.bankHandlers.Create)
	engine.PUT("/banks/:bankId", r.bankHandlers.Update)

	// BankCard routes (需要驗證)
	// TODO: 添加 JWT 驗證中間件
	engine.GET("/bankcards", r.bankCardHandlers.GetList)
	engine.GET("/bankcards/:bankcardId", r.bankCardHandlers.GetDetail)
}
