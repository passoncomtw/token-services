package modules

import (
	"go.uber.org/fx"

	"passontw-backend-services/cmd/pos-backend-api/internal/config"
	pkgConfig "passontw-backend-services/pkg/config"
)

// ConfigModule 配置模組 (遵循 SRP)
var ConfigModule = fx.Module("config",
	fx.Provide(
		config.NewConfig,
		// 提供 pkg/config.Config 給 middleware 使用
		func() *pkgConfig.Config {
			return pkgConfig.Load()
		},
	),
)
