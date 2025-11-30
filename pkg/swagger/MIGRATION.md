# Swagger 模組遷移指南

本指南說明如何將現有的 Swagger 實作遷移到新的統一 Swagger 模組。

## 遷移概述

新的 Swagger 模組提供：
- ✅ 統一的配置管理
- ✅ 條件性啟用/禁用
- ✅ 更簡潔的代碼
- ✅ 更好的可維護性

## 遷移步驟

### 步驟 1: 備份現有代碼

在開始遷移前，建議先備份或建立新分支：

```bash
git checkout -b feature/migrate-to-swagger-module
```

### 步驟 2: 更新 main.go

**遷移前** (`cmd/token-admin-api/main.go`):
```go
import (
    "passontw-backend-services/cmd/token-admin-api/internal/server"
    // ...
)

func main() {
    fx.New(
        config.ConfigModule,
        logger.LoggerModule,
        middleware.MiddlewareModule,
        // ...
    ).Run()
}
```

**遷移後**:
```go
import (
    "passontw-backend-services/cmd/token-admin-api/internal/server"
    "passontw-backend-services/pkg/swagger"  // 新增
    // ...
)

func main() {
    fx.New(
        config.ConfigModule,
        logger.LoggerModule,
        swagger.SwaggerModule,        // 新增 Swagger 模組
        middleware.MiddlewareModule,
        // ...
    ).Run()
}
```

### 步驟 3: 更新 Server 結構

**遷移前** (`cmd/token-admin-api/internal/server/server.go`):
```go
import (
    "passontw-backend-services/cmd/token-admin-api/internal/docs"
    // ...
)

type Server struct {
    engine   *gin.Engine
    port     int
    localIP  string
    swagHost string
    logger   logger.Logger
}

func NewServer(router *Router, cfg *config.Config, log logger.Logger, loggerMw *middleware.LoggerMiddleware, corsMw *middleware.CORSMiddleware) *Server {
    // ...
    
    // 取得本機 IP 和 Swagger host
    localIP := cfg.GetLocalIP()
    swagHost := cfg.GetSwaggerHost()
    
    // 動態設定 Swagger Host
    docs.SwaggerInfo.Host = swagHost
    docs.SwaggerInfo.Version = cfg.AppVersion
    docs.SwaggerInfo.Schemes = []string{"https", "http"}
    
    // ...
    
    router.SetupRoutes(engine)
    
    return &Server{
        engine:   engine,
        port:     cfg.HTTPPort,
        localIP:  localIP,
        swagHost: swagHost,
        logger:   log.With(zap.String("component", "Server")),
    }
}
```

**遷移後**:
```go
import (
    "passontw-backend-services/cmd/token-admin-api/internal/docs"
    "passontw-backend-services/pkg/swagger"  // 新增
    // ...
)

type Server struct {
    engine         *gin.Engine
    port           int
    logger         logger.Logger
    swaggerManager *swagger.SwaggerManager  // 新增
}

func NewServer(
    router *Router,
    cfg *config.Config,
    log logger.Logger,
    loggerMw *middleware.LoggerMiddleware,
    corsMw *middleware.CORSMiddleware,
    swaggerManager *swagger.SwaggerManager,  // 新增參數
) *Server {
    // ...
    
    // 初始化 Swagger（自動設定 Host、Version、Schemes）
    swaggerManager.InitializeDocs(docs.SwaggerInfo)
    
    // 註冊 Swagger 路由（只有在啟用時才會註冊）
    swaggerManager.RegisterRoutes(engine)
    
    // 設定其他路由
    router.SetupRoutes(engine)
    
    return &Server{
        engine:         engine,
        port:           cfg.HTTPPort,
        logger:         log.With(zap.String("component", "Server")),
        swaggerManager: swaggerManager,  // 新增
    }
}
```

### 步驟 4: 簡化 Router

**遷移前** (`cmd/token-admin-api/internal/server/router.go`):
```go
import (
    swaggerFiles "github.com/swaggo/files"
    ginSwagger "github.com/swaggo/gin-swagger"
)

func (r *Router) SetupRoutes(engine *gin.Engine) {
    // Health check
    engine.GET("/health-check", r.healthHandlers.HealthCheck)
    
    // Swagger UI
    engine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
    
    // 其他路由...
}
```

**遷移後**:
```go
// 移除 swagger 相關的 import（已由 SwaggerManager 處理）

func (r *Router) SetupRoutes(engine *gin.Engine) {
    // Health check
    engine.GET("/health-check", r.healthHandlers.HealthCheck)
    
    // Swagger 路由已在 Server.NewServer 中註冊，這裡不需要再註冊
    
    // 其他路由...
}
```

### 步驟 5: 更新 Start 方法（選擇性）

如果您想在啟動時顯示 Swagger URL：

**遷移前**:
```go
func (s *Server) Start(lc fx.Lifecycle) {
    // ...
    lc.Append(fx.Hook{
        OnStart: func(ctx context.Context) error {
            go func() {
                s.logger.Info("🚀 Server starting")
                s.logger.Info("📚 Swagger UI",
                    zap.String("local", fmt.Sprintf("http://localhost:%d/swagger/index.html", s.port)),
                    zap.String("network", fmt.Sprintf("http://%s/swagger/index.html", s.swagHost)),
                )
                // ...
            }()
            return nil
        },
        // ...
    })
}
```

**遷移後**:
```go
func (s *Server) Start(lc fx.Lifecycle) {
    // ...
    lc.Append(fx.Hook{
        OnStart: func(ctx context.Context) error {
            go func() {
                s.logger.Info("🚀 Server starting")
                
                // SwaggerManager 會自動在 OnStart 時顯示 Swagger URL
                // 或者您可以手動顯示：
                if s.swaggerManager.IsEnabled() {
                    s.logger.Info("📚 Swagger UI",
                        zap.String("local", s.swaggerManager.GetSwaggerURL(true)),
                        zap.String("network", s.swaggerManager.GetSwaggerURL(false)),
                    )
                }
                // ...
            }()
            return nil
        },
        // ...
    })
}
```

### 步驟 6: 更新環境變數（選擇性）

在 `.env` 檔案中添加新的配置選項：

```bash
# Swagger 配置
SWAGGER_ENABLED=true              # 新增：是否啟用 Swagger
SWAGGER_BASE_DOMAIN=              # 已存在：Swagger Host（選擇性）
APP_VERSION=v1.0.0                # 已存在：API 版本號
```

### 步驟 7: 測試

1. 啟動服務：
```bash
cd cmd/token-admin-api
go run main.go
```

2. 訪問 Swagger UI：
```
http://localhost:8080/swagger/index.html
```

3. 測試停用 Swagger：
```bash
export SWAGGER_ENABLED=false
go run main.go
```

確認 Swagger 路由未註冊且不顯示 Swagger URL。

## 遷移檢查清單

- [ ] 備份或建立新分支
- [ ] 在 `main.go` 中引入 `swagger.SwaggerModule`
- [ ] 在 `Server` 結構中添加 `swaggerManager` 欄位
- [ ] 更新 `NewServer` 函數簽名，添加 `swaggerManager` 參數
- [ ] 使用 `swaggerManager.InitializeDocs(docs.SwaggerInfo)` 初始化文檔
- [ ] 使用 `swaggerManager.RegisterRoutes(engine)` 註冊路由
- [ ] 從 `Router.SetupRoutes` 中移除 Swagger 路由註冊
- [ ] 移除不再需要的欄位（如 `localIP`, `swagHost`）
- [ ] 在 `.env` 中添加 `SWAGGER_ENABLED` 配置
- [ ] 測試啟用和停用 Swagger 的情況
- [ ] 確認所有 API 端點在 Swagger UI 中正常顯示
- [ ] 提交代碼

## 遷移前後對比

### 代碼行數減少

**遷移前**:
- 手動設定 `docs.SwaggerInfo.Host`
- 手動設定 `docs.SwaggerInfo.Version`
- 手動設定 `docs.SwaggerInfo.Schemes`
- 手動計算 Swagger URL
- 在 Router 中註冊 Swagger 路由
- 總計約 20+ 行代碼

**遷移後**:
- 一行初始化：`swaggerManager.InitializeDocs(docs.SwaggerInfo)`
- 一行註冊：`swaggerManager.RegisterRoutes(engine)`
- 總計約 2 行代碼

### 功能增強

- ✅ 可以透過環境變數停用 Swagger
- ✅ 統一的配置管理
- ✅ 自動顯示 Swagger URL
- ✅ 更容易維護和擴展

## 回滾計劃

如果遷移後發現問題，可以快速回滾：

```bash
git checkout main
git branch -D feature/migrate-to-swagger-module
```

或者保留舊代碼，暫時註解掉新代碼：

```go
// 舊代碼（暫時保留）
// docs.SwaggerInfo.Host = swagHost
// docs.SwaggerInfo.Version = cfg.AppVersion
// docs.SwaggerInfo.Schemes = []string{"https", "http"}

// 新代碼
swaggerManager.InitializeDocs(docs.SwaggerInfo)
```

## 常見問題

### Q1: 遷移後 Swagger UI 顯示空白

**解決方案**: 確保 `docs` 包已正確導入且 `swag init` 已執行。

### Q2: 遷移後找不到 SwaggerManager

**解決方案**: 確保在 `main.go` 中已引入 `swagger.SwaggerModule`。

### Q3: 遷移後編譯錯誤

**解決方案**: 檢查所有函數簽名是否正確更新，特別是 `NewServer` 函數。

## 相關文件

- [README.md](./README.md) - 模組概述
- [QUICKSTART.md](./QUICKSTART.md) - 快速入門
- [example.go](./example.go) - 使用範例

## 需要幫助？

如果遷移過程中遇到問題：
1. 參考 `example.go` 中的完整範例
2. 查看本指南的常見問題部分
3. 回滾到遷移前的版本並重新嘗試

祝您遷移順利！ 🚀

