package modules

import (
	"go.uber.org/fx"
	"go.uber.org/zap"

	"passontw-backend-services/cmd/pos-backend-service/internal/config"
)

// NewLogger 創建日誌記錄器 (遵循 DRY)
func NewLogger(cfg *config.Config) (*zap.Logger, error) {
	var logger *zap.Logger
	var err error

	if cfg.Logger.Mode == "production" {
		logger, err = zap.NewProduction()
	} else {
		logger, err = zap.NewDevelopment()
	}

	if err != nil {
		return nil, err
	}

	return logger, nil
}

// LoggerModule 日誌模組 (遵循 SRP)
var LoggerModule = fx.Module("logger",
	fx.Provide(NewLogger),
)
