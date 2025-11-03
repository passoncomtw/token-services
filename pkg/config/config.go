package config

import (
	"fmt"
	"log"
	"net"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/joho/godotenv"
)

/**
 * @brief 應用程式配置結構（單例模式）
 */
type Config struct {
	// HTTP Server
	HTTPPort int
	HTTPHost string

	// JWT
	JWTSecret         string
	JWTExpirationTime time.Duration

	// Database
	DBHost            string
	DBPort            string
	DBName            string
	DBUser            string
	DBPassword        string
	DBSSLMode         string
	DBMaxIdleConns    int
	DBMaxOpenConns    int
	DBConnMaxLifetime time.Duration
	DBConnMaxIdleTime time.Duration

	// Redis
	RedisHost     string
	RedisPort     string
	RedisPassword string
	RedisDB       int

	// Logging
	LogLevel string
	LogMode  string
}

var (
	instance *Config
	once     sync.Once
)

/**
 * @brief 載入 .env 檔案
 * @return bool 是否成功載入
 */
func loadEnvFile() bool {
	// 嘗試多個可能的路徑載入 .env 檔案
	envPaths := []string{
		"cmd/token-admin-api/.env", // 從專案根目錄執行時
		".env",       // 從當前目錄執行時
		"../.env",    // 從子目錄執行時
		"../../.env", // 從更深的子目錄執行時
	}

	for _, path := range envPaths {
		if err := godotenv.Load(path); err == nil {
			log.Printf("✅ Loaded .env file from: %s", path)
			return true
		}
	}

	log.Println("⚠️  .env file not found in any expected location, using environment variables or defaults")
	return false
}

/**
 * @brief 取得環境變數，若不存在則使用預設值
 * @param key 環境變數名稱
 * @param defaultValue 預設值
 * @return string
 */
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

/**
 * @brief 取得整數型環境變數，若不存在或無效則使用預設值
 * @param key 環境變數名稱
 * @param defaultValue 預設值
 * @return int
 */
func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

/**
 * @brief 取得本機 IP 地址（優先取得非 loopback 的 IPv4 地址）
 * @return string 本機 IP 地址，若無法取得則返回 "localhost"
 */
func getLocalIP() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		log.Printf("⚠️  Failed to get local IP: %v, using localhost", err)
		return "localhost"
	}

	for _, addr := range addrs {
		// 檢查是否為 IP 地址（排除網路遮罩等）
		if ipNet, ok := addr.(*net.IPNet); ok && !ipNet.IP.IsLoopback() {
			// 只取 IPv4 地址
			if ipNet.IP.To4() != nil {
				return ipNet.IP.String()
			}
		}
	}

	log.Println("⚠️  No non-loopback IPv4 address found, using localhost")
	return "localhost"
}

/**
 * @brief 載入應用程式配置（單例模式）
 * @return *Config
 */
func Load() *Config {
	once.Do(func() {
		// 載入 .env 檔案（只執行一次）
		loadEnvFile()

		// 初始化配置
		instance = &Config{
			// HTTP Server
			HTTPPort: getEnvInt("HTTP_PORT", 8080),
			HTTPHost: getEnv("HTTP_HOST", "127.0.0.1"),

			// JWT
			JWTSecret:         getEnv("JWT_SECRET", "your_super_secret_jwt_key_here"),
			JWTExpirationTime: 24 * time.Hour,

			// Database
			DBHost:            getEnv("DB_HOST", "localhost"),
			DBPort:            getEnv("DB_PORT", "5432"),
			DBName:            getEnv("DB_NAME", "sk-demo"),
			DBUser:            getEnv("DB_USER", "postgres"),
			DBPassword:        getEnv("DB_PASSWORD", "postgres"),
			DBSSLMode:         getEnv("DB_SSL_MODE", "disable"),
			DBMaxIdleConns:    getEnvInt("DB_MAX_IDLE_CONNS", 10),
			DBMaxOpenConns:    getEnvInt("DB_MAX_OPEN_CONNS", 100),
			DBConnMaxLifetime: time.Duration(getEnvInt("DB_CONN_MAX_LIFETIME", 3600)) * time.Second,
			DBConnMaxIdleTime: time.Duration(getEnvInt("DB_CONN_MAX_IDLE_TIME", 1800)) * time.Second,

			// Redis
			RedisHost:     getEnv("REDIS_HOST", "localhost"),
			RedisPort:     getEnv("REDIS_PORT", "6379"),
			RedisPassword: getEnv("REDIS_PASSWORD", ""),
			RedisDB:       getEnvInt("REDIS_DB", 0),

			// Logging
			LogLevel: getEnv("LOG_LEVEL", "info"),
			LogMode:  getEnv("LOG_MODE", "production"),
		}

		log.Println("✅ Application configuration loaded successfully")
	})

	return instance
}

/**
 * @brief 取得配置實例
 * @return *Config
 */
func Get() *Config {
	if instance == nil {
		return Load()
	}
	return instance
}

/**
 * @brief 取得 Swagger Host（用於 Swagger UI）
 * @return string 格式: "ip:port"
 */
func (c *Config) GetSwaggerHost() string {
	localIP := getLocalIP()
	return fmt.Sprintf("%s:%d", localIP, c.HTTPPort)
}

/**
 * @brief 取得本機 IP 地址
 * @return string
 */
func (c *Config) GetLocalIP() string {
	return getLocalIP()
}
