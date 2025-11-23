package modules

import (
	"context"
	"log"
	"os"
	"strconv"
	"time"

	"go.uber.org/fx"

	"passontw-backend-services/cmd/pos-merchant-service/internal/config"
	pkgConfig "passontw-backend-services/pkg/config"
	"passontw-backend-services/pkg/logger"
)

// NewLoggerConfig 創建 logger 配置（從 internal config 轉換）
func NewLoggerConfig(cfg *config.Config) *logger.Config {
	// 解析日誌級別
	var level logger.LogLevel
	switch cfg.Logger.Level {
	case "debug":
		level = logger.DebugLevel
	case "info":
		level = logger.InfoLevel
	case "warn":
		level = logger.WarnLevel
	case "error":
		level = logger.ErrorLevel
	case "fatal":
		level = logger.FatalLevel
	default:
		level = logger.InfoLevel
	}

	// 解析日誌模式
	var mode logger.LogMode
	if cfg.Logger.Development {
		mode = logger.DevelopmentMode
	} else {
		mode = logger.ProductionMode
	}

	return &logger.Config{
		Level: level,
		Mode:  mode,
	}
}

// NewLogger 創建日誌記錄器（使用 pkg/logger）
func NewLogger(logCfg *logger.Config, lc fx.Lifecycle) logger.Logger {
	lgr := logger.New(logCfg)

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			log.Printf("✅ Logger initialized (Level: %s, Mode: %s)", logCfg.Level, logCfg.Mode)
			return nil
		},
		OnStop: func(ctx context.Context) error {
			lgr.Info("🛑 Syncing logger...")
			return lgr.Sync()
		},
	})

	return lgr
}

// NewPkgConfig 創建 pkg/config.Config（從環境變數讀取）
func NewPkgConfig() *pkgConfig.Config {
	// 輔助函數
	getEnv := func(key, defaultValue string) string {
		if value := os.Getenv(key); value != "" {
			return value
		}
		return defaultValue
	}

	getEnvInt := func(key string, defaultValue int) int {
		if value := os.Getenv(key); value != "" {
			if intValue, err := strconv.Atoi(value); err == nil {
				return intValue
			}
		}
		return defaultValue
	}

	return &pkgConfig.Config{
		// HTTP Server
		HTTPPort: getEnvInt("HTTP_PORT", 8080),
		HTTPHost: getEnv("HTTP_HOST", "127.0.0.1"),

		// JWT
		JWTSecret:         getEnv("JWT_SECRET", "your_super_secret_jwt_key_here"),
		JWTExpirationTime: 24 * time.Hour,

		// Database
		DBHost:            getEnv("DB_HOST", "localhost"),
		DBPort:            getEnv("DB_PORT", "5432"),
		DBName:            getEnv("DB_NAME", "sk-demo"),
		DBUser:            getEnv("DB_USER", "postgres"),
		DBPassword:        getEnv("DB_PASSWORD", "postgres"),
		DBSSLMode:         getEnv("DB_SSL_MODE", "disable"),
		DBMaxIdleConns:    getEnvInt("DB_MAX_IDLE_CONNS", 10),
		DBMaxOpenConns:    getEnvInt("DB_MAX_OPEN_CONNS", 100),
		DBConnMaxLifetime: time.Duration(getEnvInt("DB_CONN_MAX_LIFETIME", 3600)) * time.Second,
		DBConnMaxIdleTime: time.Duration(getEnvInt("DB_CONN_MAX_IDLE_TIME", 1800)) * time.Second,

		// Redis
		RedisHost:     getEnv("REDIS_HOST", "localhost"),
		RedisPort:     getEnv("REDIS_PORT", "6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       getEnvInt("REDIS_DB", 0),

		// Logging
		LogLevel: getEnv("LOG_LEVEL", "info"),
		LogMode:  getEnv("LOG_MODE", "production"),

		// Swagger
		SwaggerBaseDomain: getEnv("SWAGGER_BASE_DOMAIN", ""),

		// App Version
		AppVersion: getEnv("APP_VERSION", "dev"),
	}
}

// ConfigModule 配置模組 (遵循 SRP - 只負責配置相關依賴)
var ConfigModule = fx.Module("config",
	fx.Provide(
		config.LoadConfig, // internal/config.Config (用於服務特定配置)
		NewPkgConfig,      // pkg/config.Config (用於 database 模組)
		NewLoggerConfig,   // logger.Config
		NewLogger,         // logger.Logger
	),
)
