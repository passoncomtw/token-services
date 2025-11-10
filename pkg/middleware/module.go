package middleware

import (
	"passontw-backend-services/pkg/auth"
	"passontw-backend-services/pkg/config"

	"go.uber.org/fx"
)

// MiddlewareModule FX 中間件模組
var MiddlewareModule = fx.Module("middleware",
	fx.Provide(
		// 提供 JWT 配置
		func(cfg *config.Config) *auth.Config {
			return auth.NewConfigFromAppConfig(cfg)
		},
		// 提供認證中間件
		NewAuthMiddleware,
		// 提供日誌中間件
		NewLoggerMiddleware,
	),
)
