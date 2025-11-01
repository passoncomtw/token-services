package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"os"

	"token-admin-api/pkg/config"
	"token-admin-api/pkg/database"
)

func main() {
	var (
		action string
		steps  int
	)

	flag.StringVar(&action, "action", "up", "Migration action: up, down, status")
	flag.IntVar(&steps, "steps", 0, "Number of steps to rollback (0 = all)")
	flag.Parse()

	// 載入應用程式配置
	appConfig := config.Load()

	// 建立資料庫配置
	dbConfig := database.NewConfigFromAppConfig(appConfig)

	// 建立資料庫連線
	db, err := database.NewConnection(dbConfig)
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer db.Close()

	// 執行遷移操作
	switch action {
	case "up":
		if err := database.RunMigrations(db); err != nil {
			log.Fatalf("❌ Migration failed: %v", err)
		}

	case "down":
		if err := database.RollbackMigrations(db, steps); err != nil {
			log.Fatalf("❌ Rollback failed: %v", err)
		}

	case "status":
		if err := showMigrationStatus(db); err != nil {
			log.Fatalf("❌ Failed to show status: %v", err)
		}

	default:
		fmt.Printf("❌ Unknown action: %s\n", action)
		fmt.Println("Available actions: up, down, status")
		os.Exit(1)
	}
}

/**
 * @brief 顯示遷移狀態
 * @param db 資料庫連線
 * @return error
 */
func showMigrationStatus(db *sql.DB) error {
	rows, err := db.Query(`
		SELECT version, name, applied_at
		FROM schema_migrations
		ORDER BY version
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	fmt.Println("\n📊 Migration Status:")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Printf("%-10s %-40s %-25s\n", "Version", "Name", "Applied At")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	count := 0
	for rows.Next() {
		var version int
		var name, appliedAt string

		if err := rows.Scan(&version, &name, &appliedAt); err != nil {
			return err
		}

		fmt.Printf("%-10d %-40s %-25s\n", version, name, appliedAt)
		count++
	}

	if count == 0 {
		fmt.Println("No migrations applied yet")
	}

	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Printf("\nTotal: %d migration(s) applied\n\n", count)

	return nil
}
