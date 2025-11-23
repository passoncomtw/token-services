package modules

import (
	// "github.com/joho/godotenv" // 已移除
	"go.uber.org/fx"
)

// AppModule 應用主模組 (遵循模組化設計 - OCP)
var AppModule = fx.Module("app",
	// 整合所有模組
	ConfigModule,
	LoggerModule,
	ServicesModule,
	ServerModule,
)
