package main

import (
	_ "token-admin-api/cmd/token-admin-api/internal/docs"
	"token-admin-api/cmd/token-admin-api/internal/handlers"
	"token-admin-api/cmd/token-admin-api/internal/initializers"
	"token-admin-api/cmd/token-admin-api/internal/server"
	"token-admin-api/cmd/token-admin-api/internal/services"
	"token-admin-api/pkg/config"
	"token-admin-api/pkg/database"
	"token-admin-api/pkg/middleware"

	"go.uber.org/fx"
)

// @title FX Demo API
// @version 1.0
// @description 這是一個使用 Gin 和 FX 的範例 API
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

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
		handlers.HandlerModule,
		server.ServerModule,
	).Run()
}
