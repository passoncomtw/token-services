# 錢包後台 API 啟動指南

## 問題診斷

您遇到的錯誤是因為 **PostgreSQL 資料庫沒有運行**。

## 解決方案

### 方案 1: 使用 Postgres.app (推薦 - macOS)

根據專案 README 的建議,您可以使用 Postgres.app:

1. **下載並安裝 Postgres.app**
   - 訪問: https://postgresapp.com/
   - 下載並安裝
   - 啟動 Postgres.app

2. **初始化資料庫**
   - 打開 Postgres.app
   - 點擊 "Initialize" 建立新的資料庫伺服器
   - 預設會在 port 5432 運行

3. **建立資料庫**
   ```bash
   # 使用 Postgres.app 內建的 psql
   /Applications/Postgres.app/Contents/Versions/latest/bin/psql -h localhost

   # 在 psql 命令列中執行:
   CREATE DATABASE token_admin;
   \q
   ```

4. **執行資料庫遷移**
   ```bash
   cd /Users/tomaslin/Projects/token-services/apps/token-admin-api
   npm run migrate:db
   npm run seed:db
   ```

5. **啟動應用程式**
   ```bash
   yarn start:watch
   ```

---

### 方案 2: 使用 Docker (推薦 - 跨平台)

根據專案 README 的建議,您也可以使用 Docker:

1. **啟動 PostgreSQL Docker 容器**
   ```bash
   docker run --name token-postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_DB=token_admin \
     -p 5432:5432 \
     -d postgres:14
   ```

2. **驗證容器運行**
   ```bash
   docker ps | grep token-postgres
   ```

3. **執行資料庫遷移**
   ```bash
   cd /Users/tomaslin/Projects/token-services/apps/token-admin-api
   npm run migrate:db
   npm run seed:db
   ```

4. **啟動應用程式**
   ```bash
   yarn start:watch
   ```

**停止容器:**
```bash
docker stop token-postgres
```

**重新啟動容器:**
```bash
docker start token-postgres
```

**刪除容器:**
```bash
docker rm -f token-postgres
```

---

### 方案 3: 使用 Homebrew 安裝 PostgreSQL

1. **安裝 PostgreSQL**
   ```bash
   brew install postgresql@14
   ```

2. **啟動 PostgreSQL 服務**
   ```bash
   # 啟動服務
   brew services start postgresql@14

   # 或者前台運行
   pg_ctl -D /usr/local/var/postgres start
   ```

3. **建立資料庫**
   ```bash
   createdb token_admin
   ```

4. **執行資料庫遷移**
   ```bash
   cd /Users/tomaslin/Projects/token-services/apps/token-admin-api
   npm run migrate:db
   npm run seed:db
   ```

5. **啟動應用程式**
   ```bash
   yarn start:watch
   ```

---

## 驗證資料庫連線

執行以下命令來測試資料庫連線:

```bash
node -e "
const db = require('./database/models');
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection successful!');
    console.log('Database:', db.sequelize.config.database);
    console.log('Host:', db.sequelize.config.host);
    console.log('Port:', db.sequelize.config.port);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
"
```

---

## 環境變數配置

確保 `.env` 文件配置正確:

```env
# SocketCluster Configuration
SOCKETCLUSTER_PORT=8000

# Authentication Secrets
AUTH_SECRET=your-auth-secret-key-change-in-production
SALT_SECRET=your-salt-secret-key-change-in-production

# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=token_admin
DB_PORT=5432
DB_HOST=localhost
DB_DIALECT=postgres
```

**重要提示:**
- 生產環境請務必修改 `AUTH_SECRET` 和 `SALT_SECRET`
- 如果使用不同的資料庫配置,請相應修改環境變數

---

## 常用命令

### 資料庫管理

```bash
# 執行所有資料庫遷移
npm run migrate:db

# 回滾所有遷移
npm run migrate:db:drop

# 執行種子資料 (測試資料)
npm run seed:db

# 重置本地資料庫 (刪除所有資料並重新建立)
npm run reset:local:db
```

### 開發

```bash
# 啟動開發伺服器 (熱重載)
yarn start:watch

# 正式啟動
yarn start

# 執行測試
npm test

# 執行測試 (監看模式)
npm run test:watch
```

### UAT 環境

```bash
# 啟動 UAT 環境開發伺服器
npm run start:watch:uat

# UAT 資料庫遷移
npm run migrate:db:uat

# UAT 種子資料
npm run seed:uat:db

# 重置 UAT 資料庫
npm run reset:uat:db
```

---

## 故障排除

### 問題 1: Port 5432 已被佔用

**檢查:**
```bash
lsof -i :5432
```

**解決方法:**
- 停止其他使用 5432 port 的程式
- 或修改 `.env` 中的 `DB_PORT` 為其他端口

### 問題 2: 資料庫連線被拒絕

**可能原因:**
1. PostgreSQL 沒有運行
2. 防火牆阻擋連線
3. 資料庫配置錯誤

**檢查 PostgreSQL 狀態:**
```bash
# Homebrew 安裝
brew services list | grep postgresql

# Docker
docker ps | grep postgres

# Postgres.app
# 查看應用程式是否運行
```

### 問題 3: 資料庫不存在

**錯誤訊息:**
```
database "token_admin" does not exist
```

**解決方法:**
```bash
# 方法 1: 使用 psql
psql -h localhost -U postgres -c "CREATE DATABASE token_admin;"

# 方法 2: 使用 createdb
createdb -h localhost -U postgres token_admin
```

### 問題 4: 認證失敗

**錯誤訊息:**
```
password authentication failed for user "postgres"
```

**解決方法:**
1. 確認 `.env` 中的 `DB_USERNAME` 和 `DB_PASSWORD` 正確
2. 重設 PostgreSQL 使用者密碼

### 問題 5: Sequelize Dialect 錯誤

**錯誤訊息:**
```
Error: Dialect needs to be explicitly supplied as of v4.0.0
```

**解決方法:**
- 這個問題已經修復 (修改了 `database/models/index.js`)
- 確保 `.env` 文件中有 `DB_DIALECT=postgres`

---

## 訪問 API

### Swagger UI
啟動伺服器後,訪問:
```
http://localhost:8000/api-docs/
```

### 健康檢查
```bash
curl http://localhost:8000/health-check
```

### 測試登入
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "admin2021",
    "password": "a12345678"
  }'
```

---

## 參考資料

- [Postgres.app 官網](https://postgresapp.com/)
- [Docker PostgreSQL 映像檔](https://hub.docker.com/_/postgres)
- [Sequelize 文件](https://sequelize.org/docs/v6/getting-started/)
- [API 完整文件](./API_DOCUMENTATION.md)
- [Swagger JSON](./swagger.json)

---

## 快速啟動檢查清單

- [ ] PostgreSQL 已安裝並運行
- [ ] 資料庫 `token_admin` 已建立
- [ ] `.env` 文件配置正確
- [ ] 執行 `npm install` 或 `yarn install`
- [ ] 執行資料庫遷移 `npm run migrate:db`
- [ ] 執行種子資料 `npm run seed:db` (可選)
- [ ] 啟動應用 `yarn start:watch`
- [ ] 訪問 Swagger UI `http://localhost:8000/api-docs/`

---

**最後更新**: 2025-10-15
