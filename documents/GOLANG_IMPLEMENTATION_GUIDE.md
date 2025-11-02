# Golang 實作指南

本指南提供使用 Golang 重構本專案的詳細實作建議與當前實作狀態。

## 專案結構（當前實作）

```
golang-token-services/
├── cmd/
│   └── token-admin-api/
│       ├── internal/
│       │   ├── handlers/          # ✅ HTTP 處理器
│       │   │   ├── auth.go
│       │   │   ├── health.go
│       │   │   ├── user.go
│       │   │   ├── order.go
│       │   │   └── module.go
│       │   ├── initializers/      # ✅ 初始化器
│       │   │   ├── admin.go       # 預設管理員帳號初始化
│       │   │   ├── database.go
│       │   │   └── module.go
│       │   ├── interfaces/        # ✅ 介面定義
│       │   │   ├── handlerInterfaces.go
│       │   │   └── services.go
│       │   ├── middlewares/       # ✅ 中介層
│       │   │   └── auth_middlewares.go
│       │   ├── migrations/        # 舊版資料庫遷移
│       │   │   ├── migrate.go
│       │   │   └── sqls/
│       │   ├── server/            # ✅ 伺服器設定
│       │   │   ├── router.go
│       │   │   ├── server.go
│       │   │   └── module.go
│       │   └── services/          # ✅ 業務邏輯層
│       │       ├── authService.go
│       │       ├── userService.go
│       │       └── orderService.go
│       └── main.go                # ✅ 應用程式入口（使用 Uber FX）
├── pkg/                           # ✅ 共享套件
│   ├── auth/                      # ✅ JWT 工具
│   │   └── jwt.go
│   ├── cache/                     # ✅ Redis 快取
│   │   ├── redis.go
│   │   └── module.go
│   ├── config/                    # ✅ 配置管理（使用 .env）
│   │   ├── config.go
│   │   └── module.go
│   ├── database/                  # ✅ 資料庫連線
│   │   ├── connection.go          # database/sql 連線
│   │   ├── gorm.go                # GORM 連線
│   │   ├── module.go
│   │   └── migrations/
│   │       └── dev/
│   │           └── token_admin_initial.sql
│   ├── models/                    # ✅ GORM 資料模型
│   │   ├── backend_actor.go       # 後台角色
│   │   ├── backend_user.go        # 後台使用者
│   │   ├── user.go                # 前台使用者
│   │   ├── bank.go
│   │   ├── bank_card.go
│   │   ├── order.go
│   │   ├── pending_order.go
│   │   ├── merchant.go
│   │   ├── wallet.go
│   │   └── order_statistic.go
│   ├── response/                  # ✅ 標準回應格式
│   │   ├── response.go
│   │   └── README.md
│   └── snowflake/                 # ✅ ID 生成器
│       ├── generator.go
│       ├── context.go
│       └── module.go
├── documents/                     # 📚 專案文件
│   ├── API_DOCUMENTATION.md
│   ├── GOLANG_IMPLEMENTATION_GUIDE.md
│   └── ...
├── go.mod                         # ✅ Go 模組定義
├── go.sum
├── Makefile                       # ✅ 專案指令
├── .air.toml                      # ✅ Air 熱重載配置
└── .env                           # 環境變數（位於 cmd/token-admin-api/.env）
```

## 技術棧（當前實作）

### 核心框架
- ✅ **Web 框架**: [Gin](https://github.com/gin-gonic/gin) v1.10.0
- ✅ **依賴注入**: [Uber FX](https://github.com/uber-go/fx) - 模組化架構
- ✅ **資料庫**: [GORM](https://gorm.io/) v1.25.12 + PostgreSQL
- ✅ **資料庫驅動**: [pgx](https://github.com/jackc/pgx) v5
- ✅ **JWT**: [golang-jwt/jwt](https://github.com/golang-jwt/jwt) v5
- ✅ **密碼加密**: [bcrypt](https://pkg.go.dev/golang.org/x/crypto/bcrypt)
- ✅ **配置管理**: [godotenv](https://github.com/joho/godotenv) - 使用 .env 檔案
- ✅ **快取**: [go-redis](https://github.com/redis/go-redis) v9
- ✅ **ID 生成器**: Snowflake 自訂實作
- ✅ **熱重載**: [Air](https://github.com/air-verse/air)

### 已安裝套件
```go
// go.mod
module token-admin-api

go 1.25.1

require (
    github.com/gin-gonic/gin v1.10.0
    github.com/golang-jwt/jwt/v5 v5.2.1
    github.com/google/uuid v1.6.0
    github.com/joho/godotenv v1.5.1
    github.com/lib/pq v1.10.9
    github.com/redis/go-redis/v9 v9.7.0
    go.uber.org/fx v1.23.0
    golang.org/x/crypto v0.31.0
    gorm.io/driver/postgres v1.5.11
    gorm.io/gorm v1.25.12
)
```

### 開發工具
- ✅ **Makefile**: 簡化常用指令
- ✅ **Air**: 開發時自動重新編譯和重啟
- ✅ **Swagger**: API 文檔自動生成（待完善）

## 資料模型定義（當前實作）

### 後台使用者模型範例

```go
// pkg/models/backend_user.go
package models

import "time"

// BackendUser 後台使用者資料模型
type BackendUser struct {
    ID        int        `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
    ActorID   *int       `gorm:"column:actor_id" json:"actor_id,omitempty"`
    CreatedAt time.Time  `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
    UpdatedAt time.Time  `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
    DeletedAt *time.Time `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`
    Status    int        `gorm:"column:status;not null" json:"status"` // 使用者狀態: 0=啟用
    Name      string     `gorm:"column:name;type:varchar(255);not null" json:"name"`
    Account   string     `gorm:"column:account;type:varchar(255);not null;uniqueIndex" json:"account"`
    Password  string     `gorm:"column:password;type:varchar(255);not null" json:"-"`

    // 關聯
    Actor *BackendActor `gorm:"foreignKey:ActorID;references:ID" json:"actor,omitempty"`
}

func (BackendUser) TableName() string {
    return "backend_users"
}
```

### 前台使用者模型範例

```go
// pkg/models/user.go
package models

import (
    "database/sql"
    "time"
)

// User 使用者資料模型（前台使用者）
type User struct {
    ID                int            `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
    ReferralID        sql.NullInt32  `gorm:"column:referral_id" json:"referral_id,omitempty"`
    CreatedAt         time.Time      `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
    UpdatedAt         time.Time      `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
    DeletedAt         *time.Time     `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`
    Type              int            `gorm:"column:type;not null" json:"type"` // 0: 一般使用者, 1: 商家
    Status            int            `gorm:"column:status;not null;default:0" json:"status"` // 0: 啟用, 1: 凍結
    TransactionStatus int            `gorm:"column:transaction_status;not null;default:1" json:"transaction_status"`
    OrderStatus       int            `gorm:"column:order_status;not null;default:1" json:"order_status"`
    LoginTime         *time.Time     `gorm:"column:login_time;type:timestamptz" json:"login_time,omitempty"`
    Phone             sql.NullString `gorm:"column:phone;type:varchar(255)" json:"phone,omitempty"`
    Account           string         `gorm:"column:account;type:varchar(255);not null" json:"account"`
    Name              string         `gorm:"column:name;type:varchar(255);not null" json:"name"`
    Email             string         `gorm:"column:email;type:varchar(255);not null" json:"email"`
    Password          string         `gorm:"column:password;type:varchar(255);not null" json:"-"`
    ReferralCode      string         `gorm:"column:referral_code;type:varchar(255);not null" json:"referral_code"`
    TransactionCode   string         `gorm:"column:transaction_code;type:varchar(255);not null" json:"-"`
    Markup            sql.NullString `gorm:"column:markup;type:varchar(255)" json:"markup,omitempty"`
    NotificationToken sql.NullString `gorm:"column:notification_token;type:varchar(255)" json:"notification_token,omitempty"`
}

func (User) TableName() string {
    return "users"
}
```

### 訂單模型範例

```go
// pkg/models/order.go
package models

import (
    "time"
    "github.com/google/uuid"
)

// Order 訂單資料模型
type Order struct {
    ID               uuid.UUID  `gorm:"column:id;type:uuid;primaryKey" json:"id"`
    UserID           int        `gorm:"column:user_id;not null" json:"user_id"`
    PendingOrderID   uuid.UUID  `gorm:"column:pending_order_id;type:uuid;not null" json:"pending_order_id"`
    BankCardID       int        `gorm:"column:bank_card_id;not null" json:"bank_card_id"`
    Status           int        `gorm:"column:status;not null" json:"status"`
    Amount           float64    `gorm:"column:amount;not null" json:"amount"`
    CancelReason     *string    `gorm:"column:cancel_reason;type:varchar(255)" json:"cancel_reason,omitempty"`
    ExpectedFinishAt time.Time  `gorm:"column:expected_finish_at;type:timestamptz;not null" json:"expected_finish_at"`
    FinishAt         *time.Time `gorm:"column:finish_at;type:timestamptz" json:"finish_at,omitempty"`
    CreatedAt        time.Time  `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
    UpdatedAt        time.Time  `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
    DeletedAt        *time.Time `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`

    // 關聯
    User         *User         `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
    PendingOrder *PendingOrder `gorm:"foreignKey:PendingOrderID;references:ID" json:"pending_order,omitempty"`
    BankCard     *BankCard     `gorm:"foreignKey:BankCardID;references:ID" json:"bank_card,omitempty"`
}

func (Order) TableName() string {
    return "orders"
}
```

### Response 結構（當前實作）

```go
// pkg/response/response.go
package response

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

// Response 標準 API 回應格式
type Response struct {
    Success bool        `json:"success"`
    Message string      `json:"message,omitempty"`
    Data    interface{} `json:"data,omitempty"`
    Code    string      `json:"code,omitempty"`
}

// ErrorResponse 錯誤回應格式
type ErrorResponse struct {
    Success bool   `json:"success"`
    Message string `json:"message"`
    Code    string `json:"code"`
}

// Success 成功回應（無訊息）
func Success(c *gin.Context, data interface{}) {
    c.JSON(http.StatusOK, Response{
        Success: true,
        Data:    data,
    })
}

// SuccessWithMessage 成功回應（含訊息）
func SuccessWithMessage(c *gin.Context, message string, data interface{}) {
    c.JSON(http.StatusOK, Response{
        Success: true,
        Message: message,
        Data:    data,
    })
}

// BadRequest 400 錯誤
func BadRequest(c *gin.Context, message string) {
    c.JSON(http.StatusBadRequest, ErrorResponse{
        Success: false,
        Message: message,
        Code:    "BAD_REQUEST",
    })
}

// Unauthorized 401 錯誤
func Unauthorized(c *gin.Context, message string) {
    c.JSON(http.StatusUnauthorized, ErrorResponse{
        Success: false,
        Message: message,
        Code:    "UNAUTHORIZED",
    })
}

// NotFound 404 錯誤
func NotFound(c *gin.Context, message string) {
    c.JSON(http.StatusNotFound, ErrorResponse{
        Success: false,
        Message: message,
        Code:    "NOT_FOUND",
    })
}

// InternalError 500 錯誤
func InternalError(c *gin.Context, message string) {
    c.JSON(http.StatusInternalServerError, ErrorResponse{
        Success: false,
        Message: message,
        Code:    "INTERNAL_ERROR",
    })
}
```

## JWT 認證實作（當前實作）

```go
// pkg/auth/jwt.go
package auth

import (
    "errors"
    "time"
    "token-admin-api/pkg/config"
    "github.com/golang-jwt/jwt/v5"
)

// Config JWT 配置
type Config struct {
    Secret         string
    ExpirationTime time.Duration
}

// Claims JWT 聲明結構
type Claims struct {
    UserID  int    `json:"id"`
    Account string `json:"account"`
    jwt.RegisteredClaims
}

// NewConfigFromAppConfig 從應用配置建立 JWT 配置
func NewConfigFromAppConfig(cfg *config.Config) *Config {
    return &Config{
        Secret:         cfg.JWTSecret,
        ExpirationTime: cfg.JWTExpirationTime,
    }
}

// GenerateToken 生成 JWT token
func GenerateToken(cfg *Config, userID int, account string) (string, error) {
    expirationTime := time.Now().Add(cfg.ExpirationTime)
    
    claims := &Claims{
        UserID:  userID,
        Account: account,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(expirationTime),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(cfg.Secret))
}

// ParseToken 解析 JWT token
func ParseToken(cfg *Config, tokenString string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return []byte(cfg.Secret), nil
    })
    
    if err != nil {
        return nil, err
    }
    
    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }
    
    return nil, errors.New("invalid token")
}
```

### 認證服務實作

```go
// cmd/token-admin-api/internal/services/authService.go
package services

import (
    "errors"
    "token-admin-api/pkg/auth"
    "token-admin-api/pkg/config"
    "token-admin-api/pkg/models"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
)

// AuthService 認證服務
type AuthService struct {
    db        *gorm.DB
    jwtConfig *auth.Config
}

// NewAuthService 建立新的認證服務
func NewAuthService(db *gorm.DB, cfg *config.Config) *AuthService {
    return &AuthService{
        db:        db,
        jwtConfig: auth.NewConfigFromAppConfig(cfg),
    }
}

// Login 使用者登入（後台管理員）
func (s *AuthService) Login(account, password string) (*LoginResponse, error) {
    // 查詢後台使用者
    var user models.BackendUser
    err := s.db.Where("account = ?", account).First(&user).Error
    
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("帳號或密碼錯誤")
        }
        return nil, err
    }

    // 檢查帳號狀態
    if user.Status != 0 {
        return nil, errors.New("帳號已被停用")
    }

    // 驗證密碼
    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
    if err != nil {
        return nil, errors.New("帳號或密碼錯誤")
    }

    // 生成 JWT token
    token, err := auth.GenerateToken(s.jwtConfig, user.ID, user.Account)
    if err != nil {
        return nil, err
    }

    return &LoginResponse{
        Token:   token,
        UserID:  user.ID,
        Account: user.Account,
        Name:    user.Name,
    }, nil
}
```

## 中介層範例

```go
package middleware

import (
    "net/http"
    "strings"
    "token-admin-api/internal/pkg/jwt"
    "token-admin-api/pkg/response"
    
    "github.com/gin-gonic/gin"
)

// AuthMiddleware JWT 認證中介層
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, response.Error("缺少 Authorization header", 401))
            c.Abort()
            return
        }
        
        // 移除 "Bearer " 前綴
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        if tokenString == authHeader {
            c.JSON(http.StatusUnauthorized, response.Error("Authorization header 格式錯誤", 401))
            c.Abort()
            return
        }
        
        claims, err := jwt.ParseToken(tokenString)
        if err != nil {
            c.JSON(http.StatusUnauthorized, response.Error("無效的 token", 401))
            c.Abort()
            return
        }
        
        // 將使用者資訊存入 context
        c.Set("userID", claims.UserID)
        c.Set("account", claims.Account)
        
        c.Next()
    }
}
```

## Handler 範例

```go
package handlers

import (
    "net/http"
    "strconv"
    "token-admin-api/internal/service"
    "token-admin-api/pkg/response"
    
    "github.com/gin-gonic/gin"
)

type UserHandler struct {
    userService *service.UserService
}

// GetUsers 取得使用者列表
func (h *UserHandler) GetUsers(c *gin.Context) {
    // 取得查詢參數
    account := c.Query("account")
    email := c.Query("email")
    name := c.Query("name")
    status := c.Query("status")
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
    
    // 呼叫服務層
    users, total, err := h.userService.GetUsers(account, email, name, status, page, size)
    if err != nil {
        c.JSON(http.StatusInternalServerError, response.Error(err.Error(), 500))
        return
    }
    
    // 回傳標準格式
    c.JSON(http.StatusOK, response.Success(gin.H{
        "rows": users,
        "count": total,
    }))
}

// GetUserByID 取得使用者詳情
func (h *UserHandler) GetUserByID(c *gin.Context) {
    userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, response.Error("無效的使用者 ID", 400))
        return
    }
    
    user, err := h.userService.GetUserByID(uint(userID))
    if err != nil {
        c.JSON(http.StatusNotFound, response.Error("使用者不存在", 404))
        return
    }
    
    c.JSON(http.StatusOK, response.Success(user))
}
```

## 路由設定

```go
package api

import (
    "token-admin-api/internal/api/handlers"
    "token-admin-api/internal/api/middleware"
    
    "github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
    // 公共路由
    r.GET("/health-check", handlers.HealthCheck)
    
    // 認證路由
    authHandler := handlers.NewAuthHandler()
    auth := r.Group("/auth")
    {
        auth.POST("/login", authHandler.Login)
        auth.POST("/logout", middleware.AuthMiddleware(), authHandler.Logout)
        auth.POST("/login/password", middleware.AuthMiddleware(), authHandler.UpdatePassword)
    }
    
    // 需要認證的路由
    api := r.Group("/")
    api.Use(middleware.AuthMiddleware())
    {
        // 使用者管理
        userHandler := handlers.NewUserHandler()
        users := api.Group("/users")
        {
            users.GET("", userHandler.GetUsers)
            users.POST("", userHandler.CreateUser)
            users.GET("/:userId", userHandler.GetUserByID)
            users.PUT("/:userId", userHandler.UpdateUser)
            users.PUT("/:userId/unlock", userHandler.UnlockUser)
            users.PUT("/:userId/login/password", userHandler.UpdateUserLoginPassword)
            users.PUT("/:userId/transaction/password", userHandler.UpdateUserTransactionPassword)
            users.GET("/:userId/bankcards", userHandler.GetUserBankcards)
            users.GET("/:userId/orders", userHandler.GetUserOrders)
            users.GET("/:userId/pending/orders", userHandler.GetUserPendingOrders)
        }
        
        // 後台使用者管理
        backendUserHandler := handlers.NewBackendUserHandler()
        backendUsers := api.Group("/backendusers")
        {
            backendUsers.GET("", backendUserHandler.GetUsers)
            backendUsers.POST("", backendUserHandler.CreateUser)
            backendUsers.PUT("/:backendUserId", backendUserHandler.UpdateUser)
            backendUsers.DELETE("/:backendUserId", backendUserHandler.DeleteUser)
        }
        
        // 後台角色管理
        backendActorHandler := handlers.NewBackendActorHandler()
        backendActors := api.Group("/backendactors")
        {
            backendActors.GET("", backendActorHandler.GetActors)
            backendActors.POST("", backendActorHandler.CreateActor)
            backendActors.PUT("/:backendActorId", backendActorHandler.UpdateActor)
            backendActors.DELETE("/:backendActorId", backendActorHandler.DeleteActor)
            backendActors.GET("/permissions", backendActorHandler.GetPermissions)
            backendActors.POST("/permissions", backendActorHandler.CreateActor)
        }
        
        // 銀行管理
        bankHandler := handlers.NewBankHandler()
        banks := api.Group("/banks")
        {
            banks.GET("", bankHandler.GetBanks)
            banks.POST("", bankHandler.CreateBank)
            banks.PUT("/:bankId", bankHandler.UpdateBank)
        }
        
        // 銀行卡管理
        bankcardHandler := handlers.NewBankcardHandler()
        bankcards := api.Group("/bankcards")
        {
            bankcards.GET("", bankcardHandler.GetBankcards)
            bankcards.GET("/:bankcardId", bankcardHandler.GetBankcardByID)
        }
        
        // 訂單管理
        orderHandler := handlers.NewOrderHandler()
        orders := api.Group("/orders")
        {
            orders.GET("", orderHandler.GetOrders)
            orders.PUT("/:orderId", orderHandler.CompleteOrder)
            orders.PUT("/:orderId/cancel", orderHandler.CancelOrder)
        }
        
        // 掛單管理
        pendingOrderHandler := handlers.NewPendingOrderHandler()
        pendingOrders := api.Group("/pending/orders")
        {
            pendingOrders.GET("", pendingOrderHandler.GetPendingOrders)
            pendingOrders.PUT("/:pendingOrderId/stop", pendingOrderHandler.StopPendingOrder)
            pendingOrders.PUT("/:pendingOrderId/open", pendingOrderHandler.OpenPendingOrder)
            pendingOrders.PUT("/:pendingOrderId/cancel", pendingOrderHandler.CancelPendingOrder)
            pendingOrders.DELETE("/:pendingOrderId", pendingOrderHandler.DeletePendingOrder)
        }
    }
}
```

## 資料驗證範例

```go
package validator

import (
    "regexp"
    "unicode"
)

// ValidatePassword 驗證密碼 (6~20 英文數字組合)
func ValidatePassword(password string) bool {
    if len(password) < 6 || len(password) > 20 {
        return false
    }
    
    hasLetter := false
    hasDigit := false
    
    for _, char := range password {
        if unicode.IsLetter(char) {
            hasLetter = true
        }
        if unicode.IsDigit(char) {
            hasDigit = true
        }
    }
    
    return hasLetter && hasDigit
}

// ValidateTransactionCode 驗證交易密碼 (4個數字)
func ValidateTransactionCode(code string) bool {
    matched, _ := regexp.MatchString(`^\d{4}$`, code)
    return matched
}
```

## 測試建議

### 單元測試範例

```go
package handlers_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "token-admin-api/internal/api/handlers"
    
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
)

func TestLogin(t *testing.T) {
    gin.SetMode(gin.TestMode)
    
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    
    handler := handlers.NewAuthHandler()
    
    loginReq := map[string]string{
        "account":  "admin2021",
        "password": "a12345678",
    }
    
    body, _ := json.Marshal(loginReq)
    c.Request, _ = http.NewRequest("POST", "/auth/login", bytes.NewBuffer(body))
    c.Request.Header.Set("Content-Type", "application/json")
    
    handler.Login(c)
    
    assert.Equal(t, http.StatusOK, w.Code)
    
    var response map[string]interface{}
    json.Unmarshal(w.Body.Bytes(), &response)
    
    assert.True(t, response["success"].(bool))
    assert.NotNil(t, response["data"])
}
```

## 實作進度檢查清單

### 階段一：基礎架構 ✅
- [x] 專案結構建立（使用 Uber FX 模組化架構）
- [x] 資料庫連線設定（支援 database/sql 和 GORM）
- [x] 路由框架設定（Gin + 模組化路由）
- [x] JWT 認證實作
- [x] 標準回應格式
- [x] 錯誤處理機制
- [x] Redis 快取整合
- [x] Snowflake ID 生成器
- [x] 環境變數配置（.env）
- [x] 熱重載開發環境（Air）
- [x] 資料庫模型定義（GORM）

### 階段二：認證功能 🚧
- [x] POST /api/v1/auth/login
- [x] POST /api/v1/auth/logout
- [x] JWT token 生成與驗證
- [x] JWT 認證中介層
- [x] 預設 admin 帳號自動創建
- [ ] 密碼修改功能

### 階段三：使用者管理 🔜
- [x] GET /api/v1/users/:id（基礎）
- [x] POST /api/v1/users（基礎）
- [ ] GET /api/v1/users（列表查詢）
- [ ] PUT /api/v1/users/:id
- [ ] PUT /api/v1/users/:id/unlock
- [ ] PUT /api/v1/users/:id/login/password
- [ ] PUT /api/v1/users/:id/transaction/password
- [ ] GET /api/v1/users/:id/bankcards
- [ ] GET /api/v1/users/:id/orders
- [ ] GET /api/v1/users/:id/pending/orders

### 階段四：後台管理 🔜
- [ ] GET /api/v1/backendusers
- [ ] POST /api/v1/backendusers
- [ ] PUT /api/v1/backendusers/:id
- [ ] DELETE /api/v1/backendusers/:id
- [ ] GET /api/v1/backendactors
- [ ] POST /api/v1/backendactors
- [ ] PUT /api/v1/backendactors/:id
- [ ] DELETE /api/v1/backendactors/:id
- [ ] GET /api/v1/backendactors/permissions
- [ ] POST /api/v1/backendactors/permissions

### 階段五：銀行與銀行卡 🔜
- [ ] GET /api/v1/banks
- [ ] POST /api/v1/banks
- [ ] PUT /api/v1/banks/:id
- [ ] GET /api/v1/bankcards
- [ ] GET /api/v1/bankcards/:id

### 階段六：訂單與掛單 🚧
- [x] GET /api/v1/orders/:id（基礎）
- [x] POST /api/v1/orders（基礎）
- [ ] GET /api/v1/orders（列表查詢）
- [ ] PUT /api/v1/orders/:id
- [ ] PUT /api/v1/orders/:id/cancel
- [ ] GET /api/v1/pending/orders
- [ ] PUT /api/v1/pending/orders/:id/stop
- [ ] PUT /api/v1/pending/orders/:id/open
- [ ] PUT /api/v1/pending/orders/:id/cancel
- [ ] DELETE /api/v1/pending/orders/:id

### 階段七：測試與優化 📋
- [ ] 單元測試覆蓋率 > 80%
- [ ] 整合測試
- [ ] 效能測試
- [ ] 與原始 API 對比測試
- [ ] Swagger API 文檔完善
- [ ] 錯誤處理優化
- [ ] 日誌系統完善

## 注意事項

1. **密碼處理**: 
   - 使用 `bcrypt` 或 `argon2` 進行密碼雜湊
   - 永遠不要將原始密碼存儲或記錄

2. **資料庫遷移**:
   - 確保資料庫結構與原始 Node.js 版本一致
   - 使用 GORM 的 AutoMigrate 或手動遷移

3. **時間處理**:
   - 注意時間戳與時間字串的轉換
   - 確保時區處理正確

4. **UUID 處理**:
   - 掛單 ID 使用 UUID 格式
   - 使用 `github.com/google/uuid` 套件

5. **分頁實作**:
   - 確保分頁邏輯與原始 API 一致
   - 返回 `count` (總數) 和 `rows` (資料列表)

6. **錯誤處理**:
   - 所有錯誤都應返回標準格式
   - 適當的 HTTP 狀態碼

7. **效能優化**:
   - 使用資料庫索引
   - 實作適當的快取策略
   - 避免 N+1 查詢問題

## 使用指南

### 環境設定

1. **安裝 Go**: 需要 Go 1.25+ 版本
2. **安裝 PostgreSQL**: 資料庫
3. **安裝 Redis**: 快取服務（連接到 K8s Redis）
4. **設定環境變數**: 複製並修改 `cmd/token-admin-api/.env.example` 為 `.env`

### 開發指令

```bash
# 執行專案（使用 Air 熱重載）
make run-token-admin-api

# 直接執行
cd cmd/token-admin-api && go run main.go

# 編譯專案
go build -o bin/token-admin-api ./cmd/token-admin-api

# 執行測試
go test ./...

# 檢查程式碼
go vet ./...
go fmt ./...
```

### 環境變數設定

在 `cmd/token-admin-api/.env` 設定以下變數：

```bash
# HTTP Server
HTTP_HOST=0.0.0.0
HTTP_PORT=8080

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=token_admin
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL_MODE=disable

# Redis (K8s)
REDIS_HOST=YOUR_K8S_REDIS_IP
REDIS_PORT=YOUR_K8S_REDIS_PORT
REDIS_PASSWORD=
REDIS_DB=0

# Logging
LOG_LEVEL=info
LOG_MODE=development
```

## Uber FX 模組化架構

本專案使用 [Uber FX](https://github.com/uber-go/fx) 實現依賴注入和模組化架構：

### 優點
- ✅ 清晰的依賴關係
- ✅ 易於測試和 mock
- ✅ 模組化設計，易於擴展
- ✅ 自動管理生命週期（startup/shutdown）
- ✅ 編譯時檢查依賴

### 模組結構

```go
// main.go
func main() {
    fx.New(
        config.ConfigModule,           // 配置模組
        snowflake.SnowflakeModule,     // ID 生成器模組
        database.DatabaseModule,       // 資料庫模組
        cache.RedisModule,             // Redis 模組
        initializers.InitializerModule,// 初始化器模組
        services.UserModule,           // 使用者服務模組
        services.OrderModule,          // 訂單服務模組
        services.AuthModule,           // 認證服務模組
        handlers.HandlerModule,        // 處理器模組
        server.ServerModule,           // 伺服器模組
    ).Run()
}
```

---

**文檔版本**: 2.0.0  
**最後更新**: 2025-11-02  
**專案狀態**: 🚧 開發中

