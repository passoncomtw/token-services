---
name: Feature request
about: Suggest an idea for this project
title: ''
labels: 'Feature'
assignees: ''

---

# 功能描述

* 增加 dotenv package
* jwt
* authRoutes
  * 會員登入

# 描述解決方案

# API 文件內容

## 功能

功能描述

### ROUTE AND HEADERS

* Route: 
* Method:
* Authorization: false

### Request

* phone
  * 手機號碼格式檢查
* password
  * 6~20 英數混合

```json
{
  "phone": "0987654321",
  "password": "a12345678"
}
```

### Response

* token - 使用者的 token 令牌
  * 不會超時
* user - 使用者的資訊
  * id - 使用者 id
  * phone - 使用者電話
  * name - 使用者名稱

```json
{
  "token": "string",
  "user": {
    "id": "1",
    "phone": "0987654321",
    "name": "testdemo001"
  }
}
```

**參考資料**
