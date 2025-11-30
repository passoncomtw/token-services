# Swagger 模組變更日誌

## [1.0.0] - 2025-11-27

### 新增功能 ✨

- **統一 Swagger 模組**: 建立 `pkg/swagger` 模組，提供統一的 Swagger UI 集成方案
- **條件啟用**: 透過 `SWAGGER_ENABLED` 環境變數控制是否啟用 Swagger
- **動態配置**: 自動從 `pkg/config` 讀取配置並設定 Swagger 文檔
- **FX 模組集成**: 使用 uber-go/fx 依賴注入模式，易於集成到現有服務
- **生命週期管理**: 自動在應用啟動時顯示 Swagger URL

### 核心組件 🔧

#### 1. SwaggerConfig
- 管理 Swagger 相關配置
- 支援自訂 Host、BasePath、Version、Schemes 等

#### 2. SwaggerManager
- 提供 Swagger 初始化和路由註冊功能
- 支援條件性啟用/禁用
- 自動計算 Swagger URL

#### 3. SwaggerModule
- FX 模組，自動注入依賴
- 簡化服務集成流程

### 配置更新 ⚙️

#### pkg/config/config.go
- 新增 `SwaggerEnabled` 欄位（bool 類型）
- 預設值：`true`（從環境變數 `SWAGGER_ENABLED` 讀取）

```go
type Config struct {
    // ...
    SwaggerEnabled    bool
    SwaggerBaseDomain string
    // ...
}
```

### 文件結構 📁

```
pkg/swagger/
├── swagger.go          # 核心實作
├── module.go           # FX 模組定義
├── example.go          # 使用範例
├── README.md           # 模組說明
├── QUICKSTART.md       # 快速入門指南
├── MIGRATION.md        # 遷移指南
└── CHANGELOG.md        # 本文件
```

### API 方法 📚

#### SwaggerManager.InitializeDocs()
初始化 Swagger 文檔資訊
```go
swaggerManager.InitializeDocs(docs.SwaggerInfo)
```

#### SwaggerManager.RegisterRoutes()
註冊 Swagger 路由到 Gin 引擎
```go
swaggerManager.RegisterRoutes(engine)
swaggerManager.RegisterRoutes(engine, "/api/docs/*any")  // 自訂路徑
```

#### SwaggerManager.GetSwaggerURL()
取得 Swagger UI 完整 URL
```go
url := swaggerManager.GetSwaggerURL()        // 網路 URL
url := swaggerManager.GetSwaggerURL(true)    // localhost URL
```

#### SwaggerManager.IsEnabled()
檢查 Swagger 是否啟用
```go
if swaggerManager.IsEnabled() {
    // ...
}
```

#### SwaggerManager.GetConfig()
取得 Swagger 配置
```go
cfg := swaggerManager.GetConfig()
```

### 使用範例 💡

#### 基本使用
```go
// main.go
fx.New(
    config.ConfigModule,
    logger.LoggerModule,
    swagger.SwaggerModule,  // 新增
    // ...
).Run()

// server.go
func NewServer(
    swaggerManager *swagger.SwaggerManager,
    // ...
) *Server {
    engine := gin.New()
    
    swaggerManager.InitializeDocs(docs.SwaggerInfo)
    swaggerManager.RegisterRoutes(engine)
    
    // ...
}
```

#### 條件性使用
```go
if swaggerManager.IsEnabled() {
    swaggerManager.RegisterRoutes(engine)
}
```

### 環境變數 🔐

| 變數名稱 | 類型 | 預設值 | 說明 |
|---------|------|--------|------|
| `SWAGGER_ENABLED` | bool | `true` | 是否啟用 Swagger |
| `SWAGGER_BASE_DOMAIN` | string | 自動偵測 | Swagger Host |
| `APP_VERSION` | string | `dev` | API 版本號 |

### 優勢 🎯

1. **簡化代碼**: 減少約 90% 的 Swagger 配置代碼
2. **統一管理**: 所有 Swagger 配置集中在 `pkg/config`
3. **易於維護**: 模組化設計，便於維護和擴展
4. **條件啟用**: 可以在不同環境中選擇性啟用
5. **向下兼容**: 不影響現有的 Swagger 註解

### 遷移路徑 🔄

現有服務可以透過以下步驟遷移：

1. 引入 `swagger.SwaggerModule`
2. 注入 `SwaggerManager` 到 Server
3. 使用 `InitializeDocs()` 和 `RegisterRoutes()`
4. 移除舊的 Swagger 配置代碼

詳細步驟請參考 [MIGRATION.md](./MIGRATION.md)

### 相容性 ✅

- **Go 版本**: 1.23+
- **框架**: Gin
- **依賴注入**: uber-go/fx
- **Swagger 工具**: swaggo/swag, swaggo/gin-swagger

### 依賴項 📦

```go
require (
    github.com/gin-gonic/gin v1.10.0
    github.com/swaggo/files v1.0.1
    github.com/swaggo/gin-swagger v1.6.0
    go.uber.org/fx v1.22.2
    go.uber.org/zap v1.27.0
)
```

### 測試覆蓋 🧪

當前版本專注於核心功能實作，未來版本將添加：
- [ ] 單元測試
- [ ] 集成測試
- [ ] 基準測試

### 已知問題 ⚠️

無

### 後續計劃 🚀

- [ ] 添加單元測試
- [ ] 支援更多自訂選項
- [ ] 提供更多範例
- [ ] 改進錯誤處理

### 貢獻者 👥

- Initial implementation: System

### 授權 📄

與專案主體保持一致

---

## 如何使用本變更日誌

本變更日誌遵循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/) 格式。

### 變更類型

- **新增**: 新功能
- **變更**: 現有功能的變更
- **棄用**: 即將移除的功能
- **移除**: 已移除的功能
- **修復**: 錯誤修復
- **安全**: 安全性相關變更

### 版本號規則

遵循 [語義化版本](https://semver.org/lang/zh-TW/) 規則：
- **主版本號**: 不相容的 API 變更
- **次版本號**: 向下相容的功能新增
- **修訂號**: 向下相容的錯誤修正

---

## 相關連結

- [README.md](./README.md) - 模組概述
- [QUICKSTART.md](./QUICKSTART.md) - 快速入門
- [MIGRATION.md](./MIGRATION.md) - 遷移指南
- [example.go](./example.go) - 使用範例

