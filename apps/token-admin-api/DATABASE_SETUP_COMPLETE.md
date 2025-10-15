# ✅ 資料庫初始化完成

## 執行摘要

資料庫已成功初始化並準備就緒!

### 連線資訊
- **主機**: 172.237.27.51
- **端口**: 30432
- **資料庫**: token_admin
- **狀態**: ✅ 連線成功

### 已建立的資料表 (11 個)

1. **SequelizeMeta** - Sequelize 遷移記錄表
2. **Users** - 使用者資料表
3. **Merchants** - 商家資料表
4. **Banks** - 銀行資料表
5. **Bankcards** - 銀行卡資料表
6. **Backendactors** - 後台角色資料表
7. **Backendusers** - 後台使用者資料表
8. **Wallets** - 錢包資料表
9. **PendingOrders** - 掛單資料表
10. **Orders** - 訂單資料表
11. **OrderStatistics** - 訂單統計資料表

### 執行的遷移 (10 個)

✅ 所有遷移都已成功執行:

1. `202211100337331-create-user` - 建立使用者表
2. `202211100337332-create-merchant` - 建立商家表
3. `202211100337333-create-bank` - 建立銀行表
4. `202211100337334-create-bankCard` - 建立銀行卡表
5. `202211100337335-create-backendactor` - 建立後台角色表
6. `202211100337336-create-pendingOrder` - 建立掛單表
7. `202211100337337-create-wallet` - 建立錢包表
8. `202211100337338-create-order` - 建立訂單表
9. `2022111003373390-create-orderStatistics` - 建立訂單統計表
10. `2022111003373391-create-backenduser` - 建立後台使用者表

### 種子資料

✅ 已載入測試資料:
- **後台管理員帳號**: `admin2021`
- **預設密碼**: `a12345678`
- 銀行資料
- 後台角色權限資料

---

## 啟動應用程式

### 1. 確認您在正確的目錄

```bash
cd /Users/tomaslin/Projects/token-services/apps/token-admin-api
```

**重要**: 請確保您在 `token-admin-api` 目錄,而不是 `token-app-api` 目錄!

### 2. 啟動開發伺服器

```bash
yarn start:watch
```

或

```bash
npm run start:watch
```

### 3. 驗證伺服器運行

應該會看到類似以下輸出:

```
[Active] SocketCluster worker with PID xxxxx is listening on port 8000
```

### 4. 訪問 Swagger UI

打開瀏覽器訪問:
```
http://localhost:8000/api-docs/
```

### 5. 測試 API

#### 健康檢查
```bash
curl http://localhost:8000/health-check
```

#### 登入測試
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "admin2021",
    "password": "a12345678"
  }'
```

成功後會返回 JWT Token:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "account": "admin2021",
      "name": "系統管理員"
    }
  }
}
```

---

## 常用資料庫指令

### 查看遷移狀態
```bash
cd database && npx sequelize-cli db:migrate:status --config /Users/tomaslin/Projects/token-services/apps/token-admin-api/database/config/config.js
```

### 回滾最後一次遷移
```bash
cd database && npx sequelize-cli db:migrate:undo --config /Users/tomaslin/Projects/token-services/apps/token-admin-api/database/config/config.js
```

### 回滾所有遷移
```bash
npm run migrate:db:drop
```

### 重新執行遷移
```bash
cd database && npx sequelize-cli db:migrate --config /Users/tomaslin/Projects/token-services/apps/token-admin-api/database/config/config.js
```

### 重新載入種子資料
```bash
cd database && npx sequelize-cli db:seed:all --config /Users/tomaslin/Projects/token-services/apps/token-admin-api/database/config/config.js
```

### 完全重置資料庫
```bash
npm run reset:local:db
```

---

## 測試帳號

### 後台管理員
- **帳號**: admin2021
- **密碼**: a12345678
- **權限**: 完整管理權限

---

## 資料庫結構圖

```
Users (使用者)
├── id (PK)
├── account
├── name
├── email
├── password (加密)
├── type (0: 一般, 1: 平台)
├── status (0: 停用, 1: 啟用)
└── Associations:
    ├── Merchant (1:1)
    ├── Wallet (1:1)
    ├── Bankcard (1:N)
    ├── Orders (1:N)
    └── PendingOrders (1:N)

Merchants (商家)
├── id (PK)
├── userId (FK -> Users)
├── contactor
├── telegram
├── buyFeeType
├── sellFeeType
├── buyPercentageFee (JSONB)
└── sellPercentageFee (JSONB)

Wallets (錢包)
├── id (PK)
├── userId (FK -> Users)
├── balance
└── frozenBalance

Banks (銀行)
├── id (PK)
├── bankCode
└── bankName

Bankcards (銀行卡)
├── id (PK)
├── userId (FK -> Users)
├── bankId (FK -> Banks)
├── cardNumber
├── name
└── branchName

Backendusers (後台使用者)
├── id (PK)
├── account
├── name
├── email
├── password (加密)
├── type
├── status
└── createdBy (FK -> Backendusers)

Backendactors (後台角色)
├── id (PK)
├── name
├── markup
└── permissions (JSONB)

PendingOrders (掛單)
├── id (PK)
├── userId (FK -> Users)
├── bankcardId (FK -> Bankcards)
├── type (0: 購買, 1: 出售)
├── amount
├── balance
├── minAmount
├── maxAmount
└── status (0: 停止, 1: 掛單中, 2: 已完成, 3: 已取消)

Orders (訂單)
├── id (PK)
├── userId (FK -> Users)
├── pendingOrderId (FK -> PendingOrders)
├── bankcardId (FK -> Bankcards)
├── amount
├── status (0: 待付款, 1: 已付款, 2: 已完成, 3: 已取消)
├── type (0: 購買, 1: 出售)
├── cancelReason
├── finishAt
└── expectFinishAt

OrderStatistics (訂單統計)
├── id (PK)
├── userId (FK -> Users)
├── date
├── totalOrders
├── completedOrders
├── canceledOrders
└── totalAmount
```

---

## 故障排除

### 問題: 連線資料庫失敗

**檢查**:
1. 確認 `.env` 文件中的資料庫配置正確
2. 確認資料庫伺服器正在運行
3. 檢查防火牆設定

**測試連線**:
```bash
node -e "
const db = require('./database/models');
db.sequelize.authenticate()
  .then(() => console.log('✅ 連線成功'))
  .catch(err => console.error('❌ 連線失敗:', err.message));
"
```

### 問題: 遷移失敗

**解決方法**:
1. 檢查資料庫是否已存在同名的表
2. 檢查資料庫使用者是否有建表權限
3. 查看錯誤訊息中的具體原因

### 問題: 啟動時 Dialect 錯誤

**確認**:
- `.env` 文件中有 `DB_DIALECT=postgres`
- 已經修復過 `database/models/index.js`

---

## 相關文件

- [API 完整文件](./API_DOCUMENTATION.md) - 所有 API 端點的詳細說明
- [環境設置指南](./SETUP_GUIDE.md) - 環境設置和故障排除
- [Swagger JSON](./swagger.json) - OpenAPI 規格文件

---

## 下一步

1. ✅ 啟動應用伺服器
2. ✅ 訪問 Swagger UI 測試 API
3. ✅ 使用測試帳號登入
4. ✅ 開始開發!

---

**初始化完成時間**: 2025-10-15
**資料庫版本**: PostgreSQL (遠端)
**應用版本**: 1.0.0
