package modules

import (
	// "github.com/joho/godotenv" // 已移除
	"go.uber.org/fx"

	pkgMiddleware "passontw-backend-services/pkg/middleware"
)

// AppModule 應用主模組 (遵循模組化設計 - OCP)
var AppModule = fx.Module("app",
	// 整合所有模組
	ConfigModule,
	LoggerModule,
	pkgMiddleware.MiddlewareModule, // 添加 pkg/middleware 模組（提供 CORS 等中間件）
	ServicesModule,
	ServerModule,
)
