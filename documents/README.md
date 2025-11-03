# 錢包後台 API (Golang 版本)

> 一個基於 Gin + GORM + FX 的 C2C 數位貨幣交易平台後台管理系統

## 📋 目錄

- [專案簡介](#專案簡介)
- [技術架構](#技術架構)
- [快速開始](#快速開始)
- [專案結構](#專案結構)
- [開發指南](#開發指南)
- [業務邏輯](#業務邏輯)
- [API 文檔](#api-文檔)
- [資料庫設計](#資料庫設計)
- [部署指南](#部署指南)
- [常見問題](#常見問題)

---

## 專案簡介

### 產品定位

本平台參考幣安 C2C 交易功能開發，提供點對點數位貨幣交易服務，包含：
- **移動應用 API**: 為買賣雙方提供交易介面
- **管理後台 API**: 為平台管理員提供管理工具

### 主要功能

#### 使用者端功能
- **使用者管理**: 註冊、登入、身份驗證（KYC）
- **交易功能**: 創建買入/賣出訂單、訂單匹配、支付確認
- **訂單管理**: 訂單列表、狀態追蹤、交易歷史
- **支付方式**: 多種銀行卡管理

#### 管理端功能
- **使用者管理**: 查看、凍結/解凍使用者、交易記錄查看
- **訂單管理**: 查看、干預訂單、申訴處理
- **掛單管理**: 掛單狀態控制（開啟/暫停/取消/刪除）
- **銀行管理**: 銀行和銀行卡資訊管理
- **後台管理**: 角色權限管理（RBAC）、系統日誌

### 核心價值

- ✅ **安全可靠**: JWT 認證、資料加密、事務處理
- ✅ **易於維護**: Clean Architecture、依賴注入、模組化設計
- ✅ **高效能**: GORM ORM、連線池管理、合理的資料庫索引
- ✅ **開發友好**: Swagger 文檔、熱重載、統一錯誤處理

### 角色與權限

| 角色 | 權限說明 |
|------|---------|
| **普通使用者** | 註冊登入、管理資料、銀行卡、創建訂單、查看訂單歷史 |
| **商家使用者** | 普通使用者權限 + 發佈廣告、設置交易條件、查看統計數據 |
| **系統管理員** | 使用者管理、訂單管理、銀行管理、系統參數配置 |
| **超級管理員** | 系統管理員權限 + 管理員帳號管理、角色權限設置、審計日誌 |

---

## 技術架構

### 技術棧

| 類別 | 技術 | 版本 | 說明 |
|------|------|------|------|
| 語言 | Go | 1.25.1 | 高效能編譯語言 |
| Web 框架 | Gin | 1.11.0 | 輕量級 HTTP 框架 |
| ORM | GORM | 1.31.0 | Go 語言 ORM |
| 依賴注入 | Uber FX | 1.24.0 | 模組化依賴管理 |
| JWT | golang-jwt/jwt | 5.3.0 | Token 認證 |
| 資料庫 | PostgreSQL | 14+ | 關聯式資料庫 |
| 快取 | Redis | (可選) | 快取服務 |
| API 文檔 | Swagger | 1.16.6 | 自動生成 API 文檔 |
| 熱重載 | Air | latest | 開發時自動編譯 |
| 密碼加密 | bcrypt | - | 密碼雜湊 |
| UUID | google/uuid | 1.6.0 | UUID 生成 |

### 架構圖

```
┌─────────────────────────────────────────┐
│         Gin Web Framework               │
│  ┌───────────────────────────────────┐  │
│  │     JWT Auth Middleware           │  │
│  └───────────────────────────────────┘  │
│                   ↓                      │
│  ┌───────────────────────────────────┐  │
│  │         Router Layer              │  │
│  │   (server/router.go)              │  │
│  └───────────────────────────────────┘  │
│                   ↓                      │
│  ┌───────────────────────────────────┐  │
│  │        Handlers Layer             │  │
│  │   (HTTP Request Handlers)         │  │
│  └───────────────────────────────────┘  │
│                   ↓                      │
│  ┌───────────────────────────────────┐  │
│  │        Service Layer              │  │
│  │     (Business Logic)              │  │
│  └───────────────────────────────────┘  │
│                   ↓                      │
│  ┌───────────────────────────────────┐  │
│  │      GORM + PostgreSQL            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Uber FX 依賴注入流程

```
main.go
  ├── config.ConfigModule         # 配置模組
  ├── database.DatabaseModule     # 資料庫連線
  ├── middleware.MiddlewareModule # JWT 中間件
  ├── initializers.InitializerModule # 初始化（建立預設管理員）
  ├── services.AuthModule         # 認證服務
  ├── services.UserModule         # 使用者服務
  ├── services.BankModule         # 銀行服務
  ├── services.BankCardModule     # 銀行卡服務
  ├── services.OrderModule        # 訂單服務
  ├── services.PendingOrderModule # 掛單服務
  ├── services.BackendActorModule # 後台角色服務
  ├── services.BackendUserModule  # 後台使用者服務
  ├── handlers.HandlerModule      # 處理器模組
  └── server.ServerModule         # 伺服器模組
```

---

## 快速開始

### 前置需求

- Go 1.25.1 或以上
- PostgreSQL 14 或以上
- Make（可選）
- Air（可選，用於熱重載）

### 安裝步驟

#### 1. 複製專案

```bash
git clone <repository-url>
cd golang-token-services
```

#### 2. 安裝依賴

```bash
go mod download
```

#### 3. 配置環境變數

創建 `cmd/token-admin-api/.env` 文件：

```env
# HTTP Server
HTTP_PORT=8080
HTTP_HOST=127.0.0.1

# JWT 認證
JWT_SECRET=your_super_secret_jwt_key_here

# 資料庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sk-demo
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL_MODE=disable

# 資料庫連線池
DB_MAX_IDLE_CONNS=10
DB_MAX_OPEN_CONNS=100
DB_CONN_MAX_LIFETIME=3600
DB_CONN_MAX_IDLE_TIME=1800

# 日誌配置
LOG_LEVEL=info
LOG_MODE=production
```

#### 4. 啟動資料庫

**使用 Docker:**
```bash
docker run --name token-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=sk-demo \
  -p 5432:5432 \
  -d postgres:14
```

**或使用本地 PostgreSQL:**
```bash
createdb sk-demo
```

#### 5. 啟動服務

**使用 Make（推薦）:**
```bash
# 生成 Swagger 文檔
make build-token-admin-swagger

# 使用 air 熱重載開發
make run-token-admin-api
```

**或直接執行:**
```bash
go run cmd/token-admin-api/main.go
```

#### 6. 驗證服務

```bash
# 健康檢查
curl http://localhost:8080/health-check

# 應該返回：
# {"success":true,"data":{"status":"WORKING"}}
```

#### 7. 訪問服務

- **API 服務**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger/index.html
- **健康檢查**: http://localhost:8080/health-check

### 預設管理員帳號

應用程式啟動時會自動創建預設管理員帳號：

```
帳號: admin
密碼: admin123
```

### 測試 API

```bash
# 登入
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "admin",
    "password": "admin123"
  }'

# 成功後會返回 JWT Token
# 複製 token 用於後續請求

# 查詢使用者列表（需要 token）
curl -X GET http://localhost:8080/users \
  -H "Authorization: Bearer {your_token}"
```

---

## 專案結構

```
golang-token-services/
├── cmd/
│   └── token-admin-api/
│       ├── main.go                    # 應用程式入口（Uber FX）
│       ├── .env                       # 環境變數配置
│       └── internal/
│           ├── docs/                  # Swagger 文檔（自動生成）
│           │   ├── docs.go
│           │   ├── swagger.json
│           │   └── swagger.yaml
│           ├── handlers/              # HTTP 處理器
│           │   ├── auth.go            # 認證處理器
│           │   ├── user.go            # 使用者處理器
│           │   ├── backendUser.go     # 後台使用者處理器
│           │   ├── backendActor.go    # 後台角色處理器
│           │   ├── bank.go            # 銀行處理器
│           │   ├── bankcard.go        # 銀行卡處理器
│           │   ├── order.go           # 訂單處理器
│           │   ├── pendingOrder.go    # 掛單處理器
│           │   ├── health.go          # 健康檢查
│           │   └── module.go          # Handler 模組註冊
│           ├── services/              # 業務邏輯層
│           │   ├── authService.go     # 認證服務
│           │   ├── userService.go     # 使用者服務
│           │   ├── backendUserService.go
│           │   ├── backendActorService.go
│           │   ├── bankService.go
│           │   ├── bankcardService.go
│           │   ├── orderService.go
│           │   └── pendingOrderService.go
│           ├── interfaces/            # 介面定義與 DTOs
│           │   ├── services.go
│           │   ├── handlerInterfaces.go
│           │   ├── userInterfaces.go
│           │   ├── backendUserInterfaces.go
│           │   ├── backendActorInterfaces.go
│           │   ├── bankInterfaces.go
│           │   ├── bankcardInterfaces.go
│           │   ├── orderInterfaces.go
│           │   └── pendingOrderInterfaces.go
│           ├── initializers/          # 初始化邏輯
│           │   ├── admin.go           # 預設管理員初始化
│           │   └── module.go
│           └── server/                # 伺服器配置
│               ├── server.go          # Gin 伺服器設置
│               ├── router.go          # 路由配置
│               └── module.go
├── pkg/                               # 共用套件
│   ├── auth/                         # JWT 認證
│   │   └── jwt.go
│   ├── config/                       # 配置管理
│   │   ├── config.go
│   │   └── module.go
│   ├── database/                     # 資料庫連線
│   │   ├── connection.go             # database/sql 連線
│   │   ├── gorm.go                   # GORM 連線
│   │   ├── migrate.go                # 自動遷移
│   │   ├── module.go
│   │   └── migrations/
│   │       └── dev/
│   │           └── token_admin_initial.sql
│   ├── models/                       # GORM 資料模型
│   │   ├── user.go                   # 前台使用者
│   │   ├── backend_user.go           # 後台使用者
│   │   ├── backend_actor.go          # 後台角色
│   │   ├── bank.go                   # 銀行
│   │   ├── bank_card.go              # 銀行卡
│   │   ├── order.go                  # 訂單
│   │   ├── pending_order.go          # 掛單
│   │   ├── merchant.go               # 商家
│   │   ├── wallet.go                 # 錢包
│   │   └── order_statistic.go        # 訂單統計
│   ├── middleware/                   # 中間件
│   │   ├── auth.go                   # JWT 認證中間件
│   │   └── module.go
│   └── response/                     # 統一響應格式
│       ├── response.go
│       └── README.md
├── documents/                         # 專案文檔
│   └── README.md                     # 本文檔
├── go.mod                            # Go 模組定義
├── go.sum                            # Go 依賴校驗
├── Makefile                          # 建置指令
└── .air.toml                         # Air 熱重載配置
```

---

## 開發指南

### 添加新功能的完整流程

#### 步驟 1: 定義資料模型

在 `pkg/models/` 中創建新的資料模型：

```go
// pkg/models/example.go
package models

import "time"

type Example struct {
    ID        int       `gorm:"column:id;primaryKey;autoIncrement"`
    Name      string    `gorm:"column:name;type:varchar(255);not null"`
    Status    int       `gorm:"column:status;not null;default:1"`
    CreatedAt time.Time `gorm:"column:created_at;type:timestamptz;not null"`
    UpdatedAt time.Time `gorm:"column:updated_at;type:timestamptz;not null"`
    DeletedAt *time.Time `gorm:"column:deleted_at;type:timestamptz"`
}

func (Example) TableName() string {
    return "examples"
}
```

#### 步驟 2: 定義介面和 DTOs

在 `internal/interfaces/` 中定義介面：

```go
// internal/interfaces/exampleInterfaces.go
package interfaces

// DTOs (Data Transfer Objects)
type ExampleRequest struct {
    Name   string `json:"name" binding:"required"`
    Status int    `json:"status"`
}

type ExampleResponse struct {
    ID        int    `json:"id"`
    Name      string `json:"name"`
    Status    int    `json:"status"`
    CreatedAt string `json:"created_at"`
}

// Service Interface
type ExampleServiceInterface interface {
    Create(req *ExampleRequest) (*ExampleResponse, error)
    GetList() ([]*ExampleResponse, error)
    GetByID(id int) (*ExampleResponse, error)
    Update(id int, req *ExampleRequest) error
    Delete(id int) error
}

// Handler Interface
type ExampleHandlersInterface interface {
    Create(c *gin.Context)
    GetList(c *gin.Context)
    GetByID(c *gin.Context)
    Update(c *gin.Context)
    Delete(c *gin.Context)
}
```

#### 步驟 3: 實作服務層

在 `internal/services/` 中實作業務邏輯：

```go
// internal/services/exampleService.go
package services

import (
    "token-admin-api/cmd/token-admin-api/internal/interfaces"
    "token-admin-api/pkg/models"
    "go.uber.org/fx"
    "gorm.io/gorm"
)

type ExampleService struct {
    db *gorm.DB
}

func NewExampleService(db *gorm.DB) *ExampleService {
    return &ExampleService{db: db}
}

func (s *ExampleService) Create(req *interfaces.ExampleRequest) (*interfaces.ExampleResponse, error) {
    example := &models.Example{
        Name:   req.Name,
        Status: req.Status,
    }
    
    if err := s.db.Create(example).Error; err != nil {
        return nil, err
    }
    
    return &interfaces.ExampleResponse{
        ID:        example.ID,
        Name:      example.Name,
        Status:    example.Status,
        CreatedAt: example.CreatedAt.Format("2006-01-02 15:04:05"),
    }, nil
}

func (s *ExampleService) GetList() ([]*interfaces.ExampleResponse, error) {
    var examples []models.Example
    if err := s.db.Find(&examples).Error; err != nil {
        return nil, err
    }
    
    var result []*interfaces.ExampleResponse
    for _, ex := range examples {
        result = append(result, &interfaces.ExampleResponse{
            ID:        ex.ID,
            Name:      ex.Name,
            Status:    ex.Status,
            CreatedAt: ex.CreatedAt.Format("2006-01-02 15:04:05"),
        })
    }
    
    return result, nil
}

// FX 模組註冊
var ExampleModule = fx.Module("example",
    fx.Provide(fx.Annotate(NewExampleService, fx.As(new(interfaces.ExampleServiceInterface)))),
)
```

#### 步驟 4: 實作處理器層

在 `internal/handlers/` 中實作 HTTP 處理器：

```go
// internal/handlers/example.go
package handlers

import (
    "token-admin-api/cmd/token-admin-api/internal/interfaces"
    "token-admin-api/pkg/response"
    "github.com/gin-gonic/gin"
    "strconv"
)

type ExampleHandlers struct {
    exampleService interfaces.ExampleServiceInterface
}

func NewExampleHandlers(exampleService interfaces.ExampleServiceInterface) *ExampleHandlers {
    return &ExampleHandlers{exampleService: exampleService}
}

// @Summary 創建範例
// @Tags 範例
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body interfaces.ExampleRequest true "請求參數"
// @Success 200 {object} response.Response{data=interfaces.ExampleResponse}
// @Failure 400 {object} response.ErrorResponse
// @Router /examples [post]
func (h *ExampleHandlers) Create(c *gin.Context) {
    var req interfaces.ExampleRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        response.BadRequest(c, "請求參數錯誤")
        return
    }
    
    result, err := h.exampleService.Create(&req)
    if err != nil {
        response.InternalError(c, "創建失敗")
        return
    }
    
    response.Success(c, result)
}

// @Summary 取得範例列表
// @Tags 範例
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} response.Response{data=[]interfaces.ExampleResponse}
// @Router /examples [get]
func (h *ExampleHandlers) GetList(c *gin.Context) {
    result, err := h.exampleService.GetList()
    if err != nil {
        response.InternalError(c, "查詢失敗")
        return
    }
    
    response.Success(c, result)
}
```

#### 步驟 5: 註冊路由

在 `internal/server/router.go` 中註冊路由：

```go
// internal/server/router.go

// 在 Router struct 中添加
type Router struct {
    // ... 其他 handlers
    exampleHandlers interfaces.ExampleHandlersInterface
}

// 在 NewRouter 中添加參數
func NewRouter(
    // ... 其他參數
    exampleHandlers interfaces.ExampleHandlersInterface,
) *Router {
    return &Router{
        // ... 其他 handlers
        exampleHandlers: exampleHandlers,
    }
}

// 在 SetupRoutes 中添加路由
func (r *Router) SetupRoutes(engine *gin.Engine) {
    // ... 其他路由
    
    authenticated := engine.Group("")
    authenticated.Use(r.authMiddleware.Authenticate())
    {
        // ... 其他路由
        
        // Example routes
        authenticated.POST("/examples", r.exampleHandlers.Create)
        authenticated.GET("/examples", r.exampleHandlers.GetList)
        authenticated.GET("/examples/:id", r.exampleHandlers.GetByID)
        authenticated.PUT("/examples/:id", r.exampleHandlers.Update)
        authenticated.DELETE("/examples/:id", r.exampleHandlers.Delete)
    }
}
```

#### 步驟 6: 註冊模組到 main.go

```go
// cmd/token-admin-api/main.go

func main() {
    fx.New(
        config.ConfigModule,
        database.DatabaseModule,
        middleware.MiddlewareModule,
        initializers.InitializerModule,
        // ... 其他服務模組
        services.ExampleModule, // 添加新模組
        handlers.HandlerModule,
        server.ServerModule,
    ).Run()
}
```

#### 步驟 7: 生成 Swagger 文檔

```bash
make build-token-admin-swagger
```

### GORM 最佳實踐

#### 1. 使用 Preload 載入關聯資料

```go
// ✅ 正確：預載入關聯資料
var user models.User
db.Preload("Wallet").Preload("Merchant").First(&user, id)

// ❌ 錯誤：N+1 查詢問題
var users []models.User
db.Find(&users)
for i := range users {
    db.First(&users[i].Wallet, "user_id = ?", users[i].ID)
}
```

#### 2. 使用 Joins 進行關聯過濾

```go
// ✅ 正確：使用 Joins 過濾
db := s.db.Model(&models.BankCard{})

// 根據使用者帳號過濾
if query.Account != "" {
    db = db.Joins("User").Where("User.account LIKE ?", "%"+query.Account+"%")
}

// 根據銀行代碼過濾
if query.BankCode != "" {
    db = db.Joins("Bank").Where("Bank.bank_code LIKE ?", "%"+query.BankCode+"%")
}

// 最後載入完整資料
db.Preload("User").Preload("Bank").Find(&bankCards)
```

#### 3. 使用事務保證資料一致性

```go
// ✅ 正確：使用事務
err := s.db.Transaction(func(tx *gorm.DB) error {
    // 創建使用者
    if err := tx.Create(&user).Error; err != nil {
        return err // 自動 rollback
    }
    
    // 創建錢包
    wallet := models.Wallet{UserID: &user.ID}
    if err := tx.Create(&wallet).Error; err != nil {
        return err // 自動 rollback
    }
    
    return nil // 自動 commit
})
```

#### 4. 正確實作分頁

```go
// ✅ 正確：分頁查詢
func (s *Service) GetList(page, size int) (*Response, error) {
    // 建立查詢
    db := s.db.Model(&models.Example{})
    
    // 計算總數（使用獨立 session）
    var count int64
    countDB := db.Session(&gorm.Session{})
    if err := countDB.Count(&count).Error; err != nil {
        return nil, err
    }
    
    // 分頁查詢
    offset := (page - 1) * size
    var items []models.Example
    if err := db.Offset(offset).Limit(size).Find(&items).Error; err != nil {
        return nil, err
    }
    
    return &Response{Count: count, Rows: items}, nil
}
```

#### 5. 軟刪除

```go
// 模型定義（包含 DeletedAt）
type Model struct {
    DeletedAt *time.Time `gorm:"column:deleted_at;type:timestamptz"`
}

// 軟刪除（設置 deleted_at）
db.Delete(&model)

// 查詢會自動過濾已刪除的記錄
db.Find(&models)

// 包含已刪除的記錄
db.Unscoped().Find(&models)
```

### 常用命令

```bash
# 開發命令
make build-token-admin-swagger  # 生成 Swagger 文檔
make run-token-admin-api        # 使用 air 熱重載
go run cmd/token-admin-api/main.go  # 直接執行

# 建置命令
go build -o bin/token-admin-api cmd/token-admin-api/main.go

# 測試命令
go test ./...                   # 執行所有測試
go test -cover ./...            # 測試覆蓋率
go test -v ./cmd/...            # 詳細輸出

# 程式碼品質
go fmt ./...                    # 格式化
go vet ./...                    # 靜態分析
go mod tidy                     # 整理依賴
```

---

## 業務邏輯

### 交易流程

#### 買幣流程
1. 使用者登入系統
2. 瀏覽賣家廣告或直接創建買入訂單
3. 選擇交易金額和支付方式
4. 確認訂單信息並創建訂單
5. 根據賣家提供的銀行卡信息進行付款
6. 標記訂單為「已付款」
7. 等待賣家確認並放幣
8. 收到數位貨幣，交易完成

#### 賣幣流程
1. 使用者登入系統
2. 發布賣幣廣告或直接創建賣出訂單
3. 設置交易金額和接受的支付方式
4. 確認訂單並鎖定數位貨幣
5. 等待買家付款
6. 收到買家付款通知並確認收款
7. 確認後系統自動放幣給買家
8. 交易完成

### 業務規則

#### 交易規則
- **金額限制**: 單筆交易最低 100 元，最高 50,000 元
- **時間限制**: 訂單創建後，買家需在 30 分鐘內完成付款
- **確認時限**: 收到付款通知後，賣家需在 15 分鐘內確認
- **取消規則**: 未付款前，買家可隨時取消訂單
- **申訴時效**: 交易過程中或完成後 24 小時內可提出申訴

#### 訂單狀態

| 狀態值 | 狀態名稱 | 說明 |
|--------|----------|------|
| 0 | 待付款 | 訂單已建立，等待付款 |
| 1 | 已付款 | 使用者已完成付款，等待確認 |
| 2 | 已完成 | 訂單已完成 |
| 3 | 已取消 | 訂單已取消 |

#### 掛單狀態

| 狀態值 | 狀態名稱 | 說明 |
|--------|----------|------|
| 0 | 掛單中 | 掛單進行中，可接受新訂單 |
| 1 | 暫停掛單 | 掛單暫停，不接受新訂單 |
| 2 | 取消掛單 | 掛單已取消 |
| 3 | 已刪除掛單 | 掛單已刪除（軟刪除） |

---

## API 文檔

### 認證

所有受保護的 API 都需要在 Header 中攜帶 JWT Token：

```
Authorization: Bearer {token}
```

### 主要端點總覽

| 模組 | 端點 | 方法 | 說明 |
|------|------|------|------|
| **健康檢查** | `/health-check` | GET | 檢查服務狀態 |
| **認證** | `/auth/login` | POST | 使用者登入 |
| **認證** | `/auth/logout` | POST | 使用者登出 |
| **使用者** | `/users` | GET | 查詢使用者列表 |
| **使用者** | `/users` | POST | 新增使用者 |
| **使用者** | `/users/{userId}` | GET | 查詢使用者詳情 |
| **使用者** | `/users/{userId}` | PUT | 更新使用者資訊 |
| **使用者** | `/users/{userId}/unlock` | PUT | 解鎖使用者 |
| **使用者** | `/users/{userId}/login/password` | PUT | 更新登入密碼 |
| **使用者** | `/users/{userId}/transaction/password` | PUT | 更新交易密碼 |
| **使用者** | `/users/{userId}/bankcards` | GET | 查詢使用者銀行卡 |
| **使用者** | `/users/{userId}/orders` | GET | 查詢使用者訂單 |
| **使用者** | `/users/{userId}/pending/orders` | GET | 查詢使用者掛單 |
| **後台使用者** | `/backendusers` | GET | 查詢後台使用者列表 |
| **後台使用者** | `/backendusers` | POST | 新增後台使用者 |
| **後台使用者** | `/backendusers/{id}` | PUT | 更新後台使用者 |
| **後台使用者** | `/backendusers/{id}` | DELETE | 刪除後台使用者 |
| **後台角色** | `/backendactors` | GET | 查詢角色列表 |
| **後台角色** | `/backendactors` | POST | 新增角色 |
| **後台角色** | `/backendactors/{id}` | PUT | 更新角色 |
| **後台角色** | `/backendactors/{id}` | DELETE | 刪除角色 |
| **後台角色** | `/backendactors/permissions` | GET | 查詢權限清單 |
| **銀行** | `/banks` | GET | 查詢銀行列表 |
| **銀行** | `/banks` | POST | 新增銀行 |
| **銀行** | `/banks/{bankId}` | PUT | 更新銀行 |
| **銀行卡** | `/bankcards` | GET | 查詢銀行卡列表 |
| **銀行卡** | `/bankcards/{id}` | GET | 查詢銀行卡詳情 |
| **訂單** | `/orders` | GET | 查詢訂單列表 |
| **訂單** | `/orders/{orderId}` | PUT | 完成訂單 |
| **訂單** | `/orders/{orderId}/cancel` | PUT | 取消訂單 |
| **掛單** | `/pending/orders` | GET | 查詢掛單列表 |
| **掛單** | `/pending/orders/{id}/stop` | PUT | 暫停掛單 |
| **掛單** | `/pending/orders/{id}/open` | PUT | 開啟掛單 |
| **掛單** | `/pending/orders/{id}/cancel` | PUT | 取消掛單 |
| **掛單** | `/pending/orders/{id}` | DELETE | 刪除掛單 |

### API 請求範例

#### 登入

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "admin",
    "password": "admin123"
  }'
```

回應：
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expireIn": 86400000,
    "user": {
      "id": 1,
      "type": 0,
      "account": "admin",
      "name": "系統管理員"
    }
  }
}
```

#### 查詢使用者列表

```bash
curl -X GET "http://localhost:8080/users?page=1&size=10" \
  -H "Authorization: Bearer {token}"
```

#### 創建訂單

```bash
curl -X POST http://localhost:8080/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "amount": 1000,
    "type": 0
  }'
```

### 完整 API 文檔

訪問 Swagger UI 查看完整的互動式 API 文檔：  
http://localhost:8080/swagger/index.html

---

## 資料庫設計

### 核心資料表

#### Users (使用者)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    account VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    transaction_password VARCHAR(255),
    type INTEGER NOT NULL,                 -- 0: 一般, 1: 商家
    status INTEGER NOT NULL,               -- 0: 啟用, 1: 凍結
    order_status INTEGER NOT NULL,         -- 0: 停用, 1: 啟用
    transaction_status INTEGER NOT NULL,    -- 0: 停用, 1: 啟用
    phone VARCHAR(50),
    markup TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_account ON users(account);
CREATE INDEX idx_users_email ON users(email);
```

#### Orders (訂單)

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    pending_order_id UUID REFERENCES pending_orders(id),
    bank_card_id INTEGER REFERENCES bank_cards(id),
    amount NUMERIC(18,0) NOT NULL,
    status INTEGER NOT NULL,               -- 0: 待付款, 1: 已付款, 2: 已完成, 3: 已取消
    type INTEGER NOT NULL,                 -- 0: 購買, 1: 出售
    cancel_reason TEXT,
    payer VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL,
    finish_at TIMESTAMPTZ,
    expect_finish_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

#### PendingOrders (掛單)

```sql
CREATE TABLE pending_orders (
    id UUID PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    bank_card_id INTEGER REFERENCES bank_cards(id),
    type INTEGER NOT NULL,                 -- 0: 買幣, 1: 賣幣
    status INTEGER NOT NULL,               -- 0: 掛單中, 1: 暫停, 2: 取消, 3: 刪除
    transaction_minutes INTEGER NOT NULL,
    process_count INTEGER NOT NULL,
    cancel_count INTEGER NOT NULL,
    done_count INTEGER NOT NULL,
    min_amount NUMERIC(18,0) NOT NULL,
    balance NUMERIC(18,0) NOT NULL,
    amount NUMERIC(18,0) NOT NULL,
    process_amount NUMERIC(18,0) NOT NULL,
    cancel_amount NUMERIC(18,0) NOT NULL,
    done_amount NUMERIC(18,0) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_pending_orders_user_id ON pending_orders(user_id);
CREATE INDEX idx_pending_orders_status ON pending_orders(status);
```

### 資料表關聯

```
Users (使用者)
  ├── 1:1 → Merchants (商家資訊)
  ├── 1:1 → Wallets (錢包)
  ├── 1:N → BankCards (銀行卡)
  ├── 1:N → Orders (訂單)
  └── 1:N → PendingOrders (掛單)

Banks (銀行)
  └── 1:N → BankCards (銀行卡)

BackendUsers (後台使用者)
  └── N:N → BackendActors (後台角色)

Orders (訂單)
  ├── N:1 → Users (使用者)
  ├── N:1 → PendingOrders (掛單)
  └── N:1 → BankCards (銀行卡)

PendingOrders (掛單)
  ├── N:1 → Users (使用者)
  └── N:1 → BankCards (銀行卡)
```

### 資料模型範例

```go
// User 使用者模型
type User struct {
    ID                int        `gorm:"column:id;primaryKey;autoIncrement"`
    Account           string     `gorm:"column:account;type:varchar(255);unique;not null"`
    Name              string     `gorm:"column:name;type:varchar(255);not null"`
    Email             string     `gorm:"column:email;type:varchar(255)"`
    Password          string     `gorm:"column:password;type:varchar(255);not null"`
    TransactionPassword string   `gorm:"column:transaction_password;type:varchar(255)"`
    Type              int        `gorm:"column:type;not null"`
    Status            int        `gorm:"column:status;not null"`
    OrderStatus       int        `gorm:"column:order_status;not null"`
    TransactionStatus int        `gorm:"column:transaction_status;not null"`
    Phone             string     `gorm:"column:phone;type:varchar(50)"`
    Markup            string     `gorm:"column:markup;type:text"`
    CreatedAt         time.Time  `gorm:"column:created_at;type:timestamptz;not null"`
    UpdatedAt         time.Time  `gorm:"column:updated_at;type:timestamptz;not null"`
    DeletedAt         *time.Time `gorm:"column:deleted_at;type:timestamptz"`
    
    // 關聯
    Merchant *Merchant `gorm:"foreignKey:UserID;references:ID"`
    Wallet   *Wallet   `gorm:"foreignKey:UserID;references:ID"`
}

func (User) TableName() string {
    return "users"
}
```

---

## 部署指南

### Docker 部署

#### 1. 建置映像檔

創建 `Dockerfile`：

```dockerfile
FROM golang:1.25.1-alpine AS builder

WORKDIR /app

# 安裝依賴
COPY go.mod go.sum ./
RUN go mod download

# 複製原始碼
COPY . .

# 建置應用程式
RUN go build -o token-admin-api cmd/token-admin-api/main.go

# 最終映像
FROM alpine:latest

WORKDIR /app

# 安裝必要工具
RUN apk --no-cache add ca-certificates

# 複製二進位檔案
COPY --from=builder /app/token-admin-api .
COPY --from=builder /app/cmd/token-admin-api/.env .

EXPOSE 8080

CMD ["./token-admin-api"]
```

建置並執行：

```bash
# 建置映像
docker build -t token-admin-api:latest .

# 執行容器
docker run -d \
  --name token-admin-api \
  -p 8080:8080 \
  -e DB_HOST=postgres-host \
  -e DB_PORT=5432 \
  -e DB_NAME=sk-demo \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_secret_key \
  token-admin-api:latest
```

#### 2. Docker Compose

創建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sk-demo
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  token-admin-api:
    build: .
    ports:
      - "8080:8080"
    environment:
      HTTP_PORT: 8080
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: sk-demo
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: your_secret_key_here
    depends_on:
      - postgres

volumes:
  postgres-data:
```

啟動服務：

```bash
docker-compose up -d
```

### Kubernetes 部署

#### 1. ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: token-admin-api-config
data:
  HTTP_PORT: "8080"
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  DB_NAME: "sk-demo"
  LOG_LEVEL: "info"
  LOG_MODE: "production"
```

#### 2. Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: token-admin-api-secret
type: Opaque
stringData:
  JWT_SECRET: "your_super_secret_jwt_key_here"
  DB_USER: "postgres"
  DB_PASSWORD: "your_password"
```

#### 3. Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: token-admin-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: token-admin-api
  template:
    metadata:
      labels:
        app: token-admin-api
    spec:
      containers:
      - name: api
        image: token-admin-api:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: token-admin-api-config
        - secretRef:
            name: token-admin-api-secret
        livenessProbe:
          httpGet:
            path: /health-check
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health-check
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

#### 4. Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: token-admin-api-service
spec:
  selector:
    app: token-admin-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

部署到 Kubernetes：

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### 環境變數說明

| 變數名稱 | 必填 | 預設值 | 說明 |
|---------|------|--------|------|
| HTTP_PORT | 否 | 8080 | HTTP 伺服器端口 |
| HTTP_HOST | 否 | 127.0.0.1 | HTTP 伺服器主機 |
| JWT_SECRET | 是 | - | JWT 密鑰（生產環境必須設置強隨機字串） |
| DB_HOST | 是 | localhost | 資料庫主機 |
| DB_PORT | 是 | 5432 | 資料庫端口 |
| DB_NAME | 是 | sk-demo | 資料庫名稱 |
| DB_USER | 是 | postgres | 資料庫使用者 |
| DB_PASSWORD | 是 | - | 資料庫密碼 |
| DB_SSL_MODE | 否 | disable | SSL 模式 |
| DB_MAX_IDLE_CONNS | 否 | 10 | 最大閒置連線數 |
| DB_MAX_OPEN_CONNS | 否 | 100 | 最大開啟連線數 |
| LOG_LEVEL | 否 | info | 日誌等級 |
| LOG_MODE | 否 | production | 日誌模式 |

---

## 常見問題

### Q1: 如何生成 Swagger 文檔？

**A:** 執行以下命令：

```bash
make build-token-admin-swagger
```

或手動執行：

```bash
cd cmd/token-admin-api
swag init -g main.go -o internal/docs --parseDependency --parseInternal
```

### Q2: 如何處理資料庫遷移？

**A:** 專案啟動時會自動執行 `pkg/database/migrate.go` 中定義的遷移。

手動執行遷移的 SQL 文件位於：`pkg/database/migrations/dev/token_admin_initial.sql`

### Q3: JWT Token 過期時間是多久？

**A:** 預設為 24 小時，可在 `pkg/config/config.go` 中修改：

```go
JWTExpirationTime: 24 * time.Hour
```

### Q4: 預設管理員帳號是什麼？

**A:** 應用程式啟動時會自動創建：
- 帳號: `admin`
- 密碼: `admin123`

建議在生產環境中立即修改此密碼。

### Q5: 如何啟用熱重載開發？

**A:** 使用 Air：

```bash
# 安裝 Air
go install github.com/air-verse/air@latest

# 執行
make run-token-admin-api
```

### Q6: 如何處理 CORS 問題？

**A:** 在 `internal/server/server.go` 中配置 CORS 中間件：

```go
import "github.com/gin-contrib/cors"

engine.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:3000"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    AllowCredentials: true,
}))
```

### Q7: 訂單和掛單的 ID 格式是什麼？

**A:** 使用 UUID 格式：
- 格式: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- 範例: `c66dc29e-fd6d-43c2-9b21-1c12a25c4226`
- 使用 `github.com/google/uuid` 套件生成

### Q8: 如何實作軟刪除？

**A:** GORM 會自動處理有 `DeletedAt` 欄位的 model：

```go
type Model struct {
    DeletedAt *time.Time `gorm:"column:deleted_at;type:timestamptz"`
}

// 軟刪除
db.Delete(&model)

// 查詢會自動過濾已刪除的記錄
db.Find(&models)

// 包含已刪除的記錄
db.Unscoped().Find(&models)
```

### Q9: 如何處理密碼？

**A:** 使用 bcrypt 加密：

```go
import "golang.org/x/crypto/bcrypt"

// 加密密碼
hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)

// 驗證密碼
err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
```

### Q10: 如何測試 API？

**A:** 三種方式：

1. **使用 Swagger UI**: http://localhost:8080/swagger/index.html
2. **使用 curl**:
   ```bash
   curl -X POST http://localhost:8080/auth/login \
     -H "Content-Type: application/json" \
     -d '{"account":"admin","password":"admin123"}'
   ```
3. **使用 Postman** 或其他 API 測試工具

---

## 參考資源

### 官方文檔

- [Go 官方文檔](https://go.dev/doc/)
- [Gin 框架文檔](https://gin-gonic.com/docs/)
- [GORM 文檔](https://gorm.io/docs/)
- [Uber FX 文檔](https://uber-go.github.io/fx/)
- [Swagger 文檔](https://swagger.io/docs/)

### 專案相關

- **Swagger UI**: http://localhost:8080/swagger/index.html
- **健康檢查**: http://localhost:8080/health-check

### 開發工具

- [Air - 熱重載工具](https://github.com/air-verse/air)
- [Swag - Swagger 生成工具](https://github.com/swaggo/swag)
- [PostgreSQL 文檔](https://www.postgresql.org/docs/)

---

## 授權

本專案採用 MIT 授權。

---

## 聯絡資訊

**開發團隊**: Token Services Team  
**專案 Repository**: golang-token-services

---

## Changelog

### v1.0.0 (2025-11-03)

**重構完成**
- ✅ 使用 Golang + Gin + GORM 重構整個專案
- ✅ 採用 Uber FX 依賴注入架構
- ✅ 實現 Clean Architecture 分層設計

**功能實現**
- ✅ JWT 認證系統與中間件
- ✅ 使用者管理系統（前台與後台）
- ✅ 角色權限管理（RBAC）
- ✅ 訂單管理系統
- ✅ 掛單管理系統（開啟/暫停/取消/刪除）
- ✅ 銀行和銀行卡管理
- ✅ 預設管理員自動創建
- ✅ Swagger API 文檔

**技術亮點**
- ✅ GORM 關聯查詢最佳化
- ✅ 統一錯誤處理與響應格式
- ✅ UUID 支援（訂單與掛單）
- ✅ 軟刪除支援
- ✅ 事務處理確保資料一致性
- ✅ 分頁查詢實作
- ✅ 熱重載開發環境（Air）

---

**最後更新日期**: 2025-11-03
