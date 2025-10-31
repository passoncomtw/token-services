# Token App API - 端點總覽

## 端點統計

- **總路由數**: 20 個
- **總操作數**: 25 個 HTTP 方法

## 完整端點列表

### 1. 健康檢查 (1)
- GET /health-check

### 2. 使用者驗證 (2)
- POST /auth/login
- POST /auth/logout

### 3. 使用者管理 (7)
- POST /users (註冊)
- GET /users/{user_id}
- PUT /users/{user_id}
- PUT /users/login/password
- PUT /users/transaction/password
- GET /users/pending/orders
- POST /users/{user_id}/store/value

### 4. 銀行管理 (1)
- GET /banks

### 5. 銀行卡管理 (4)
- GET /bankcards
- POST /bankcards
- PUT /bankcards/{bankcard_id}
- DELETE /bankcards/{bankcard_id}

### 6. 掛單管理 (6)
- GET /pending/orders
- POST /pending/orders
- GET /pending/orders/{pendingorder_id}
- DELETE /pending/orders/{pendingorder_id}
- PUT /pending/orders/{pendingorder_id}/lock
- PUT /pending/orders/{pendingorder_id}/unlock

### 7. 訂單管理 (5)
- GET /orders
- POST /orders
- PUT /orders/{order_id}/paid
- PUT /orders/{order_id}/apply
- PUT /orders/{order_id}/reject

---

## 認證需求對比

### 不需要認證的端點
- GET /health-check
- POST /users (註冊)
- POST /auth/login
- GET /users/{user_id}
- GET /banks
- POST /users/{user_id}/store/value

### 需要認證的端點 (19)
所有其他端點都需要 Bearer Token

---

**與 token-admin-api 的差異**:
- token-app-api 端點數較少（25 vs 37）
- 專注於使用者交易功能
- 不包含管理功能（後台使用者、後台角色等）
- 支援推播通知

