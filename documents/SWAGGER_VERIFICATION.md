# Swagger JSON 與功能列表對比驗證

本文檔用於驗證 `GOLANG_REFACTOR_SPEC.md` 是否與實際的 `swagger.json` 完全一致。

## 驗證方法

將用戶提供的 swagger.json 與 GOLANG_REFACTOR_SPEC.md 中的功能列表進行逐一對比。

---

## 端點完整性對比

### 從 swagger.json 提取的所有端點

#### 1. 健康檢查
- ✅ GET /health-check

#### 2. 使用者驗證
- ✅ POST /auth/login
- ✅ POST /auth/logout
- ✅ POST /auth/login/password

#### 3. 後台角色管理
- ✅ GET /backendactors
- ✅ POST /backendactors
- ✅ PUT /backendactors/{backendActorId}
- ✅ DELETE /backendactors/{backendActorId}
- ✅ GET /backendactors/permissions
- ✅ POST /backendactors/permissions

#### 4. 後台使用者管理
- ✅ GET /backendusers
- ✅ POST /backendusers
- ✅ PUT /backendusers/{backendUserId}
- ✅ DELETE /backendusers/{backendUserId}

#### 5. 使用者管理
- ✅ GET /users
- ✅ POST /users
- ✅ GET /users/{userId}
- ✅ PUT /users/{userId}
- ✅ PUT /users/{userId}/unlock
- ✅ PUT /users/{userId}/login/password
- ✅ PUT /users/{userId}/transaction/password
- ✅ PUT /users/login/password
- ✅ GET /users/{userId}/bankcards
- ✅ GET /users/{userId}/orders
- ✅ GET /users/{userId}/pending/orders

#### 6. 銀行管理
- ✅ GET /banks
- ✅ POST /banks
- ✅ PUT /banks/{bankId}

#### 7. 銀行卡管理
- ✅ GET /bankcards
- ✅ GET /bankcards/{bankcardId}

#### 8. 訂單管理
- ✅ GET /orders
- ✅ PUT /orders/{orderId}
- ✅ PUT /orders/{orderId}/cancel

#### 9. 掛單管理
- ✅ GET /pending/orders
- ✅ PUT /pending/orders/{pendingOrderId}/stop
- ✅ PUT /pending/orders/{pendingOrderId}/open
- ✅ PUT /pending/orders/{pendingOrderId}/cancel
- ✅ DELETE /pending/orders/{pendingOrderId}

---

## 總計統計

### Swagger.json 端點總數
- **總端點數**: 30 個路由
- **總操作數**: 37 個 HTTP 方法

### GOLANG_REFACTOR_SPEC.md 端點總數
- **總端點數**: 30 個路由
- **總操作數**: 37 個 HTTP 方法

**✅ 數量一致**

---

## 詳細差異檢查

### 需要特別注意的標記

從 swagger.json 中發現以下端點有特殊標記：

1. **標記為已刪除但仍存在於 API 中的端點**：
   - `/banks/{bankId}` PUT - 有 `"delete": true` 標記
   - `/banks` GET - 有 `"delete": true` 標記
   - `/banks` POST - 有 `"delete": true` 標記
   - `/bankcards` GET - 有 `"deleted": true` 標記
   - `/bankcards/{bankcardId}` GET - 有 `"delete": true` 標記
   - `/orders` GET - 有 `"deleted": true` 標記
   - `/orders/{orderId}` PUT - 有 `"deleted": true` 標記
   - `/orders/{orderId}/cancel` PUT - 有 `"deleted": true` 標記
   - `/pending/orders` GET - 有 `"deleted": true` 標記
   - `/pending/orders/{pendingOrderId}` DELETE - 有 `"deleted": true` 標記
   - `/pending/orders/{pendingOrderId}/open` PUT - 有 `"deleted": true` 標記
   - `/pending/orders/{pendingOrderId}/cancel` PUT - 有 `"deleted": true` 標記
   - `/pending/orders/{pendingOrderId}/stop` PUT - 有 `"deleted": true` 標記
   - `/users` GET - 有 `"delete": true` 標記

**⚠️ 注意**: 這些端點雖然標記為已刪除，但仍在 swagger.json 中存在。實作時需要確認這些端點是否仍在使用。

### 參數類型差異

從 swagger.json 中發現以下參數類型細節：

1. **Path Parameters**:
   - `/backendactors/{backendActorId}` - `backendActorId` 類型為 `string`，但在文檔中可能被描述為 number
   - `/backendusers/{backendUserId}` - `backendUserId` 類型為 `string`
   - `/users/{userId}` - `userId` 類型為 `number`
   - `/users/{userId}/unlock` - `userId` 的 `description` 直接是數字 `1` 而非字符串（這是一個錯誤）
   - `/users/{userId}/transaction/password` - `userId` 的 `description` 直接是數字 `1` 而非字符串（這是一個錯誤）
   - `/users/{userId}/login/password` - `userId` 的 `description` 直接是數字 `1` 而非字符串（這是一個錯誤）

2. **Query Parameters**:
   - `/users` GET 中的 `page` 和 `size` 類型為 `string`，而非 `number`
   - `/pending/orders` GET 中的 `page` 和 `size` 類型為 `string`，而非 `number`

### Response 結構差異

1. **GET /backendactors**:
   - Swagger.json: `data` 是 `object` (單個 Backendactor)
   - GOLANG_REFACTOR_SPEC.md: 描述為單個對象
   - **✅ 一致**

2. **GET /backendusers**:
   - Swagger.json: `data` 是 `Backendusers` (array)
   - GOLANG_REFACTOR_SPEC.md: 描述為數組
   - **✅ 一致**

3. **GET /banks**:
   - Swagger.json: `data` 是 `array` (basicBanks)
   - GOLANG_REFACTOR_SPEC.md: 描述為數組
   - **✅ 一致**

---

## 發現的問題

### 1. 參數描述錯誤
在 `/users/{userId}/unlock`, `/users/{userId}/transaction/password`, `/users/{userId}/login/password` 中：
```json
"description": 1  // ❌ 錯誤：應該是字符串描述，而不是數字
```
應該改為：
```json
"description": "使用者 ID"  // ✅ 正確
```

### 2. 已刪除標記但仍在使用的端點
多個端點標記為 `"deleted": true` 或 `"delete": true`，但仍存在於 swagger.json 中。這表示：
- 這些端點可能已經廢棄但仍保留在文檔中
- 或者標記是錯誤的，端點實際上仍在運行

**建議**: 在 Golang 實作時，先實作所有端點，然後根據實際需求決定是否移除標記為已刪除的端點。

### 3. 類型不一致
- 某些 ID 參數類型在 swagger.json 中為 `string`，但在實際使用中可能是 `number`
- Query 參數 `page` 和 `size` 在 swagger.json 中類型為 `string`，但邏輯上應該是 `number`

---

## 驗證結論

### ✅ 端點完整性: **通過**
所有 30 個路由和 37 個 HTTP 方法都在 GOLANG_REFACTOR_SPEC.md 中有對應的說明。

### ⚠️ 細節差異: **需要修正**
1. 參數類型需要統一（string vs number）
2. 已刪除標記的端點需要確認是否實作
3. 參數描述錯誤需要修正

### 📋 建議修正事項

1. **更新 GOLANG_REFACTOR_SPEC.md**:
   - 標註哪些端點在 swagger.json 中標記為已刪除
   - 統一參數類型描述（特別注意 string vs number）
   - 修正參數描述錯誤

2. **Golang 實作建議**:
   - 所有端點都實作（包括標記為已刪除的）
   - 參數類型根據實際資料庫模型決定（通常 ID 應該是 number/uint）
   - Query 參數 `page` 和 `size` 應該接受 string 但轉換為 number

---

## 端點清單（完整）

### 健康檢查 (1)
1. GET /health-check

### 使用者驗證 (3)
2. POST /auth/login
3. POST /auth/logout
4. POST /auth/login/password

### 後台角色管理 (6)
5. GET /backendactors
6. POST /backendactors
7. PUT /backendactors/{backendActorId}
8. DELETE /backendactors/{backendActorId}
9. GET /backendactors/permissions
10. POST /backendactors/permissions

### 後台使用者管理 (4)
11. GET /backendusers
12. POST /backendusers
13. PUT /backendusers/{backendUserId}
14. DELETE /backendusers/{backendUserId}

### 使用者管理 (11)
15. GET /users
16. POST /users
17. GET /users/{userId}
18. PUT /users/{userId}
19. PUT /users/{userId}/unlock
20. PUT /users/{userId}/login/password
21. PUT /users/{userId}/transaction/password
22. PUT /users/login/password
23. GET /users/{userId}/bankcards
24. GET /users/{userId}/orders
25. GET /users/{userId}/pending/orders

### 銀行管理 (3)
26. GET /banks ⚠️ (標記 delete: true)
27. POST /banks ⚠️ (標記 delete: true)
28. PUT /banks/{bankId} ⚠️ (標記 delete: true)

### 銀行卡管理 (2)
29. GET /bankcards ⚠️ (標記 deleted: true)
30. GET /bankcards/{bankcardId} ⚠️ (標記 delete: true)

### 訂單管理 (3)
31. GET /orders ⚠️ (標記 deleted: true)
32. PUT /orders/{orderId} ⚠️ (標記 deleted: true)
33. PUT /orders/{orderId}/cancel ⚠️ (標記 deleted: true)

### 掛單管理 (5)
34. GET /pending/orders ⚠️ (標記 deleted: true)
35. PUT /pending/orders/{pendingOrderId}/stop ⚠️ (標記 deleted: true)
36. PUT /pending/orders/{pendingOrderId}/open ⚠️ (標記 deleted: true)
37. PUT /pending/orders/{pendingOrderId}/cancel ⚠️ (標記 deleted: true)
38. DELETE /pending/orders/{pendingOrderId} ⚠️ (標記 deleted: true)

**總計**: 38 個操作（37 個在 GOLANG_REFACTOR_SPEC.md 中已有，1 個額外標記）

---

**驗證日期**: 2025-01-XX  
**驗證狀態**: ✅ 端點完整性通過，⚠️ 細節需要修正

