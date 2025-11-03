package logger

import (
	"context"
	"log"

	"token-services/pkg/config"

	"go.uber.org/fx"
)

/**
 * @brief 從應用配置建立日誌配置
 * @param cfg 應用配置
 * @return *Config
 */
func NewLoggerConfig(cfg *config.Config) *Config {
	// 解析日誌級別
	var level LogLevel
	switch cfg.LogLevel {
	case "debug":
		level = DebugLevel
	case "info":
		level = InfoLevel
	case "warn":
		level = WarnLevel
	case "error":
		level = ErrorLevel
	case "fatal":
		level = FatalLevel
	default:
		level = InfoLevel
	}

	// 解析日誌模式
	var mode LogMode
	if cfg.LogMode == "development" {
		mode = DevelopmentMode
	} else {
		mode = ProductionMode
	}

	return &Config{
		Level: level,
		Mode:  mode,
	}
}

/**
 * @brief 建立 Logger 實例
 * @param logCfg 日誌配置
 * @param lc FX Lifecycle
 * @return Logger
 */
func NewLogger(logCfg *Config, lc fx.Lifecycle) Logger {
	logger := New(logCfg)

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			log.Printf("✅ Logger initialized (Level: %s, Mode: %s)", logCfg.Level, logCfg.Mode)
			return nil
		},
		OnStop: func(ctx context.Context) error {
			logger.Info("🛑 Syncing logger...")
			return logger.Sync()
		},
	})

	return logger
}

// LoggerModule FX 模組，提供 Logger
var LoggerModule = fx.Module("logger",
	fx.Provide(
		NewLoggerConfig, // 提供日誌配置
		NewLogger,       // 提供 Logger 實例
	),
)
