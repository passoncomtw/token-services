package initializers

import (
	"context"
	"database/sql"

	"go.uber.org/fx"
)

var InitializerModule = fx.Module("initializer",
	fx.Invoke(func(lc fx.Lifecycle, sqlDB *sql.DB) {
		lc.Append(fx.Hook{
			OnStart: func(ctx context.Context) error {
				// 初始化管理員帳號
				return InitializeAdmin(ctx, sqlDB)
			},
		})
	}),
)
