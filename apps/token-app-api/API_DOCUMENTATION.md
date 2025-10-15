# 錢包 APP API 功能詳細說明文件

## 目錄
- [系統概述](#系統概述)
- [技術架構](#技術架構)
- [認證與授權](#認證與授權)
- [API 端點詳細說明](#api-端點詳細說明)
  - [使用者認證](#使用者認證)
  - [使用者管理](#使用者管理)
  - [銀行卡管理](#銀行卡管理)
  - [掛單管理](#掛單管理)
  - [訂單管理](#訂單管理)
- [錯誤處理](#錯誤處理)
- [最佳實踐](#最佳實踐)

---

## 系統概述

### 專案資訊
- **專案名稱**: 錢包 APP API (token-app-api)
- **版本**: 1.0.0
- **技術棧**: Node.js + Express + PostgreSQL + SocketCluster
- **API 規範**: Swagger 2.0 / OpenAPI
- **預設端口**: 8000 (可通過環境變數 `SOCKETCLUSTER_PORT` 配置)
- **用途**: 行動應用程式後端 API

### 主要功能
1. **使用者註冊與登入**: 支援帳號密碼登入和推播通知
2. **使用者資料管理**: 個人資料更新、密碼修改
3. **銀行卡管理**: 新增、查詢、刪除銀行卡
4. **掛單管理**: 建立買賣掛單、查詢可用掛單
5. **訂單交易**: 建立訂單、付款確認、訂單狀態管理

### 與 token-admin-api 的區別
| 功能 | token-admin-api | token-app-api |
|------|----------------|---------------|
| 用途 | 營運後台管理 | 使用者行動應用 |
| 使用者類型 | 管理員 | 一般使用者 |
| 權限控制 | 角色權限管理 | 個人權限 |
| 功能範圍 | 完整管理功能 | 使用者交易功能 |
| 推播支援 | 無 | 有 (Notification Token) |

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
│  │  - authRouter (認證)              │  │
│  │  - userRouter (使用者)            │  │
│  │  - bankcardRouter (銀行卡)        │  │
│  │  - pendingOrderRouter (掛單)      │  │
│  │  - orderRouter (訂單)             │  │
│  │  - bankRouter (銀行列表)          │  │
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

### 資料庫共用
- **資料庫**: `token_admin` (與 token-admin-api 共用)
- **資料表**: 使用相同的資料表結構
- **關聯**: User, Merchant, Wallet, Bankcard, Order, PendingOrder

---

## 認證與授權

### 認證機制
本系統採用 **JWT (JSON Web Token)** 進行身份認證。

#### 認證流程
1. 使用者通過 `/auth/login` 端點提交帳號、密碼和推播 Token
2. 系統驗證帳號密碼，成功後生成 JWT Token
3. 客戶端在後續請求的 Header 中攜帶 Token: `Authorization: Bearer {token}`
4. 受保護的端點會驗證 Token 的有效性

### JWT Token 結構
```json
{
  "data": {
    "id": 1,
    "account": "user001"
  }
}
```

### 環境變數配置
```env
# 伺服器配置
SOCKETCLUSTER_PORT=8000

# JWT 認證密鑰
AUTH_SECRET=your_secret_key_here
SALT_SECRET=your_salt_key_here

# 資料庫配置
DB_USERNAME=postgres
DB_DATABASE=token_admin
DB_PASSWORD=your_password
DB_HOST=172.237.27.51
DB_PORT=30432
DB_DIALECT=postgres
```

### 受保護的路由
以下路由需要在 Header 中攜帶有效的 JWT Token:
- `/home/*` - 首頁資料
- `/users/pending/orders` - 使用者掛單列表
- `/users/login/password` - 修改登入密碼
- `/users/transaction/password` - 修改交易密碼
- `/users/:userId` - 更新使用者資料
- `/bankcards/*` - 銀行卡管理
- `/pending/orders/*` - 掛單管理 (除了查詢列表)
- `/orders/*` - 訂單管理

---

## API 端點詳細說明

### 使用者認證

#### 1. 使用者登入
**端點**: `POST /auth/login`

**描述**: 使用者登入並獲取 JWT Token,同時更新推播通知 Token

**請求參數**:
```json
{
  "account": "user001",
  "password": "a12345678",
  "notificationToken": "FCM_OR_APNS_TOKEN_HERE"
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| account | string | 是 | 使用者帳號 |
| password | string | 是 | 登入密碼 |
| notificationToken | string | 是 | 推播通知 Token (FCM/APNS) |

**請求範例**:
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "user001",
    "password": "a12345678",
    "notificationToken": "fcm_token_example"
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
      "account": "user001",
      "name": "使用者名稱",
      "email": "user@example.com",
      "type": 0,
      "status": 1
    }
  }
}
```

**錯誤響應**:
- `400`: 參數驗證失敗
- `401`: 帳號或密碼錯誤
- `500`: 伺服器錯誤

---

#### 2. 使用者登出
**端點**: `POST /auth/logout`

**描述**: 使用者登出系統,清除推播通知 Token

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

### 使用者管理

#### 1. 使用者註冊
**端點**: `POST /users`

**描述**: 註冊新的使用者帳號

**請求參數**:
```json
{
  "name": "使用者名稱",
  "email": "user@example.com",
  "password": "a12345678",
  "transactionCode": "abc123456",
  "referralCode": "REF12345"
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 | 驗證規則 |
|------|------|------|------|----------|
| name | string | 是 | 使用者名稱 | - |
| email | string | 是 | 電子郵件 | 必須是有效的 email 格式 |
| password | string | 是 | 登入密碼 | - |
| transactionCode | string | 是 | 交易密碼 | 6~20 位英數組合 |
| referralCode | string | 否 | 推薦碼 | - |

**驗證規則**:
- `email`: 必須符合 email 格式
- `transactionCode`: `/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,20}$/`

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "account": "auto_generated_account",
    "name": "使用者名稱",
    "email": "user@example.com",
    "type": 0,
    "status": 1
  }
}
```

---

#### 2. 查詢使用者資訊
**端點**: `GET /users/:userId`

**描述**: 根據使用者 ID 獲取使用者資訊

**路徑參數**:
- `userId`: 使用者 ID

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "account": "user001",
    "name": "使用者名稱",
    "email": "user@example.com",
    "type": 0,
    "status": 1,
    "wallet": {
      "balance": 10000,
      "frozenBalance": 500
    },
    "merchant": null
  }
}
```

---

#### 3. 更新使用者資料
**端點**: `PUT /users/:userId`

**描述**: 更新使用者的基本資料

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `userId`: 使用者 ID

**請求參數**:
```json
{
  "name": "新的使用者名稱",
  "email": "newemail@example.com"
}
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "account": "user001",
    "name": "新的使用者名稱",
    "email": "newemail@example.com"
  }
}
```

---

#### 4. 修改登入密碼
**端點**: `PUT /users/login/password`

**描述**: 修改當前登入使用者的登入密碼

**請求 Header**:
```
Authorization: Bearer {token}
```

**請求參數**:
```json
{
  "password": "a12345678",
  "newPassword": "b12345678"
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| password | string | 是 | 舊密碼 |
| newPassword | string | 是 | 新密碼 |

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

#### 5. 修改交易密碼
**端點**: `PUT /users/transaction/password`

**描述**: 修改當前登入使用者的交易密碼

**請求 Header**:
```
Authorization: Bearer {token}
```

**請求參數**:
```json
{
  "password": "abc123456",
  "newPassword": "def123456"
}
```

**驗證規則**:
- 交易密碼必須為 6~20 位英數組合
- 正則表達式: `/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,20}$/`

**成功響應** (200):
```json
{
  "success": true
}
```

---

#### 6. 查詢使用者掛單列表
**端點**: `GET /users/pending/orders`

**描述**: 獲取當前登入使用者的掛單列表 (買入和賣出)

**請求 Header**:
```
Authorization: Bearer {token}
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "buy": {
      "id": 1,
      "type": 0,
      "amount": 10000,
      "balance": 5000,
      "minAmount": 100,
      "status": 0,
      "bankcard": {
        "id": 1,
        "cardNumber": "1234****5678",
        "name": "張三"
      }
    },
    "sell": {
      "id": 2,
      "type": 1,
      "amount": 20000,
      "balance": 15000,
      "minAmount": 100,
      "status": 0
    }
  }
}
```

**資料說明**:
- `buy`: 買入掛單 (type=0)
- `sell`: 賣出掛單 (type=1)
- 如果沒有對應類型的掛單,該欄位為 `null`

---

#### 7. 使用者儲值
**端點**: `POST /users/:userId/store/value`

**描述**: 為使用者進行儲值操作

**路徑參數**:
- `userId`: 使用者 ID

**成功響應** (200):
```json
{
  "success": true
}
```

---

### 銀行卡管理

#### 1. 查詢銀行列表
**端點**: `GET /banks`

**描述**: 獲取所有可用銀行列表

**成功響應** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bankCode": "004",
      "bankName": "台灣銀行"
    },
    {
      "id": 2,
      "bankCode": "007",
      "bankName": "第一商業銀行"
    }
  ]
}
```

---

#### 2. 查詢使用者銀行卡列表
**端點**: `GET /bankcards`

**描述**: 獲取當前登入使用者的銀行卡列表

**請求 Header**:
```
Authorization: Bearer {token}
```

**查詢參數**:
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| page | integer | 否 | 頁碼 (預設: 1) |
| size | integer | 否 | 每頁筆數 (預設: 10) |

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
          "id": 1,
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

#### 3. 新增銀行卡
**端點**: `POST /bankcards`

**描述**: 新增使用者的銀行卡

**請求 Header**:
```
Authorization: Bearer {token}
```

**請求參數**:
```json
{
  "bankId": 1,
  "cardNumber": "1234567890123456",
  "name": "張三",
  "branchName": "台北分行"
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| bankId | integer | 是 | 銀行 ID |
| cardNumber | string | 是 | 銀行卡號 |
| name | string | 是 | 帳戶名稱 |
| branchName | string | 是 | 分行名稱 |

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bankId": 1,
    "cardNumber": "1234567890123456",
    "name": "張三",
    "branchName": "台北分行"
  }
}
```

---

#### 4. 刪除銀行卡
**端點**: `DELETE /bankcards/:bankcardId`

**描述**: 刪除指定的銀行卡

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `bankcardId`: 銀行卡 ID

**成功響應** (200):
```json
{
  "success": true
}
```

---

### 掛單管理

#### 1. 查詢可用掛單列表
**端點**: `GET /pending/orders`

**描述**: 查詢當前可用的掛單列表 (供使用者接單)

**請求 Header**:
```
Authorization: Bearer {token}
```

**查詢參數**:
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| type | integer | 否 | 掛單類型: 0=購買, 1=出售 |
| balance | number | 否 | 餘額篩選 |
| page | integer | 否 | 頁碼 (預設: 1) |
| size | integer | 否 | 每頁筆數 (預設: 10) |

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": 1,
        "type": 0,
        "amount": 10000,
        "balance": 5000,
        "minAmount": 100,
        "maxAmount": 5000,
        "status": 0,
        "transactionMinutes": 30,
        "user": {
          "id": 2,
          "account": "merchant001",
          "name": "商家名稱"
        },
        "bankcard": {
          "id": 1,
          "cardNumber": "1234****5678",
          "name": "商家",
          "bank": {
            "bankCode": "004",
            "bankName": "台灣銀行"
          }
        }
      }
    ],
    "count": 1,
    "page": 1,
    "size": 10
  }
}
```

**掛單狀態說明**:
- `status: 0` - 掛單中 (可接單)
- `status: 1` - 已鎖定
- `status: 2` - 已完成
- `status: 3` - 已取消

---

#### 2. 查詢掛單詳情
**端點**: `GET /pending/orders/:pending_order_id`

**描述**: 根據掛單 ID 獲取詳細資訊

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `pending_order_id`: 掛單 ID

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "amount": 10000,
    "balance": 5000,
    "minAmount": 100,
    "maxAmount": 5000,
    "status": 0,
    "transactionMinutes": 30,
    "bankcard": {
      "id": 1,
      "cardNumber": "1234567890123456",
      "name": "商家",
      "branchName": "台北分行",
      "bank": {
        "bankCode": "004",
        "bankName": "台灣銀行"
      }
    }
  }
}
```

---

#### 3. 建立掛單
**端點**: `POST /pending/orders`

**描述**: 建立新的買入或賣出掛單

**請求 Header**:
```
Authorization: Bearer {token}
```

**請求參數**:
```json
{
  "bankcardId": 1,
  "type": 0,
  "amount": 10000,
  "minAmount": 100,
  "transactionCode": "abc123456",
  "transactionMinutes": 30
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 | 驗證規則 |
|------|------|------|------|----------|
| bankcardId | integer | 是 | 銀行卡 ID | - |
| type | integer | 是 | 掛單類型 | 0=購買, 1=出售 |
| amount | number | 是 | 掛單金額 | 最小 100 |
| minAmount | number | 是 | 最小交易金額 | 最小 100 |
| transactionCode | string | 是 | 交易密碼 | 6~20 位英數組合 |
| transactionMinutes | number | 是 | 訂單等待時間(分鐘) | 5~120 分鐘 |

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "amount": 10000,
    "balance": 10000,
    "minAmount": 100,
    "status": 0,
    "transactionMinutes": 30
  }
}
```

**錯誤響應**:
- `400`: 參數驗證失敗或餘額不足
- `401`: 交易密碼錯誤
- `500`: 伺服器錯誤

---

#### 4. 鎖定掛單
**端點**: `PUT /pending/orders/:pending_order_id/lock`

**描述**: 鎖定掛單 (暫停接單)

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `pending_order_id`: 掛單 ID

**成功響應** (200):
```json
{
  "success": true
}
```

---

#### 5. 解鎖掛單
**端點**: `PUT /pending/orders/:pending_order_id/unlock`

**描述**: 解鎖掛單 (恢復接單)

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `pending_order_id`: 掛單 ID

**成功響應** (200):
```json
{
  "success": true
}
```

---

#### 6. 刪除掛單
**端點**: `DELETE /pending/orders/:pending_order_id`

**描述**: 刪除掛單

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `pending_order_id`: 掛單 ID

**成功響應** (200):
```json
{
  "success": true
}
```

**注意事項**:
- 只能刪除自己的掛單
- 有進行中的訂單時無法刪除

---

### 訂單管理

#### 1. 查詢訂單列表
**端點**: `GET /orders`

**描述**: 查詢訂單列表

**請求 Header**:
```
Authorization: Bearer {token}
```

**查詢參數**:
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| page | integer | 否 | 頁碼 (預設: 1) |
| size | integer | 否 | 每頁筆數 (預設: 10) |

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": 1,
        "orderId": "ORD20231015001",
        "amount": 1000,
        "status": 1,
        "type": 0,
        "createdAt": 1697356800000,
        "expectFinishAt": 1697358600000,
        "pendingOrder": {
          "id": 1,
          "type": 0,
          "user": {
            "account": "merchant001",
            "name": "商家"
          }
        },
        "beneficiaryBankcard": {
          "cardNumber": "1234****5678",
          "name": "收款人",
          "bank": {
            "bankName": "台灣銀行"
          }
        }
      }
    ],
    "count": 1,
    "page": 1,
    "size": 10
  }
}
```

**訂單狀態說明**:
- `status: 0` - 待付款
- `status: 1` - 已付款待確認
- `status: 2` - 已完成
- `status: 3` - 已拒絕/取消

---

#### 2. 建立訂單
**端點**: `POST /orders`

**描述**: 根據掛單建立新訂單

**請求 Header**:
```
Authorization: Bearer {token}
```

**請求參數**:
```json
{
  "beneficiaryBankcardId": 1,
  "type": 0,
  "orderId": "ORD20231015001",
  "amount": 1000,
  "transactionCode": "abc123456"
}
```

**參數說明**:
| 欄位 | 類型 | 必填 | 說明 | 驗證規則 |
|------|------|------|------|----------|
| beneficiaryBankcardId | integer | 是 | 收款銀行卡 ID | - |
| type | integer | 是 | 訂單類型 | 0=購買, 1=出售 |
| orderId | string | 是 | 訂單編號 | - |
| amount | number | 是 | 訂單金額 | - |
| transactionCode | string | 是 | 交易密碼 | 6~20 位英數組合 |

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": "ORD20231015001",
    "amount": 1000,
    "status": 0,
    "type": 0,
    "expectFinishAt": 1697358600000
  }
}
```

**錯誤響應**:
- `400`: 參數驗證失敗或金額不符
- `401`: 交易密碼錯誤
- `404`: 掛單不存在或已完成
- `500`: 伺服器錯誤

---

#### 3. 確認已付款
**端點**: `PUT /orders/:order_id/paid`

**描述**: 買家確認已完成付款

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `order_id`: 訂單 ID

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": "ORD20231015001",
    "status": 1,
    "paidAt": 1697357400000
  }
}
```

---

#### 4. 申請完成訂單
**端點**: `PUT /orders/:order_id/apply`

**描述**: 賣家申請完成訂單 (確認已收款)

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `order_id`: 訂單 ID

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": "ORD20231015001",
    "status": 2,
    "finishAt": 1697358000000
  }
}
```

---

#### 5. 拒絕訂單
**端點**: `PUT /orders/:order_id/reject`

**描述**: 賣家拒絕訂單 (未收到款項)

**請求 Header**:
```
Authorization: Bearer {token}
```

**路徑參數**:
- `order_id`: 訂單 ID

**請求參數**:
```json
{
  "rejectReason": "未收到款項"
}
```

**成功響應** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": "ORD20231015001",
    "status": 3,
    "rejectReason": "未收到款項",
    "rejectedAt": 1697358000000
  }
}
```

---

## 錯誤處理

### 統一錯誤響應格式
```json
{
  "success": false,
  "message": "錯誤訊息描述"
}
```

### HTTP 狀態碼
| 狀態碼 | 說明 | 使用時機 |
|--------|------|----------|
| 200 | 成功 | 請求處理成功 |
| 400 | 錯誤請求 | 參數驗證失敗 |
| 401 | 未授權 | JWT Token 無效或密碼錯誤 |
| 403 | 禁止訪問 | 權限不足 |
| 404 | 找不到資源 | 請求的資源不存在 |
| 500 | 伺服器錯誤 | 伺服器內部錯誤 |

### 常見錯誤訊息

#### 認證錯誤
```json
{
  "success": false,
  "message": "帳號或密碼不可為空"
}
```

#### 參數驗證錯誤
```json
{
  "success": false,
  "message": "交易密碼格式不正確"
}
```

#### 業務邏輯錯誤
```json
{
  "success": false,
  "message": "餘額不足"
}
```

---

## 最佳實踐

### 1. 安全性建議

#### 密碼安全
- **登入密碼**: 建議使用 6~20 位英文數字組合
- **交易密碼**: 必須使用 6~20 位英數組合 (至少包含一個英文字母和一個數字)
- 定期提醒使用者更換密碼

#### Token 管理
- JWT Token 應該安全存儲在裝置上
- 登出時清除本地 Token
- Token 過期後需要重新登入

#### 推播通知
- 登入時更新 Notification Token
- 登出時清除 Notification Token
- 支援 FCM (Android) 和 APNS (iOS)

### 2. 交易安全

#### 訂單建立流程
1. 查詢可用掛單 (`GET /pending/orders`)
2. 選擇合適的掛單
3. 輸入交易密碼建立訂單 (`POST /orders`)
4. 完成付款後確認 (`PUT /orders/:id/paid`)
5. 等待對方確認收款

#### 掛單建立流程
1. 確認銀行卡已綁定 (`GET /bankcards`)
2. 輸入掛單資訊和交易密碼
3. 建立掛單 (`POST /pending/orders`)
4. 等待其他使用者接單

### 3. 錯誤處理

#### 客戶端處理
```javascript
try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!result.success) {
    // 顯示錯誤訊息給使用者
    showError(result.message);
  }
} catch (error) {
  // 處理網路錯誤
  showError('網路連線失敗，請稍後再試');
}
```

### 4. 分頁查詢

#### 標準分頁參數
```javascript
const params = {
  page: 1,    // 頁碼從 1 開始
  size: 10    // 每頁筆數
};
```

#### 分頁響應格式
```json
{
  "rows": [],      // 資料陣列
  "count": 100,    // 總筆數
  "page": 1,       // 當前頁碼
  "size": 10,      // 每頁筆數
  "totalPages": 10 // 總頁數
}
```

---

## 附錄

### A. Swagger UI 訪問
訪問 http://localhost:8000/api-docs/ 查看完整的互動式 API 文檔

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

### C. 訂單狀態流程圖

```
買家建立訂單
    ↓
[status: 0] 待付款
    ↓
買家完成付款 (PUT /orders/:id/paid)
    ↓
[status: 1] 已付款待確認
    ↓
    ├─→ 賣家確認收款 (PUT /orders/:id/apply)
    │       ↓
    │   [status: 2] 已完成
    │
    └─→ 賣家拒絕 (PUT /orders/:id/reject)
            ↓
        [status: 3] 已拒絕
```

### D. 掛單狀態說明

| 狀態值 | 狀態名稱 | 說明 | 可執行操作 |
|--------|----------|------|------------|
| 0 | 掛單中 | 可接受新訂單 | 鎖定、刪除 |
| 1 | 已鎖定 | 暫停接單 | 解鎖、刪除 |
| 2 | 已完成 | 金額已全部成交 | 查看 |
| 3 | 已取消 | 掛單已取消 | 查看 |

---

## 版本歷史

### 1.0.0 (2021-07-01)
- 初始版本發布
- 實現使用者註冊和登入
- 實現銀行卡管理
- 實現掛單和訂單管理
- 支援推播通知

---

## 聯絡資訊

**開發團隊**: PassonTW
**電子郵件**: passon.com.tw@gmail.com

---

**文件更新日期**: 2025-10-15
**API 版本**: 1.0.0
**資料庫**: token_admin (共用)
