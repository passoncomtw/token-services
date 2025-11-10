# Golang Token Services - 部署指南

本目錄包含 Golang Token Services 各個服務的 Docker 部署配置。

## 📁 目錄結構

```
deploy/
├── token-admin-api/      # Token 管理後台 API
│   ├── Dockerfile
│   └── README.md
├── token-app-api/        # Token App 前台 API
│   ├── Dockerfile
│   └── README.md
├── Dockerfile.template   # 新服務 Dockerfile 模板
└── README.md            # 本文件（含新增服務完整指南）
```

## 🚀 自動化建置 (GitHub Actions)

專案已配置 GitHub Actions 自動建置流程，當推送程式碼到 `develop` 或 `main` 分支時，會自動：

1. 建置 Docker 映像
2. 推送到 GitHub Container Registry (ghcr.io)
3. 支援平台：linux/amd64
4. 使用 Go modules 和 build cache 加速建置
5. 解決 macOS runner 的鑰匙圈問題

### Workflow 文件

- `.github/workflows/build-token-admin-api.yml` - Token Admin API 建置流程
- `.github/workflows/build-token-app-api.yml` - Token App API 建置流程

### 觸發條件

當以下檔案變更時會觸發建置：
- `cmd/[service]/**` - 服務程式碼
- `pkg/**` - 共用套件
- `deploy/[service]/**` - Dockerfile 等部署檔案
- `go.mod`, `go.sum` - Go 模組依賴

## ➕ 新增服務指南

本節說明如何在 token-services 專案中添加新的微服務，並避免服務之間的衝突。

### 📋 專案結構概覽

```
token-services/
├── cmd/
│   ├── token-admin-api/         # 管理後台 API
│   ├── token-app-api/            # 前端應用 API
│   └── token-{新服務}-api/       # 您的新服務
├── pkg/                          # 共用程式碼
│   ├── auth/
│   ├── config/
│   ├── database/
│   ├── logger/
│   ├── middleware/
│   ├── models/
│   └── response/
├── deploy/
│   ├── token-admin-api/
│   ├── token-app-api/
│   ├── token-{新服務}-api/       # 新服務的部署配置
│   └── Dockerfile.template       # Dockerfile 模板
├── scripts/
│   └── create-new-service.sh     # 自動創建新服務腳本
└── .github/workflows/
    ├── build-token-admin-api.yml
    ├── build-token-app-api.yml
    └── build-token-{新服務}-api.yml  # 新服務的 CI/CD
```

### 🚀 快速創建新服務

**推薦方式：使用自動化腳本**

```bash
# 在專案根目錄執行
./scripts/create-new-service.sh payment

# 腳本會自動完成以下步驟：
# ✅ 創建目錄結構
# ✅ 創建 Dockerfile
# ✅ 更新所有現有服務的 Dockerfile（添加 --exclude）
# ✅ 創建 GitHub Actions workflow
```

**或手動創建：**

#### 步驟 1：創建服務目錄結構

```bash
# 設定服務名稱
SERVICE_NAME="payment"  # 替換為您的服務名稱

# 創建服務目錄
mkdir -p cmd/token-${SERVICE_NAME}-api/internal/{handlers,interfaces,middlewares,services,server,initializers}

# 創建 main.go
cat > cmd/token-${SERVICE_NAME}-api/main.go << 'EOF'
package main

import "log"

func main() {
    log.Println("Token service starting...")
    // TODO: 實作服務邏輯
}
EOF
```

#### 步驟 2：創建 Dockerfile

```bash
# 創建部署目錄
mkdir -p deploy/token-${SERVICE_NAME}-api

# 複製並修改模板
cp deploy/Dockerfile.template deploy/token-${SERVICE_NAME}-api/Dockerfile

# macOS
sed -i '' "s/{SERVICE_NAME}/${SERVICE_NAME}/g" deploy/token-${SERVICE_NAME}-api/Dockerfile

# Linux
sed -i "s/{SERVICE_NAME}/${SERVICE_NAME}/g" deploy/token-${SERVICE_NAME}-api/Dockerfile
```

#### 步驟 2.5：更新現有服務的 Dockerfile（重要！）

新增服務後，需要在**所有現有服務**的 Dockerfile 中添加 `--exclude` 排除新服務：

```bash
# 範例：如果新增了 payment-api，需要更新 admin-api 和 app-api 的 Dockerfile

# 在 deploy/token-admin-api/Dockerfile 中：
swag init ... \
  --exclude cmd/token-app-api \
  --exclude cmd/token-payment-api \      ⬅️ 添加這行
  --parseDependency --parseInternal

# 在 deploy/token-app-api/Dockerfile 中：
swag init ... \
  --exclude cmd/token-admin-api \
  --exclude cmd/token-payment-api \      ⬅️ 添加這行
  --parseDependency --parseInternal
```

#### 步驟 3：創建 GitHub Actions Workflow

```bash
# 複製現有 workflow
cp .github/workflows/build-token-admin-api.yml \
   .github/workflows/build-token-${SERVICE_NAME}-api.yml

# 替換服務名稱（需手動編輯或使用 sed）
# 主要修改：
# - name: Build Token {服務名稱} API
# - IMAGE_NAME: token-{服務名稱}-api
# - paths: cmd/token-{服務名稱}-api/**
# - file: ./deploy/token-{服務名稱}-api/Dockerfile
```

#### 步驟 4：調整埠號

在 Dockerfile 中設定不同的埠號：

| 服務 | 埠號 |
|------|------|
| token-admin-api | 8080 |
| token-app-api | 8081 |
| token-payment-api | 8082 |
| token-notification-api | 8083 |

```dockerfile
# 在 Dockerfile 中
EXPOSE 8082  # 使用不同的埠號
```

### 🎯 關鍵配置：避免服務衝突

**⚠️ 重要：使用 `--exclude` 參數排除其他服務**

在 Dockerfile 的 swag 配置中，必須使用 `--exclude` 參數排除其他服務目錄：

```dockerfile
# ✅ 正確做法（排除其他服務）
swag init -g cmd/token-admin-api/main.go \
  -o cmd/token-admin-api/internal/docs \
  --dir ./ \
  --exclude cmd/token-app-api \          ⬅️ 關鍵：排除其他服務目錄
  --parseDependency --parseInternal
```

```dockerfile
# ❌ 錯誤做法（會掃描所有目錄，導致類型衝突）
swag init -g cmd/token-{服務}-api/main.go \
  --dir ./ \
  --parseDependency --parseInternal
```

**為什麼使用 `--exclude` 而不是 `--dir`？**

雖然理論上 `--dir cmd/token-admin-api,pkg` 看起來更優雅，但在實際運行中會出現問題：
- `pkg` 目錄本身沒有 Go 文件，只是子目錄的容器
- swag 嘗試將 `pkg` 作為包處理時會失敗
- 錯誤：`no Go files in /app/pkg`

因此，我們使用 `--dir ./` 掃描整個專案，然後用 `--exclude` 排除其他服務目錄。

#### 為什麼這麼重要？

假設有以下結構：

```
cmd/
├── token-admin-api/internal/interfaces/LoginRequest (Admin 版本)
├── token-app-api/internal/interfaces/LoginRequest (App 版本)
└── token-payment-api/internal/interfaces/LoginRequest (Payment 版本)
```

**問題場景：**
- 如果不使用 `--dir`，swag 會掃描所有目錄
- 發現其他服務的 Swagger 註解
- 嘗試解析其他服務的類型
- 導致建置失敗：`cannot find type definition`

**解決方案：**
- 使用 `--dir cmd/token-payment-api,pkg`
- 只掃描當前服務目錄
- 完全隔離，無需排除其他服務
- 可無限擴展

### 🔍 掃描範圍說明

`--dir cmd/token-{服務}-api,pkg` 的含義：

```plaintext
掃描範圍：
├── cmd/token-{服務}-api/    ✅ 掃描此目錄
│   ├── main.go               ✅ 主程式入口
│   └── internal/             ✅ 服務內部代碼
│       ├── handlers/         ✅ API handlers
│       ├── interfaces/       ✅ 請求/回應結構
│       └── services/         ✅ 業務邏輯
│
├── pkg/                      ✅ 掃描共用程式碼
│   ├── models/              ✅ 資料模型
│   ├── response/            ✅ 統一回應格式
│   └── ...
│
└── cmd/token-other-api/      ❌ 不掃描其他服務
```

**為什麼要包含 `pkg`？**
- `pkg` 包含所有服務共用的程式碼
- Swagger 註解可能引用 `pkg` 中的類型
- swag 需要掃描 `pkg` 才能正確解析這些類型

### 📝 完整創建腳本

專案已包含自動化腳本：`scripts/create-new-service.sh`

使用方式：

```bash
# 在專案根目錄執行
./scripts/create-new-service.sh payment

# 腳本會自動：
# ✓ 創建目錄結構
# ✓ 創建 Dockerfile
# ✓ 更新所有現有服務的 Dockerfile（添加 --exclude）
# ✓ 創建 GitHub Actions workflow
```

**腳本內容：**

```bash
#!/bin/bash
# create-new-service.sh - 創建新服務的輔助腳本

SERVICE_NAME=$1

if [ -z "$SERVICE_NAME" ]; then
  echo "使用方法: ./scripts/create-new-service.sh {服務名稱}"
  echo "範例: ./scripts/create-new-service.sh payment"
  exit 1
fi

echo "🚀 創建新服務: token-${SERVICE_NAME}-api"

# 1. 創建目錄結構
echo "📁 創建目錄結構..."
mkdir -p cmd/token-${SERVICE_NAME}-api/internal/{handlers,interfaces,middlewares,services,server,initializers}
mkdir -p deploy/token-${SERVICE_NAME}-api

# 2. 創建 main.go
echo "📝 創建 main.go..."
cat > cmd/token-${SERVICE_NAME}-api/main.go << 'EOF'
package main

import "log"

func main() {
    log.Println("Token service starting...")
    // TODO: 實作服務邏輯
}
EOF

# 3. 複製 Dockerfile
echo "📄 創建 Dockerfile..."
cp deploy/Dockerfile.template deploy/token-${SERVICE_NAME}-api/Dockerfile
sed -i '' "s/{SERVICE_NAME}/${SERVICE_NAME}/g" deploy/token-${SERVICE_NAME}-api/Dockerfile

# 3.5 更新現有服務的 Dockerfile（添加 --exclude）
echo "🔧 更新現有服務的 Dockerfile..."
for dockerfile in deploy/token-*/Dockerfile; do
  if [[ "$dockerfile" != "deploy/token-${SERVICE_NAME}-api/Dockerfile" ]]; then
    # 在 --parseDependency 前添加新的 --exclude 行
    sed -i '' "/--parseDependency/i\\
      --exclude cmd/token-${SERVICE_NAME}-api \\\\
" "$dockerfile"
    echo "   ✓ 更新 $dockerfile"
  fi
done

# 4. 複製 workflow
echo "⚙️  創建 GitHub Actions workflow..."
cp .github/workflows/build-token-admin-api.yml \
   .github/workflows/build-token-${SERVICE_NAME}-api.yml
sed -i '' "s/admin/${SERVICE_NAME}/g" .github/workflows/build-token-${SERVICE_NAME}-api.yml
sed -i '' "s/Admin/${SERVICE_NAME^}/g" .github/workflows/build-token-${SERVICE_NAME}-api.yml

echo "✅ 服務創建完成！"
echo ""
echo "📝 已完成的操作："
echo "   ✓ 創建服務目錄結構"
echo "   ✓ 創建 Dockerfile"
echo "   ✓ 更新所有現有服務的 Dockerfile（添加 --exclude）"
echo "   ✓ 創建 GitHub Actions workflow"
echo ""
echo "🔜 接下來的步驟："
echo "1. 實作服務邏輯（cmd/token-${SERVICE_NAME}-api/）"
echo "2. 調整 Dockerfile 中的埠號（EXPOSE）"
echo "3. 本地測試建置："
echo "   docker build -t token-${SERVICE_NAME}-api:test -f deploy/token-${SERVICE_NAME}-api/Dockerfile ."
echo "4. 檢查所有 Dockerfile 的 --exclude 配置是否正確"
echo "5. 提交並推送："
echo "   git add ."
echo "   git commit -m \"feat: 添加 ${SERVICE_NAME} API 服務並更新 Swagger 隔離配置\""
echo "   git push origin develop"
```

### ✅ 驗證配置

#### 1. 本地建置測試

```bash
# 建置 Docker 映像
docker build -t token-{服務}-api:test -f deploy/token-{服務}-api/Dockerfile .

# 如果建置成功，表示配置正確
```

#### 2. 檢查 Swagger 文檔

建置成功後，檢查生成的文檔：

```bash
ls -la cmd/token-{服務}-api/internal/docs/

# 應該看到：
# - docs.go
# - swagger.json
# - swagger.yaml
```

#### 3. 檢查服務隔離

在建置過程中，不應該看到其他服務的類型錯誤：

```bash
# ❌ 如果看到這樣的錯誤，表示配置有問題：
# "cannot find type definition: token_app_api_internal_interfaces.XXX"

# ✅ 正確的建置不會有任何類型錯誤
```

### 🎓 最佳實踐

#### 1. 服務命名規範

```
token-{功能}-api

範例：
- token-payment-api       # 支付服務
- token-notification-api  # 通知服務
- token-analytics-api     # 分析服務
```

#### 2. 目錄結構一致性

所有服務保持相同的內部結構：

```
internal/
├── handlers/      # HTTP handlers
├── interfaces/    # 請求/回應結構
├── services/      # 業務邏輯
├── server/        # 服務器配置
├── middlewares/   # 中間件
└── initializers/  # 初始化邏輯
```

#### 3. 共用代碼管理

`pkg/` 中只放置真正共用的代碼：

```
pkg/
├── auth/          # 認證相關
├── config/        # 配置管理
├── database/      # 資料庫
├── logger/        # 日誌系統
├── middleware/    # 共用中間件
├── models/        # 資料模型
└── response/      # 統一回應格式
```

#### 4. 埠號管理

維護一個埠號分配表，避免衝突：

| 服務 | 埠號 | 用途 |
|------|------|------|
| token-admin-api | 8080 | 管理後台 |
| token-app-api | 8081 | 前端應用 |
| token-payment-api | 8082 | 支付服務 |
| token-notification-api | 8083 | 通知服務 |
| ... | ... | ... |

### ⚠️ 常見問題

#### Q1：為什麼建置時出現 "cannot find type definition" 錯誤？

**原因：** swag 掃描了其他服務的目錄，但找不到對應的類型定義。

**解決：** 檢查 Dockerfile 中的 `swag init` 命令，確保使用了 `--dir` 參數：

```dockerfile
swag init -g cmd/token-{服務}-api/main.go \
  --dir cmd/token-{服務}-api,pkg \    ⬅️ 確認這行
  --parseDependency --parseInternal
```

#### Q2：新增服務後，其他服務的建置失敗了？

**原因：** 可能使用了 `--exclude` 方式，需要手動排除新服務。

**解決：** 改用 `--dir` 方式，完全隔離各服務。

#### Q3：如何在本地測試新服務？

```bash
# 1. 建置映像
docker build -t token-{服務}-api:test -f deploy/token-{服務}-api/Dockerfile .

# 2. 運行容器
docker run -d \
  --name token-{服務}-api \
  -p 8082:8082 \
  -e DB_HOST=localhost \
  token-{服務}-api:test

# 3. 測試健康檢查
curl http://localhost:8082/health

# 4. 查看 Swagger 文檔
open http://localhost:8082/swagger/index.html
```

### 📊 方案對比

| 特性 | 無隔離 ❌ | 使用 --exclude ⚠️ | 理想方案（不可行）|
|------|-----------|-------------------|-------------------|
| 類型衝突 | 會發生 | 不會發生 ✅ | 不會發生 ✅ |
| 可擴展性 | N/A | 需手動維護 | 自動隔離 |
| 維護成本 | 高（無法建置）| 中等（N×M） | 低（N） |
| 錯誤風險 | 100% | 中等（可能遺漏）| 低 |
| 新增服務 | 建置失敗 | 需更新所有 Dockerfile | 無需修改 |
| 建置速度 | - | 正常 | 正常 |

*N = 服務數量，M = 需要排除的服務數量*

**說明：**
- ❌ **無隔離**：會導致 `cannot find type definition` 錯誤，完全無法建置
- ⚠️ **使用 --exclude**：當前採用的方案，需要維護排除列表，但可以正常運作
- 🔮 **理想方案**：`--dir cmd/service,pkg` 在理論上最優，但 swag 無法處理空的 `pkg` 目錄

## 🛠️ 本地建置

### Token Admin API

```bash
# 建置映像
docker build -f deploy/token-admin-api/Dockerfile -t token-admin-api:latest .

# 執行容器
docker run -d \
  --name token-admin-api \
  -p 8080:8080 \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_NAME=token_services \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  token-admin-api:latest
```

### Token App API

```bash
# 建置映像
docker build -f deploy/token-app-api/Dockerfile -t token-app-api:latest .

# 執行容器
docker run -d \
  --name token-app-api \
  -p 8081:8081 \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_NAME=token_services \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  token-app-api:latest
```

## 📦 從 GitHub Container Registry 拉取

### Token Admin API

```bash
# 拉取最新版本
docker pull ghcr.io/{你的組織}/token-admin-api:develop

# 拉取特定版本
docker pull ghcr.io/{你的組織}/token-admin-api:main
docker pull ghcr.io/{你的組織}/token-admin-api:develop-abc1234
docker pull ghcr.io/{你的組織}/token-admin-api:sha-abc1234
```

### Token App API

```bash
# 拉取最新版本
docker pull ghcr.io/{你的組織}/token-app-api:develop

# 拉取特定版本
docker pull ghcr.io/{你的組織}/token-app-api:main
docker pull ghcr.io/{你的組織}/token-app-api:develop-abc1234
docker pull ghcr.io/{你的組織}/token-app-api:sha-abc1234
```

## 🐳 Docker Compose 部署

創建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: token-services-db
    environment:
      POSTGRES_DB: token_services
      POSTGRES_USER: token_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - token-network

  token-admin-api:
    image: ghcr.io/{你的組織}/token-admin-api:develop
    container_name: token-admin-api
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: token_services
      DB_USER: token_user
      DB_PASSWORD: your_secure_password
      HTTP_PORT: 8080
      LOG_LEVEL: info
      LOG_MODE: production
    ports:
      - "8080:8080"
    networks:
      - token-network
    restart: unless-stopped

  token-app-api:
    image: ghcr.io/{你的組織}/token-app-api:develop
    container_name: token-app-api
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: token_services
      DB_USER: token_user
      DB_PASSWORD: your_secure_password
      HTTP_PORT: 8081
      LOG_LEVEL: info
      LOG_MODE: production
    ports:
      - "8081:8081"
    networks:
      - token-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  token-network:
    driver: bridge
```

啟動服務：

```bash
docker-compose up -d
```

## 🔧 環境變數

### 資料庫配置

- `DB_HOST` - 資料庫主機位址
- `DB_PORT` - 資料庫埠號 (預設: 5432)
- `DB_NAME` - 資料庫名稱
- `DB_USER` - 資料庫使用者
- `DB_PASSWORD` - 資料庫密碼
- `DB_SSLMODE` - SSL 模式 (預設: disable)

### 服務配置

- `HTTP_PORT` - HTTP 服務埠號
  - Token Admin API: 8080
  - Token App API: 8081

### 日誌配置

- `LOG_LEVEL` - 日誌級別 (debug, info, warn, error, fatal)
- `LOG_MODE` - 日誌模式 (development, production)

### JWT 配置

- `JWT_SECRET` - JWT 密鑰
- `JWT_EXPIRE_HOURS` - Token 過期時間（小時）

## 🔍 健康檢查

### Token Admin API

```bash
curl http://localhost:8080/health
curl http://localhost:8080/health-check
```

### Token App API

```bash
curl http://localhost:8081/health
curl http://localhost:8081/health-check
```

預期回應：

```json
{
  "success": true,
  "data": {
    "status": "WORKING"
  }
}
```

## 📊 Swagger API 文檔

### Token Admin API

訪問 Swagger UI：
```
http://localhost:8080/swagger/index.html
```

### Token App API

訪問 Swagger UI：
```
http://localhost:8081/swagger/index.html
```

## 🏗️ 多階段建置說明

Dockerfile 採用多階段建置以優化映像大小和建置速度：

### 第一階段 (Builder)

**基礎映像：** `golang:1.23-alpine`

**優化特性：**
- ✅ BuildKit cache mounts（加速依賴下載）
- ✅ 分層快取（go.mod/go.sum 獨立層）
- ✅ 中國 GOPROXY 鏡像（goproxy.cn）
- ✅ `-trimpath` 編譯參數（減小二進制大小）
- ✅ Swagger 服務隔離（`--dir` 參數）

**建置步驟：**
1. 安裝建置工具（git, ca-certificates, tzdata）
2. 複製並下載 Go 模組依賴（cache mount）
3. 生成 Swagger 文檔（只掃描當前服務）
4. 編譯 Go 應用程式（使用 build cache）

### 第二階段 (Runtime)

**基礎映像：** `scratch`（最小化映像）

**特點：**
- ✅ 僅包含編譯好的二進位檔案
- ✅ 複製 SSL 憑證（支援 HTTPS）
- ✅ 無作業系統層（最小攻擊面）
- ✅ 最終映像大小：約 10-15 MB

### 快取策略

專案使用三層快取提升建置速度：

```plaintext
┌─────────────────────────────────────┐
│ GitHub Actions Cache                │
│ • Go modules (~/.cache/go-build)    │
│ • Go pkg (~/go/pkg/mod)             │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ Docker BuildKit Cache (GHA)         │
│ • type=gha                          │
│ • mode=max                          │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ Docker Layer Cache                  │
│ • go.mod/go.sum 層                  │
│ • 源碼層                             │
│ • 編譯層                             │
└─────────────────────────────────────┘
```

**效能提升：**
- 第一次建置：~5-7 分鐘
- 無變更重建：~30-60 秒（提升 85-90%）
- 只改程式碼：~1-2 分鐘（提升 70-80%）
- 改依賴：~3-4 分鐘（提升 40-50%）

## 🔐 安全性

### 安全特性

1. ✅ **最小化映像** - 使用 `scratch` 作為最終映像（最小攻擊面）
2. ✅ **無建置工具** - 最終映像不包含任何建置工具
3. ✅ **靜態編譯** - CGO_ENABLED=0，無動態連結依賴
4. ✅ **臨時憑證** - CI/CD 使用臨時 Docker 配置，自動清理
5. ✅ **版本固定** - 基礎映像使用固定版本（golang:1.23-alpine）

### 建議的安全實踐

1. **定期更新基礎映像**
   ```bash
   # 定期檢查並更新 Dockerfile 中的基礎映像版本
   FROM golang:1.23-alpine  # 保持更新
   ```

2. **掃描漏洞**（可選）
   ```bash
   # 使用 Trivy 掃描映像
   docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
     aquasec/trivy image token-admin-api:latest
   ```

3. **環境變數管理**
   - 不要在映像中硬編碼敏感資訊
   - 使用 Docker secrets 或環境變數
   - 使用 `.env` 文件管理本地開發配置

4. **網路隔離**
   ```yaml
   # 在 Docker Compose 中使用獨立網路
   networks:
     token-network:
       driver: bridge
   ```

## 📝 版本標籤策略

GitHub Actions 會自動產生以下標籤：

- `develop` - develop 分支最新版本
- `main` - main 分支最新版本（穩定版）
- `develop-abc1234` - develop 分支特定 commit（前7碼SHA）
- `sha-abc1234` - 任意分支特定 commit（前7碼SHA）

**範例：**
```bash
# 最新開發版
ghcr.io/{組織}/token-admin-api:develop

# 最新穩定版
ghcr.io/{組織}/token-admin-api:main

# 特定版本
ghcr.io/{組織}/token-admin-api:develop-0364f7e
ghcr.io/{組織}/token-admin-api:sha-0364f7e
```

## 🚢 持續部署

### 自動部署流程

專案使用 GitHub Actions 實現自動化 CI/CD：

```plaintext
開發者推送代碼
      ↓
觸發 GitHub Actions
      ↓
1. 建置 Docker 映像
2. 推送到 GHCR
3. 自動清理
      ↓
映像可用於部署
```

### 手動部署

```bash
# 1. 拉取最新映像
docker pull ghcr.io/{組織}/token-admin-api:develop
docker pull ghcr.io/{組織}/token-app-api:develop

# 2. 停止舊容器
docker-compose down

# 3. 啟動新容器
docker-compose pull
docker-compose up -d

# 4. 檢查狀態
docker-compose ps
docker-compose logs -f
```

### 使用 Watchtower 自動更新（可選）

```bash
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 300 \
  token-admin-api token-app-api
```

Watchtower 會每 5 分鐘檢查一次映像更新並自動重新部署。

## 🔗 相關資源

- [GitHub Container Registry](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Documentation](https://docs.docker.com)
- [Docker Compose](https://docs.docker.com/compose/)
- [Docker BuildKit](https://docs.docker.com/build/buildkit/)
- [Swagger/OpenAPI](https://swagger.io/docs/)
- [swag 工具文檔](https://github.com/swaggo/swag)
- [Go 專案結構指南](https://github.com/golang-standards/project-layout)

## 📞 支援與問題排查

### 常見問題

#### 1. 建置失敗：找不到類型定義

**錯誤訊息：**
```
cannot find type definition: token_app_api_internal_interfaces.XXX
```

**解決方案：**
- 檢查 Dockerfile 中的 `swag init` 命令
- 確保使用 `--exclude` 排除其他服務目錄
- 參考本文檔的「新增服務指南」章節

#### 2. Docker 登入失敗（macOS）

**錯誤訊息：**
```
Error saving credentials: User interaction is not allowed
```

**解決方案：**
- GitHub Actions 已自動處理（使用臨時 DOCKER_CONFIG）
- 本地開發使用 `docker logout` 後重新登入

#### 3. 快取未生效

**症狀：** 每次建置都很慢

**檢查清單：**
- GitHub Actions cache 是否正確配置
- Docker BuildKit 是否啟用（`DOCKER_BUILDKIT=1`）
- `go.sum` 是否有變更

### 獲取幫助

如有問題或需要協助，請：
1. 查看 [GitHub Issues](../../issues)
2. 查閱專案文檔和本 README
3. 檢查 GitHub Actions 建置日誌
4. 聯繫開發團隊

---

**最後更新：** 2025-11-10  
**版本：** 3.0  
**主要特性：**
- ✅ 可擴展的微服務架構
- ✅ Swagger 服務隔離（`--exclude` 參數避免類型衝突）
- ✅ 三層快取策略（GHA + BuildKit + Docker）
- ✅ 完整的新服務創建指南
- ✅ macOS CI/CD 鑰匙圈問題解決方案
- ✅ 效能優化（建置速度提升 85-90%）

**注意事項：**
- ⚠️ 新增服務時需要更新所有現有服務的 Dockerfile（添加 `--exclude` 排除新服務）
- ⚠️ 雖然需要手動維護排除列表，但這是目前唯一可行的方案

