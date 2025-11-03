package main

import (
	_ "token-services/cmd/token-admin-api/internal/docs"
	"token-services/cmd/token-admin-api/internal/handlers"
	"token-services/cmd/token-admin-api/internal/initializers"
	"token-services/cmd/token-admin-api/internal/server"
	"token-services/cmd/token-admin-api/internal/services"
	"token-services/pkg/config"
	"token-services/pkg/database"
	"token-services/pkg/logger"
	"token-services/pkg/middleware"

	"go.uber.org/fx"
)

// @title token-admin-api
// @version 1.0
// @description token-admin-api 是一個使用 Gin 和 FX 的範例 API
// @termsOfService http://swagger.io/terms/

// @contact.name token-admin-api Support
// @contact.url http://www.swagger.io/support
// @contact.email passon.com.tw@gmail.com

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /
// @schemes http

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description 在 value 欄位輸入: Bearer {token}

// ==================== 主程式 ====================
func main() {
	fx.New(
		config.ConfigModule,
		logger.LoggerModule,
		database.DatabaseModule,
		middleware.MiddlewareModule,
		initializers.InitializerModule,
		services.AuthModule,
		services.BackendActorModule,
		services.BackendUserModule,
		services.UserModule,
		services.BankModule,
		services.BankCardModule,
		services.OrderModule,
		services.PendingOrderModule,
		handlers.HandlerModule,
		server.ServerModule,
	).Run()
}
