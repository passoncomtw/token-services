# Logger 模組

基於 `uber-go/zap` 的高效能結構化日誌模組，支援根據環境進行日誌分級。

## 功能特性

- ✅ **高效能**: 基於 uber-go/zap，零記憶體分配
- ✅ **結構化日誌**: 支援 JSON 格式輸出（生產環境）
- ✅ **環境切換**: 開發/生產環境自動切換日誌格式
- ✅ **級別控制**: 支援 Debug/Info/Warn/Error/Fatal 五個級別
- ✅ **彩色輸出**: 開發環境支援彩色終端輸出
- ✅ **格式化支援**: 提供類似 Printf 的格式化方法
- ✅ **FX 整合**: 完全整合到 FX 依賴注入系統

## 日誌級別

| 級別 | 說明 | 使用場景 |
|------|------|----------|
| `Debug` | 調試信息 | 開發階段詳細追蹤 |
| `Info` | 一般信息 | 正常業務流程記錄 |
| `Warn` | 警告信息 | 可能的問題，但不影響運行 |
| `Error` | 錯誤信息 | 錯誤但不會導致程式崩潰 |
| `Fatal` | 致命錯誤 | 程式無法繼續運行 |

## 日誌模式

### Development 模式
- 輸出格式：人類可讀的控制台格式
- 顏色：彩色輸出
- 時間格式：ISO8601 (2006-01-02T15:04:05.000Z)
- 顯示調用者：是
- Stacktrace：Error 及以上級別

### Production 模式
- 輸出格式：JSON 格式
- 顏色：無
- 時間格式：Unix timestamp
- 顯示調用者：是
- Stacktrace：僅 Fatal 級別

## 環境變數配置

在 `.env` 文件中配置：

```env
# 日誌級別：debug, info, warn, error, fatal
LOG_LEVEL=info

# 日誌模式：development, production
LOG_MODE=production
```

## 使用方式

### 1. 在 main.go 中註冊模組

```go
package main

import (
    "token-services/pkg/logger"
    "go.uber.org/fx"
)

func main() {
    fx.New(
        // ... 其他模組
        logger.LoggerModule,  // 添加 Logger 模組
        // ... 其他模組
    ).Run()
}
```

### 2. 在服務中注入使用

```go
package services

import (
    "token-services/pkg/logger"
    "go.uber.org/zap"
)

type UserService struct {
    db     *gorm.DB
    logger logger.Logger  // 注入 logger
}

func NewUserService(db *gorm.DB, logger logger.Logger) *UserService {
    return &UserService{
        db:     db,
        logger: logger,
    }
}

func (s *UserService) CreateUser(req *CreateUserRequest) error {
    // 結構化日誌（推薦）
    s.logger.Info("Creating user",
        zap.String("account", req.Account),
        zap.String("name", req.Name),
    )
    
    // 格式化日誌
    s.logger.Infof("Creating user: %s (%s)", req.Name, req.Account)
    
    user := &models.User{
        Account: req.Account,
        Name:    req.Name,
    }
    
    if err := s.db.Create(user).Error; err != nil {
        // 記錄錯誤
        s.logger.Error("Failed to create user",
            zap.Error(err),
            zap.String("account", req.Account),
        )
        return err
    }
    
    s.logger.Info("User created successfully",
        zap.Int("userId", user.ID),
        zap.String("account", user.Account),
    )
    
    return nil
}
```

### 3. 在 Handler 中使用

```go
package handlers

import (
    "token-services/pkg/logger"
    "token-services/pkg/response"
    "github.com/gin-gonic/gin"
    "go.uber.org/zap"
)

type UserHandlers struct {
    userService interfaces.UserServiceInterface
    logger      logger.Logger  // 注入 logger
}

func NewUserHandlers(
    userService interfaces.UserServiceInterface,
    logger logger.Logger,
) *UserHandlers {
    return &UserHandlers{
        userService: userService,
        logger:      logger,
    }
}

func (h *UserHandlers) Create(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        h.logger.Warn("Invalid request body",
            zap.Error(err),
            zap.String("path", c.Request.URL.Path),
        )
        response.BadRequest(c, "請求參數錯誤")
        return
    }
    
    h.logger.Info("Received create user request",
        zap.String("account", req.Account),
        zap.String("ip", c.ClientIP()),
    )
    
    if err := h.userService.CreateUser(&req); err != nil {
        h.logger.Error("Create user failed",
            zap.Error(err),
            zap.String("account", req.Account),
        )
        response.InternalError(c, "創建使用者失敗")
        return
    }
    
    response.Success(c, nil)
}
```

## 日誌方法

### 結構化日誌（推薦）

使用 `zap.Field` 添加結構化欄位：

```go
logger.Info("User logged in",
    zap.String("userId", "123"),
    zap.Int("attempts", 3),
    zap.Duration("latency", time.Since(start)),
)

logger.Error("Database connection failed",
    zap.Error(err),
    zap.String("host", "localhost"),
    zap.Int("port", 5432),
)
```

### 格式化日誌

使用 Printf 風格的格式化：

```go
logger.Infof("User %s logged in from %s", username, ip)
logger.Errorf("Failed to connect to %s:%d - %v", host, port, err)
```

### 常用 zap.Field 類型

```go
// 基本類型
zap.String("key", "value")
zap.Int("key", 123)
zap.Int64("key", 123)
zap.Float64("key", 3.14)
zap.Bool("key", true)

// 時間和持續時間
zap.Time("key", time.Now())
zap.Duration("key", time.Second)

// 錯誤
zap.Error(err)

// 複雜類型
zap.Any("key", complexObject)
zap.Strings("keys", []string{"a", "b", "c"})
zap.Ints("numbers", []int{1, 2, 3})
```

### 創建子 Logger

使用 `With` 創建帶有預設欄位的子 logger：

```go
// 服務初始化時創建
type UserService struct {
    logger logger.Logger
}

func NewUserService(logger logger.Logger) *UserService {
    return &UserService{
        logger: logger.With(
            zap.String("service", "UserService"),
        ),
    }
}

// 使用時自動帶上 service 欄位
func (s *UserService) CreateUser(account string) {
    s.logger.Info("Creating user",
        zap.String("account", account),
    )
    // 輸出: {"level":"info","service":"UserService","account":"john","msg":"Creating user"}
}
```

## 輸出範例

### Development 模式

```
2024-01-15T10:30:45.123+0800    INFO    services/userService.go:45    Creating user    {"account": "john", "name": "John Doe"}
2024-01-15T10:30:45.234+0800    INFO    services/userService.go:67    User created successfully    {"userId": 123, "account": "john"}
2024-01-15T10:30:50.456+0800    ERROR   services/userService.go:89    Failed to create user    {"error": "duplicate key", "account": "jane"}
```

### Production 模式

```json
{"level":"info","ts":1705286445.123,"caller":"services/userService.go:45","msg":"Creating user","account":"john","name":"John Doe"}
{"level":"info","ts":1705286445.234,"caller":"services/userService.go:67","msg":"User created successfully","userId":123,"account":"john"}
{"level":"error","ts":1705286450.456,"caller":"services/userService.go:89","msg":"Failed to create user","error":"duplicate key","account":"jane"}
```

## 最佳實踐

### 1. 使用結構化日誌而非格式化字串

```go
// ✅ 推薦：結構化日誌
logger.Info("User login",
    zap.String("userId", userId),
    zap.String("ip", ip),
)

// ❌ 不推薦：格式化字串（除非是簡單訊息）
logger.Infof("User %s login from %s", userId, ip)
```

### 2. 為服務創建帶上下文的子 Logger

```go
type Service struct {
    logger logger.Logger
}

func NewService(logger logger.Logger) *Service {
    return &Service{
        logger: logger.With(
            zap.String("service", "UserService"),
            zap.String("version", "1.0"),
        ),
    }
}
```

### 3. 記錄重要業務事件

```go
// 用戶操作
logger.Info("User created", zap.Int("userId", user.ID))
logger.Info("Order placed", zap.String("orderId", order.ID))

// 系統事件
logger.Info("Database connection established")
logger.Warn("Cache miss", zap.String("key", key))
```

### 4. 錯誤日誌包含足夠上下文

```go
logger.Error("Failed to process payment",
    zap.Error(err),
    zap.String("orderId", orderId),
    zap.String("userId", userId),
    zap.Float64("amount", amount),
)
```

### 5. 避免在循環中記錄大量日誌

```go
// ❌ 不好
for _, item := range items {
    logger.Debug("Processing item", zap.Any("item", item))
    process(item)
}

// ✅ 更好
logger.Info("Processing items", zap.Int("count", len(items)))
for _, item := range items {
    process(item)
}
logger.Info("Items processed", zap.Int("count", len(items)))
```

### 6. 使用適當的日誌級別

- **Debug**: 詳細的開發調試信息
- **Info**: 重要業務流程節點
- **Warn**: 異常但可恢復的情況
- **Error**: 錯誤需要關注
- **Fatal**: 程式無法繼續運行（會退出程式）

## 性能考量

1. **結構化日誌性能更好**: zap 的結構化日誌是零分配的
2. **避免字串拼接**: 使用 `zap.String()` 而非 `fmt.Sprintf()`
3. **條件日誌**: 如果需要昂貴的操作，先檢查日誌級別

```go
// 如果 Debug 級別未啟用，不會執行 expensiveOperation
if logger.Core().Enabled(zapcore.DebugLevel) {
    result := expensiveOperation()
    logger.Debug("Debug info", zap.Any("result", result))
}
```

## 與其他日誌庫對比

| 特性 | zap | logrus | std log |
|------|-----|--------|---------|
| 性能 | 🟢 最快 | 🟡 中等 | 🟡 中等 |
| 結構化 | 🟢 優秀 | 🟢 良好 | 🔴 不支援 |
| 零分配 | 🟢 是 | 🔴 否 | 🔴 否 |
| 彩色輸出 | 🟢 支援 | 🟢 支援 | 🔴 不支援 |
| 配置複雜度 | 🟡 中等 | 🟢 簡單 | 🟢 簡單 |

## 相關資源

- [Zap 官方文檔](https://pkg.go.dev/go.uber.org/zap)
- [Zap GitHub](https://github.com/uber-go/zap)
- [Zap 性能基準](https://github.com/uber-go/zap#performance)

