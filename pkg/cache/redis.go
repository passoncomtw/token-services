package cache

import (
	"context"
	"fmt"
	"log"
	"time"

	"token-admin-api/pkg/config"

	"github.com/redis/go-redis/v9"
)

/**
 * @brief Redis 配置結構
 */
type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

/**
 * @brief 從統一配置載入 Redis 配置
 * @param cfg 應用程式配置
 * @return *RedisConfig
 */
func NewRedisConfigFromAppConfig(cfg *config.Config) *RedisConfig {
	return &RedisConfig{
		Host:     cfg.RedisHost,
		Port:     cfg.RedisPort,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	}
}

/**
 * @brief 建立 Redis 客戶端連線
 * @param config Redis 配置
 * @return *redis.Client
 * @return error
 */
func NewRedisClient(config *RedisConfig) (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr:         fmt.Sprintf("%s:%s", config.Host, config.Port),
		Password:     config.Password,
		DB:           config.DB,
		DialTimeout:  10 * time.Second,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
		PoolSize:     10,
		MinIdleConns: 5,
	})

	// 測試連線
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to ping Redis: %w", err)
	}

	log.Printf("✅ Redis connected successfully to %s:%s (DB: %d)", config.Host, config.Port, config.DB)
	return client, nil
}

/**
 * @brief 關閉 Redis 連線
 * @param client Redis 客戶端
 */
func CloseRedisClient(client *redis.Client) error {
	if client != nil {
		log.Println("🔌 Closing Redis connection...")
		return client.Close()
	}
	return nil
}
