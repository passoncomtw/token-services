package swagger

import (
	"context"

	"passontw-backend-services/pkg/logger"

	"go.uber.org/fx"
	"go.uber.org/zap"
)

/**
 * @brief 建立 Swagger 管理器（帶生命週期管理）
 * @param swagCfg Swagger 配置
 * @param log Logger 實例
 * @param lc FX Lifecycle
 * @return *SwaggerManager
 */
func NewSwaggerManagerWithLifecycle(swagCfg *SwaggerConfig, log logger.Logger, lc fx.Lifecycle) *SwaggerManager {
	sm := NewSwaggerManager(swagCfg, log)

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			if sm.IsEnabled() {
				log.Info("========================================")
				log.Info("📚 Swagger UI Configuration",
					zap.String("host", sm.config.Host),
					zap.String("version", sm.config.Version),
					zap.String("basePath", sm.config.BasePath),
				)
				log.Info("📖 Swagger UI URLs",
					zap.String("local", sm.GetSwaggerURL(true)),
					zap.String("network", sm.GetSwaggerURL(false)),
				)
				log.Info("========================================")
			} else {
				log.Info("⚠️  Swagger is disabled (SWAGGER_ENABLED=false)")
			}
			return nil
		},
	})

	return sm
}

// SwaggerModule FX 模組，提供 Swagger 功能
// 
// 使用方式：
//   1. 在 main.go 中引入此模組
//   2. 在 Server 初始化時註冊路由
//   3. 在 Server 初始化時初始化文檔
//
// 範例：
//   fx.New(
//       config.ConfigModule,
//       logger.LoggerModule,
//       swagger.SwaggerModule,
//       // ... 其他模組
//   )
var SwaggerModule = fx.Module("swagger",
	fx.Provide(
		NewSwaggerConfig,              // 提供 Swagger 配置
		NewSwaggerManagerWithLifecycle, // 提供 Swagger 管理器（帶生命週期）
	),
)

