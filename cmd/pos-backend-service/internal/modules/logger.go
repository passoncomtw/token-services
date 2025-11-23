package modules

import (
	"context"
	"log"

	"go.uber.org/fx"

	"passontw-backend-services/cmd/pos-backend-service/internal/config"
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
	if cfg.Logger.Mode == "development" {
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

// LoggerModule 日誌模組 (遵循 SRP)
var LoggerModule = fx.Module("logger",
	fx.Provide(
		NewLoggerConfig,
		NewLogger,
	),
)
