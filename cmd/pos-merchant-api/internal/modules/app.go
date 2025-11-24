package modules

import (
	"go.uber.org/fx"

	"passontw-backend-services/pkg/database"
)

// AppModule 應用程式主模組 (遵循 DRY - 統一的模組整合)
var AppModule = fx.Options(
	// 按照依賴順序載入模組
	ConfigModule,         // 配置和日誌
	database.DatabaseModule, // 數據庫連接
	ServicesModule,       // 業務服務
	ServerModule,         // HTTP 服務器和生命週期
)
