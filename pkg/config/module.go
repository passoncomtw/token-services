package config

import (
	"go.uber.org/fx"
)

// ConfigModule 配置模組
var ConfigModule = fx.Module("config",
	fx.Provide(func() *Config {
		return Load()
	}),
)
