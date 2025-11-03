# Golang 重構功能規格文件

本文檔基於 `swagger.json` 整理，提供完整的功能列表供 Golang 開發者依序實作。

## 基礎資訊

- **API 版本**: 1.0.0
- **Base Path**: `/`
- **Host**: `localhost:8300` (開發環境) / `token-api.passon.tw` (生產環境)
- **Schemes**: `http`, `https`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT) 在 Header 中傳遞

### 認證方式

所有需要認證的 API（除登入相關外）都需要在 Header 中包含：
```
Authorization: Bearer {token}
```

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
- **備註**: `status` 可能的值: "WORKING", "STOP", "MAINTAIN"

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
  "account": "admin2021",
  "password": "a12345678"
}
```
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
      "createAt": 1131231311322,
      "permissions": {
        "user": {
          "manager": {"read": true},
          "list": {"read": true}
        },
        "system": {
          "backenduser": {"read": true, "create": true},
          "backendactor": {"read": true, "create": true}
        }
      }
    }
  }
}
```
- **備註**: 
  - `user.type`: 0 = 一般使用者, 1 = 平台使用者
  - `permissions`: 巢狀 JSON 物件，包含所有權限設定
  - JWT token 使用時需要在前面加上 "Bearer "

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

#### POST /auth/login/password
- **Tags**: `使用者驗證`
- **描述**: 編輯後台使用者登入密碼
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**:
```json
{
  "password": "a12345678",
  "newPassword": "a123456789"
}
```
- **備註**: 
  - `password`: 舊密碼 (6~20 英文數字組合)
  - `newPassword`: 新密碼 (6~20 英文數字組合)
- **Response 200**:
```json
{
  "success": true
}
```

---

### 3. 後台角色管理 (Backend Actors)

#### GET /backendactors
- **Tags**: `後台角色`
- **描述**: 取回角色列表
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Query Parameters**: 無
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "admin",
      "markup": "testadmin",
      "permissions": {
        "user": {
          "manager": {"read": true},
          "list": {"read": true},
          "order": {"read": true, "update": true}
        },
        "system": {
          "backenduser": {"read": true, "create": true, "delete": true},
          "backendactor": {"read": true, "create": true, "delete": true}
        }
      }
    }
  ]
}
```

#### POST /backendactors
- **Tags**: `後台角色`
- **描述**: 新增後台角色
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**:
```json
{
  "name": "admin",
  "markup": "testadmin",
  "permissions": {
    "user": {
      "manager": {"read": true},
      "list": {"read": true}
    },
    "system": {
      "backenduser": {"read": true, "create": true},
      "backendactor": {"read": true, "create": true}
    }
  }
}
```
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "admin",
    "markup": "testadmin",
    "permissions": {
      "user": {
        "manager": {"read": true},
        "list": {"read": true}
      },
      "system": {
        "backenduser": {"read": true, "create": true},
        "backendactor": {"read": true, "create": true}
      }
    }
  }
}
```

#### PUT /backendactors/{backendActorId}
- **Tags**: `後台角色`
- **描述**: 編輯後台角色
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `backendActorId` (string): 角色 ID
- **Request Body**:
```json
{
  "name": "admin",
  "markup": "testadmin",
  "permissions": {
    "user": {
      "manager": {"read": true},
      "list": {"read": true}
    },
    "system": {
      "backenduser": {"read": true, "create": true},
      "backendactor": {"read": true, "create": true}
    }
  }
}
```
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "admin",
    "markup": "testadmin",
    "permissions": {
      "user": {
        "manager": {"read": true},
        "list": {"read": true}
      },
      "system": {
        "backenduser": {"read": true, "create": true},
        "backendactor": {"read": true, "create": true}
      }
    }
  }
}
```

#### DELETE /backendactors/{backendActorId}
- **Tags**: `後台角色`
- **描述**: 刪除後台角色
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `backendActorId` (string): 角色 ID
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true
}
```

#### GET /backendactors/permissions
- **Tags**: `後台角色`
- **描述**: 取回所有的權限樹狀結構
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "functionName": "系統管理",
    "functionIdentify": "system",
    "parentId": null,
    "children": [
      {
        "functionName": "後台使用者管理",
        "functionIdentify": "system.backenduser",
        "parentId": "system",
        "children": [
          {
            "functionName": "檢視",
            "functionIdentify": "system.backenduser.read",
            "parentId": "system.backenduser"
          },
          {
            "functionName": "新增",
            "functionIdentify": "system.backenduser.create",
            "parentId": "system.backenduser"
          },
          {
            "functionName": "刪除",
            "functionIdentify": "system.backenduser.delete",
            "parentId": "system.backenduser"
          }
        ]
      },
      {
        "functionName": "後台角色管理",
        "functionIdentify": "system.backendactor",
        "parentId": "system",
        "children": [
          {
            "functionName": "檢視",
            "functionIdentify": "system.backendactor.read",
            "parentId": "system.backendactor"
          },
          {
            "functionName": "新增",
            "functionIdentify": "system.backendactor.create",
            "parentId": "system.backendactor"
          },
          {
            "functionName": "刪除",
            "functionIdentify": "system.backendactor.delete",
            "parentId": "system.backendactor"
          }
        ]
      }
    ]
  }
}
```

#### POST /backendactors/permissions
- **Tags**: `後台角色`
- **描述**: 新增後台角色（與 POST /backendactors 相同）
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**: 與 POST /backendactors 相同
- **Response**: 與 POST /backendactors 相同

---

### 4. 後台使用者管理 (Backend Users)

#### GET /backendusers
- **Tags**: `後台使用者`
- **描述**: 後台使用者列表
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Query Parameters**:
  - `account` (string, optional): 後台使用者帳號，範例: "wendy"
  - `name` (string, optional): 後台使用者暱稱，範例: "wendy"
  - `status` (number, optional): 帳號狀態，0 = 啟用, 1 = 停用
  - `page` (number, optional, default: 1): 頁數
  - `size` (number, optional, default: 10): 每頁資訊
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "admin001",
      "account": "testadmin",
      "status": 0,
      "permissions": {
        "user": {
          "manager": {"read": true},
          "list": {"read": true}
        },
        "system": {
          "backenduser": {"read": true, "create": true},
          "backendactor": {"read": true, "create": true}
        }
      },
      "actor": {
        "id": 1,
        "name": "admin",
        "markup": "admin"
      }
    }
  ]
}
```
- **備註**: 
  - `permissions`: 從關聯的 actor 複製過來，方便前端顯示
  - `actor`: 單一角色物件（一個使用者只能有一個角色）

#### POST /backendusers
- **Tags**: `後台使用者`
- **描述**: 新增後台使用者
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**:
```json
{
  "name": "admin001",
  "account": "testadmin",
  "password": "a12345678",
  "actorId": 1
}
```
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "admin001",
    "account": "testadmin",
    "status": 0,
    "permissions": {
      "user": {
        "manager": {"read": true},
        "list": {"read": true}
      },
      "system": {
        "backenduser": {"read": true, "create": true},
        "backendactor": {"read": true, "create": true}
      }
    },
    "actor": {
      "id": 1,
      "name": "admin",
      "markup": "admin"
    }
  }
}
```
- **備註**: 
  - `actorId`: 指定角色 ID（必填）
  - `password`: 6~20 英文數字組合

#### PUT /backendusers/{backendUserId}
- **Tags**: `後台使用者`
- **描述**: 編輯後台使用者
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `backendUserId` (string): 要編輯的使用者 ID
- **Request Body**:
```json
{
  "name": "admin001",
  "account": "testadmin",
  "status": 0,
  "actorId": 1
}
```
- **備註**: 
  - `status`: 0 = 啟用, 1 = 停用
  - `actorId`: 可選，更換角色時提供
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "admin001",
    "account": "testadmin",
    "status": 0,
    "permissions": {
      "user": {
        "manager": {"read": true},
        "list": {"read": true}
      },
      "system": {
        "backenduser": {"read": true, "create": true},
        "backendactor": {"read": true, "create": true}
      }
    },
    "actor": {
      "id": 1,
      "name": "admin",
      "markup": "admin"
    }
  }
}
```

#### DELETE /backendusers/{backendUserId}
- **Tags**: `後台使用者`
- **描述**: 刪除後台使用者
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `backendUserId` (string): 要編輯的使用者 ID
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true
}
```

---

### 5. 使用者管理 (Users)

#### GET /users
- **Tags**: `使用者`
- **描述**: 使用者列表
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Query Parameters**:
  - `account` (string, optional): 使用者帳號，範例: "edmond"
  - `email` (string, optional): 使用者信箱，範例: "aaa@bbb.cc"
  - `name` (string, optional): 使用者暱稱，範例: "edmond"
  - `status` (number, optional): 會員狀態，0 = 停用, 1 = 啟用
  - `orderStatus` (number, optional): 掛單狀態，0 = 凍結, 1 = 啟用
  - `transactionStatus` (number, optional): 交易狀態，0 = 凍結, 1 = 啟用
  - `isMerchant` (boolean, optional): 是否為商家
  - `page` (string, optional, default: 1): 取為第幾頁的資料
  - `size` (string, optional, default: 10): 取回幾筆資料
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": 0,
      "account": "simon",
      "name": "simon",
      "createAt": 1131231311322,
      "merchant": null
    }
  ]
}
```

#### POST /users
- **Tags**: `使用者`
- **描述**: 新增使用者(商家)
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**:
```json
{
  "type": 0,
  "account": "simon",
  "name": "simon",
  "password": "a12345678",
  "transactionCode": "a12345678",
  "referrer": "a3e4e373",
  "contactor": "溫蒂s",
  "telegram": "abcccccc",
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
- **備註**:
  - `type`: 0 = 一般使用者, 1 = 平台使用者
  - `password`: 密碼 (6~20 英文數字組合)
  - `transactionCode`: 交易密碼 (4個數字)
  - `buyFeeType` / `sellFeeType`: 0 = 百分比手續費, 1 = 階梯式手續費
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "account": "simon",
    "name": "simon",
    "createAt": 1131231311322,
    "merchant": null
  }
}
```

#### GET /users/{userId}
- **Tags**: `使用者`
- **描述**: 取得使用者詳細資訊
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `userId` (number): 使用者Id
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
    "createAt": 1131231311322,
    "status": 1,
    "orderStatus": 1,
    "transactionStatus": 1,
    "phone": "0987654321",
    "markup": "test mark up",
    "merchant": null,
    "wallet": null
  }
}
```

#### PUT /users/{userId}
- **Tags**: `使用者`
- **描述**: 編輯使用者(商家)
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `userId` (number): 要編輯的使用者 Id
- **Request Body**:
```json
{
  "phone": "0987654321",
  "status": 1,
  "orderStatus": 1,
  "transactionStatus": 1,
  "type": 0,
  "name": "simon",
  "contactor": "溫蒂s",
  "telegram": "abcccccc",
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
  },
  "buyLadderFee": [
    {
      "amount": 100,
      "feePercent": 0.1
    }
  ],
  "sellLadderFee": [
    {
      "amount": 100,
      "feePercent": 0.1
    }
  ]
}
```
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "account": "simon",
    "name": "simon",
    "createAt": 1131231311322,
    "merchant": null
  }
}
```

#### PUT /users/{userId}/unlock
- **Tags**: `使用者`
- **描述**: 解鎖使用者
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `userId` (number): 使用者 ID
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
    "createAt": 1131231311322,
    "status": 1,
    "orderStatus": 1,
    "transactionStatus": 1,
    "phone": "0987654321",
    "markup": "test mark up",
    "merchant": null,
    "wallet": null
  }
}
```

#### PUT /users/{userId}/login/password
- **Tags**: `使用者`
- **描述**: 編輯使用者登入密碼
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `userId` (number): 使用者 ID
- **Request Body**:
```json
{
  "password": "a12345678",
  "newPassword": "a123456789"
}
```
- **備註**: 
  - `password`: 舊密碼 (6~20 英文數字組合)
  - `newPassword`: 新密碼 (6~20 英文數字組合)
- **Response 200**:
```json
{
  "success": true
}
```

#### PUT /users/{userId}/transaction/password
- **Tags**: `使用者`
- **描述**: 編輯使用者交易密碼
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `userId` (number): 使用者 ID
- **Request Body**:
```json
{
  "password": "a12345678"
}
```
- **備註**: `password`: 新交易密碼 (4個數字)
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": 0,
    "account": "simon",
    "name": "simon",
    "createAt": 1131231311322,
    "status": 1,
    "orderStatus": 1,
    "transactionStatus": 1,
    "phone": "0987654321",
    "markup": "test mark up",
    "merchant": null,
    "wallet": null
  }
}
```

#### PUT /users/login/password
- **Tags**: `使用者`
- **描述**: 編輯自己的登入密碼
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**:
```json
{
  "password": "a12345678",
  "newPassword": "a123456789"
}
```
- **備註**: 
  - `password`: 舊密碼
  - `newPassword`: 新密碼
- **Response 200**:
```json
{
  "success": true
}
```

#### GET /users/{userId}/bankcards
- **Tags**: `使用者`
- **描述**: 取得使用者銀行卡列表
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `userId` (number): 使用者 Id
- **Query Parameters**:
  - `page` (string, optional, default: 1): 取為第幾頁的資料
  - `size` (string, optional, default: 10): 取回幾筆資料
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 0,
      "createAt": "12312312312",
      "name": "溫蒂",
      "cardNumber": "1234567890123456789",
      "branchName": "分行名稱",
      "status": 0,
      "bankId": 1,
      "bankName": "中國銀行",
      "bankCode": "CDD"
    }
  ]
}
```

#### GET /users/{userId}/orders
- **Tags**: `使用者`
- **描述**: 取得使用者訂單列表
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `userId` (number): 使用者 Id
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": 0,
      "cancelReason": null,
      "amount": 100,
      "finishAt": 12312313,
      "pendingOrder": {},
      "user": {
        "id": 1,
        "name": "tomasdemo001",
        "account": "tomasdemo001"
      },
      "bankcard": {},
      "createAt": "123132131231"
    }
  ]
}
```

#### GET /users/{userId}/pending/orders
- **Tags**: `使用者`
- **描述**: 取得使用者掛單列表
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `userId` (number): 使用者 Id
- **Query Parameters**:
  - `page` (string, optional, default: 1): 取為第幾頁的資料
  - `size` (string, optional, default: 1): 取回幾筆資料
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "30dae9a8-a9ee-43f2-8df5-3b5d2110f04b",
        "type": 0,
        "status": 0,
        "amount": 100,
        "minAmount": 100,
        "balance": 100,
        "transactionMinutes": 15,
        "user": {},
        "bankcard": {},
        "createAt": "2312131312"
      }
    ],
    "count": 10
  }
}
```

---

### 6. 銀行管理 (Banks)

#### GET /banks
- **Tags**: `銀行`
- **描述**: 銀行列表
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
      "id": 1,
      "bankName": "中國農業銀行",
      "bankCode": "CDC",
      "status": 1
    }
  ]
}
```

#### POST /banks
- **Tags**: `銀行`
- **描述**: 新增銀行
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Request Body**:
```json
{
  "bankName": "中國農業銀行",
  "bankCode": "CDC"
}
```
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bankName": "中國農業銀行",
    "bankCode": "CDC",
    "status": 1
  }
}
```

#### PUT /banks/{bankId}
- **Tags**: `銀行`
- **描述**: 編輯銀行
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `bankId` (number): 銀行的 id
- **Request Body**:
```json
{
  "bankName": "中國農業銀行",
  "bankCode": "CDC"
}
```
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bankName": "中國農業銀行",
    "bankCode": "CDC",
    "status": 1
  }
}
```

---

### 7. 銀行卡管理 (Bankcards)

#### GET /bankcards
- **Tags**: `銀行卡`
- **描述**: 銀行卡列表（有 query 的話要做 url encode）
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Query Parameters**:
  - `cardNumber` (string, optional): 銀行卡卡號，範例: "1231231231"
  - `bankCode` (string, optional): 銀行代碼，範例: "CDC"
  - `branchName` (string, optional): 開戶支行，範例: "民生支行"
  - `bankName` (string, optional): 開戶行，範例: "中央銀行"
  - `name` (string, optional): 銀行卡使用者姓名，範例: "温蒂"
  - `account` (string, optional): 銀行卡使用者帳號，範例: "tomasdemo001"
  - `page` (number, required): 頁數，範例: 1
  - `size` (number, required): 每頁筆數，範例: 10
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "count": 100,
    "rows": [
      {
        "id": 0,
        "createAt": "12312312312",
        "name": "溫蒂",
        "cardNumber": "1234567890123456789",
        "branchName": "分行名稱",
        "status": 0,
        "bankId": 1,
        "bankName": "中國銀行",
        "bankCode": "CDD",
        "account": "wendy"
      }
    ]
  }
}
```

#### GET /bankcards/{bankcardId}
- **Tags**: `銀行卡`
- **描述**: 銀行卡詳細資訊
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `bankcardId` (string, default: 1): 銀行卡 Id
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 0,
    "createAt": "12312312312",
    "name": "溫蒂",
    "cardNumber": "1234567890123456789",
    "branchName": "分行名稱",
    "status": 0,
    "bankId": 1,
    "bankName": "中國銀行",
    "bankCode": "CDD"
  }
}
```

---

### 8. 訂單管理 (Orders)

#### GET /orders
- **Tags**: `訂單`
- **描述**: 訂單列表
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Query Parameters**:
  - `account` (string, optional): 使用者的帳號，範例: "wendy"
  - `payer` (string, optional): 收款人/付款人的暱稱，範例: "wendy"
  - `cancelReason` (string, optional): 取消的理由，範例: "test"
  - `startAt` (string, optional): 搜尋訂單建立的時間區段 startAt，範例: "2021-04-01 09:00:00"
  - `endAt` (string, optional): 搜尋訂單建立的時間區段 endAt，範例: "2021-12-02 19:00:00"
  - `type` (string, optional): 交易類型，0 = 買幣, 1 = 賣幣
  - `orderId` (string, optional): 訂單編號，範例: "ajkasjl12313"
  - `status` (number, optional): 訂單狀態，0 = 等待匯款, 1 = 已匯款未放行, 2 = 已放行, 3 = 買家已取消, 4 = 賣家已取消
  - `minAmount` (number, optional): 最低金額的數量，範例: 0
  - `maxAmount` (number, optional): 最高金額數量，範例: 10
  - `userId` (string, optional, default: 0): 建立訂單的使用者id
  - `finishAtType` (string, optional): 交易時間，沒有值代表全部，overdue = 逾期, notOverdue = 未逾期
  - `page` (number, optional, default: 1): 頁數
  - `size` (number, optional, default: 10): 每頁數量
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "count": 10,
    "rows": [
      {
        "id": 1,
        "createdAt": "12312312312",
        "status": 0,
        "cancelReason": null,
        "amount": 100,
        "finishAt": 12312313,
        "sender": {},
        "senderBankcard": {},
        "beneficiaryBankcard": {},
        "beneficiary": {
          "id": 1,
          "name": 1,
          "account": 1
        }
      }
    ]
  }
}
```

#### PUT /orders/{orderId}
- **Tags**: `訂單`
- **描述**: 完成訂單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `orderId` (string): 訂單 id，範例: "59ce32c9-ae02-4355-b1dc-d66965b24d0f"
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": 0,
    "cancelReason": null,
    "amount": 100,
    "finishAt": 12312313,
    "pendingOrder": {},
    "user": {},
    "bankcard": {},
    "createAt": "123132131231"
  }
}
```

#### PUT /orders/{orderId}/cancel
- **Tags**: `訂單`
- **描述**: 取消訂單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `orderId` (string): 訂單 id，範例: "59ce32c9-ae02-4355-b1dc-d66965b24d0f"
- **Request Body**:
```json
{
  "cancelReason": "test"
}
```
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": 0,
    "cancelReason": null,
    "amount": 100,
    "finishAt": 12312313,
    "pendingOrder": {},
    "user": {},
    "bankcard": {},
    "createAt": "123132131231"
  }
}
```

---

### 9. 掛單管理 (Pending Orders)

#### GET /pending/orders
- **Tags**: `掛單`
- **描述**: 掛單列表
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Query Parameters**:
  - `pendingOrderId` (string, optional): 掛單 ID，範例: "c66dc29e-fd6d-43c2-9b21-1c12a25c4226"
  - `startAt` (string, optional): 開始的時間，範例: "2021-04-01 00:00:00"
  - `endAt` (string, optional): 結束的時間，範例: "2021-04-02 00:00:00"
  - `account` (string, optional): 建立掛單的使用者 account
  - `minAmount` (number, optional): 最小的數量
  - `maxAmount` (number, optional): 最大的數量
  - `minBalance` (number, optional): 最小的餘額
  - `maxBalance` (number, optional): 最大的餘額
  - `userId` (string, optional): 建立掛單的使用者id
  - `type` (integer, optional): 類型，0 = 買幣, 1 = 賣幣
  - `status` (integer, optional): 掛單狀態，0 = 掛單中, 1 = 暫停掛單, 2 = 取消掛單, 3 = 已刪除掛單
  - `page` (string, optional, default: 1): 取為第幾頁的資料
  - `size` (string, optional, default: 1): 取回幾筆資料
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "count": 1,
    "rows": [
      {
        "id": "30dae9a8-a9ee-43f2-8df5-3b5d2110f04b",
        "type": 0,
        "status": 0,
        "amount": 100,
        "minAmount": 100,
        "balance": 100,
        "transactionMinutes": 15,
        "user": {},
        "bankcard": {},
        "createAt": "2312131312",
        "cancelAmount": 0,
        "processAmount": 0,
        "doneAmount": 0,
        "cancelCount": 0,
        "doneCount": 0,
        "processCount": 0
      }
    ]
  }
}
```

#### PUT /pending/orders/{pendingOrderId}/stop
- **Tags**: `掛單`
- **描述**: 暫停掛單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `pendingOrderId` (string): 掛單的 id: UUID，範例: "634f5e3d-f591-4cd5-87ad-aed2bc12cb5b"
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true
}
```

#### PUT /pending/orders/{pendingOrderId}/open
- **Tags**: `掛單`
- **描述**: 開啟掛單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `pendingOrderId` (string): 掛單的 id: UUID，範例: "634f5e3d-f591-4cd5-87ad-aed2bc12cb5b"
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true
}
```

#### PUT /pending/orders/{pendingOrderId}/cancel
- **Tags**: `掛單`
- **描述**: 取消掛單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `pendingOrderId` (string): 掛單的 id: UUID，範例: "634f5e3d-f591-4cd5-87ad-aed2bc12cb5b"
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true
}
```

#### DELETE /pending/orders/{pendingOrderId}
- **Tags**: `掛單`
- **描述**: 刪除掛單
- **認證**: 需要 (Bearer Token)
- **Headers**:
  - `Authorization`: Bearer {token}
- **Path Parameters**:
  - `pendingOrderId` (string): 掛單的 id: UUID，範例: "634f5e3d-f591-4cd5-87ad-aed2bc12cb5b"
- **Request Body**: 無
- **Response 200**:
```json
{
  "success": true
}
```

---

## 資料模型定義 (Definitions)

以下為所有 API 中使用的資料模型完整定義：

### LOGIN_RESPONSE
```json
{
  "access_token": "string",
  "expireIn": 1000000,
  "user": {
    "id": 1,
    "type": 0,
    "account": "simon",
    "name": "simon",
    "createAt": 1131231311322,
    "permissions": {
      "user": {
        "manager": {"read": true},
        "list": {"read": true}
      },
      "system": {
        "backenduser": {"read": true, "create": true},
        "backendactor": {"read": true, "create": true}
      }
    }
  }
}
```

### Backendactor
```json
{
  "id": 1,
  "name": "admin",
  "markup": "testadmin",
  "permissions": {
    "user": {
      "manager": {"read": true},
      "list": {"read": true},
      "order": {"read": true, "update": true}
    },
    "system": {
      "backenduser": {"read": true, "create": true, "delete": true},
      "backendactor": {"read": true, "create": true, "delete": true}
    }
  }
}
```

### createBackendactor
```json
{
  "name": "admin",
  "markup": "testadmin",
  "permissions": {
    "user": {
      "manager": {"read": true},
      "list": {"read": true}
    },
    "system": {
      "backenduser": {"read": true, "create": true},
      "backendactor": {"read": true, "create": true}
    }
  }
}
```

### Backenduser
```json
{
  "id": 1,
  "name": "admin001",
  "account": "testadmin",
  "status": 0,
  "permissions": {
    "user": {
      "manager": {"read": true},
      "list": {"read": true}
    },
    "system": {
      "backenduser": {"read": true, "create": true},
      "backendactor": {"read": true, "create": true}
    }
  },
  "actor": {
    "id": 1,
    "name": "admin",
    "markup": "admin"
  }
}
```

### CreateBackenduser
```json
{
  "name": "admin001",
  "account": "testadmin",
  "password": "a12345678",
  "actorId": 1
}
```

### UpdateBackenduser
```json
{
  "name": "admin001",
  "account": "testadmin",
  "status": 0,
  "actorId": 1
}
```

### User
```json
{
  "id": 1,
  "type": 0,
  "account": "simon",
  "name": "simon",
  "createAt": 1131231311322,
  "merchant": null
}
```

### UserDetail
```json
{
  "id": 1,
  "type": 0,
  "account": "simon",
  "name": "simon",
  "createAt": 1131231311322,
  "status": 1,
  "orderStatus": 1,
  "transactionStatus": 1,
  "phone": "0987654321",
  "markup": "test mark up",
  "merchant": null,
  "wallet": null
}
```

### REGISTER_USER
```json
{
  "type": 0,
  "account": "simon",
  "name": "simon",
  "password": "a12345678",
  "transactionCode": "a12345678",
  "referrer": "a3e4e373",
  "contactor": "溫蒂s",
  "telegram": "abcccccc",
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
  },
  "buyLadderFee": [
    {
      "amount": 100,
      "feePercent": 0.1
    }
  ],
  "sellLadderFee": [
    {
      "amount": 100,
      "feePercent": 0.1
    }
  ]
}
```

### updateUserRequest
```json
{
  "phone": "0987654321",
  "status": 1,
  "orderStatus": 1,
  "transactionStatus": 1,
  "type": 0,
  "name": "simon",
  "contactor": "溫蒂s",
  "telegram": "abcccccc",
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
  },
  "buyLadderFee": [
    {
      "amount": 100,
      "feePercent": 0.1
    }
  ],
  "sellLadderFee": [
    {
      "amount": 100,
      "feePercent": 0.1
    }
  ]
}
```

### UpdateUserLoginPassword
```json
{
  "password": "a12345678",
  "newPassword": "a123456789"
}
```

### UpdateUserTransactionCode
```json
{
  "password": "a12345678"
}
```

### basicBank
```json
{
  "id": 1,
  "bankName": "中國農業銀行",
  "bankCode": "CDC",
  "status": 1
}
```

### createBank
```json
{
  "bankName": "中國農業銀行",
  "bankCode": "CDC"
}
```

### Bankcard
```json
{
  "id": 0,
  "createAt": "12312312312",
  "name": "溫蒂",
  "cardNumber": "1234567890123456789",
  "branchName": "分行名稱",
  "status": 0,
  "bankId": 1,
  "bankName": "中國銀行",
  "bankCode": "CDD"
}
```

### BankcardResponse
```json
{
  "id": 0,
  "createAt": "12312312312",
  "name": "溫蒂",
  "cardNumber": "1234567890123456789",
  "branchName": "分行名稱",
  "status": 0,
  "bankId": 1,
  "bankName": "中國銀行",
  "bankCode": "CDD",
  "account": "wendy"
}
```

### Order
```json
{
  "id": 1,
  "status": 0,
  "cancelReason": null,
  "amount": 100,
  "finishAt": 12312313,
  "pendingOrder": {},
  "user": {
    "id": 1,
    "name": "tomasdemo001",
    "account": "tomasdemo001"
  },
  "bankcard": {},
  "createAt": "123132131231"
}
```

### OrderResponse
```json
{
  "id": 1,
  "createdAt": "12312312312",
  "status": 0,
  "cancelReason": null,
  "amount": 100,
  "finishAt": 12312313,
  "sender": {},
  "senderBankcard": {},
  "beneficiaryBankcard": {},
  "beneficiary": {
    "id": 1,
    "name": 1,
    "account": 1
  }
}
```

### PendingOrder
```json
{
  "id": "30dae9a8-a9ee-43f2-8df5-3b5d2110f04b",
  "type": 0,
  "status": 0,
  "amount": 100,
  "minAmount": 100,
  "balance": 100,
  "transactionMinutes": 15,
  "user": {},
  "bankcard": {},
  "createAt": "2312131312",
  "cancelAmount": 0,
  "processAmount": 0,
  "doneAmount": 0,
  "cancelCount": 0,
  "doneCount": 0,
  "processCount": 0
}
```

### Merchant
```json
{
  "createAt": 1131231311322,
  "contactor": "溫蒂s",
  "telegram": "abcccccc",
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
  },
  "buyLadderFee": [
    {
      "amount": 100,
      "feePercent": 0.1
    }
  ],
  "sellLadderFee": [
    {
      "amount": 100,
      "feePercent": 0.1
    }
  ]
}
```

### Wallet
```json
{
  "id": 1,
  "status": 1,
  "usefulBalance": 100,
  "guaranteedBalance": 90,
  "freezeBalance": 30,
  "createAt": "1131231311322"
}
```

---

## 實作建議順序

### 階段一：基礎功能
1. **健康檢查** - GET /health-check
2. **使用者登入** - POST /auth/login
3. **使用者登出** - POST /auth/logout

### 階段二：後台管理
4. **後台角色列表** - GET /backendactors
5. **後台角色權限** - GET /backendactors/permissions
6. **後台使用者管理** - GET/POST/PUT/DELETE /backendusers

### 階段三：使用者管理
7. **使用者列表** - GET /users
8. **使用者詳情** - GET /users/{userId}
9. **使用者操作** - PUT /users/{userId}/*

### 階段四：銀行與銀行卡
10. **銀行管理** - GET/POST/PUT /banks
11. **銀行卡查詢** - GET /bankcards

### 階段五：訂單系統
12. **訂單列表** - GET /orders
13. **訂單操作** - PUT /orders/{orderId}/*

### 階段六：掛單系統
14. **掛單列表** - GET /pending/orders
15. **掛單操作** - PUT/DELETE /pending/orders/{pendingOrderId}/*

---

## 重要注意事項

1. **認證機制**: 所有需要認證的 API 都使用 JWT Bearer Token
2. **錯誤處理**: 所有錯誤回應都應遵循標準格式
3. **資料驗證**: 確保所有輸入參數都經過驗證
4. **狀態碼**: 
   - `status`: 0 = 停用/凍結, 1 = 啟用
   - `orderStatus`: 0 = 凍結, 1 = 啟用
   - `transactionStatus`: 0 = 凍結, 1 = 啟用
   - 訂單 `status`: 0 = 等待匯款, 1 = 已匯款未放行, 2 = 已放行, 3 = 買家已取消, 4 = 賣家已取消
   - 掛單 `status`: 0 = 掛單中, 1 = 暫停掛單, 2 = 取消掛單, 3 = 已刪除掛單
5. **時間格式**: 使用時間戳（number）或日期字串
6. **UUID**: 掛單 ID 使用 UUID 格式
7. **分頁**: 使用 `page` 和 `size` 參數，回應包含 `count` 和 `rows`

---

## 測試建議

每個功能實作完成後，建議：
1. 單元測試：測試業務邏輯
2. 整合測試：測試 API 端點
3. 對比測試：與原始 Node.js API 進行對比測試，確保回應格式完全一致

---

**文檔版本**: 1.0.0  
**最後更新**: 2025-01-XX  
**基於**: swagger.json

