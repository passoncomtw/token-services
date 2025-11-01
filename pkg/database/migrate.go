package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/lib/pq"
)

// MigrationsPath 遷移檔案目錄路徑
var MigrationsPath = "cmd/token-admin-api/internal/migrations/sqls"

// Migration 遷移資訊
type Migration struct {
	Version int
	Name    string
	UpSQL   string
	DownSQL string
}

/**
 * @brief 執行資料庫遷移
 * @param db 資料庫連線
 * @return error
 */
func RunMigrations(db *sql.DB) error {
	// 建立 migrations 記錄表
	if err := createMigrationsTable(db); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// 讀取所有遷移檔案
	migrations, err := loadMigrations()
	if err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	// 執行待執行的遷移
	for _, migration := range migrations {
		if err := executeMigration(db, migration); err != nil {
			return fmt.Errorf("failed to execute migration %d: %w", migration.Version, err)
		}
	}

	log.Println("✅ All migrations completed successfully")
	return nil
}

/**
 * @brief 建立遷移記錄表
 * @param db 資料庫連線
 * @return error
 */
func createMigrationsTable(db *sql.DB) error {
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version INT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)
	`
	_, err := db.Exec(query)
	return err
}

/**
 * @brief 載入所有遷移檔案
 * @return []Migration
 * @return error
 */
func loadMigrations() ([]Migration, error) {
	// 讀取遷移目錄
	entries, err := os.ReadDir(MigrationsPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read migrations directory: %w", err)
	}

	migrationsMap := make(map[int]*Migration)

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		filename := entry.Name()
		if !strings.HasSuffix(filename, ".sql") {
			continue
		}

		// 解析檔名格式: 001_create_users_table.up.sql 或 001_create_users_table.down.sql
		parts := strings.Split(filename, "_")
		if len(parts) < 2 {
			continue
		}

		var version int
		if _, err := fmt.Sscanf(parts[0], "%d", &version); err != nil {
			continue
		}

		// 讀取檔案內容
		content, err := os.ReadFile(filepath.Join(MigrationsPath, filename))
		if err != nil {
			return nil, fmt.Errorf("failed to read file %s: %w", filename, err)
		}

		// 取得遷移名稱（移除版本號和 .up.sql/.down.sql）
		nameEnd := strings.LastIndex(filename, ".up.sql")
		if nameEnd == -1 {
			nameEnd = strings.LastIndex(filename, ".down.sql")
		}
		name := filename[len(parts[0])+1 : nameEnd]

		if migrationsMap[version] == nil {
			migrationsMap[version] = &Migration{
				Version: version,
				Name:    name,
			}
		}

		if strings.HasSuffix(filename, ".up.sql") {
			migrationsMap[version].UpSQL = string(content)
		} else if strings.HasSuffix(filename, ".down.sql") {
			migrationsMap[version].DownSQL = string(content)
		}
	}

	// 轉換為切片並排序
	var migrations []Migration
	for _, m := range migrationsMap {
		migrations = append(migrations, *m)
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

/**
 * @brief 執行單個遷移
 * @param db 資料庫連線
 * @param migration 遷移資訊
 * @return error
 */
func executeMigration(db *sql.DB, migration Migration) error {
	// 檢查是否已執行
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM schema_migrations WHERE version = $1", migration.Version).Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		log.Printf("⏭️  Migration %d (%s) already applied, skipping", migration.Version, migration.Name)
		return nil
	}

	// 開始事務
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 執行整個 SQL 腳本（不分割）
	// PostgreSQL 可以在一個事務中執行多個語句
	if _, err := tx.Exec(migration.UpSQL); err != nil {
		return fmt.Errorf("failed to execute migration SQL: %w", err)
	}

	// 記錄遷移
	_, err = tx.Exec(
		"INSERT INTO schema_migrations (version, name) VALUES ($1, $2)",
		migration.Version,
		migration.Name,
	)
	if err != nil {
		return fmt.Errorf("failed to record migration: %w", err)
	}

	// 提交事務
	if err := tx.Commit(); err != nil {
		return err
	}

	log.Printf("✅ Migration %d (%s) applied successfully", migration.Version, migration.Name)
	return nil
}

/**
 * @brief 回滾遷移
 * @param db 資料庫連線
 * @param steps 回滾步數（0 表示回滾所有）
 * @return error
 */
func RollbackMigrations(db *sql.DB, steps int) error {
	// 載入所有遷移
	migrations, err := loadMigrations()
	if err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	// 取得已執行的遷移
	rows, err := db.Query("SELECT version FROM schema_migrations ORDER BY version DESC")
	if err != nil {
		return err
	}
	defer rows.Close()

	var appliedVersions []int
	for rows.Next() {
		var version int
		if err := rows.Scan(&version); err != nil {
			return err
		}
		appliedVersions = append(appliedVersions, version)
	}

	// 決定要回滾的遷移
	rollbackCount := len(appliedVersions)
	if steps > 0 && steps < rollbackCount {
		rollbackCount = steps
	}

	// 執行回滾
	for i := 0; i < rollbackCount; i++ {
		version := appliedVersions[i]

		// 找到對應的遷移
		var migration *Migration
		for j := range migrations {
			if migrations[j].Version == version {
				migration = &migrations[j]
				break
			}
		}

		if migration == nil {
			return fmt.Errorf("migration version %d not found", version)
		}

		// 開始事務
		tx, err := db.Begin()
		if err != nil {
			return err
		}

		// 執行回滾 SQL
		if _, err := tx.Exec(migration.DownSQL); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to rollback migration %d: %w", version, err)
		}

		// 刪除遷移記錄
		if _, err := tx.Exec("DELETE FROM schema_migrations WHERE version = $1", version); err != nil {
			tx.Rollback()
			return err
		}

		// 提交事務
		if err := tx.Commit(); err != nil {
			return err
		}

		log.Printf("⏪ Migration %d (%s) rolled back successfully", version, migration.Name)
	}

	log.Printf("✅ Rolled back %d migration(s)", rollbackCount)
	return nil
}
