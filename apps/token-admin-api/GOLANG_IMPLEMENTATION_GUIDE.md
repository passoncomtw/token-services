# Golang 實作指南

本指南提供使用 Golang 重構本專案的詳細實作建議。

## 專案結構建議

```
token-admin-api-go/
├── cmd/
│   └── server/
│       └── main.go              # 應用程式入口
├── internal/
│   ├── api/
│   │   ├── handlers/           # HTTP 處理器
│   │   │   ├── auth.go
│   │   │   ├── users.go
│   │   │   ├── backend_users.go
│   │   │   ├── backend_actors.go
│   │   │   ├── banks.go
│   │   │   ├── bankcards.go
│   │   │   ├── orders.go
│   │   │   └── pending_orders.go
│   │   ├── middleware/         # 中介層
│   │   │   ├── auth.go         # JWT 認證
│   │   │   └── cors.go
│   │   └── routes.go           # 路由設定
│   ├── domain/                 # 領域模型
│   │   ├── models/
│   │   │   ├── user.go
│   │   │   ├── backend_user.go
│   │   │   ├── backend_actor.go
│   │   │   ├── bank.go
│   │   │   ├── bankcard.go
│   │   │   ├── order.go
│   │   │   ├── pending_order.go
│   │   │   └── merchant.go
│   │   └── enums/
│   │       ├── user_status.go
│   │       └── order_status.go
│   ├── service/                # 業務邏輯層
│   │   ├── auth_service.go
│   │   ├── user_service.go
│   │   ├── backend_user_service.go
│   │   ├── bank_service.go
│   │   ├── order_service.go
│   │   └── pending_order_service.go
│   ├── repository/             # 資料存取層
│   │   ├── interfaces/         # 介面定義
│   │   └── postgres/          # PostgreSQL 實作
│   │       ├── user_repository.go
│   │       └── ...
│   └── config/                 # 設定檔
│       └── config.go
├── pkg/
│   ├── jwt/                    # JWT 工具
│   ├── response/               # 標準回應格式
│   └── validator/              # 驗證工具
├── migrations/                 # 資料庫遷移
├── go.mod
├── go.sum
└── README.md
```

## 技術棧建議

### 核心框架
- **Web 框架**: [Gin](https://github.com/gin-gonic/gin) 或 [Echo](https://echo.labstack.com/)
- **資料庫**: [GORM](https://gorm.io/) + PostgreSQL
- **JWT**: [golang-jwt/jwt](https://github.com/golang-jwt/jwt)
- **配置管理**: [Viper](https://github.com/spf13/viper)
- **驗證**: [go-playground/validator](https://github.com/go-playground/validator)

### 推薦套件
```go
// go.mod
module token-admin-api

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/golang-jwt/jwt/v5 v5.2.0
    gorm.io/gorm v1.25.5
    gorm.io/driver/postgres v1.5.4
    github.com/spf13/viper v1.18.2
    github.com/go-playground/validator/v10 v10.16.0
    github.com/google/uuid v1.5.0
    golang.org/x/crypto v0.17.0
)
```

## 資料模型定義

### User 模型範例

```go
package models

import (
    "time"
    "gorm.io/gorm"
)

type UserType int
const (
    UserTypeNormal UserType = 0  // 一般使用者
    UserTypePlatform UserType = 1 // 平台使用者
)

type UserStatus int
const (
    UserStatusDisabled UserType = 0 // 停用
    UserStatusEnabled UserType = 1  // 啟用
)

type User struct {
    ID                uint      `json:"id" gorm:"primaryKey"`
    Type              UserType  `json:"type"`
    Account           string    `json:"account" gorm:"uniqueIndex;not null"`
    Name              string    `json:"name"`
    Password          string    `json:"-" gorm:"not null"` // 不序列化到 JSON
    TransactionCode  string    `json:"-"`                 // 交易密碼
    Status            UserStatus `json:"status"`
    OrderStatus       UserStatus `json:"orderStatus"`
    TransactionStatus UserStatus `json:"transactionStatus"`
    Phone             *string   `json:"phone"`
    Email             *string   `json:"email"`
    Markup            *string   `json:"markup"`
    CreateAt          int64     `json:"createAt" gorm:"autoCreateTime"`
    Merchant          *Merchant `json:"merchant,omitempty" gorm:"foreignKey:UserID"`
    Wallet            *Wallet   `json:"wallet,omitempty" gorm:"foreignKey:UserID"`
}

type Merchant struct {
    ID              uint      `json:"id" gorm:"primaryKey"`
    UserID          uint      `json:"-" gorm:"uniqueIndex"`
    Contactor       *string   `json:"contactor"`
    Telegram        *string   `json:"telegram"`
    BuyFeeType      int       `json:"buyFeeType"`
    SellFeeType     int       `json:"sellFeeType"`
    BuyPercentageFee  *FeePercentage `json:"buyPercentageFee,omitempty" gorm:"embedded;embeddedPrefix:buy_percentage_"`
    SellPercentageFee *FeePercentage `json:"sellPercentageFee,omitempty" gorm:"embedded;embeddedPrefix:sell_percentage_"`
    BuyLadderFee    []FeeLadder `json:"buyLadderFee,omitempty" gorm:"foreignKey:MerchantID"`
    SellLadderFee   []FeeLadder `json:"sellLadderFee,omitempty" gorm:"foreignKey:MerchantID"`
    CreateAt        int64     `json:"createAt" gorm:"autoCreateTime"`
}

type FeePercentage struct {
    FeePercent float64 `json:"feePercent"`
    MinFee     float64 `json:"minFee"`
    MaxFee     float64 `json:"maxFee"`
}

type FeeLadder struct {
    ID         uint    `json:"id" gorm:"primaryKey"`
    MerchantID uint   `json:"-"`
    Amount     float64 `json:"amount"`
    FeePercent float64 `json:"feePercent"`
}
```

### Response 結構

```go
package response

// StandardResponse 標準 API 回應格式
type StandardResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   *ErrorInfo  `json:"error,omitempty"`
}

type ErrorInfo struct {
    Message string `json:"message"`
    Code    int    `json:"code"`
}

// Success 成功回應
func Success(data interface{}) StandardResponse {
    return StandardResponse{
        Success: true,
        Data:    data,
    }
}

// Error 錯誤回應
func Error(message string, code int) StandardResponse {
    return StandardResponse{
        Success: false,
        Error: &ErrorInfo{
            Message: message,
            Code:    code,
        },
    }
}
```

## JWT 認證實作

```go
package jwt

import (
    "errors"
    "time"
    "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
    UserID   uint   `json:"id"`
    Account  string `json:"account"`
    jwt.RegisteredClaims
}

var jwtSecret = []byte("your-secret-key") // 從環境變數讀取

// GenerateToken 生成 JWT token
func GenerateToken(userID uint, account string) (string, int64, error) {
    expireTime := time.Now().Add(24 * time.Hour).Unix()
    
    claims := Claims{
        UserID:  userID,
        Account: account,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Unix(expireTime, 0)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString(jwtSecret)
    
    return tokenString, expireTime, err
}

// ParseToken 解析 JWT token
func ParseToken(tokenString string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
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

## 實作檢查清單

### 階段一：基礎架構
- [ ] 專案結構建立
- [ ] 資料庫連線設定
- [ ] 路由框架設定
- [ ] JWT 認證實作
- [ ] 標準回應格式
- [ ] 錯誤處理機制

### 階段二：認證功能
- [ ] POST /auth/login
- [ ] POST /auth/logout
- [ ] POST /auth/login/password
- [ ] JWT token 生成與驗證

### 階段三：使用者管理
- [ ] GET /users
- [ ] POST /users
- [ ] GET /users/{userId}
- [ ] PUT /users/{userId}
- [ ] PUT /users/{userId}/unlock
- [ ] PUT /users/{userId}/login/password
- [ ] PUT /users/{userId}/transaction/password
- [ ] GET /users/{userId}/bankcards
- [ ] GET /users/{userId}/orders
- [ ] GET /users/{userId}/pending/orders

### 階段四：後台管理
- [ ] GET /backendusers
- [ ] POST /backendusers
- [ ] PUT /backendusers/{backendUserId}
- [ ] DELETE /backendusers/{backendUserId}
- [ ] GET /backendactors
- [ ] POST /backendactors
- [ ] PUT /backendactors/{backendActorId}
- [ ] DELETE /backendactors/{backendActorId}
- [ ] GET /backendactors/permissions
- [ ] POST /backendactors/permissions

### 階段五：銀行與銀行卡
- [ ] GET /banks
- [ ] POST /banks
- [ ] PUT /banks/{bankId}
- [ ] GET /bankcards
- [ ] GET /bankcards/{bankcardId}

### 階段六：訂單與掛單
- [ ] GET /orders
- [ ] PUT /orders/{orderId}
- [ ] PUT /orders/{orderId}/cancel
- [ ] GET /pending/orders
- [ ] PUT /pending/orders/{pendingOrderId}/stop
- [ ] PUT /pending/orders/{pendingOrderId}/open
- [ ] PUT /pending/orders/{pendingOrderId}/cancel
- [ ] DELETE /pending/orders/{pendingOrderId}

### 階段七：測試與優化
- [ ] 單元測試覆蓋率 > 80%
- [ ] 整合測試
- [ ] 效能測試
- [ ] 與原始 API 對比測試
- [ ] 文檔完善

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

---

**文檔版本**: 1.0.0  
**最後更新**: 2025-01-XX

