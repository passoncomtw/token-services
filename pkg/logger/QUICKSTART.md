# Logger 模組快速開始

## 1. 安裝依賴

```bash
go get -u go.uber.org/zap
```

## 2. 配置環境變數

編輯 `cmd/token-admin-api/.env`：

```env
# 日誌級別：debug, info, warn, error, fatal
LOG_LEVEL=debug

# 日誌模式：development, production
LOG_MODE=development
```

## 3. 註冊 Logger 模組

編輯 `cmd/token-admin-api/main.go`，添加 Logger 模組：

```go
package main

import (
    "token-services/pkg/config"
    "token-services/pkg/database"
    "token-services/pkg/logger"        // 導入 logger 模組
    "token-services/pkg/middleware"
    // ... 其他導入
    
    "go.uber.org/fx"
)

func main() {
    fx.New(
        config.ConfigModule,
        logger.LoggerModule,            // 添加 Logger 模組
        database.DatabaseModule,
        middleware.MiddlewareModule,
        // ... 其他模組
    ).Run()
}
```

## 4. 在服務中使用

### 4.1 更新服務構造函數

```go
// internal/services/userService.go
package services

import (
    "token-services/pkg/logger"
    "token-services/pkg/models"
    "go.uber.org/zap"
    "gorm.io/gorm"
)

type UserService struct {
    db     *gorm.DB
    logger logger.Logger  // 添加 logger 欄位
}

// 更新構造函數，注入 logger
func NewUserService(db *gorm.DB, logger logger.Logger) *UserService {
    // 為服務創建帶上下文的 logger
    serviceLogger := logger.With(
        zap.String("service", "UserService"),
    )
    
    return &UserService{
        db:     db,
        logger: serviceLogger,
    }
}

func (s *UserService) GetList(query *interfaces.UserListQuery) (*interfaces.UserListResponse, error) {
    s.logger.Info("Fetching user list",
        zap.String("account", query.Account),
        zap.Int("page", query.Page),
        zap.Int("size", query.Size),
    )
    
    // ... 業務邏輯
    
    s.logger.Info("User list fetched",
        zap.Int64("total", count),
        zap.Int("returned", len(users)),
    )
    
    return result, nil
}

func (s *UserService) Create(req *interfaces.CreateUserRequest) (*interfaces.UserResponse, error) {
    s.logger.Info("Creating user",
        zap.String("account", req.Account),
        zap.String("name", req.Name),
    )
    
    // ... 創建邏輯
    
    if err != nil {
        s.logger.Error("Failed to create user",
            zap.Error(err),
            zap.String("account", req.Account),
        )
        return nil, err
    }
    
    s.logger.Info("User created successfully",
        zap.Int("userId", user.ID),
    )
    
    return response, nil
}
```

### 4.2 更新 Handler

```go
// internal/handlers/user.go
package handlers

import (
    "token-services/cmd/token-admin-api/internal/interfaces"
    "token-services/pkg/logger"
    "token-services/pkg/response"
    "github.com/gin-gonic/gin"
    "go.uber.org/zap"
)

type UserHandlers struct {
    userService interfaces.UserServiceInterface
    logger      logger.Logger  // 添加 logger 欄位
}

// 更新構造函數
func NewUserHandlers(
    userService interfaces.UserServiceInterface,
    logger logger.Logger,  // 注入 logger
) *UserHandlers {
    // 為 handler 創建帶上下文的 logger
    handlerLogger := logger.With(
        zap.String("handler", "UserHandlers"),
    )
    
    return &UserHandlers{
        userService: userService,
        logger:      handlerLogger,
    }
}

func (h *UserHandlers) GetList(c *gin.Context) {
    h.logger.Info("GetList request received",
        zap.String("ip", c.ClientIP()),
        zap.String("userAgent", c.Request.UserAgent()),
    )
    
    var query interfaces.UserListQuery
    if err := c.ShouldBindQuery(&query); err != nil {
        h.logger.Warn("Invalid query parameters",
            zap.Error(err),
        )
        response.BadRequest(c, "請求參數錯誤")
        return
    }
    
    result, err := h.userService.GetList(&query)
    if err != nil {
        h.logger.Error("Failed to get user list",
            zap.Error(err),
        )
        response.InternalError(c, "查詢失敗")
        return
    }
    
    h.logger.Info("GetList request completed",
        zap.Int64("total", result.Count),
    )
    
    response.Success(c, result)
}
```

## 5. 驗證日誌輸出

啟動服務：

```bash
make run-token-admin-api
```

你應該會看到類似的日誌輸出：

### Development 模式（彩色輸出）

```
2024-01-15T10:30:45.123+0800    INFO    config/config.go:174    ✅ Application configuration loaded successfully
2024-01-15T10:30:45.234+0800    INFO    logger/module.go:60    ✅ Logger initialized (Level: debug, Mode: development)
2024-01-15T10:30:45.345+0800    INFO    services/userService.go:45    Fetching user list    {"service": "UserService", "account": "", "page": 1, "size": 10}
```

### Production 模式（JSON 格式）

```json
{"level":"info","ts":1705286445.123,"caller":"config/config.go:174","msg":"✅ Application configuration loaded successfully"}
{"level":"info","ts":1705286445.234,"caller":"logger/module.go:60","msg":"✅ Logger initialized (Level: info, Mode: production)"}
{"level":"info","ts":1705286445.345,"caller":"services/userService.go:45","msg":"Fetching user list","service":"UserService","account":"","page":1,"size":10}
```

## 6. 常用日誌方法

```go
// 結構化日誌（推薦）
logger.Info("Message", 
    zap.String("key", "value"),
    zap.Int("count", 10),
)

// 格式化日誌
logger.Infof("User %s logged in", username)

// 錯誤日誌
logger.Error("Operation failed", 
    zap.Error(err),
    zap.String("operation", "create_user"),
)

// 帶上下文的子 logger
requestLogger := logger.With(
    zap.String("requestId", requestId),
    zap.String("method", method),
)
requestLogger.Info("Processing request")
```

## 7. 下一步

- 閱讀完整文檔：[README.md](./README.md)
- 查看使用範例：[example.go](./example.go)
- 了解最佳實踐和性能優化

