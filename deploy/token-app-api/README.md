# Token App API - 部署文檔

Token App 前台 API 服務的 Docker 部署配置。

## 🎯 服務說明

Token App API 是前台應用的核心服務，提供：

- 📱 使用者註冊與登入
- 👤 使用者資料管理
- 💰 錢包管理
- 🏦 銀行卡管理
- 📋 訂單建立與查詢
- 📌 掛單建立與管理
- 🔐 JWT 認證
- 📊 Swagger API 文檔

## 🐳 快速開始

### 使用預建映像

```bash
# 拉取映像
docker pull ghcr.io/[username]/token-app-api:develop

# 執行容器
docker run -d \
  --name token-app-api \
  -p 8081:8081 \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_NAME=token_services \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_jwt_secret \
  ghcr.io/[username]/token-app-api:develop
```

### 本地建置

```bash
# 從專案根目錄執行
cd /path/to/golang-token-services

# 建置映像
docker build -f deploy/token-app-api/Dockerfile -t token-app-api:local .

# 執行容器
docker run -d \
  --name token-app-api \
  -p 8081:8081 \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_NAME=token_services \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your_password \
  token-app-api:local
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
| `HTTP_PORT` | HTTP 服務埠號 | `8081` |
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

- `POST /auth/login` - 使用者登入
- `POST /auth/logout` - 使用者登出

### 使用者管理

- `POST /users` - 使用者註冊
- `GET /users/:user_id` - 取回使用者資訊
- `PUT /users/:user_id` - 更新使用者資訊
- `PUT /users/login/password` - 更新登入密碼
- `PUT /users/transaction/password` - 更新交易密碼
- `POST /users/:user_id/store/value` - 儲值（測試用）

### 銀行與銀行卡

- `GET /banks` - 取回銀行列表
- `GET /bankcards` - 取回銀行卡列表
- `POST /bankcards` - 新增銀行卡
- `PUT /bankcards/:bankcard_id` - 更新銀行卡
- `DELETE /bankcards/:bankcard_id` - 刪除銀行卡

### 訂單管理

- `GET /orders` - 取回訂單列表
- `POST /orders` - 建立訂單
- `PUT /orders/:order_id/paid` - 標記已付款
- `PUT /orders/:order_id/apply` - 放行訂單
- `PUT /orders/:order_id/reject` - 取消訂單

### 掛單管理

- `GET /pending/orders` - 取回掛單列表
- `GET /pending/orders/:id` - 取回掛單詳情
- `POST /pending/orders` - 建立掛單
- `DELETE /pending/orders/:id` - 刪除掛單
- `PUT /pending/orders/:id/lock` - 凍結掛單
- `PUT /pending/orders/:id/unlock` - 解除凍結掛單
- `GET /users/pending/orders` - 取回使用者掛單

詳細 API 文檔請訪問：`http://localhost:8081/swagger/index.html`

## 🔍 健康檢查

```bash
# 基本健康檢查
curl http://localhost:8081/health

# 詳細健康檢查
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
docker logs token-app-api

# 即時查看日誌
docker logs -f token-app-api

# 查看最後 100 行
docker logs --tail 100 token-app-api
```

## 🔐 安全性

### JWT 認證

Token App API 使用 JWT 進行身份驗證：

1. 使用者透過 `/users` 註冊帳號
2. 使用 `/auth/login` 取得 JWT token
3. 在後續請求的 `Authorization` header 中帶入 token
4. 格式：`Bearer <token>`

### 測試帳號

可以透過 API 註冊測試帳號：

```bash
curl -X POST http://localhost:8081/users \
  -H "Content-Type: application/json" \
  -d '{
    "type": 0,
    "account": "testuser",
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "transactionCode": "123456"
  }'
```

## 🛠️ 故障排除

### 連線資料庫失敗

**錯誤訊息**：`failed to ping database: dial tcp: connect: connection refused`

**解決方法**：
1. 確認資料庫已啟動
2. 檢查 `DB_HOST` 和 `DB_PORT` 設定
3. 確認網路連線是否正常

### JWT Token 驗證失敗

**錯誤訊息**：`invalid token` 或 `token expired`

**解決方法**：
1. 確認 token 格式正確（`Bearer <token>`）
2. 檢查 token 是否過期
3. 確認 `JWT_SECRET` 與發行 token 時一致

### 交易密碼錯誤

**錯誤訊息**：`交易密碼錯誤`

**解決方法**：
1. 確認使用者已設定交易密碼
2. 確認交易密碼格式（6-20 位英數字）
3. 使用 API 重設交易密碼

### 容器啟動失敗

```bash
# 檢查容器日誌
docker logs token-app-api

# 檢查容器狀態
docker ps -a | grep token-app-api

# 進入容器除錯（如果容器仍在執行）
docker exec -it token-app-api sh
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

## 🧪 測試 API

### 完整測試流程

```bash
# 1. 註冊使用者
curl -X POST http://localhost:8081/users \
  -H "Content-Type: application/json" \
  -d '{
    "type": 0,
    "account": "testuser",
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "transactionCode": "123456"
  }'

# 2. 登入取得 token
TOKEN=$(curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"testuser","password":"password123"}' \
  | jq -r '.data.access_token')

# 3. 查看使用者資訊
curl -X GET "http://localhost:8081/users/1" \
  -H "Authorization: Bearer $TOKEN"

# 4. 查看銀行列表
curl -X GET "http://localhost:8081/banks"

# 5. 新增銀行卡
curl -X POST http://localhost:8081/bankcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test User",
    "cardNumber": "1234567890123456",
    "bankId": 1,
    "branchName": "Test Branch",
    "status": 0
  }'
```

## 🔗 相關資源

- [Token App API 文檔](../../cmd/token-app-api/README.md)
- [部署指南](../README.md)
- [API 文檔](../../documents/README.md)

---

**服務埠號**: 8081  
**Swagger UI**: http://localhost:8081/swagger/index.html

