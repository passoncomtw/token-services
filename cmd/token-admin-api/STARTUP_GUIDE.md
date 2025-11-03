# Token Admin API 啟動指南

## 前置要求

1. **Go 1.25.1+** 已安裝
2. **PostgreSQL 14+** 資料庫
3. **Make** 工具（可選，但推薦）

## 快速啟動

### 1. 配置環境變數

創建 `.env` 文件（如果還沒有）：

```bash
cat > .env << 'EOF'
# HTTP Server
HTTP_PORT=8080
HTTP_HOST=127.0.0.1

# JWT 認證
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# 資料庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sk-demo
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL_MODE=disable

# 資料庫連線池
DB_MAX_IDLE_CONNS=10
DB_MAX_OPEN_CONNS=100
DB_CONN_MAX_LIFETIME=3600
DB_CONN_MAX_IDLE_TIME=1800

# 日誌配置
LOG_LEVEL=debug
LOG_MODE=development
EOF
```

### 2. 確保資料庫運行

**使用 Docker（推薦）：**

```bash
docker run --name token-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=sk-demo \
  -p 5432:5432 \
  -d postgres:14
```

**或使用本地 PostgreSQL：**

```bash
createdb sk-demo
```

### 3. 啟動服務

從**專案根目錄**執行：

```bash
# 使用 Make（推薦，支援熱重載）
make run-token-admin-api

# 或直接運行
go run cmd/token-admin-api/main.go
```

### 4. 驗證服務

```bash
# 健康檢查
curl http://localhost:8080/health-check

# 應該返回：
# {"success":true,"data":{"status":"WORKING"}}
```

## 服務端點

- **API 服務**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger/index.html
- **健康檢查**: http://localhost:8080/health-check

## 預設管理員帳號

應用程式啟動時會自動創建：

```
帳號: admin
密碼: admin123
```

**⚠️ 生產環境請立即修改此密碼！**

## 測試登入

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "admin",
    "password": "admin123"
  }'
```

## 日誌配置

在 `.env` 文件中調整：

```env
# 日誌級別：debug, info, warn, error, fatal
LOG_LEVEL=debug

# 日誌模式
# development: 彩色控制台輸出（開發環境推薦）
# production: JSON 格式輸出（生產環境推薦）
LOG_MODE=development
```

## 熱重載開發

使用 `make run-token-admin-api` 啟動時，Air 會自動監控文件變化並重新編譯：

- 修改 `.go` 文件後自動重新編譯
- 錯誤日誌保存在 `cmd/token-admin-api/tmp/build-errors.log`
- 排除 `internal/docs`（Swagger 生成的文件）避免循環重載

## 目錄結構

```
cmd/token-admin-api/
├── .air.toml           # Air 熱重載配置
├── .env                # 環境變數（不納入版控）
├── ENV_TEMPLATE.md     # 環境變數範本
├── main.go            # 應用程式入口
├── tmp/               # Air 編譯產物（自動生成）
└── internal/
    ├── docs/          # Swagger 文檔（自動生成）
    ├── handlers/      # HTTP 處理器
    ├── services/      # 業務邏輯
    ├── interfaces/    # 介面定義
    └── server/        # 伺服器配置
```

## 常見問題

### Q: 服務無法啟動

**A:** 檢查：
1. `.env` 文件是否存在
2. 資料庫是否運行（PostgreSQL）
3. 端口 8080 是否被佔用

### Q: 無法連接資料庫

**A:** 確認：
1. PostgreSQL 服務正在運行
2. `.env` 中的資料庫配置正確
3. 資料庫 `sk-demo` 已創建

### Q: Swagger UI 無法訪問

**A:** 執行：
```bash
make build-token-admin-swagger
```

## 開發命令

從**專案根目錄**執行：

```bash
# 生成 Swagger 文檔
make build-token-admin-swagger

# 啟動服務（熱重載）
make run-token-admin-api

# 直接運行
go run cmd/token-admin-api/main.go

# 編譯
go build -o bin/token-admin-api cmd/token-admin-api/main.go

# 測試
go test ./cmd/token-admin-api/...

# 格式化代碼
go fmt ./cmd/token-admin-api/...
```

