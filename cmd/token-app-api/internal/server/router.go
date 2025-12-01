package server

import (
	"passontw-backend-services/cmd/token-app-api/internal/interfaces"

	"github.com/gin-gonic/gin"
)

// Router 路由管理器
type Router struct {
	healthHandlers       interfaces.HealthHandlersInterface
	authHandlers         interfaces.AuthHandlersInterface
	userHandlers         interfaces.UserHandlersInterface
	bankHandlers         interfaces.BankHandlersInterface
	bankCardHandlers     interfaces.BankCardHandlersInterface
	pendingOrderHandlers interfaces.PendingOrderHandlersInterface
	orderHandlers        interfaces.OrderHandlersInterface
}

/**
 * @brief 建立新的 Router 實例
 * @param healthHandlers 健康檢查處理器
 * @param authHandlers 認證處理器
 * @param userHandlers 使用者處理器
 * @param bankHandlers 銀行處理器
 * @param bankCardHandlers 銀行卡處理器
 * @param pendingOrderHandlers 掛單處理器
 * @param orderHandlers 訂單處理器
 * @return Router 指標
 */
func NewRouter(
	healthHandlers interfaces.HealthHandlersInterface,
	authHandlers interfaces.AuthHandlersInterface,
	userHandlers interfaces.UserHandlersInterface,
	bankHandlers interfaces.BankHandlersInterface,
	bankCardHandlers interfaces.BankCardHandlersInterface,
	pendingOrderHandlers interfaces.PendingOrderHandlersInterface,
	orderHandlers interfaces.OrderHandlersInterface,
) *Router {
	return &Router{
		healthHandlers:       healthHandlers,
		authHandlers:         authHandlers,
		userHandlers:         userHandlers,
		bankHandlers:         bankHandlers,
		bankCardHandlers:     bankCardHandlers,
		pendingOrderHandlers: pendingOrderHandlers,
		orderHandlers:        orderHandlers,
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
			authenticated.PUT("/:user_id", r.userHandlers.UpdateUser)                         // 更新使用者資訊
			authenticated.PUT("/login/password", r.userHandlers.UpdateLoginPassword)          // 更新登入密碼
			authenticated.PUT("/transaction/password", r.userHandlers.UpdateTransactionCode)  // 更新交易密碼
			authenticated.GET("/pending/orders", r.pendingOrderHandlers.GetUserPendingOrders) // 取回使用者掛單
		}
	}

	// Bank routes (公開)
	engine.GET("/banks", r.bankHandlers.GetBanks) // 取回銀行列表

	// BankCard routes (需要認證)
	bankCards := engine.Group("/bankcards")
	bankCards.Use(r.authHandlers.JWTAuthMiddleware())
	{
		bankCards.GET("", r.bankCardHandlers.GetBankCards)                   // 取回銀行卡列表
		bankCards.POST("", r.bankCardHandlers.CreateBankCard)                // 新增銀行卡
		bankCards.PUT("/:bankcard_id", r.bankCardHandlers.UpdateBankCard)    // 更新銀行卡
		bankCards.DELETE("/:bankcard_id", r.bankCardHandlers.DeleteBankCard) // 刪除銀行卡
	}

	// PendingOrder routes
	pendingOrders := engine.Group("/pending/orders")
	{
		// 公開端點
		pendingOrders.GET("", r.pendingOrderHandlers.GetPendingOrders)                 // 取回掛單列表
		pendingOrders.GET("/:pendingorder_id", r.pendingOrderHandlers.GetPendingOrder) // 取回掛單詳情

		// 需要認證的端點
		authenticated := pendingOrders.Group("")
		authenticated.Use(r.authHandlers.JWTAuthMiddleware())
		{
			authenticated.POST("", r.pendingOrderHandlers.CreatePendingOrder)                        // 建立掛單
			authenticated.DELETE("/:pendingorder_id", r.pendingOrderHandlers.DeletePendingOrder)     // 刪除掛單
			authenticated.PUT("/:pendingorder_id/lock", r.pendingOrderHandlers.LockPendingOrder)     // 凍結掛單
			authenticated.PUT("/:pendingorder_id/unlock", r.pendingOrderHandlers.UnlockPendingOrder) // 解除凍結掛單
		}
	}

	// Order routes (需要認證)
	orders := engine.Group("/orders")
	orders.Use(r.authHandlers.JWTAuthMiddleware())
	{
		orders.GET("", r.orderHandlers.GetOrders)                    // 取回訂單列表
		orders.POST("", r.orderHandlers.CreateOrder)                 // 建立訂單
		orders.PUT("/:order_id/paid", r.orderHandlers.MarkAsPaid)    // 標記已付款
		orders.PUT("/:order_id/apply", r.orderHandlers.ApplyOrder)   // 放行
		orders.PUT("/:order_id/reject", r.orderHandlers.RejectOrder) // 取消訂單
	}
}
