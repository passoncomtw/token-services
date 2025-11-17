package main

import (
	_ "passontw-backend-services/cmd/token-admin-api/internal/docs"
	"passontw-backend-services/cmd/token-admin-api/internal/handlers"
	"passontw-backend-services/cmd/token-admin-api/internal/initializers"
	"passontw-backend-services/cmd/token-admin-api/internal/server"
	"passontw-backend-services/cmd/token-admin-api/internal/services"
	"passontw-backend-services/pkg/config"
	"passontw-backend-services/pkg/database"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/middleware"

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
// @schemes https http

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description 在 value 欄位輸入: Bearer {token}

// ==================== 主程式 ====================

// version 會在編譯時通過 ldflags 注入
var version = "dev"

// AppVersion 提供應用程式版本號
type AppVersion string

// ProvideVersion 提供版本號給 FX 容器
func ProvideVersion() AppVersion {
	return AppVersion(version)
}

func main() {
	fx.New(
		// 提供版本號
		fx.Provide(ProvideVersion),
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
