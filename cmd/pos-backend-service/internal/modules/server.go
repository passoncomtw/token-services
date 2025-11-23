package modules

import (
	"context"
	"time"

	"go.uber.org/fx"
	"go.uber.org/zap"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"passontw-backend-services/cmd/pos-backend-service/internal/config"
	"passontw-backend-services/cmd/pos-backend-service/internal/handlers"
	"passontw-backend-services/cmd/pos-backend-service/internal/server"
	"passontw-backend-services/cmd/pos-backend-service/internal/services"
	"passontw-backend-services/pkg/logger"
)

func NewDB(cfg *config.Config) (*gorm.DB, error) {
	dsn := "host=" + cfg.DB.Host + " user=" + cfg.DB.User + " password=" + cfg.DB.Password + " dbname=" + cfg.DB.Name + " port=" + cfg.DB.Port + " sslmode=" + cfg.DB.SSLMode
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxIdleConns(cfg.DB.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.DB.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Duration(cfg.DB.ConnMaxLifetime) * time.Second)
	sqlDB.SetConnMaxIdleTime(time.Duration(cfg.DB.ConnMaxIdleTime) * time.Second)
	return db, nil
}

// ServerModule 服務器模組 (遵循 SRP)
var ServerModule = fx.Module("server",
	fx.Provide(
		NewDB,
		func(cfg *config.Config) string { return cfg.JWT.Secret },
		services.NewDBInitService,
		services.NewAuthService,
		handlers.NewHandlers,
		server.NewHTTPServer,
		server.NewServerManager,
	),
	fx.Invoke(func(lc fx.Lifecycle, manager *server.ServerManager, dbInit *services.DBInitService, lgr logger.Logger) {
		lc.Append(fx.Hook{
			OnStart: func(ctx context.Context) error {
				// 初始化數據庫
				if err := dbInit.InitializeDatabase(); err != nil {
					lgr.Error("Failed to initialize database", zap.Error(err))
					return err
				}
				// 啟動服務器
				return manager.Start()
			},
			OnStop: func(ctx context.Context) error {
				return manager.Stop(ctx)
			},
		})
	}),
)
