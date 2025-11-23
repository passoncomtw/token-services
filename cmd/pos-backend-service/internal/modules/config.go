package modules

import (
	"go.uber.org/fx"

	"passontw-backend-services/cmd/pos-backend-service/internal/config"
)

// ConfigModule 配置模組 (遵循 SRP)
var ConfigModule = fx.Module("config",
	fx.Provide(config.NewConfig),
)
