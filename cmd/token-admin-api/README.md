# Token Admin API

基於 Golang + Gin + GORM + FX 的 C2C 數位貨幣交易平台後台管理 API。

## 🚀 快速開始

### 1. 配置環境變數

創建 `.env` 文件：

```bash
cp ENV_TEMPLATE.md .env.example
# 然後編輯 .env 文件
```

或使用快速命令：

```bash
cat > .env << 'EOF'
HTTP_PORT=8080
JWT_SECRET=your_secret_key_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sk-demo
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL_MODE=disable
DB_MAX_IDLE_CONNS=10
DB_MAX_OPEN_CONNS=100
DB_CONN_MAX_LIFETIME=3600
DB_CONN_MAX_IDLE_TIME=1800
LOG_LEVEL=debug
LOG_MODE=development
EOF
```

### 2. 啟動資料庫

```bash
docker run --name token-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=sk-demo \
  -p 5432:5432 \
  -d postgres:14
```

### 3. 啟動服務

從**專案根目錄**執行：

```bash
make run-token-admin-api
```

或者：

```bash
cd /path/to/golang-token-services
make run-token-admin-api
```

## 📝 注意事項

- ⚠️ **必須從專案根目錄執行 `make` 命令**
- `.air.toml` 已配置在 `cmd/token-admin-api/.air.toml`
- Makefile 會自動切換到正確的目錄

## 🔗 服務端點

- **API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger/index.html
- **Health Check**: http://localhost:8080/health-check

## 🔐 預設帳號

```
帳號: admin
密碼: admin123
```

## 📚 文檔

- [啟動指南](./STARTUP_GUIDE.md)
- [環境變數範本](./ENV_TEMPLATE.md)

## 🛠 開發命令

```bash
# 從專案根目錄執行
make build-token-admin-swagger  # 生成 Swagger 文檔
make run-token-admin-api        # 啟動服務（熱重載）
```

## 📂 目錄結構

```
cmd/token-admin-api/
├── .air.toml              # Air 熱重載配置
├── .env                   # 環境變數（不納入版控）
├── main.go               # 應用程式入口
└── internal/
    ├── docs/             # Swagger 文檔（自動生成）
    ├── handlers/         # HTTP 處理器
    ├── services/         # 業務邏輯
    ├── interfaces/       # 介面定義
    └── server/           # 伺服器配置
```

## 🎯 特色功能

- ✅ JWT 認證
- ✅ 結構化日誌（基於 zap）
- ✅ Swagger API 文檔
- ✅ 熱重載開發（Air）
- ✅ 依賴注入（FX）
- ✅ GORM ORM
- ✅ 統一錯誤處理
- ✅ 自動 HTTP 請求日誌

