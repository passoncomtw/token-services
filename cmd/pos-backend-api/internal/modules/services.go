package modules

import (
	"database/sql"

	"go.uber.org/fx"
	"gorm.io/gorm"

	"passontw-backend-services/cmd/pos-backend-api/internal/services"
)

// GetSQLDB 從 gorm.DB 取得 *sql.DB
func GetSQLDB(db *gorm.DB) (*sql.DB, error) {
	return db.DB()
}

// ServicesModule 服務模組 (遵循 SRP)
var ServicesModule = fx.Module("services",
	fx.Provide(
		// 提供 *sql.DB（從 *gorm.DB 取得）
		GetSQLDB,
		// 業務服務在這裡註冊
		services.NewMerchantService,
	),
)
