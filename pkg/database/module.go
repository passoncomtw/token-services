package database

import (
	"database/sql"

	"token-services/pkg/config"

	"go.uber.org/fx"
	"gorm.io/gorm"
)

var DatabaseModule = fx.Module("database",
	fx.Provide(func(cfg *config.Config) (*sql.DB, error) {
		dbConfig := NewConfigFromAppConfig(cfg)
		return NewConnection(dbConfig)
	}),
	fx.Provide(func(cfg *config.Config) (*gorm.DB, error) {
		dbConfig := NewConfigFromAppConfig(cfg)
		return NewGormConnection(dbConfig)
	}),
)
