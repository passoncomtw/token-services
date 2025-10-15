# 錢包後台 API 功能詳細說明文件

## 目錄
- [系統概述](#系統概述)
- [技術架構](#技術架構)
- [認證與授權](#認證與授權)
- [API 端點詳細說明](#api-端點詳細說明)
  - [認證模組](#認證模組)
  - [使用者管理](#使用者管理)
  - [後台使用者管理](#後台使用者管理)
  - [後台角色權限管理](#後台角色權限管理)
  - [銀行管理](#銀行管理)
  - [銀行卡管理](#銀行卡管理)
  - [訂單管理](#訂單管理)
  - [掛單管理](#掛單管理)
- [資料模型](#資料模型)
- [錯誤處理](#錯誤處理)
- [最佳實踐](#最佳實踐)

---

## 系統概述

### 專案資訊
- **專案名稱**: 錢包後台 API (token-admin-api)
- **版本**: 1.0.0
- **技術棧**: Node.js + Express + PostgreSQL + SocketCluster
- **API 規範**: Swagger 2.0 / OpenAPI
- **預設端口**: 8888 (可通過環境變數 `SOCKETCLUSTER_PORT` 配置)

### 主要功能
1. **使用者認證與授權**: JWT Token 驗證機制
2. **使用者管理**: 一般使用者和商家帳號的完整生命週期管理
3. **後台管理**: 後台使用者和角色權限管理
4. **交易管理**: 訂單和掛單的管理和監控
5. **金融帳戶管理**: 銀行和銀行卡資訊管理

---

## 技術架構

### 後端架構
```
┌─────────────────────────────────────────┐
│         Express Application             │
│  ┌───────────────────────────────────┐  │
│  │     Authentication Middleware     │  │
│  │      (Passport JWT Strategy)      │  │
│  └───────────────────────────────────┘  │
│                   ↓                      │
│  ┌───────────────────────────────────┐  │
│  │         Router Layer              │  │
│  │  - authRouter                     │  │
│  │  - userRouter                     │  │
│  │  - backenduserRouter              │  │
│  │  - backendactorRouter             │  │
│  │  - orderRouter                    │  │
│  │  - pendingOrderRouter             │  │
│  │  - bankcardRouter                 │  │
│  │  - bankRouter                     │  │
│  └───────────────────────────────────┘  │
│                   ↓                      │
│  ┌───────────────────────────────────┐  │
│  │        Service Layer              │  │
│  │  - Business Logic                 │  │
│  │  - Data Validation (Yup)          │  │
│  └───────────────────────────────────┘  │
│                   ↓                      │
│  ┌───────────────────────────────────┐  │
│  │      Database Layer (ORM)         │  │
│  │       Sequelize + PostgreSQL      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 資料庫模型關聯
```
User (使用者) ──┬── Merchant (商家資訊)
               ├── Wallet (錢包)
               ├── Bankcard (銀行卡)
               ├── Order (訂單)
               └── PendingOrder (掛單)

BackendUser (後台使用者) ── BackendActor (後台角色)

Bank (銀行) ── Bankcard (銀行卡)

Order (訂單) ──┬── User (使用者)
               ├── PendingOrder (掛單)
               └── Bankcard (銀行卡)

PendingOrder (掛單) ──┬── User (使用者)
                      └── Bankcard (銀行卡)
```

### 目錄結構
```
token-admin-api/
├── server.js                    # 應用程式入口點
├── controllers/                 # 路由控制器
│   ├── authRouter.js           # 認證相關路由
│   ├── userRouter.js           # 使用者管理路由
│   ├── backenduserRouter.js    # 後台使用者路由
│   ├── backendactorRouter.js   # 角色權限路由
│   ├── orderRouter.js          # 訂單管理路由
│   ├── pendingOrderRouter.js   # 掛單管理路由
│   ├── bankcardRouter.js       # 銀行卡管理路由
│   └── bankRouter.js           # 銀行管理路由
├── services/                    # 業務邏輯層
│   ├── authServices.js
│   ├── userServices.js
│   ├── backenduserServices.js
│   ├── backendactorServices.js
│   ├── orderServices.js
│   ├── pendingorderServices.js
│   ├── bankcardServices.js
│   └── bankServices.js
├── database/                    # 資料庫相關
│   └── models/                 # Sequelize 資料模型
│       ├── User.js
│       ├── Merchant.js
│       ├── Wallet.js
│       ├── Backenduser.js
│       ├── Backendactor.js
│       ├── Bank.js
│       ├── Bankcard.js
│       ├── Order.js
│       ├── PendingOrder.js
│       └── OrderStatistics.js
├── helpers/                     # 輔助函數
│   ├── expressAppHelper.js     # Express 應用配置
│   ├── passportManager.js      # Passport 認證配置
│   └── response.js             # 統一響應格式
└── constants/                   # 常量定義
    └── swaggerOptions/         # Swagger 配置
        ├── paths/              # API 路由定義
        └── definitions/        # 資料模型定義
```

---

## 認證與授權

### 認證機制
本系統採用 **JWT (JSON Web Token)** 進行身份認證。

#### 認證流程
1. 使用者通過 `/auth/login` 端點提交帳號密碼
2. 系統驗證帳號密碼，成功後生成 JWT Token
3. 客戶端在後續請求的 Header 中攜帶 Token: `Authorization: Bearer {token}`
4. 受保護的端點會驗證 Token 的有效性

### JWT Token 結構
```json
{
  "data": {
    "id": 1,
    "account": "admin2021",
    "name": "管理員",
    "email": "admin@example.com",
    "type": 0,
    "merchant": null
  }
}
```

### 環境變數配置
```env
# 伺服器配置
SOCKETCLUSTER_PORT=8888

# JWT 認證密鑰
AUTH_SECRET=your_secret_key_here
SALT_SECRET=your_salt_key_here

# 資料庫配置
DB_USERNAME=postgres
DB_DATABASE=token_wallet
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DIALECT=postgres
```

### 受保護的路由
以下路由需要在 Header 中攜帶有效的 JWT Token:
- `/banks/*` - 銀行管理
- `/bankcards/*` - 銀行卡管理
- `/backendusers/*` - 後台使用者管理
- `/backendactors/*` - 角色權限管理
- `/users/*` - 使用者管理
- `/orders/*` - 訂單管理
- `/pending/orders/*` - 掛單管理

---

## API 端點詳細說明

### 認證模組

#### 1. 使用者登入
**端點**: `POST /auth/login`

**描述**: 使用者登入並獲取 JWT Token

**請求參數**:
```json
{
  "account": "admin2021",
  "password": "a12345678"
}
```

**請求範例**:
```bash
curl -X POST http://localhost:8888/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "admin2021",
    "password": "a12345678"
  }'
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expireIn": null,
    "user": {
      "id": 1,
      "account": "admin2021",
      "name": "管理員",
      "email": "admin@example.com",
      "type": 0,
      "merchant": null
    }
  }
}
```

**錯誤響應**:
- `401`: 帳號或密碼錯誤
- `500`: 伺服器錯誤

---

#### 2. 使用者登出
**端點**: `POST /auth/logout`

**描述**: 使用者登出系統

**請求 Header**:
```
Authorization: Bearer {token}
```

**成功響應** (200):
```json
{
  "success": true
}
```

---

#### 3. 修改後台使用者登入密碼
**端點**: `POST /auth/login/password`

**描述**: 修改當前登入後台使用者的密碼

**請求 Header**:
```
Authorization: Bearer {token}
```

**請求參數**:
```json
{
  "password": "a12345678",
  "newPassword": "a123456789"
}
```

**驗證規則**:
- `password`: 必填，舊密碼
- `newPassword`: 必填，新密碼，6~20 位英文數字組合

**成功響應** (200):
```json
{
  "success": true
}
```

**錯誤響應**:
- `400`: 參數驗證失敗
- `401`: 舊密碼錯誤
- `500`: 伺服器錯誤

---

### 使用者管理

#### 1. 查詢使用者列表
**端點**: `GET /users`

**描述**: 獲取使用者列表，支援多條件篩選和分頁

**請求 Header**:
```
Authorization: Bearer {token}
```

**查詢參數**:
| 參數 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| name | string | 否 | 使用者名稱 (模糊搜尋) | simon |
| email | string | 否 | 電子郵件 (模糊搜尋) | test@example.com |
| account | string | 否 | 帳號 (模糊搜尋) | user001 |
| status | integer | 否 | 帳號狀態: 0=停用, 1=啟用 | 1 |
| isMerchant | boolean | 否 | 是否為商家: true/false | true |
| orderStatus | integer | 否 | 掛單狀態: 0=停用, 1=啟用 | 1 |
| transactionStatus | integer | 否 | 交易狀態: 0=停用, 1=啟用 | 1 |
| page | integer | 否 | 頁碼 (預設: 1) | 1 |
| size | integer | 否 | 每頁筆數 (預設: 10) | 20 |

**請求範例**:
```bash
curl -X GET "http://localhost:8888/users?account=simon&status=1&page=1&size=10" \
  -H "Authorization: Bearer {token}"
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": 1,
        "account": "simon",
        "name": "Simon Chen",
        "email": "simon@example.com",
        "type": 0,
        "status": 1,
        "orderStatus": 1,
        "transactionStatus": 1,
        "phone": "0912345678",
        "createdAt": 1625097600000,
        "merchant": {
          "contactor": "Simon",
          "telegram": "simon_tg",
          "buyFeeType": 0,
          "sellFeeType": 0,
          "buyPercentageFee": {
            "feePercent": 0.6,
            "minFee": 0,
            "maxFee": 1000
          },
          "sellPercentageFee": {
            "feePercent": 0.6,
            "minFee": 0,
            "maxFee": 1000
          }
        },
        "wallet": {
          "balance": 10000,
          "frozenBalance": 500
        }
      }
    ],
    "count": 1,
    "page": 1,
    "size": 10,
    "totalPages": 1
  }
}
```

---

#### 2. 查詢使用者詳細資訊
**端點**: `GET /users/:userId`

**描述**: 根據使用者 ID 獲取詳細資訊

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `userId`: 使用者 ID

**請求範例**:
```bash
curl -X GET http://localhost:8888/users/1 \
  -H "Authorization: Bearer {token}"
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "account": "simon",
    "name": "Simon Chen",
    "email": "simon@example.com",
    "type": 0,
    "status": 1,
    "orderStatus": 1,
    "transactionStatus": 1,
    "phone": "0912345678",
    "markup": "VIP 使用者",
    "createdAt": 1625097600000,
    "merchant": {
      "id": 1,
      "contactor": "Simon",
      "telegram": "simon_tg",
      "buyFeeType": 0,
      "sellFeeType": 0,
      "buyPercentageFee": {
        "feePercent": 0.6,
        "minFee": 0,
        "maxFee": 1000
      }
    },
    "wallet": {
      "id": 1,
      "balance": 10000,
      "frozenBalance": 500
    }
  }
}
```

---

#### 3. 新增使用者
**端點**: `POST /users`

**描述**: 創建新的使用者帳號 (一般使用者或商家)

**請求 Header**:
```
Authorization: Bearer {token}
```

**請求參數**:
```json
{
  "account": "newuser001",
  "name": "New User",
  "email": "newuser@example.com",
  "password": "a12345678",
  "type": 0,
  "buyFeeType": 0,
  "sellFeeType": 0
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| account | string | 是 | 帳號 | newuser001 |
| name | string | 是 | 使用者名稱 | New User |
| email | string | 是 | 電子郵件 | newuser@example.com |
| password | string | 是 | 密碼 (6~20 位英數組合) | a12345678 |
| type | integer | 是 | 使用者類型: 0=一般, 1=平台 | 0 |
| buyFeeType | integer | 是 | 購買手續費類型: 0=百分比, 1=階梯式 | 0 |
| sellFeeType | integer | 是 | 販售手續費類型: 0=百分比, 1=階梯式 | 0 |

**商家額外參數** (type=1 時):
```json
{
  "contactor": "聯絡人姓名",
  "telegram": "Telegram ID",
  "buyPercentageFee": {
    "feePercent": 0.6,
    "minFee": 0,
    "maxFee": 1000
  },
  "sellPercentageFee": {
    "feePercent": 0.6,
    "minFee": 0,
    "maxFee": 1000
  },
  "buyLadderFee": [
    {
      "amount": 100,
      "feePercent": 0.1
    },
    {
      "amount": 1000,
      "feePercent": 0.5
    }
  ],
  "sellLadderFee": [
    {
      "amount": 100,
      "feePercent": 0.1
    },
    {
      "amount": 1000,
      "feePercent": 0.5
    }
  ]
}
```

**成功響應** (200):
```json
{
  "success": true
}
```

**錯誤響應**:
- `400`: 參數驗證失敗或帳號已存在
- `500`: 伺服器錯誤

---

#### 4. 更新使用者資訊
**端點**: `PUT /users/:userId`

**描述**: 更新使用者的基本資訊和狀態

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `userId`: 使用者 ID

**請求參數**:
```json
{
  "name": "Updated Name",
  "phone": "0987654321",
  "email": "updated@example.com",
  "contactor": "聯絡人",
  "telegram": "telegram_id",
  "type": 0,
  "status": 1,
  "orderStatus": 1,
  "transactionStatus": 1,
  "buyFeeType": 0,
  "sellFeeType": 0
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| name | string | 是 | 使用者名稱 |
| phone | string | 是 | 電話號碼 |
| email | string | 是 | 電子郵件 |
| contactor | string | 是 | 聯絡人姓名 |
| telegram | string | 是 | Telegram ID |
| type | integer | 是 | 使用者類型: 0=一般, 1=平台 |
| status | integer | 是 | 帳號狀態: 0=停用, 1=啟用 |
| orderStatus | integer | 是 | 掛單狀態: 0=停用, 1=啟用 |
| transactionStatus | integer | 是 | 交易狀態: 0=停用, 1=啟用 |
| buyFeeType | integer | 是 | 購買手續費類型 |
| sellFeeType | integer | 是 | 販售手續費類型 |

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "account": "simon",
    "name": "Updated Name",
    "email": "updated@example.com",
    "phone": "0987654321",
    "status": 1
  }
}
```

---

#### 5. 解鎖使用者
**端點**: `PUT /users/:userId/unlock`

**描述**: 解除使用者帳號的鎖定狀態

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `userId`: 使用者 ID

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "account": "simon",
    "status": 1,
    "loginAttempts": 0,
    "lockedUntil": null
  }
}
```

---

#### 6. 更新使用者登入密碼
**端點**: `PUT /users/:userId/login/password`

**描述**: 管理員為使用者重設登入密碼

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `userId`: 使用者 ID

**請求參數**:
```json
{
  "password": "a12345678"
}
```

**驗證規則**:
- 密碼必須為 6~20 位英文數字組合
- 正則表達式: `^.*(?=.{6,20})(?=.*\d)(?=.*[a-z|A-Z]).*$`

**成功響應** (200):
```json
{
  "success": true
}
```

---

#### 7. 更新使用者交易密碼
**端點**: `PUT /users/:userId/transaction/password`

**描述**: 管理員為使用者重設交易密碼

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `userId`: 使用者 ID

**請求參數**:
```json
{
  "password": "a12345678"
}
```

**成功響應** (200):
```json
{
  "success": true
}
```

---

#### 8. 查詢使用者銀行卡列表
**端點**: `GET /users/:userId/bankcards`

**描述**: 獲取指定使用者的銀行卡列表

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `userId`: 使用者 ID

**查詢參數**:
- `page`: 頁碼 (預設: 1)
- `size`: 每頁筆數 (預設: 10)

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": 1,
        "cardNumber": "1234567890123456",
        "name": "張三",
        "branchName": "台北分行",
        "bank": {
          "bankCode": "004",
          "bankName": "台灣銀行"
        }
      }
    ],
    "count": 1,
    "page": 1,
    "size": 10
  }
}
```

---

#### 9. 查詢使用者掛單列表
**端點**: `GET /users/:userId/pending/orders`

**描述**: 獲取指定使用者的掛單列表

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `userId`: 使用者 ID

**查詢參數**: 與掛單列表查詢參數相同

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": 1,
        "type": 0,
        "amount": 1000,
        "balance": 1000,
        "status": 1,
        "createdAt": 1625097600000
      }
    ],
    "count": 1,
    "page": 1,
    "size": 10
  }
}
```

---

#### 10. 查詢使用者訂單列表
**端點**: `GET /users/:userId/orders`

**描述**: 獲取指定使用者的訂單列表

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `userId`: 使用者 ID

**成功響應** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": 1000,
      "status": 2,
      "type": 0,
      "createdAt": 1625097600000,
      "finishAt": 1625101200000,
      "expectFinishAt": 1625104800000
    }
  ]
}
```

---

### 後台使用者管理

#### 1. 查詢後台使用者列表
**端點**: `GET /backendusers`

**描述**: 獲取後台使用者列表

**請求 Header**:
```
Authorization: Bearer {token}
```

**成功響應** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "account": "admin2021",
      "name": "系統管理員",
      "email": "admin@example.com",
      "type": 0,
      "status": 1,
      "createdAt": 1625097600000,
      "actors": [
        {
          "id": 1,
          "name": "超級管理員",
          "permissions": [1, 2, 3, 4, 5]
        }
      ]
    }
  ]
}
```

---

#### 2. 新增後台使用者
**端點**: `POST /backendusers`

**描述**: 創建新的後台使用者帳號

**請求 Header**:
```
Authorization: Bearer {token}
```

**請求參數**:
```json
{
  "account": "newadmin",
  "name": "新管理員",
  "password": "a12345678"
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| account | string | 是 | 帳號 |
| name | string | 是 | 使用者名稱 |
| password | string | 是 | 密碼 (6~20 位英數組合) |

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "account": "newadmin",
    "name": "新管理員",
    "status": 1
  }
}
```

**錯誤響應**:
- `400`: 參數驗證失敗或帳號已存在
- `500`: 伺服器錯誤

---

#### 3. 更新後台使用者
**端點**: `PUT /backendusers/:backendUserId`

**描述**: 更新後台使用者資訊

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `backendUserId`: 後台使用者 ID

**請求參數**:
```json
{
  "account": "updatedadmin",
  "name": "更新後的管理員",
  "status": 1
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| account | string | 是 | 帳號 |
| name | string | 是 | 使用者名稱 |
| status | integer | 是 | 狀態: 0=停用, 1=啟用 |

**限制**:
- 不能修改 ID 為 1 的超級管理員帳號

**成功響應** (200):
```json
{
  "success": true
}
```

**錯誤響應**:
- `400`: 參數驗證失敗
- `403`: 權限不足 (嘗試修改超級管理員)
- `500`: 伺服器錯誤

---

#### 4. 刪除後台使用者
**端點**: `DELETE /backendusers/:backendUserId`

**描述**: 刪除後台使用者帳號

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `backendUserId`: 後台使用者 ID

**限制**:
- 不能刪除自己的帳號
- 不能刪除 ID 為 1 的超級管理員帳號

**成功響應** (200):
```json
{
  "success": true
}
```

**錯誤響應**:
- `403`: 不能刪除自己或權限不足
- `500`: 伺服器錯誤

---

### 後台角色權限管理

#### 1. 查詢角色列表
**端點**: `GET /backendactors`

**描述**: 獲取所有後台角色列表

**請求 Header**:
```
Authorization: Bearer {token}
```

**成功響應** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "超級管理員",
      "markup": "擁有所有權限",
      "permissions": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "createdAt": 1625097600000
    },
    {
      "id": 2,
      "name": "客服人員",
      "markup": "負責客戶服務",
      "permissions": [2, 3, 5, 7, 9],
      "createdAt": 1625097600000
    }
  ]
}
```

---

#### 2. 查詢權限清單
**端點**: `GET /backendactors/permissions`

**描述**: 獲取系統所有可用權限清單 (樹狀結構)

**請求 Header**:
```
Authorization: Bearer {token}
```

**成功響應** (200):
```json
{
  "success": true,
  "data": [
    {
      "functionName": "會員管理",
      "functionIdentify": 1,
      "parentId": null,
      "children": [
        {
          "functionName": "會員列表",
          "functionIdentify": 2,
          "parentId": 1,
          "children": [
            {
              "functionName": "訂單（檢視）",
              "functionIdentify": 3,
              "parentId": 2,
              "children": []
            },
            {
              "functionName": "訂單（取消訂單）",
              "functionIdentify": 4,
              "parentId": 2,
              "children": []
            },
            {
              "functionName": "掛單（檢視）",
              "functionIdentify": 5,
              "parentId": 2,
              "children": []
            },
            {
              "functionName": "掛單（操作）",
              "functionIdentify": 6,
              "parentId": 2,
              "children": []
            }
          ]
        },
        {
          "functionName": "新增商家",
          "functionIdentify": 18,
          "parentId": 1,
          "children": []
        }
      ]
    },
    {
      "functionName": "訂單管理",
      "functionIdentify": 19,
      "parentId": null,
      "children": [
        {
          "functionName": "訂單管理（取消訂單）",
          "functionIdentify": 20,
          "parentId": 19,
          "children": []
        }
      ]
    },
    {
      "functionName": "系統設置",
      "functionIdentify": 23,
      "parentId": null,
      "children": [
        {
          "functionName": "帳號列表",
          "functionIdentify": 24,
          "parentId": 23,
          "children": [
            {
              "functionName": "賬號列表（新增賬號）",
              "functionIdentify": 25,
              "parentId": 24,
              "children": []
            },
            {
              "functionName": "賬號列表（刪除賬號）",
              "functionIdentify": 26,
              "parentId": 24,
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

**權限識別碼清單**:
| ID | 權限名稱 | 父權限 | 說明 |
|----|----------|--------|------|
| 1 | 會員管理 | - | 一級權限 |
| 2 | 會員列表 | 1 | 查看會員列表 |
| 3 | 訂單（檢視） | 2 | 查看會員訂單 |
| 4 | 訂單（取消訂單） | 2 | 取消會員訂單 |
| 5 | 掛單（檢視） | 2 | 查看會員掛單 |
| 6 | 掛單（操作） | 2 | 操作會員掛單 |
| 7 | 收付賬户（檢視） | 2 | 查看收付帳戶 |
| 8 | 收付賬户（刪除賬户） | 2 | 刪除收付帳戶 |
| 9 | 會員資料（檢視） | 2 | 查看會員資料 |
| 10 | 會員資料（編輯） | 2 | 編輯會員資料 |
| 11 | 會員資料（更改登錄密碼） | 2 | 更改會員登錄密碼 |
| 12 | 會員資料（更改交易密碼） | 2 | 更改會員交易密碼 |
| 13 | 會員資料（解除鎖定） | 2 | 解除會員鎖定 |
| 14 | 會員資料（購買手續費） | 2 | 設定購買手續費 |
| 15 | 會員資料（出售手續費） | 2 | 設定出售手續費 |
| 16 | 賬户列表 | 1 | 查看帳戶列表 |
| 17 | 賬户列表（刪除賬户） | 16 | 刪除帳戶 |
| 18 | 新增商家 | 1 | 新增商家 |
| 19 | 訂單管理 | - | 一級權限 |
| 20 | 訂單管理（取消訂單） | 19 | 取消訂單 |
| 21 | 掛單管理 | - | 一級權限 |
| 22 | 掛單管理（操作） | 21 | 操作掛單 |
| 23 | 系統設置 | - | 一級權限 |
| 24 | 帳號列表 | 23 | 查看帳號列表 |
| 25 | 賬號列表（新增賬號） | 24 | 新增帳號 |
| 26 | 賬號列表（刪除賬號） | 24 | 刪除帳號 |
| 27 | 角色權限 | 23 | 角色權限管理 |
| 28 | 角色權限（新增角色） | 27 | 新增角色 |
| 29 | 角色權限（刪除角色） | 27 | 刪除角色 |

---

#### 3. 新增角色
**端點**: `POST /backendactors`

**描述**: 創建新的後台角色

**請求 Header**:
```
Authorization: Bearer {token}
```

**請求參數**:
```json
{
  "name": "客服人員",
  "markup": "負責客戶服務和訂單處理"
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| name | string | 是 | 角色名稱 |
| markup | string | 否 | 角色描述 |

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "客服人員",
    "markup": "負責客戶服務和訂單處理",
    "permissions": [],
    "createdAt": 1625097600000
  }
}
```

---

#### 4. 更新角色
**端點**: `PUT /backendactors/:backendActorId`

**描述**: 更新角色資訊和權限

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `backendActorId`: 角色 ID

**請求參數**:
```json
{
  "name": "高級客服",
  "markup": "高級客服人員，擁有更多權限"
}
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "高級客服",
    "markup": "高級客服人員，擁有更多權限",
    "permissions": [2, 3, 5, 7, 9]
  }
}
```

---

#### 5. 刪除角色
**端點**: `DELETE /backendactors/:backendActorId`

**描述**: 刪除後台角色

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `backendActorId`: 角色 ID

**成功響應** (200):
```json
{
  "success": true
}
```

---

### 銀行管理

#### 1. 查詢銀行列表
**端點**: `GET /banks`

**描述**: 獲取所有銀行列表

**請求 Header**:
```
Authorization: Bearer {token}
```

**成功響應** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bankCode": "004",
      "bankName": "台灣銀行",
      "createdAt": 1625097600000
    },
    {
      "id": 2,
      "bankCode": "007",
      "bankName": "第一商業銀行",
      "createdAt": 1625097600000
    }
  ]
}
```

---

#### 2. 新增銀行
**端點**: `POST /banks`

**描述**: 新增銀行資訊

**請求 Header**:
```
Authorization: Bearer {token}
```

**請求參數**:
```json
{
  "bankCode": "012",
  "bankName": "台北富邦銀行"
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| bankCode | string | 是 | 銀行代碼 (3碼) |
| bankName | string | 是 | 銀行名稱 |

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 3,
    "bankCode": "012",
    "bankName": "台北富邦銀行"
  }
}
```

---

#### 3. 更新銀行
**端點**: `PUT /banks/:bankId`

**描述**: 更新銀行資訊

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `bankId`: 銀行 ID

**請求參數**:
```json
{
  "bankCode": "012",
  "bankName": "台北富邦商業銀行"
}
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 3,
    "bankCode": "012",
    "bankName": "台北富邦商業銀行"
  }
}
```

---

### 銀行卡管理

#### 1. 查詢銀行卡列表
**端點**: `GET /bankcards`

**描述**: 查詢銀行卡列表，支援多條件篩選

**請求 Header**:
```
Authorization: Bearer {token}
```

**查詢參數**:
| 參數 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| cardNumber | string | 否 | 卡號 (模糊搜尋) | 1234 |
| bankCode | string | 否 | 銀行代碼 (模糊搜尋) | 004 |
| bankName | string | 否 | 銀行名稱 (模糊搜尋) | 台灣銀行 |
| branchName | string | 否 | 分行名稱 (模糊搜尋) | 台北分行 |
| account | string | 否 | 使用者帳號 (模糊搜尋) | simon |
| name | string | 否 | 帳戶名稱 (模糊搜尋) | 張三 |
| page | integer | 否 | 頁碼 (預設: 1) | 1 |
| size | integer | 否 | 每頁筆數 (預設: 10) | 20 |

**請求範例**:
```bash
curl -X GET "http://localhost:8888/bankcards?bankName=台灣銀行&page=1&size=10" \
  -H "Authorization: Bearer {token}"
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": 1,
        "cardNumber": "1234567890123456",
        "name": "張三",
        "branchName": "台北分行",
        "user": {
          "id": 1,
          "account": "simon",
          "name": "Simon Chen"
        },
        "bank": {
          "id": 1,
          "bankCode": "004",
          "bankName": "台灣銀行"
        },
        "createdAt": 1625097600000
      }
    ],
    "count": 1,
    "page": 1,
    "size": 10,
    "totalPages": 1
  }
}
```

---

#### 2. 查詢銀行卡詳細資訊
**端點**: `GET /bankcards/:bankcardId`

**描述**: 根據銀行卡 ID 獲取詳細資訊

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `bankcardId`: 銀行卡 ID

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cardNumber": "1234567890123456",
    "name": "張三",
    "branchName": "台北分行",
    "user": {
      "id": 1,
      "account": "simon",
      "name": "Simon Chen",
      "email": "simon@example.com"
    },
    "bank": {
      "id": 1,
      "bankCode": "004",
      "bankName": "台灣銀行"
    },
    "createdAt": 1625097600000
  }
}
```

---

### 訂單管理

#### 1. 查詢訂單列表
**端點**: `GET /orders`

**描述**: 查詢訂單列表，支援多條件篩選和分頁

**請求 Header**:
```
Authorization: Bearer {token}
```

**查詢參數**:
| 參數 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| orderId | integer | 否 | 訂單 ID | 123 |
| account | string | 否 | 使用者帳號 (模糊搜尋) | simon |
| payer | string | 否 | 付款人名稱 (模糊搜尋) | 張三 |
| cancelReason | string | 否 | 取消原因 (模糊搜尋) | 逾期 |
| startAt | string | 否 | 開始時間 (ISO 8601) | 2021-07-01T00:00:00Z |
| endAt | string | 否 | 結束時間 (ISO 8601) | 2021-07-31T23:59:59Z |
| finishAtType | string | 否 | 完成時間類型: overdue=逾期, normal=正常 | overdue |
| type | integer | 否 | 訂單類型: 0=購買, 1=出售 | 0 |
| status | integer | 否 | 訂單狀態: 0=待付款, 1=已付款, 2=已完成, 3=已取消 | 2 |
| minAmount | number | 否 | 最小金額 | 1000 |
| maxAmount | number | 否 | 最大金額 | 10000 |
| page | integer | 否 | 頁碼 (預設: 1) | 1 |
| size | integer | 否 | 每頁筆數 (預設: 10) | 20 |

**請求範例**:
```bash
curl -X GET "http://localhost:8888/orders?status=2&type=0&page=1&size=10" \
  -H "Authorization: Bearer {token}"
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": 123,
        "amount": 5000,
        "status": 2,
        "type": 0,
        "cancelReason": null,
        "createdAt": 1625097600000,
        "finishAt": 1625101200000,
        "expectFinishAt": 1625104800000,
        "user": {
          "id": 1,
          "account": "simon",
          "name": "Simon Chen"
        },
        "pendingOrder": {
          "id": 456,
          "type": 0,
          "amount": 10000,
          "balance": 5000
        },
        "bankcard": {
          "id": 1,
          "cardNumber": "1234****3456",
          "name": "張三",
          "bank": {
            "bankCode": "004",
            "bankName": "台灣銀行"
          }
        }
      }
    ],
    "count": 1,
    "page": 1,
    "size": 10,
    "totalPages": 1
  }
}
```

**訂單狀態說明**:
| 狀態值 | 狀態名稱 | 說明 |
|--------|----------|------|
| 0 | 待付款 | 訂單已建立，等待付款 |
| 1 | 已付款 | 使用者已完成付款，等待確認 |
| 2 | 已完成 | 訂單已完成 |
| 3 | 已取消 | 訂單已取消 |

---

#### 2. 完成訂單
**端點**: `PUT /orders/:orderId`

**描述**: 標記訂單為已完成

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `orderId`: 訂單 ID

**請求參數** (可選):
```json
{
  "remark": "訂單完成備註"
}
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 123,
    "amount": 5000,
    "status": 2,
    "finishAt": 1625101200000,
    "remark": "訂單完成備註"
  }
}
```

---

#### 3. 取消訂單
**端點**: `PUT /orders/:orderId/cancel`

**描述**: 取消訂單並說明取消原因

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `orderId`: 訂單 ID

**請求參數**:
```json
{
  "cancelReason": "使用者逾期未付款"
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| cancelReason | string | 是 | 取消原因 |

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 123,
    "amount": 5000,
    "status": 3,
    "cancelReason": "使用者逾期未付款",
    "cancelAt": 1625101200000
  }
}
```

---

### 掛單管理

#### 1. 查詢掛單列表
**端點**: `GET /pending/orders`

**描述**: 查詢掛單列表，支援多條件篩選和分頁

**請求 Header**:
```
Authorization: Bearer {token}
```

**查詢參數**:
| 參數 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| pendingOrderId | integer | 否 | 掛單 ID | 456 |
| account | string | 否 | 使用者帳號 | simon |
| startAt | string | 否 | 開始時間 (ISO 8601) | 2021-07-01T00:00:00Z |
| endAt | string | 否 | 結束時間 (ISO 8601) | 2021-07-31T23:59:59Z |
| userId | integer | 否 | 使用者 ID | 1 |
| minAmount | number | 否 | 最小掛單金額 | 1000 |
| maxAmount | number | 否 | 最大掛單金額 | 50000 |
| minBalance | number | 否 | 最小餘額 | 500 |
| maxBalance | number | 否 | 最大餘額 | 30000 |
| type | integer | 否 | 掛單類型: 0=購買, 1=出售 | 0 |
| status | integer | 否 | 掛單狀態: 0=停止, 1=掛單中, 2=已完成, 3=已取消 | 1 |
| page | integer | 否 | 頁碼 (預設: 1) | 1 |
| size | integer | 否 | 每頁筆數 (預設: 10) | 20 |

**請求範例**:
```bash
curl -X GET "http://localhost:8888/pending/orders?status=1&type=0&page=1&size=10" \
  -H "Authorization: Bearer {token}"
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": 456,
        "type": 0,
        "amount": 10000,
        "balance": 5000,
        "status": 1,
        "minAmount": 1000,
        "maxAmount": 5000,
        "createdAt": 1625097600000,
        "user": {
          "id": 1,
          "account": "simon",
          "name": "Simon Chen"
        },
        "bankcard": {
          "id": 1,
          "cardNumber": "1234****3456",
          "name": "張三",
          "bank": {
            "bankCode": "004",
            "bankName": "台灣銀行"
          }
        }
      }
    ],
    "count": 1,
    "page": 1,
    "size": 10,
    "totalPages": 1
  }
}
```

**掛單狀態說明**:
| 狀態值 | 狀態名稱 | 說明 |
|--------|----------|------|
| 0 | 停止 | 掛單暫停，不接受新訂單 |
| 1 | 掛單中 | 掛單進行中，可接受新訂單 |
| 2 | 已完成 | 掛單金額已全部成交 |
| 3 | 已取消 | 掛單已取消 |

---

#### 2. 停止掛單
**端點**: `PUT /pending/orders/:pendingOrderId/stop`

**描述**: 暫停掛單，不再接受新訂單

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `pendingOrderId`: 掛單 ID

**成功響應** (200):
```json
{
  "success": true
}
```

---

#### 3. 開啟掛單
**端點**: `PUT /pending/orders/:pendingOrderId/open`

**描述**: 重新開啟已停止的掛單

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `pendingOrderId`: 掛單 ID

**成功響應** (200):
```json
{
  "success": true
}
```

---

#### 4. 取消掛單
**端點**: `PUT /pending/orders/:pendingOrderId/cancel`

**描述**: 取消掛單

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `pendingOrderId`: 掛單 ID

**成功響應** (200):
```json
{
  "success": true
}
```

**注意事項**:
- 取消掛單會退回所有未成交的餘額
- 已有進行中的訂單不會受影響

---

#### 5. 刪除掛單
**端點**: `DELETE /pending/orders/:pendingOrderId`

**描述**: 軟刪除掛單記錄

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `pendingOrderId`: 掛單 ID

**成功響應** (200):
```json
{
  "success": true
}
```

**注意事項**:
- 這是軟刪除操作，資料不會真正從資料庫移除
- 只有已完成或已取消的掛單才能刪除

---

## 資料模型

### User (使用者)
```javascript
{
  id: INTEGER,              // 使用者 ID (主鍵)
  account: STRING,          // 帳號 (唯一)
  name: STRING,             // 使用者名稱
  email: STRING,            // 電子郵件
  password: STRING,         // 密碼 (加密)
  transactionPassword: STRING, // 交易密碼 (加密)
  type: INTEGER,            // 使用者類型: 0=一般, 1=平台
  status: INTEGER,          // 帳號狀態: 0=停用, 1=啟用
  orderStatus: INTEGER,     // 掛單狀態: 0=停用, 1=啟用
  transactionStatus: INTEGER, // 交易狀態: 0=停用, 1=啟用
  phone: STRING,            // 電話號碼
  markup: TEXT,             // 備註
  loginAttempts: INTEGER,   // 登入失敗次數
  lockedUntil: DATE,        // 鎖定截止時間
  createdAt: DATE,          // 建立時間
  updatedAt: DATE           // 更新時間
}
```

### Merchant (商家)
```javascript
{
  id: INTEGER,              // 商家 ID (主鍵)
  userId: INTEGER,          // 使用者 ID (外鍵)
  contactor: STRING,        // 聯絡人姓名
  telegram: STRING,         // Telegram ID
  buyFeeType: INTEGER,      // 購買手續費類型: 0=百分比, 1=階梯式
  sellFeeType: INTEGER,     // 販售手續費類型: 0=百分比, 1=階梯式
  buyPercentageFee: JSONB,  // 購買百分比手續費設定
  sellPercentageFee: JSONB, // 販售百分比手續費設定
  buyLadderFee: JSONB,      // 購買階梯式手續費設定
  sellLadderFee: JSONB,     // 販售階梯式手續費設定
  createdAt: DATE,          // 建立時間
  updatedAt: DATE           // 更新時間
}
```

### Wallet (錢包)
```javascript
{
  id: INTEGER,              // 錢包 ID (主鍵)
  userId: INTEGER,          // 使用者 ID (外鍵)
  balance: DECIMAL(10, 2),  // 餘額
  frozenBalance: DECIMAL(10, 2), // 凍結餘額
  createdAt: DATE,          // 建立時間
  updatedAt: DATE           // 更新時間
}
```

### BackendUser (後台使用者)
```javascript
{
  id: INTEGER,              // 後台使用者 ID (主鍵)
  account: STRING,          // 帳號 (唯一)
  name: STRING,             // 使用者名稱
  email: STRING,            // 電子郵件
  password: STRING,         // 密碼 (加密)
  type: INTEGER,            // 使用者類型: 0=管理員
  status: INTEGER,          // 狀態: 0=停用, 1=啟用
  createdBy: INTEGER,       // 建立者 ID
  createdAt: DATE,          // 建立時間
  updatedAt: DATE           // 更新時間
}
```

### BackendActor (後台角色)
```javascript
{
  id: INTEGER,              // 角色 ID (主鍵)
  name: STRING,             // 角色名稱
  markup: TEXT,             // 角色描述
  permissions: JSONB,       // 權限清單 (陣列)
  createdAt: DATE,          // 建立時間
  updatedAt: DATE           // 更新時間
}
```

### Bank (銀行)
```javascript
{
  id: INTEGER,              // 銀行 ID (主鍵)
  bankCode: STRING,         // 銀行代碼
  bankName: STRING,         // 銀行名稱
  createdAt: DATE,          // 建立時間
  updatedAt: DATE           // 更新時間
}
```

### Bankcard (銀行卡)
```javascript
{
  id: INTEGER,              // 銀行卡 ID (主鍵)
  userId: INTEGER,          // 使用者 ID (外鍵)
  bankId: INTEGER,          // 銀行 ID (外鍵)
  cardNumber: STRING,       // 卡號
  name: STRING,             // 帳戶名稱
  branchName: STRING,       // 分行名稱
  createdAt: DATE,          // 建立時間
  updatedAt: DATE           // 更新時間
}
```

### Order (訂單)
```javascript
{
  id: INTEGER,              // 訂單 ID (主鍵)
  userId: INTEGER,          // 使用者 ID (外鍵)
  pendingOrderId: INTEGER,  // 掛單 ID (外鍵)
  bankcardId: INTEGER,      // 銀行卡 ID (外鍵)
  amount: DECIMAL(10, 2),   // 訂單金額
  status: INTEGER,          // 訂單狀態: 0=待付款, 1=已付款, 2=已完成, 3=已取消
  type: INTEGER,            // 訂單類型: 0=購買, 1=出售
  cancelReason: TEXT,       // 取消原因
  remark: TEXT,             // 備註
  createdAt: DATE,          // 建立時間
  finishAt: DATE,           // 完成時間
  expectFinishAt: DATE,     // 預期完成時間
  cancelAt: DATE,           // 取消時間
  updatedAt: DATE           // 更新時間
}
```

### PendingOrder (掛單)
```javascript
{
  id: INTEGER,              // 掛單 ID (主鍵)
  userId: INTEGER,          // 使用者 ID (外鍵)
  bankcardId: INTEGER,      // 銀行卡 ID (外鍵)
  type: INTEGER,            // 掛單類型: 0=購買, 1=出售
  amount: DECIMAL(10, 2),   // 掛單總金額
  balance: DECIMAL(10, 2),  // 剩餘金額
  minAmount: DECIMAL(10, 2), // 單筆最小金額
  maxAmount: DECIMAL(10, 2), // 單筆最大金額
  status: INTEGER,          // 掛單狀態: 0=停止, 1=掛單中, 2=已完成, 3=已取消
  createdAt: DATE,          // 建立時間
  updatedAt: DATE,          // 更新時間
  deletedAt: DATE           // 刪除時間 (軟刪除)
}
```

### OrderStatistics (訂單統計)
```javascript
{
  id: INTEGER,              // 統計 ID (主鍵)
  userId: INTEGER,          // 使用者 ID (外鍵)
  date: DATE,               // 統計日期
  totalOrders: INTEGER,     // 總訂單數
  completedOrders: INTEGER, // 完成訂單數
  canceledOrders: INTEGER,  // 取消訂單數
  totalAmount: DECIMAL(15, 2), // 總交易金額
  createdAt: DATE,          // 建立時間
  updatedAt: DATE           // 更新時間
}
```

---

## 錯誤處理

### 統一錯誤響應格式
```json
{
  "success": false,
  "message": "錯誤訊息描述",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP 狀態碼
| 狀態碼 | 說明 | 使用時機 |
|--------|------|----------|
| 200 | 成功 | 請求處理成功 |
| 400 | 錯誤請求 | 參數驗證失敗 |
| 401 | 未授權 | JWT Token 無效或過期 |
| 403 | 禁止訪問 | 權限不足 |
| 404 | 找不到資源 | 請求的資源不存在 |
| 500 | 伺服器錯誤 | 伺服器內部錯誤 |

### 常見錯誤訊息

#### 認證錯誤
```json
{
  "success": false,
  "message": "帳號或密碼錯誤",
  "code": "AUTH_FAILED"
}
```

#### 參數驗證錯誤
```json
{
  "success": false,
  "message": "帳號不可為空",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "account",
    "type": "required"
  }
}
```

#### 權限不足
```json
{
  "success": false,
  "message": "權限不足",
  "code": "PERMISSION_DENIED"
}
```

#### Token 無效
```json
{
  "success": false,
  "message": "Token 無效或已過期",
  "code": "INVALID_TOKEN"
}
```

---

## 最佳實踐

### 1. 安全性建議

#### JWT Token 管理
- Token 應該存儲在安全的地方 (如 httpOnly Cookie)
- 定期刷新 Token
- 實施 Token 黑名單機制

#### 密碼安全
- 密碼必須符合複雜度要求: 6~20 位英文數字組合
- 使用安全的密碼哈希算法 (bcrypt)
- 實施登入失敗鎖定機制

#### API 請求
- 所有敏感操作都需要 JWT Token 驗證
- 使用 HTTPS 加密傳輸
- 實施請求頻率限制 (Rate Limiting)

### 2. 開發建議

#### 錯誤處理
```javascript
try {
  // 業務邏輯
  const result = await someService();
  responseOk(res, { success: true, data: result });
} catch (error) {
  const status = error.status || 500;
  responseErrWithMsg(res, error.message, status);
}
```

#### 參數驗證
```javascript
const schema = yup.object({
  account: yup.string().required('帳號不可為空'),
  password: yup.string()
    .matches(/^.*(?=.{6,20})(?=.*\d)(?=.*[a-z|A-Z]).*$/, '6~20 的英數組合')
    .required('密碼不可為空')
});

await schema.validate(req.body);
```

#### 分頁查詢
```javascript
const { page = 1, size = 10 } = req.query;
const offset = (page - 1) * size;
const limit = parseInt(size);

const { rows, count } = await Model.findAndCountAll({
  where: whereCondition,
  offset,
  limit,
  order: [['createdAt', 'DESC']]
});

return {
  rows,
  count,
  page: parseInt(page),
  size: parseInt(size),
  totalPages: Math.ceil(count / size)
};
```

### 3. 測試建議

#### 單元測試
```bash
# 執行所有測試
npm test

# 執行測試並生成覆蓋率報告
npm run test:CI

# 監看模式執行測試
npm run test:watch
```

#### API 測試範例
參考 `specs/api.http` 檔案進行手動測試

### 4. 部署建議

#### 環境變數配置
確保在生產環境設定以下環境變數:
- `NODE_ENV=production`
- `SOCKETCLUSTER_PORT`: 伺服器端口
- `AUTH_SECRET`: JWT 密鑰 (強隨機字串)
- `SALT_SECRET`: 密碼加鹽密鑰
- 資料庫連線參數

#### 資料庫遷移
```bash
# 執行資料庫遷移
npm run migrate:db

# 執行種子資料
npm run seed:db
```

#### 生產環境啟動
```bash
# 使用 PM2 管理應用程式
pm2 start ecosystem.config.js --env production

# 查看日誌
pm2 logs token-admin-api
```

---

## 附錄

### A. Swagger UI 訪問
訪問 http://localhost:8888/api-docs/ 查看完整的互動式 API 文檔

### B. 健康檢查端點
**端點**: `GET /health-check`

**描述**: 檢查 API 服務是否正常運行

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "status": "WORKING"
  }
}
```

### C. 資料庫初始化
```bash
# 重置本地資料庫 (刪除所有資料並重新建立)
npm run reset:local:db

# 重置 UAT 環境資料庫
npm run reset:uat:db
```

### D. 開發命令
```bash
# 啟動開發伺服器 (熱重載)
npm run start:watch

# 啟動 UAT 環境開發伺服器
npm run start:watch:uat

# 版本發布
npm run release:patch  # 補丁版本 (1.0.0 -> 1.0.1)
npm run release:minor  # 次要版本 (1.0.0 -> 1.1.0)
npm run release:major  # 主要版本 (1.0.0 -> 2.0.0)
```

---

## 版本歷史

### 1.0.0 (2021-07-01)
- 初始版本發布
- 實現完整的使用者管理系統
- 實現後台管理和權限系統
- 實現訂單和掛單管理
- 實現銀行卡管理

---

## 聯絡資訊

**開發團隊**: PassonTW
**電子郵件**: passon.com.tw@gmail.com
**專案 Repository**: [待補充]

---

**文件更新日期**: 2025-10-15
