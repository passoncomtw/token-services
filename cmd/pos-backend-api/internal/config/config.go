package config

import (
	"os"
	"strconv"
)

// Config 應用配置結構 (遵循 SRP - 只負責配置管理)
type Config struct {
	Server ServerConfig
	Logger LoggerConfig
	HTTP   HTTPConfig
	DB     DBConfig
	JWT    JWTConfig
}

// ServerConfig 服務器配置 (遵循 SRP)
type ServerConfig struct {
	Port string
}

// HTTPConfig HTTP 服務配置
// 支援 CORS 設定
type HTTPConfig struct {
	Port              string
	SwaggerBaseDomain string // Swagger 基礎域名（用於 Swagger UI 顯示）
}

// DBConfig 資料庫與連接池配置
type DBConfig struct {
	Host            string
	Port            string
	Name            string
	User            string
	Password        string
	SSLMode         string
	MaxIdleConns    int
	MaxOpenConns    int
	ConnMaxLifetime int
	ConnMaxIdleTime int
}

// JWTConfig JWT 設定
type JWTConfig struct {
	Secret string
}

// LoggerConfig 日誌配置 (遵循 SRP)
type LoggerConfig struct {
	Level string
	Mode  string
}

// NewConfig 創建新的配置實例 (遵循 DRY - 統一配置載入邏輯)
func NewConfig() *Config {
	return &Config{
		Server: ServerConfig{
			Port: getEnvOrDefault("PORT", "50051"),
		},
		Logger: LoggerConfig{
			Level: getEnvOrDefault("LOG_LEVEL", "info"),
			Mode:  getEnvOrDefault("LOG_MODE", "development"),
		},
		HTTP: HTTPConfig{
			Port:              getEnvOrDefault("HTTP_PORT", "8080"),
			SwaggerBaseDomain: getEnvOrDefault("SWAGGER_BASE_DOMAIN", ""),
		},
		DB: DBConfig{
			Host:            getEnvOrDefault("DB_HOST", "localhost"),
			Port:            getEnvOrDefault("DB_PORT", "5432"),
			Name:            getEnvOrDefault("DB_NAME", "pos_system"),
			User:            getEnvOrDefault("DB_USER", "postgres"),
			Password:        getEnvOrDefault("DB_PASSWORD", ""),
			SSLMode:         getEnvOrDefault("DB_SSL_MODE", "disable"),
			MaxIdleConns:    getEnvOrDefaultInt("DB_MAX_IDLE_CONNS", 10),
			MaxOpenConns:    getEnvOrDefaultInt("DB_MAX_OPEN_CONNS", 100),
			ConnMaxLifetime: getEnvOrDefaultInt("DB_CONN_MAX_LIFETIME", 3600),
			ConnMaxIdleTime: getEnvOrDefaultInt("DB_CONN_MAX_IDLE_TIME", 1800),
		},
		JWT: JWTConfig{
			Secret: getEnvOrDefault("JWT_SECRET", "changeme"),
		},
	}
}

// 輔助函數 (遵循 DRY)
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvOrDefaultInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvOrDefaultBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}
