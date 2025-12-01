# PassonTW Backend Services

> 基於 Gin + GORM + FX 的微服務後端系統，包含 Token 錢包服務和 POS 商城服務

## 📋 目錄

- [專案簡介](#專案簡介)
- [技術架構](#技術架構)
- [快速開始](#快速開始)
- [專案結構](#專案結構)
- [Kubernetes 部署](#kubernetes-部署)
- [Wireframes 說明](#wireframes-說明)
- [開發指南](#開發指南)
- [API 文檔](#api-文檔)
- [資料庫設計](#資料庫設計)
- [部署指南](#部署指南)
- [常見問題](#常見問題)

---

## 專案簡介

### 產品定位

本平台包含兩個主要系統：

#### Token 錢包系統
參考幣安 C2C 交易功能開發，提供點對點數位貨幣交易服務：
- **Token App API**: 為買賣雙方提供交易介面
- **Token Admin API**: 為平台管理員提供管理工具

#### POS 商城系統
提供完整的電商平台解決方案：
- **POS Backend API**: 後台管理系統
- **POS Merchant API**: 商家服務系統

### 核心價值

- ✅ **安全可靠**: JWT 認證、資料加密、事務處理
- ✅ **易於維護**: Clean Architecture、依賴注入、模組化設計
- ✅ **高效能**: GORM ORM、連線池管理、合理的資料庫索引
- ✅ **開發友好**: Swagger 文檔、熱重載、統一錯誤處理
- ✅ **容器化部署**: Docker + Kubernetes，CI/CD 自動化

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
| 容器化 | Docker | latest | 容器化部署 |
| 編排 | Kubernetes | 1.27+ | 容器編排 |
| 配置管理 | Kustomize | latest | K8s 配置管理 |
| 熱重載 | Air | latest | 開發時自動編譯 |

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
  ├── logger.LoggerModule         # 日誌模組
  ├── middleware.MiddlewareModule # JWT 中間件
  ├── swagger.SwaggerModule       # Swagger 文檔（可選）
  ├── services.*Module            # 各業務服務模組
  ├── handlers.HandlerModule      # 處理器模組
  └── server.ServerModule         # 伺服器模組
```

---

## 快速開始

### 前置需求

- Go 1.25.1 或以上
- PostgreSQL 14 或以上
- Redis（Token APIs 需要）
- Make（可選）
- Air（可選，用於熱重載）

### 安裝步驟

#### 1. 複製專案

```bash
git clone <repository-url>
cd passontw-backend-services
```

#### 2. 安裝依賴

```bash
go mod download
```

#### 3. 配置環境變數

創建 `cmd/{service-name}/.env` 文件（例如 `cmd/token-admin-api/.env`）：

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

# Redis（Token APIs 需要）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Swagger
SWAGGER_ENABLED=true
SWAGGER_BASE_DOMAIN=localhost:8080

# 日誌配置
LOG_LEVEL=info
LOG_MODE=production
```

#### 4. 啟動資料庫

**使用 Docker:**
```bash
docker run --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=sk-demo \
  -p 5432:5432 \
  -d postgres:14
```

**Redis（Token APIs）:**
```bash
docker run --name redis \
  -p 6379:6379 \
  -d redis:latest
```

#### 5. 啟動服務

**使用 Make（推薦）:**
```bash
# Token Admin API
make build-token-admin-swagger
make run-token-admin-api

# Token App API
make build-token-app-swagger
make run-token-app-api

# POS Backend API
make run-pos-backend-api

# POS Merchant API
make run-pos-merchant-api
```

**或直接執行:**
```bash
go run cmd/token-admin-api/main.go
```

#### 6. 驗證服務

```bash
# 健康檢查
curl http://localhost:8080/health-check

# Swagger UI
open http://localhost:8080/swagger/index.html
```

---

## 專案結構

```
passontw-backend-services/
├── cmd/                                # 應用程式入口
│   ├── token-admin-api/
│   │   ├── main.go                     # Admin API 入口
│   │   ├── .env                        # 環境變數
│   │   └── internal/
│   │       ├── docs/                   # Swagger 文檔（自動生成）
│   │       ├── handlers/               # HTTP 處理器
│   │       ├── services/               # 業務邏輯層
│   │       ├── interfaces/             # 介面定義與 DTOs
│   │       ├── initializers/           # 初始化邏輯
│   │       └── server/                 # 伺服器配置
│   ├── token-app-api/
│   ├── pos-backend-api/
│   └── pos-merchant-api/
├── pkg/                                # 共用套件
│   ├── auth/                           # JWT 認證
│   ├── config/                         # 配置管理
│   ├── database/                       # 資料庫連線
│   ├── logger/                         # 日誌模組
│   ├── middleware/                     # 中間件
│   ├── models/                         # GORM 資料模型
│   ├── response/                       # 統一響應格式
│   └── swagger/                        # Swagger 模組
├── k8s/                                # Kubernetes 配置
│   ├── base/                           # 共用配置（Patches）
│   ├── services/                       # 各服務的專屬配置
│   ├── overlays/                       # 環境特定的覆蓋配置
│   └── secrets/                        # Secret 示例文件
├── deploy/                             # Docker 配置
│   ├── token-admin-api/Dockerfile
│   ├── token-app-api/Dockerfile
│   ├── pos-backend-api/Dockerfile
│   └── pos-merchant-api/Dockerfile
├── documents/                          # 專案文檔
│   ├── README.md                       # 本文檔
│   └── wireframes/                     # UI Wireframes
│       ├── shoppingcar-backend-web/    # 商城後台
│       ├── shoppingcar-froentend-app/  # 商城 APP
│       ├── token-admin-web/            # Token 管理後台
│       └── token-app/                  # Token APP
├── scripts/                            # 部署腳本
├── go.mod                              # Go 模組定義
├── go.sum                              # Go 依賴校驗
├── Makefile                            # 建置指令
└── .air.toml                           # Air 熱重載配置
```

---

## Kubernetes 部署

### K8s 配置結構

```
k8s/
├── base/                               # 共用配置（Patches）
│   ├── common-patches.yaml             # 安全設置、資源限制
│   ├── common-secrets-env.yaml         # Database + JWT Secrets
│   └── redis-secrets-env.yaml          # Redis Secrets（Token APIs）
│
├── services/                           # 各服務的專屬配置
│   ├── token-admin-api/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── kustomization.yaml
│   ├── token-app-api/
│   ├── pos-backend-api/
│   └── pos-merchant-api/
│
├── overlays/                           # 環境特定的覆蓋配置
│   └── staging/
│       ├── namespace.yaml
│       ├── ingress.yaml
│       └── kustomization.yaml
│
└── secrets/                            # Secret 示例文件
    ├── database-secret.yaml.example
    ├── jwt-secret.yaml.example
    └── redis-secret.yaml.example
```

### 設計理念

#### 1. 共用配置（DRY 原則）
- **Base Patches**: 所有服務共用的配置集中在 `k8s/base/`
- **自動應用**: 通過 Kustomize 的 `patchesStrategicMerge` 自動應用
- **可覆蓋**: 服務可以覆蓋 base 中的任何配置

#### 2. 服務隔離
- 每個服務有獨立的目錄
- 自包含配置：deployment, service, configmap
- 易於維護，修改一個服務不影響其他服務

#### 3. 環境覆蓋
- 基礎配置在服務目錄中定義
- 環境配置在 `overlays/staging/` 中覆蓋
- 可擴展，未來可添加 `overlays/production/`

### Base 共用配置

`k8s/base/common-patches.yaml` 包含所有服務共用的配置：

- **安全設置**:
  - `imagePullSecrets: ghcr-pull-secret`
  - `runAsNonRoot: true`
  - `readOnlyRootFilesystem: true`
  - `allowPrivilegeEscalation: false`

- **資源限制**:
  - Requests: `128Mi / 100m`
  - Limits: `512Mi / 500m`

### 部署方式

#### 方式 1：CI/CD 自動部署（推薦）

GitHub Actions 自動處理：
1. 編譯並推送 Docker 鏡像
2. 更新 Kustomize 鏡像標籤
3. 應用配置到 Kubernetes
4. 驗證部署狀態

#### 方式 2：手動部署

```bash
# 部署所有服務到 Staging
cd k8s/overlays/staging
kubectl apply -k .

# 部署單個服務
kubectl apply -k k8s/services/token-admin-api

# 查看部署狀態
kubectl get pods -n passontw-services-staging
```

### Kustomize 使用

#### 設置鏡像標籤

```bash
cd k8s/overlays/staging
kustomize edit set image \
  ghcr.io/passoncomtw/token-admin-api:develop-abc1234
kubectl apply -k .
```

#### 預覽配置

```bash
# 查看生成的配置（不應用）
kustomize build k8s/overlays/staging

# 查看差異
kubectl diff -k k8s/overlays/staging
```

### Ingress 和 HTTPS

所有服務的路由在 `k8s/overlays/staging/ingress.yaml` 中統一管理：

- **Token Admin API**: `https://token-admin-api.passon.tw`
- **Token App API**: `https://token-app-api.passon.tw`
- **POS Backend API**: `https://pos-backend-api.passon.tw`
- **POS Merchant API**: `https://pos-merchant-api.passon.tw`

使用 **cert-manager + Let's Encrypt** 自動生成和續期證書。

### Secrets 管理

```bash
# 創建 Secrets
kubectl apply -f k8s/secrets/database-secret.yaml
kubectl apply -f k8s/secrets/jwt-secret.yaml
kubectl apply -f k8s/secrets/redis-secret.yaml

# GHCR Pull Secret
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_PAT> \
  --namespace=passontw-services-staging
```

### 監控和調試

```bash
# 查看 Pods 狀態
kubectl get pods -n passontw-services-staging

# 查看日志
kubectl logs -f <POD_NAME> -n passontw-services-staging

# 查看部署歷史
kubectl rollout history deployment/token-admin-api -n passontw-services-staging

# 手動回滾
kubectl rollout undo deployment/token-admin-api -n passontw-services-staging
```

---

## Wireframes 說明

專案包含完整的 UI Wireframes，位於 `documents/wireframes/` 目錄。

### 購物商城系統

#### 商城後台 (`shoppingcar-backend-web/`)

**用途**: 管理員後台，管理多個商家、商品、會員和訂單

**核心功能**:
- 商家管理（新增、編輯、查看）
- 每個商家下的商品列表
- 每個商家下的會員列表
- 每個商家下的訂單列表

**頁面**:
- `login.html` - 管理員登入
- `merchants.html` - 商家列表
- `merchant-create.html` - 新增商家
- `merchant-detail.html` - 商家詳情（含商品/會員/訂單標籤頁）

**圖片資源**:
- 一般圖片: `https://picsum.photos/`
- 頭像: `https://pravatar.cc/`

#### 商城 APP (`shoppingcar-froentend-app/`)

**用途**: 使用者購物 APP，單一商家的商品瀏覽和訂單管理

**核心功能**:
- 電話密碼登入
- 商品列表瀏覽
- 商品詳情查看
- 購物車管理
- 綠界金流結帳
- 訂單列表和詳情

**頁面**:
- `login.html` - 使用者登入
- `home.html` - 商品列表（首頁）
- `product-detail.html` - 商品詳情
- `shoppingcar.html` - 購物車
- `order-success.html` - 訂單完成
- `orders.html` - 訂單列表
- `order-detail.html` - 訂單詳情
- `profile.html` - 使用者資訊

**特色**:
- iOS 風格設計
- 固定 iPhone 尺寸（375×812）
- 整合綠界金流
- 底部導航列

**訂單狀態**:
- 尚未付款
- 已取消訂單
- 付款失敗
- 已完成

### Token 錢包系統

#### Token 管理後台 (`token-admin-web/`)

**用途**: 管理 Token 錢包系統的用戶、訂單、銀行和收付帳戶

**核心功能**:
- 用戶管理
- 訂單管理（含待處理訂單標籤頁）
- 銀行管理
- 收付帳戶

**頁面**:
- `login.html` - 管理員登入
- `user-list.html` - 用戶列表
- `user-detail.html` - 用戶詳情
- `order-list.html` - 訂單列表（含標籤頁）
- `order-detail.html` - 訂單詳情
- `order-history.html` - 訂單歷史
- `bank-management.html` - 銀行管理
- `payment-accounts.html` - 收付帳戶

**設計規範**:
- 黃色主題 (`#ffcc00`)
- 瀏覽器框架設計
- 統一的側邊欄導航
- 所有頁面有登出按鈕

#### Token APP (`token-app/`)

**用途**: C2C 數位貨幣交易 APP

**核心功能**:
- 使用者註冊登入
- 掛單管理（買入/賣出）
- 訂單管理
- 銀行卡管理
- 交易確認

**頁面包含**:
- 登入/註冊頁面
- 首頁（掛單列表）
- 創建掛單頁面
- 訂單列表和詳情
- 交易確認頁面
- 使用者資訊

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

type ExampleServiceInterface interface {
    Create(req *ExampleRequest) (*ExampleResponse, error)
    GetList() ([]*ExampleResponse, error)
}
```

#### 步驟 3: 實作服務層

在 `internal/services/` 中實作業務邏輯：

```go
// internal/services/exampleService.go
package services

import (
    "go.uber.org/fx"
    "gorm.io/gorm"
)

type ExampleService struct {
    db *gorm.DB
}

func NewExampleService(db *gorm.DB) *ExampleService {
    return &ExampleService{db: db}
}

// 實作服務方法...

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
    "github.com/gin-gonic/gin"
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
// @Success 200 {object} response.Response
// @Router /examples [post]
func (h *ExampleHandlers) Create(c *gin.Context) {
    // 實作邏輯...
}
```

#### 步驟 5: 註冊路由

在 `internal/server/router.go` 中註冊路由。

#### 步驟 6: 註冊模組到 main.go

```go
func main() {
    fx.New(
        config.ConfigModule,
        database.DatabaseModule,
        // ... 其他模組
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

#### 使用 Preload 載入關聯資料

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

#### 使用事務保證資料一致性

```go
err := s.db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&user).Error; err != nil {
        return err // 自動 rollback
    }
    
    wallet := models.Wallet{UserID: &user.ID}
    if err := tx.Create(&wallet).Error; err != nil {
        return err // 自動 rollback
    }
    
    return nil // 自動 commit
})
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

# 程式碼品質
go fmt ./...                    # 格式化
go vet ./...                    # 靜態分析
go mod tidy                     # 整理依賴
```

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
| **使用者** | `/users` | GET | 查詢使用者列表 |
| **使用者** | `/users/{userId}` | GET | 查詢使用者詳情 |
| **訂單** | `/orders` | GET | 查詢訂單列表 |
| **訂單** | `/orders/{orderId}` | PUT | 更新訂單 |

### 完整 API 文檔

訪問 Swagger UI 查看完整的互動式 API 文檔：  

- Token Admin API: `http://localhost:8080/swagger/index.html`
- Token App API: `http://localhost:8081/swagger/index.html`
- POS Backend API: `http://localhost:8082/swagger/index.html`
- POS Merchant API: `http://localhost:8083/swagger/index.html`

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
    type INTEGER NOT NULL,
    status INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);
```

#### Orders (訂單)

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount NUMERIC(18,0) NOT NULL,
    status INTEGER NOT NULL,
    type INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
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
```

---

## 部署指南

### Docker 部署

#### 建置映像檔

```bash
# Token Admin API
docker build -f deploy/token-admin-api/Dockerfile -t token-admin-api:latest .

# 執行容器
docker run -d \
  --name token-admin-api \
  -p 8080:8080 \
  -e DB_HOST=postgres-host \
  -e JWT_SECRET=your_secret_key \
  token-admin-api:latest
```

#### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: sk-demo
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  redis:
    image: redis:latest
    ports:
      - "6379:6379"

  token-admin-api:
    build:
      context: .
      dockerfile: deploy/token-admin-api/Dockerfile
    ports:
      - "8080:8080"
    environment:
      DB_HOST: postgres
      REDIS_HOST: redis
      JWT_SECRET: your_secret_key
    depends_on:
      - postgres
      - redis
```

### Kubernetes 部署

詳見 [Kubernetes 部署](#kubernetes-部署) 章節。

### 環境變數說明

| 變數名稱 | 必填 | 預設值 | 說明 |
|---------|------|--------|------|
| HTTP_PORT | 否 | 8080 | HTTP 伺服器端口 |
| JWT_SECRET | 是 | - | JWT 密鑰 |
| DB_HOST | 是 | localhost | 資料庫主機 |
| DB_PORT | 是 | 5432 | 資料庫端口 |
| DB_NAME | 是 | sk-demo | 資料庫名稱 |
| DB_USER | 是 | postgres | 資料庫使用者 |
| DB_PASSWORD | 是 | - | 資料庫密碼 |
| REDIS_HOST | 否 | localhost | Redis 主機（Token APIs） |
| SWAGGER_ENABLED | 否 | true | 啟用 Swagger |
| LOG_LEVEL | 否 | info | 日誌等級 |

---

## 常見問題

### Q1: 如何生成 Swagger 文檔？

```bash
make build-token-admin-swagger
```

或手動執行：

```bash
cd cmd/token-admin-api
swag init -g main.go -o internal/docs --parseDependency --parseInternal
```

### Q2: 如何處理資料庫遷移？

專案啟動時會自動執行 `pkg/database/migrate.go` 中定義的遷移。

### Q3: JWT Token 過期時間是多久？

預設為 24 小時，可在 `pkg/config/config.go` 中修改。

### Q4: 如何啟用熱重載開發？

```bash
# 安裝 Air
go install github.com/air-verse/air@latest

# 執行
make run-token-admin-api
```

### Q5: .env 文件應該放在哪裡？

放在各服務目錄下：`cmd/{service-name}/.env`

系統會自動載入：
1. 當前目錄的 `.env`（優先）
2. `cmd/{service-name}/.env`（從專案根目錄執行時）

### Q6: 如何部署到 Kubernetes？

```bash
# 部署到 Staging
cd k8s/overlays/staging
kubectl apply -k .

# 查看部署狀態
kubectl get pods -n passontw-services-staging
```

### Q7: 如何查看服務日誌？

```bash
# Kubernetes
kubectl logs -f deployment/token-admin-api -n passontw-services-staging

# Docker
docker logs -f token-admin-api

# 本地開發
# 日誌會直接輸出到終端
```

---

## 參考資源

### 官方文檔

- [Go 官方文檔](https://go.dev/doc/)
- [Gin 框架文檔](https://gin-gonic.com/docs/)
- [GORM 文檔](https://gorm.io/docs/)
- [Uber FX 文檔](https://uber-go.github.io/fx/)
- [Kubernetes 文檔](https://kubernetes.io/docs/)
- [Kustomize 文檔](https://kustomize.io/)

### 開發工具

- [Air - 熱重載工具](https://github.com/air-verse/air)
- [Swag - Swagger 生成工具](https://github.com/swaggo/swag)
- [PostgreSQL 文檔](https://www.postgresql.org/docs/)

---

## 授權

本專案採用 MIT 授權。

---

## 聯絡資訊

**開發團隊**: PassonTW Backend Team  
**專案 Repository**: passontw-backend-services

---

## Changelog

### v2.0.0 (2025-12)

**架構升級**
- ✅ 重構 K8s 配置為服務隔離結構
- ✅ 實現 Base Patches 共用配置
- ✅ 優化 CI/CD 觸發路徑

**新增功能**
- ✅ Swagger 模組化（pkg/swagger）
- ✅ 動態 .env 載入機制
- ✅ 完整的 Wireframes

**文檔改進**
- ✅ 整合所有文檔到單一 README
- ✅ 完整的 K8s 部署指南
- ✅ Wireframes 設計說明

### v1.0.0 (2025-11)

**重構完成**
- ✅ 使用 Golang + Gin + GORM 重構整個專案
- ✅ 採用 Uber FX 依賴注入架構
- ✅ 實現 Clean Architecture 分層設計

**功能實現**
- ✅ JWT 認證系統與中間件
- ✅ 使用者管理系統
- ✅ 訂單管理系統
- ✅ 銀行和銀行卡管理
- ✅ Swagger API 文檔

---

**最後更新日期**: 2025-12-01
