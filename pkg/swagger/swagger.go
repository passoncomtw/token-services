package swagger

import (
	"fmt"
	"reflect"

	"passontw-backend-services/pkg/config"
	"passontw-backend-services/pkg/logger"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"go.uber.org/zap"
)

/**
 * @brief Swagger 配置結構
 */
type SwaggerConfig struct {
	Enabled    bool   // 是否啟用 Swagger
	Host       string // Swagger Host（格式: "domain" 或 "ip:port"）
	BasePath   string // API 基礎路徑
	Version    string // API 版本號
	Title      string // API 標題
	Desc       string // API 描述
	Schemes    []string // 支援的協議（http, https）
}

/**
 * @brief Swagger 管理器
 */
type SwaggerManager struct {
	config *SwaggerConfig
	logger logger.Logger
}

/**
 * @brief 從應用配置建立 Swagger 配置
 * @param cfg 應用配置
 * @return *SwaggerConfig
 */
func NewSwaggerConfig(cfg *config.Config) *SwaggerConfig {
	return &SwaggerConfig{
		Enabled:  cfg.SwaggerEnabled,
		Host:     cfg.GetSwaggerHost(),
		BasePath: "/",
		Version:  cfg.AppVersion,
		Schemes:  []string{"https", "http"},
	}
}

/**
 * @brief 建立 Swagger 管理器
 * @param swagCfg Swagger 配置
 * @param log Logger 實例
 * @return *SwaggerManager
 */
func NewSwaggerManager(swagCfg *SwaggerConfig, log logger.Logger) *SwaggerManager {
	return &SwaggerManager{
		config: swagCfg,
		logger: log.With(zap.String("component", "Swagger")),
	}
}

/**
 * @brief 初始化 Swagger 文檔信息（動態設定）
 * @param docsSwaggerInfo Swagger 文檔信息物件（從各服務的 docs 包傳入）
 * 
 * 使用方式：
 *   import "your-service/internal/docs"
 *   swaggerManager.InitializeDocs(docs.SwaggerInfo)
 */
func (sm *SwaggerManager) InitializeDocs(docsSwaggerInfo interface{}) {
	if !sm.config.Enabled {
		sm.logger.Info("⚠️  Swagger is disabled, skipping initialization")
		return
	}

	// 使用反射設定 Swagger 文檔信息
	swagInfo := reflect.ValueOf(docsSwaggerInfo).Elem()
	
	// 設定 Host
	if hostField := swagInfo.FieldByName("Host"); hostField.IsValid() && hostField.CanSet() {
		hostField.SetString(sm.config.Host)
	}
	
	// 設定 BasePath
	if basePathField := swagInfo.FieldByName("BasePath"); basePathField.IsValid() && basePathField.CanSet() {
		basePathField.SetString(sm.config.BasePath)
	}
	
	// 設定 Version
	if versionField := swagInfo.FieldByName("Version"); versionField.IsValid() && versionField.CanSet() {
		versionField.SetString(sm.config.Version)
	}
	
	// 設定 Schemes
	if schemesField := swagInfo.FieldByName("Schemes"); schemesField.IsValid() && schemesField.CanSet() {
		schemesField.Set(reflect.ValueOf(sm.config.Schemes))
	}

	// 設定 Title（如果有配置）
	if sm.config.Title != "" {
		if titleField := swagInfo.FieldByName("Title"); titleField.IsValid() && titleField.CanSet() {
			titleField.SetString(sm.config.Title)
		}
	}

	// 設定 Description（如果有配置）
	if sm.config.Desc != "" {
		if descField := swagInfo.FieldByName("Description"); descField.IsValid() && descField.CanSet() {
			descField.SetString(sm.config.Desc)
		}
	}

	sm.logger.Info("✅ Swagger documentation initialized",
		zap.String("host", sm.config.Host),
		zap.String("version", sm.config.Version),
		zap.Strings("schemes", sm.config.Schemes),
	)
}

/**
 * @brief 註冊 Swagger 路由到 Gin 引擎
 * @param engine Gin 引擎
 * @param path Swagger UI 路徑（預設: "/swagger/*any"）
 */
func (sm *SwaggerManager) RegisterRoutes(engine *gin.Engine, path ...string) {
	if !sm.config.Enabled {
		sm.logger.Info("⚠️  Swagger is disabled, routes not registered")
		return
	}

	// 預設路徑
	swaggerPath := "/swagger/*any"
	if len(path) > 0 && path[0] != "" {
		swaggerPath = path[0]
	}

	// 註冊 Swagger UI 路由
	engine.GET(swaggerPath, ginSwagger.WrapHandler(swaggerFiles.Handler))

	sm.logger.Info("✅ Swagger routes registered",
		zap.String("path", swaggerPath),
	)
}

/**
 * @brief 取得 Swagger UI URL
 * @param useLocalhost 是否使用 localhost（預設使用配置的 host）
 * @return string Swagger UI 完整 URL
 */
func (sm *SwaggerManager) GetSwaggerURL(useLocalhost ...bool) string {
	if !sm.config.Enabled {
		return ""
	}

	host := sm.config.Host
	if len(useLocalhost) > 0 && useLocalhost[0] {
		// 從 host 中提取端口
		port := ""
		if _, _, err := parseHostPort(sm.config.Host); err == nil {
			port = fmt.Sprintf(":%s", extractPort(sm.config.Host))
		}
		host = "localhost" + port
	}

	// 判斷是否使用 HTTPS
	scheme := "http"
	if len(sm.config.Schemes) > 0 && sm.config.Schemes[0] == "https" {
		scheme = "https"
	}

	return fmt.Sprintf("%s://%s/swagger/index.html", scheme, host)
}

/**
 * @brief 是否啟用 Swagger
 * @return bool
 */
func (sm *SwaggerManager) IsEnabled() bool {
	return sm.config.Enabled
}

/**
 * @brief 取得 Swagger 配置
 * @return *SwaggerConfig
 */
func (sm *SwaggerManager) GetConfig() *SwaggerConfig {
	return sm.config
}

/**
 * @brief 輔助函數：解析 host:port
 */
func parseHostPort(hostPort string) (string, string, error) {
	// 簡單的 host:port 解析
	for i := len(hostPort) - 1; i >= 0; i-- {
		if hostPort[i] == ':' {
			return hostPort[:i], hostPort[i+1:], nil
		}
	}
	return hostPort, "", fmt.Errorf("no port in host")
}

/**
 * @brief 輔助函數：從 host:port 中提取端口
 */
func extractPort(hostPort string) string {
	_, port, err := parseHostPort(hostPort)
	if err != nil {
		return "8080" // 預設端口
	}
	return port
}

