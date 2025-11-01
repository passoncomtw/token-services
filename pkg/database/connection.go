package database

import (
	"database/sql"
	"fmt"
	"log"

	"token-admin-api/pkg/config"

	_ "github.com/lib/pq"
)

// Config 資料庫配置
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

/**
 * @brief 從統一配置載入資料庫配置
 * @param cfg 應用程式配置
 * @return *Config
 */
func NewConfigFromAppConfig(cfg *config.Config) *Config {
	return &Config{
		Host:     cfg.DBHost,
		Port:     cfg.DBPort,
		User:     cfg.DBUser,
		Password: cfg.DBPassword,
		DBName:   cfg.DBName,
		SSLMode:  cfg.DBSSLMode,
	}
}

/**
 * @brief 建立資料庫連線
 * @param config 資料庫配置
 * @return *sql.DB
 * @return error
 */
func NewConnection(config *Config) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host,
		config.Port,
		config.User,
		config.Password,
		config.DBName,
		config.SSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// 測試連線
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// 設定連線池
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	log.Printf("✅ Database connected successfully to %s:%s/%s", config.Host, config.Port, config.DBName)
	return db, nil
}
