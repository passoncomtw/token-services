package main

import (
	_ "token-services/cmd/token-app-api/internal/docs"
	"token-services/cmd/token-app-api/internal/handlers"
	"token-services/cmd/token-app-api/internal/server"
	"token-services/cmd/token-app-api/internal/services"
	"token-services/pkg/config"
	"token-services/pkg/database"
	"token-services/pkg/logger"
	"token-services/pkg/middleware"

	"go.uber.org/fx"
)

// @title Token App API
// @version 1.0
// @description Token App API - 前台使用者 API（登入/登出）
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

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
		middleware.MiddlewareModule,
		database.DatabaseModule,
		services.AuthModule,
		services.UserModule,
		services.BankModule,
		services.BankCardModule,
		services.PendingOrderModule,
		services.OrderModule,
		handlers.HandlerModule,
		server.ServerModule,
	).Run()
}
