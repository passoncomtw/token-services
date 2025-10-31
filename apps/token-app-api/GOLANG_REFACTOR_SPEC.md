# Golang 重構功能規格文件 - Token App API

本文檔基於 `swagger.json` 整理，提供完整的功能列表供 Golang 開發者依序實作。

## 基礎資訊

- **API 版本**: 1.0.0
- **Base Path**: `/`
- **Host**: `localhost:8001` (開發環境，根據實際運行端口調整) / `token-app-api.passon.tw` (生產環境)
- **Schemes**: `http`, `https`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT) 在 Header 中傳遞

### 認證方式

所有需要認證的 API（除登入相關外）都需要在 Header 中包含：
```
Authorization: Bearer {token}
```

**注意**: 與 token-admin-api 不同，token-app-api 的 securityDefinitions 在 swagger.json 中被註解掉了，但實際使用中仍需要 JWT 認證。

### 標準回應格式

所有 API 回應都遵循以下格式：
```json
{
  "success": boolean,
  "data": object | array
}
```

---

## 功能列表

### 1. 健康檢查 (Health Check)

#### GET /health-check
- **Tags**: `檢查服務狀態`
- **描述**: 檢查服務狀態
- **認證**: 不需要
- **Headers**: 無
- **Query Parameters**: 無
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "status": "WORKING"
  }
}
```
- **備註**: `status` 可能的值: "WORKING: 正常", "STOP: 停止", "MAINTAIN: 維護中"

---

### 2. 使用者驗證 (Authentication)

#### POST /auth/login
- **Tags**: `使用者驗證`
- **描述**: 使用者登入，取得 JWT token
- **認證**: 不需要
- **Headers**: 無
- **Request Body**:
```json
{
  "account": "simon",
  "password": "a12345678",
  "notificationToken": "abcde"
}
```
- **備註**: 
  - `account`: 帳號 (必填)
  - `password`: 密碼 (必填)
  - `notificationToken`: 推播 token (選填，用於推播通知)
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expireIn": 1000000,
    "user": {
      "id": 1,
      "type": 0,
      "account": "simon",
      "name": "simon",
      "email": "aaaaaa123@gmail.com",
      "createAt": "11312313113",
      "referralCode": "adfajfjd",
      "wallet": null,
      "referralUser": null
    }
  }
}
```
- **備註**: 
  - `user.type`: 0 = 一般使用者, 1 = 平台使用者
  - JWT token 使用時需要在前面加上 "Bearer "
  - 支援推播通知 token 更新

#### POST /auth/logout
- **Tags**: `使用者驗證`
- **描述**: 使用者登出
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true
}
```

---

### 3. 使用者管理 (Users)

#### POST /users
- **Tags**: `使用者`
- **描述**: 使用者註冊
- **認證**: 不需要
- **Headers**: 無
- **Request Body**:
```json
{
  "type": 0,
  "account": "simon",
  "name": "simon",
  "email": "aaa@bbb.ccc",
  "password": "a12345678",
  "transactionCode": "a123456",
  "referralCode": "123adsf"
}
```
- **備註**:
  - `type`: 0 = 一般使用者, 1 = 平台使用者
  - `email`: 必填
  - `password`: 密碼 (6~20 英文數字組合)
  - `transactionCode`: 交易密碼 (6-20位英數混合字)
  - `referralCode`: 推薦人代碼 (選填)
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "account": "simon",
    "name": "simon",
    "email": "aaaaaa123@gmail.com",
    "createAt": "11312313113",
    "referralCode": "adfajfjd",
    "wallet": null,
    "referralUser": null
  }
}
```

#### GET /users/{user_id}
- **Tags**: `使用者`
- **描述**: 顯示使用者資訊
- **認證**: 不需要（根據 swagger.json）
- **Headers**: 無
- **Path Parameters**:
  - `user_id` (string): 使用者的ID，範例: 1
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "account": "simon",
    "name": "simon",
    "email": "aaaaaa123@gmail.com",
    "createAt": "11312313113",
    "referralCode": "adfajfjd",
    "wallet": null,
    "referralUser": null
  }
}
```

#### PUT /users/{user_id}
- **Tags**: `使用者`
- **描述**: 編輯使用者資訊
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `user_id` (string): 使用者的ID，範例: 1
- **Request Body**:
```json
{
  "name": "simon",
  "email": "aaa@bbb.ccc"
}
```
- **備註**: 
  - `email`: 必填
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "account": "simon",
    "name": "simon",
    "email": "aaaaaa123@gmail.com",
    "createAt": "11312313113",
    "referralCode": "adfajfjd",
    "wallet": null,
    "referralUser": null
  }
}
```

#### PUT /users/login/password
- **Tags**: `使用者`
- **描述**: 編輯使用者登入密碼
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**:
```json
{
  "password": "a12345678",
  "newPassword": "a12345678"
}
```
- **備註**: 
  - `password`: 原密碼 (6~20 英文數字組合)
  - `newPassword`: 新密碼 (6~20 英文數字組合)
- **Response 200**:
```json
{
  "success": true
}
```

#### PUT /users/transaction/password
- **Tags**: `使用者`
- **描述**: 編輯使用者交易密碼
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**:
```json
{
  "password": "a123456",
  "newPassword": "a123456"
}
```
- **備註**: 
  - `password`: 原交易密碼 (6-20位英數混合字)
  - `newPassword`: 新交易密碼 (6-20位英數混合字)
- **Response 200**:
```json
{
  "success": true
}
```

#### GET /users/pending/orders
- **Tags**: `使用者`
- **描述**: 取回使用者自己建立的掛單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "buy": {
      "id": "bd1c7b9e-700b-469d-999c-ebd7de4c0f42",
      "isSplit": true,
      "type": 0,
      "status": 0,
      "amount": 100,
      "minAmount": 100,
      "balance": 100,
      "transactionMinutes": 15,
      "user": {},
      "bankcard": {},
      "createdAt": "2312131312",
      "cancelAmount": 0,
      "doneAmount": 0,
      "processAmount": 0,
      "processCount": 0,
      "doneCount": 0,
      "cancelCount": 0
    },
    "sell": {
      "id": "bd1c7b9e-700b-469d-999c-ebd7de4c0f42",
      "isSplit": true,
      "type": 1,
      "status": 0,
      "amount": 100,
      "minAmount": 100,
      "balance": 100,
      "transactionMinutes": 15,
      "user": {},
      "bankcard": {},
      "createdAt": "2312131312",
      "cancelAmount": 0,
      "doneAmount": 0,
      "processAmount": 0,
      "processCount": 0,
      "doneCount": 0,
      "cancelCount": 0
    }
  }
}
```
- **備註**: 返回使用者自己的買幣和賣幣掛單

#### POST /users/{user_id}/store/value
- **Tags**: `使用者`
- **描述**: 自動儲存一千塊
- **認證**: 不需要（根據 swagger.json）
- **Headers**: 無
- **Path Parameters**:
  - `user_id` (string): 使用者的ID，範例: 1
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "account": "simon",
    "name": "simon",
    "email": "aaaaaa123@gmail.com",
    "createAt": "11312313113",
    "referralCode": "adfajfjd",
    "wallet": null,
    "referralUser": null
  }
}
```

---

### 4. 銀行管理 (Banks)

#### GET /banks
- **Tags**: `銀行`
- **描述**: 取回銀行列表
- **認證**: 不需要
- **Headers**: 無
- **Query Parameters**: 無
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 0,
      "bankName": "溫蒂",
      "bankCode": "1234567890123456789"
    }
  ]
}
```

---

### 5. 銀行卡管理 (Bankcards)

#### GET /bankcards
- **Tags**: `銀行卡`
- **描述**: 取回銀行卡列表
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 0,
      "createdAt": "12312312312",
      "name": "溫蒂",
      "cardNumber": "1234567890123456789",
      "bankId": 1,
      "branchName": "分行名稱",
      "status": 0,
      "bank": {
        "id": 0,
        "bankName": "溫蒂",
        "bankCode": "1234567890123456789"
      }
    }
  ]
}
```

#### POST /bankcards
- **Tags**: `銀行卡`
- **描述**: 新增銀行卡
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**:
```json
{
  "name": "溫蒂",
  "cardNumber": "1234567890123456789",
  "branchName": "分行名稱",
  "status": 0,
  "bankId": 1
}
```
- **備註**: 
  - `status`: 0 = 凍結, 1 = 啟用
  - `bankId`: 銀行 Id (必填)
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 0,
    "createdAt": "12312312312",
    "name": "溫蒂",
    "cardNumber": "1234567890123456789",
    "bankId": 1,
    "branchName": "分行名稱",
    "status": 0,
    "bank": {}
  }
}
```

#### PUT /bankcards/{bankcard_id}
- **Tags**: `銀行卡`
- **描述**: 編輯銀行卡
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `bankcard_id` (string, default: 1): 銀行卡ID
- **Request Body**:
```json
{
  "cardNumber": "1234567890123456789",
  "bankId": 1,
  "branchName": "分行名稱"
}
```
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 0,
    "createdAt": "12312312312",
    "name": "溫蒂",
    "cardNumber": "1234567890123456789",
    "bankId": 1,
    "branchName": "分行名稱",
    "status": 0,
    "bank": {}
  }
}
```

#### DELETE /bankcards/{bankcard_id}
- **Tags**: `銀行卡`
- **描述**: 刪除銀行卡
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `bankcard_id` (string, default: 1): 銀行卡ID
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true
}
```

---

### 6. 掛單管理 (Pending Orders)

#### GET /pending/orders
- **Tags**: `掛單`
- **描述**: 取回掛單列表
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Query Parameters**:
  - `type` (integer, optional): 掛單類型，0 = 買幣, 1 = 賣幣
  - `balance` (number, optional): 掛單的餘額搜尋
  - `page` (string, optional, default: 1): 取為第幾頁的資料
  - `size` (string, optional, default: 1): 取回幾筆資料
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "bd1c7b9e-700b-469d-999c-ebd7de4c0f42",
      "isSplit": true,
      "type": 0,
      "status": 0,
      "amount": 100,
      "minAmount": 100,
      "balance": 100,
      "transactionMinutes": 15,
      "user": {},
      "bankcard": {},
      "createdAt": "2312131312"
    }
  ]
}
```

#### POST /pending/orders
- **Tags**: `掛單`
- **描述**: 建立掛單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**:
```json
{
  "bankcardId": 0,
  "type": 0,
  "amount": 100,
  "minAmount": 100,
  "transactionMinutes": 15,
  "transactionCode": "a123456"
}
```
- **備註**:
  - `bankcardId`: 收款的銀行卡 ID (必填)
  - `type`: 0 = 買幣, 1 = 賣幣 (必填)
  - `amount`: 這筆訂單的販賣(購買)數量 (必填)
  - `minAmount`: 交易最小額度 (必填)
  - `transactionMinutes`: 每筆交易的限制時間 (必填)
  - `transactionCode`: 交易密碼 (6-20位英數混合字) (必填)
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "bd1c7b9e-700b-469d-999c-ebd7de4c0f42",
      "isSplit": true,
      "type": 0,
      "status": 0,
      "amount": 100,
      "minAmount": 100,
      "balance": 100,
      "transactionMinutes": 15,
      "user": {},
      "bankcard": {},
      "createdAt": "2312131312"
    }
  ]
}
```

#### GET /pending/orders/{pendingorder_id}
- **Tags**: `掛單`
- **描述**: 取回掛單詳情
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `pendingorder_id` (string): 掛單 Id
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "bd1c7b9e-700b-469d-999c-ebd7de4c0f42",
    "isSplit": true,
    "type": 0,
    "status": 0,
    "amount": 100,
    "minAmount": 100,
    "balance": 100,
    "transactionMinutes": 15,
    "user": {},
    "bankcard": {},
    "createdAt": "2312131312"
  }
}
```

#### DELETE /pending/orders/{pendingorder_id}
- **Tags**: `掛單`
- **描述**: 刪除掛單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `pendingorder_id` (string): 掛單 Id
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true
}
```

#### PUT /pending/orders/{pendingorder_id}/lock
- **Tags**: `掛單`
- **描述**: 凍結掛單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `pendingorder_id` (string): 掛單 Id
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true
}
```

#### PUT /pending/orders/{pendingorder_id}/unlock
- **Tags**: `掛單`
- **描述**: 解除凍結掛單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `pendingorder_id` (string): 掛單 Id
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true
}
```

---

### 7. 訂單管理 (Orders)

#### GET /orders
- **Tags**: `訂單`
- **描述**: 取回訂單列表
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Query Parameters**:
  - `page` (string, optional, default: 1): 取為第幾頁的資料
  - `size` (string, optional, default: 1): 取回幾筆資料
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
      "status": 0,
      "amount": 100,
      "cancelReason": null,
      "finishAt": "12312313",
      "user": {},
      "bankcard": {},
      "pendingOrder": {},
      "createdAt": "123132131231"
    }
  ]
}
```

#### POST /orders
- **Tags**: `訂單`
- **描述**: 建立訂單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**:
```json
{
  "beneficiaryBankcardId": 1,
  "orderId": "76690007-53b7-4228-89cb-b388df9fcd2f",
  "amount": 100,
  "transactionCode": "a123456"
}
```
- **備註**:
  - `beneficiaryBankcardId`: 買家銀行卡 Id
  - `orderId`: 掛單 Id (UUID)
  - `amount`: 交易額度
  - `transactionCode`: 交易密碼 (6-20位英數混合字) (必填)
- **Response 200**:
```json
{
  "id": "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
  "status": 0,
  "amount": 100,
  "cancelReason": null,
  "finishAt": "12312313",
  "user": {},
  "bankcard": {},
  "pendingOrder": {},
  "createdAt": "123132131231"
}
```

#### PUT /orders/{order_id}/paid
- **Tags**: `訂單`
- **描述**: 付款已完成
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `order_id` (string, default: 1): 交易 Id
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
      "status": 0,
      "amount": 100,
      "cancelReason": null,
      "finishAt": "12312313",
      "user": {},
      "bankcard": {},
      "pendingOrder": {},
      "createdAt": "123132131231"
    }
  ]
}
```

#### PUT /orders/{order_id}/apply
- **Tags**: `訂單`
- **描述**: 放行
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `order_id` (string, default: 1): 交易 Id
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
      "status": 0,
      "amount": 100,
      "cancelReason": null,
      "finishAt": "12312313",
      "user": {},
      "bankcard": {},
      "pendingOrder": {},
      "createdAt": "123132131231"
    }
  ]
}
```

#### PUT /orders/{order_id}/reject
- **Tags**: `訂單`
- **描述**: 取消訂單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `order_id` (string, default: 1): 交易 Id
- **Request Body**:
```json
{
  "cancelReason": "就是想取消"
}
```
- **備註**: `cancelReason`: 取消原因
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
      "status": 0,
      "amount": 100,
      "cancelReason": null,
      "finishAt": "12312313",
      "user": {},
      "bankcard": {},
      "pendingOrder": {},
      "createdAt": "123132131231"
    }
  ]
}
```

---

## 資料模型定義 (Definitions)

以下為所有 API 中使用的資料模型完整定義：

### LOGIN_RESPONSE
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expireIn": 1000000,
  "user": {
    "id": 1,
    "type": 0,
    "account": "simon",
    "name": "simon",
    "email": "aaaaaa123@gmail.com",
    "createAt": "11312313113",
    "referralCode": "adfajfjd",
    "wallet": null,
    "referralUser": null
  }
}
```

### User
```json
{
  "id": 1,
  "type": 0,
  "account": "simon",
  "name": "simon",
  "email": "aaaaaa123@gmail.com",
  "createAt": "11312313113",
  "referralCode": "adfajfjd",
  "wallet": null,
  "referralUser": null
}
```

### REGISTER_USER
```json
{
  "type": 0,
  "account": "simon",
  "name": "simon",
  "email": "aaa@bbb.ccc",
  "password": "a12345678",
  "transactionCode": "a123456",
  "referralCode": "123adsf"
}
```

### UPDATE_USER
```json
{
  "name": "simon",
  "email": "aaa@bbb.ccc"
}
```

### UpdateUserLoginPassword
```json
{
  "password": "a12345678",
  "newPassword": "a12345678"
}
```

### UpdateUserTransactionCode
```json
{
  "password": "a123456",
  "newPassword": "a123456"
}
```

### Bank
```json
{
  "id": 0,
  "bankName": "溫蒂",
  "bankCode": "1234567890123456789"
}
```

### Banks
```json
[
  {
    "id": 0,
    "bankName": "溫蒂",
    "bankCode": "1234567890123456789"
  }
]
```

### Bankcard
```json
{
  "id": 0,
  "createdAt": "12312312312",
  "name": "溫蒂",
  "cardNumber": "1234567890123456789",
  "bankId": 1,
  "branchName": "分行名稱",
  "status": 0,
  "bank": {
    "id": 0,
    "bankName": "溫蒂",
    "bankCode": "1234567890123456789"
  }
}
```

### CreateBankcard
```json
{
  "name": "溫蒂",
  "cardNumber": "1234567890123456789",
  "branchName": "分行名稱",
  "status": 0,
  "bankId": 1
}
```

### UpdateBankcard
```json
{
  "cardNumber": "1234567890123456789",
  "bankId": 1,
  "branchName": "分行名稱"
}
```

### Bankcards
```json
[
  {
    "id": 0,
    "createdAt": "12312312312",
    "name": "溫蒂",
    "cardNumber": "1234567890123456789",
    "bankId": 1,
    "branchName": "分行名稱",
    "status": 0,
    "bank": {}
  }
]
```

### PendingOrder
```json
{
  "id": "bd1c7b9e-700b-469d-999c-ebd7de4c0f42",
  "isSplit": true,
  "type": 0,
  "status": 0,
  "amount": 100,
  "minAmount": 100,
  "balance": 100,
  "transactionMinutes": 15,
  "user": {
    "id": "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
    "name": "simon"
  },
  "bankcard": {},
  "createdAt": "2312131312"
}
```

### CreatePendingOrder
```json
{
  "bankcardId": 0,
  "type": 0,
  "amount": 100,
  "minAmount": 100,
  "transactionMinutes": 15,
  "transactionCode": "a123456"
}
```

### UserPendingOrder
```json
{
  "id": "bd1c7b9e-700b-469d-999c-ebd7de4c0f42",
  "isSplit": true,
  "type": 0,
  "status": 0,
  "amount": 100,
  "minAmount": 100,
  "balance": 100,
  "transactionMinutes": 15,
  "user": {},
  "bankcard": {},
  "createdAt": "2312131312",
  "cancelAmount": 0,
  "doneAmount": 0,
  "processAmount": 0,
  "processCount": 0,
  "doneCount": 0,
  "cancelCount": 0
}
```

### UserPendingOrders
```json
[
  {
    "id": "bd1c7b9e-700b-469d-999c-ebd7de4c0f42",
    "isSplit": true,
    "type": 0,
    "status": 0,
    "amount": 100,
    "minAmount": 100,
    "balance": 100,
    "transactionMinutes": 15,
    "user": {},
    "bankcard": {},
    "createdAt": "2312131312",
    "cancelAmount": 0,
    "doneAmount": 0,
    "processAmount": 0,
    "processCount": 0,
    "doneCount": 0,
    "cancelCount": 0
  }
]
```

### PendingOrders
```json
[
  {
    "id": "bd1c7b9e-700b-469d-999c-ebd7de4c0f42",
    "isSplit": true,
    "type": 0,
    "status": 0,
    "amount": 100,
    "minAmount": 100,
    "balance": 100,
    "transactionMinutes": 15,
    "user": {},
    "bankcard": {},
    "createdAt": "2312131312"
  }
]
```

### Order
```json
{
  "id": "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
  "status": 0,
  "amount": 100,
  "cancelReason": null,
  "finishAt": "12312313",
  "user": {
    "id": "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
    "name": "simon"
  },
  "bankcard": {},
  "pendingOrder": {},
  "createdAt": "123132131231"
}
```

### CreateOrder
```json
{
  "beneficiaryBankcardId": 1,
  "orderId": "76690007-53b7-4228-89cb-b388df9fcd2f",
  "amount": 100,
  "transactionCode": "a123456"
}
```

### Orders
```json
[
  {
    "id": "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
    "status": 0,
    "amount": 100,
    "cancelReason": null,
    "finishAt": "12312313",
    "user": {},
    "bankcard": {},
    "pendingOrder": {},
    "createdAt": "123132131231"
  }
]
```

### Wallet
```json
{
  "status": 1,
  "usefulBalance": 100,
  "guaranteedBalance": 90,
  "freezeBalance": 30
}
```

### ReferralUser
```json
{
  "id": 1,
  "type": 0,
  "account": "simon",
  "name": "simon",
  "email": "aaa@bbb.ccc"
}
```

### BasicOrderStatistics
```json
{
  "id": 0,
  "createdAt": "12312312312",
  "successfulOrderCount": 0,
  "successfulCommentCount": 0,
  "failCommentCount": 0,
  "averageOrderTime": 0
}
```

---

## 實作建議順序

### 階段一：基礎功能
1. **健康檢查** - GET /health-check
2. **使用者註冊** - POST /users
3. **使用者登入** - POST /auth/login
4. **使用者登出** - POST /auth/logout

### 階段二：使用者管理
5. **使用者資訊查詢** - GET /users/{user_id}
6. **使用者資訊更新** - PUT /users/{user_id}
7. **修改登入密碼** - PUT /users/login/password
8. **修改交易密碼** - PUT /users/transaction/password
9. **使用者掛單列表** - GET /users/pending/orders

### 階段三：銀行與銀行卡
10. **銀行列表** - GET /banks
11. **銀行卡列表** - GET /bankcards
12. **新增銀行卡** - POST /bankcards
13. **編輯銀行卡** - PUT /bankcards/{bankcard_id}
14. **刪除銀行卡** - DELETE /bankcards/{bankcard_id}

### 階段四：掛單系統
15. **掛單列表** - GET /pending/orders
16. **建立掛單** - POST /pending/orders
17. **掛單詳情** - GET /pending/orders/{pendingorder_id}
18. **刪除掛單** - DELETE /pending/orders/{pendingorder_id}
19. **凍結掛單** - PUT /pending/orders/{pendingorder_id}/lock
20. **解除凍結** - PUT /pending/orders/{pendingorder_id}/unlock

### 階段五：訂單系統
21. **訂單列表** - GET /orders
22. **建立訂單** - POST /orders
23. **付款確認** - PUT /orders/{order_id}/paid
24. **放行訂單** - PUT /orders/{order_id}/apply
25. **取消訂單** - PUT /orders/{order_id}/reject

### 階段六：特殊功能
26. **自動儲值** - POST /users/{user_id}/store/value

---

## 重要注意事項

1. **認證機制**: 
   - 雖然 swagger.json 中 securityDefinitions 被註解掉，但實際上所有需要認證的 API 都使用 JWT Bearer Token
   - 只有 `/health-check`, `/users` POST (註冊), `/auth/login`, `/users/{user_id}` GET 不需要認證

2. **推播通知**: 
   - 登入時可以提交 `notificationToken` 用於推播通知
   - 這是 token-app-api 特有的功能

3. **交易密碼格式**:
   - 登入密碼: 6~20 英文數字組合
   - 交易密碼: 6-20位英數混合字（與 admin-api 的 4個數字不同）

4. **狀態碼**: 
   - 銀行卡 `status`: 0 = 凍結, 1 = 啟用
   - 掛單 `status`: 0 = 掛賣中, 1 = 已暫停掛賣, 2 = 以取消掛單, 3 = (根據 enum)
   - 訂單 `status`: 0 = 等待匯款, 1 = 已匯款未放行, 2 = 已放行, 3 = 買家已取消, 4 = 賣家已取消

5. **UUID 格式**: 
   - 掛單 ID (`pendingorder_id`) 使用 UUID 格式
   - 訂單 ID (`order_id`) 使用 UUID 格式

6. **Path 參數命名**:
   - 使用 `user_id` 而非 `userId` (與 admin-api 不同)
   - 使用 `bankcard_id` 而非 `bankcardId` (與 admin-api 不同)
   - 使用 `pendingorder_id` 而非 `pendingOrderId` (與 admin-api 不同)
   - 使用 `order_id` 而非 `orderId` (與 admin-api 不同)

7. **分頁參數**: 
   - `page` 和 `size` 在 swagger.json 中類型為 `string`
   - 實作時應轉換為 `number`

8. **訂單操作流程**:
   - `paid`: 買家已付款
   - `apply`: 賣家放行
   - `reject`: 取消訂單（需要提供 `cancelReason`）

9. **掛單操作**:
   - `lock`: 凍結掛單
   - `unlock`: 解除凍結掛單

10. **與 token-admin-api 的差異**:
    - token-app-api 是給一般使用者使用的行動應用 API
    - 不需要後台角色管理、後台使用者管理等管理功能
    - 專注於使用者的交易操作：註冊、登入、掛單、訂單、銀行卡管理
    - 支援推播通知 token

---

## 測試建議

每個功能實作完成後，建議：
1. 單元測試：測試業務邏輯
2. 整合測試：測試 API 端點
3. 對比測試：與原始 Node.js API 進行對比測試，確保回應格式完全一致

---

**文檔版本**: 1.0.0  
**最後更新**: 2025-01-XX  
**基於**: swagger.json (token-app-api)  
**總端點數**: 20 個路由，25 個 HTTP 操作

