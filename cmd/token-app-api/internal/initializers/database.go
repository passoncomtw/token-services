package initializers

import (
	"context"
	"log"

	"github.com/yourusername/project/cmd/github.com/yourusername/project/internal/models"

	"gorm.io/gorm"
)

/**
 * @brief InitializeDatabase 初始化資料庫表結構
 * @param ctx 上下文
 * @param db GORM 資料庫連線
 * @return error
 */
func InitializeDatabase(ctx context.Context, db *gorm.DB) error {
	log.Println("🔧 Initializing database schema...")

	// 自動遷移資料表結構
	err := db.AutoMigrate(
		&models.Order{},
		&models.User{},
	)
	if err != nil {
		log.Printf("❌ Failed to migrate database: %v", err)
		return err
	}

	log.Println("✅ Database schema initialized successfully")
	return nil
}
