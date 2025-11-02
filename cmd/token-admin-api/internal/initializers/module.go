package initializers

import (
	"context"

	"go.uber.org/fx"
	"gorm.io/gorm"
)

var InitializerModule = fx.Module("initializers",
	fx.Invoke(func(lc fx.Lifecycle, gormDB *gorm.DB) {
		lc.Append(fx.Hook{
			OnStart: func(ctx context.Context) error {
				// 初始化管理員帳號
				return InitializeAdmin(ctx, gormDB)
			},
		})
	}),
)
