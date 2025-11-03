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
└── README.md            # 本文件
```

## 🚀 自動化建置 (GitHub Actions)

專案已配置 GitHub Actions 自動建置流程，當推送程式碼到 `develop` 或 `main` 分支時，會自動：

1. 建置 Docker 映像
2. 推送到 GitHub Container Registry (ghcr.io)
3. 支援多平台 (linux/amd64, linux/arm64)
4. 執行安全性掃描 (Trivy)

### Workflow 文件

- `.github/workflows/build-token-admin-api.yml` - Token Admin API 建置流程
- `.github/workflows/build-token-app-api.yml` - Token App API 建置流程

### 觸發條件

當以下檔案變更時會觸發建置：
- `cmd/[service]/**` - 服務程式碼
- `pkg/**` - 共用套件
- `deploy/[service]/**` - Dockerfile 等部署檔案
- `go.mod`, `go.sum` - Go 模組依賴

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
docker pull ghcr.io/[username]/token-admin-api:develop

# 拉取特定版本
docker pull ghcr.io/[username]/token-admin-api:main
docker pull ghcr.io/[username]/token-admin-api:v1.0.0
```

### Token App API

```bash
# 拉取最新版本
docker pull ghcr.io/[username]/token-app-api:develop

# 拉取特定版本
docker pull ghcr.io/[username]/token-app-api:main
docker pull ghcr.io/[username]/token-app-api:v1.0.0
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
    image: ghcr.io/[username]/token-admin-api:develop
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
    image: ghcr.io/[username]/token-app-api:develop
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

Dockerfile 採用多階段建置以優化映像大小：

### 第一階段 (Builder)
- 基於 `golang:1.24.1-alpine`
- 安裝建置工具
- 下載 Go 模組依賴
- 生成 Swagger 文檔
- 編譯 Go 應用程式

### 第二階段 (Runtime)
- 基於 `scratch` (最小化映像)
- 僅複製編譯好的二進位檔案
- 複製 SSL 憑證
- 最終映像大小約 10-15 MB

## 🔐 安全性

### Trivy 掃描

GitHub Actions 會自動執行 Trivy 安全性掃描，檢查：
- 基礎映像漏洞
- 依賴套件漏洞
- 配置問題

掃描結果會上傳到 GitHub Security 標籤。

### 最佳實踐

1. ✅ 使用 `scratch` 作為最終映像（最小攻擊面）
2. ✅ 不包含建置工具在最終映像中
3. ✅ 定期更新基礎映像
4. ✅ 使用非 root 使用者（可選）
5. ✅ 掃描已知漏洞

## 📝 版本標籤策略

GitHub Actions 會自動產生以下標籤：

- `develop` - develop 分支最新版本
- `main` - main 分支最新版本 (穩定版)
- `[branch]-[sha]` - 特定 commit 的版本
- `v*.*.*` - 語意化版本標籤

## 🚢 持續部署

### 手動部署

```bash
# 1. 拉取最新映像
docker pull ghcr.io/[username]/token-admin-api:develop
docker pull ghcr.io/[username]/token-app-api:develop

# 2. 停止舊容器
docker stop token-admin-api token-app-api
docker rm token-admin-api token-app-api

# 3. 啟動新容器
docker-compose up -d
```

### 自動部署（建議使用 Watchtower）

```bash
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 300 \
  token-admin-api token-app-api
```

Watchtower 會每 5 分鐘檢查一次映像更新並自動重新部署。

## 🔗 相關連結

- [GitHub Container Registry](https://ghcr.io)
- [Docker Documentation](https://docs.docker.com)
- [Docker Compose](https://docs.docker.com/compose/)
- [Trivy Scanner](https://github.com/aquasecurity/trivy)

## 📞 支援

如有問題或需要協助，請：
1. 查看 [GitHub Issues](../../issues)
2. 查閱專案文檔
3. 聯繫開發團隊

---

**最後更新**: 2025-11-03

