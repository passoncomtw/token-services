package cache

import (
	"context"

	"token-admin-api/pkg/config"

	"github.com/redis/go-redis/v9"
	"go.uber.org/fx"
)

var RedisModule = fx.Module("redis",
	fx.Provide(func(cfg *config.Config) (*redis.Client, error) {
		redisConfig := NewRedisConfigFromAppConfig(cfg)
		return NewRedisClient(redisConfig)
	}),
	fx.Invoke(func(lc fx.Lifecycle, client *redis.Client) {
		lc.Append(fx.Hook{
			OnStop: func(ctx context.Context) error {
				return CloseRedisClient(client)
			},
		})
	}),
)
