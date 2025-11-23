package config

import (
	"os"
	"strconv"
	"time"
)

// Config 主配置結構
type Config struct {
	Server    ServerConfig
	Logger    LoggerConfig
	Backend   BackendConfig
	AESKey    string
	JWTSecret string
}

// ServerConfig gRPC 服務器配置
type ServerConfig struct {
	Port             string
	MerchantID       string
	EnableReflection bool
}

// LoggerConfig 日誌配置
type LoggerConfig struct {
	Level       string
	Development bool
	Encoding    string
}

// BackendConfig 後端服務配置
type BackendConfig struct {
	Address           string
	ConnectionTimeout time.Duration
	HeartbeatInterval int32
	MaxEventsPerBatch int32
	EnableHeartbeat   bool
	RetryAttempts     int
	RetryBaseDelay    time.Duration
	RetryMaxDelay     time.Duration
	RetryMultiplier   float64
}

// LoadConfig 載入配置
func LoadConfig() (*Config, error) {
	return &Config{
		Server:    loadServerConfig(),
		Logger:    loadLoggerConfig(),
		Backend:   loadBackendConfig(),
		AESKey:    getEnvOrDefault("AES_KEY", ""),
		JWTSecret: getEnvOrDefault("JWT_SECRET", ""),
	}, nil
}

// loadServerConfig 載入服務器配置
func loadServerConfig() ServerConfig {
	enableReflection, _ := strconv.ParseBool(getEnvOrDefault("GRPC_ENABLE_REFLECTION", "true"))
	return ServerConfig{
		Port:             getEnvOrDefault("PORT", "50053"),
		MerchantID:       getEnvOrDefault("MERCHANT_ID", "test-merchant"),
		EnableReflection: enableReflection,
	}
}

// loadLoggerConfig 載入日誌配置
func loadLoggerConfig() LoggerConfig {
	dev, _ := strconv.ParseBool(getEnvOrDefault("LOG_DEVELOPMENT", "true"))
	return LoggerConfig{
		Level:       getEnvOrDefault("LOG_LEVEL", "debug"),
		Development: dev,
		Encoding:    getEnvOrDefault("LOG_ENCODING", "console"),
	}
}

// loadBackendConfig 載入後端服務配置
func loadBackendConfig() BackendConfig {
	connTimeout, _ := time.ParseDuration(getEnvOrDefault("BACKEND_CONNECTION_TIMEOUT", "10s"))
	heartbeatInterval, _ := strconv.ParseInt(getEnvOrDefault("BACKEND_HEARTBEAT_INTERVAL", "30"), 10, 32)
	maxEvents, _ := strconv.ParseInt(getEnvOrDefault("BACKEND_MAX_EVENTS_PER_BATCH", "20"), 10, 32)
	retryAttempts, _ := strconv.Atoi(getEnvOrDefault("BACKEND_RETRY_ATTEMPTS", "3"))
	retryBaseDelay, _ := time.ParseDuration(getEnvOrDefault("BACKEND_RETRY_BASE_DELAY", "1s"))
	retryMaxDelay, _ := time.ParseDuration(getEnvOrDefault("BACKEND_RETRY_MAX_DELAY", "30s"))
	retryMultiplier, _ := strconv.ParseFloat(getEnvOrDefault("BACKEND_RETRY_MULTIPLIER", "2.0"), 64)

	return BackendConfig{
		Address:           getEnvOrDefault("BACKEND_SERVICE_ADDR", "localhost:50051"),
		ConnectionTimeout: connTimeout,
		HeartbeatInterval: int32(heartbeatInterval),
		MaxEventsPerBatch: int32(maxEvents),
		EnableHeartbeat:   true,
		RetryAttempts:     retryAttempts,
		RetryBaseDelay:    retryBaseDelay,
		RetryMaxDelay:     retryMaxDelay,
		RetryMultiplier:   retryMultiplier,
	}
}

// getEnvOrDefault 獲取環境變數或使用預設值
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetAESKey 取得 AES 金鑰
func (c *Config) GetAESKey() string {
	return c.AESKey
}

// GetJWTSecret 取得 JWT 金鑰
func (c *Config) GetJWTSecret() string {
	return c.JWTSecret
}
