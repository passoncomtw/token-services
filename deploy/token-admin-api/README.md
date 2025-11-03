# Token Admin API - 部署文檔

Token 管理後台 API 服務的 Docker 部署配置。

## 🎯 服務說明

Token Admin API 是管理後台的核心服務，提供：

- 👥 後台使用者管理
- 👤 前台使用者管理
- 🏦 銀行與銀行卡管理
- 📋 訂單管理
- 📌 掛單管理
- 🔐 JWT 認證與授權
- 📊 Swagger API 文檔

## 🐳 快速開始

### 使用預建映像

```bash
# 拉取映像
docker pull ghcr.io/[username]/token-admin-api:develop

# 執行容器
docker run -d \
  --name token-admin-api \
  -p 8080:8080 \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_NAME=token_services \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_jwt_secret \
  ghcr.io/[username]/token-admin-api:develop
```

### 本地建置

```bash
# 從專案根目錄執行
cd /path/to/golang-token-services

# 建置映像
docker build -f deploy/token-admin-api/Dockerfile -t token-admin-api:local .

# 執行容器
docker run -d \
  --name token-admin-api \
  -p 8080:8080 \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_NAME=token_services \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your_password \
  token-admin-api:local
```

## ⚙️ 環境變數

### 必需設定

| 變數 | 說明 | 預設值 | 範例 |
|------|------|--------|------|
| `DB_HOST` | 資料庫主機 | - | `localhost` |
| `DB_PORT` | 資料庫埠號 | `5432` | `5432` |
| `DB_NAME` | 資料庫名稱 | - | `token_services` |
| `DB_USER` | 資料庫使用者 | - | `postgres` |
| `DB_PASSWORD` | 資料庫密碼 | - | `your_password` |
| `JWT_SECRET` | JWT 密鑰 | - | `your_secret_key` |

### 選用設定

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `HTTP_PORT` | HTTP 服務埠號 | `8080` |
| `LOG_LEVEL` | 日誌級別 | `info` |
| `LOG_MODE` | 日誌模式 | `production` |
| `DB_SSLMODE` | SSL 模式 | `disable` |
| `JWT_EXPIRE_HOURS` | Token 過期時間（小時） | `24` |

## 📡 API 端點

### 健康檢查

- `GET /health` - 基本健康檢查
- `GET /health-check` - 詳細健康檢查

### Swagger 文檔

- `GET /swagger/index.html` - Swagger UI

### 認證

- `POST /auth/login` - 後台使用者登入
- `POST /auth/logout` - 後台使用者登出

### 主要功能

- `/backend-users` - 後台使用者管理
- `/users` - 前台使用者管理
- `/banks` - 銀行管理
- `/bankcards` - 銀行卡管理
- `/orders` - 訂單管理
- `/pending-orders` - 掛單管理

詳細 API 文檔請訪問：`http://localhost:8080/swagger/index.html`

## 🔍 健康檢查

```bash
# 基本健康檢查
curl http://localhost:8080/health

# 詳細健康檢查
curl http://localhost:8080/health-check
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

## 📊 日誌

### 日誌級別

- `debug` - 除錯資訊
- `info` - 一般資訊 (預設)
- `warn` - 警告訊息
- `error` - 錯誤訊息
- `fatal` - 致命錯誤

### 日誌模式

- `development` - 彩色輸出，適合開發環境
- `production` - JSON 格式，適合生產環境

### 查看日誌

```bash
# 查看容器日誌
docker logs token-admin-api

# 即時查看日誌
docker logs -f token-admin-api

# 查看最後 100 行
docker logs --tail 100 token-admin-api
```

## 🔐 安全性

### JWT 認證

Token Admin API 使用 JWT 進行身份驗證：

1. 使用 `/auth/login` 取得 JWT token
2. 在後續請求的 `Authorization` header 中帶入 token
3. 格式：`Bearer <token>`

### 預設管理員帳號

初次啟動時會自動建立預設管理員帳號：

- 帳號：`admin`
- 密碼：`admin123`

**⚠️ 重要：請在生產環境中立即更改預設密碼！**

## 🛠️ 故障排除

### 連線資料庫失敗

**錯誤訊息**：`failed to ping database: dial tcp: connect: connection refused`

**解決方法**：
1. 確認資料庫已啟動
2. 檢查 `DB_HOST` 和 `DB_PORT` 設定
3. 確認網路連線是否正常

### 無法生成 Swagger 文檔

**錯誤訊息**：`swagger documentation not found`

**解決方法**：
1. 重新建置映像
2. 確認 Dockerfile 中的 swag 指令執行成功

### 容器啟動失敗

```bash
# 檢查容器日誌
docker logs token-admin-api

# 檢查容器狀態
docker ps -a | grep token-admin-api

# 進入容器除錯（如果容器仍在執行）
docker exec -it token-admin-api sh
```

## 📦 建置資訊

### 映像大小

- Builder 階段：~800 MB
- 最終映像：~15 MB

### 支援平台

- `linux/amd64` - x86_64 架構
- `linux/arm64` - ARM64 架構（如 M1/M2 Mac）

### 建置時間

- 首次建置：~3-5 分鐘
- 使用快取：~1-2 分鐘

## 🔗 相關資源

- [Token Admin API 文檔](../../cmd/token-admin-api/README.md)
- [部署指南](../README.md)
- [API 文檔](../../documents/README.md)

---

**服務埠號**: 8080  
**Swagger UI**: http://localhost:8080/swagger/index.html

