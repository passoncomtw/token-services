package main

import (
	"token-services/cmd/token-app-api/internal/handlers"
	"token-services/cmd/token-app-api/internal/initializers"
	"token-services/cmd/token-app-api/internal/server"
	"token-services/cmd/token-app-api/internal/services"
	"token-services/pkg/config"
	"token-services/pkg/database"
	"token-services/pkg/logger"

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
		logger.LoggerModule,
		database.DatabaseModule,
		initializers.InitializerModule,
		services.AuthModule,
		services.UserModule,
		services.OrderModule,
		handlers.HandlerModule,
		server.ServerModule,
	).Run()
}
