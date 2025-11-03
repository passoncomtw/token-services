# 掛單管理功能實作文檔

## 概述

本文檔記錄了掛單管理（Pending Orders）功能的實作細節。掛單管理是 Token Admin API 的重要模組之一，提供掛單的查詢、狀態管理和刪除等功能。

## 實作日期

**完成日期**: 2025-11-03

## 功能需求

根據 `GOLANG_REFACTOR_SPEC.md` 規格文件，掛單管理需要實作以下 API 端點：

### API 端點

1. **GET /pending/orders** - 掛單列表
   - 支援多種過濾條件（掛單ID、時間範圍、使用者、金額範圍、類型、狀態等）
   - 支援分頁查詢

2. **PUT /pending/orders/{pendingOrderId}/stop** - 暫停掛單
   - 將掛單狀態更新為「暫停掛單」（status = 1）

3. **PUT /pending/orders/{pendingOrderId}/open** - 開啟掛單
   - 將掛單狀態更新為「掛單中」（status = 0）

4. **PUT /pending/orders/{pendingOrderId}/cancel** - 取消掛單
   - 將掛單狀態更新為「取消掛單」（status = 2）

5. **DELETE /pending/orders/{pendingOrderId}** - 刪除掛單
   - 軟刪除掛單（設置 deleted_at）

## 技術架構

### 分層架構

```
interfaces/ (介面層)
    └── pendingOrderInterfaces.go  - 定義資料結構和介面
services/ (服務層)
    └── pendingOrderService.go     - 實作業務邏輯
handlers/ (處理器層)
    └── pendingOrder.go             - 處理 HTTP 請求
```

### 依賴注入

使用 Uber FX 框架進行依賴注入：
- `PendingOrderModule` (services)
- `HandlerModule` (handlers)

## 實作細節

### 1. 介面定義 (pendingOrderInterfaces.go)

#### 資料結構

##### PendingOrderListQuery
```go
type PendingOrderListQuery struct {
    PendingOrderID string   `form:"pendingOrderId"`  // 掛單 ID (UUID)
    StartAt        string   `form:"startAt"`         // 開始時間
    EndAt          string   `form:"endAt"`           // 結束時間
    Account        string   `form:"account"`         // 使用者帳號
    MinAmount      *int64   `form:"minAmount"`       // 最小金額
    MaxAmount      *int64   `form:"maxAmount"`       // 最大金額
    MinBalance     *int64   `form:"minBalance"`      // 最小餘額
    MaxBalance     *int64   `form:"maxBalance"`      // 最大餘額
    UserID         *int     `form:"userId"`          // 使用者 ID
    Type           *int     `form:"type"`            // 類型 (0=買幣, 1=賣幣)
    Status         *int     `form:"status"`          // 狀態 (0=掛單中, 1=暫停, 2=取消, 3=刪除)
    Page           int      `form:"page"`            // 頁數
    Size           int      `form:"size"`            // 每頁數量
}
```

##### PendingOrderResponse
```go
type PendingOrderResponse struct {
    ID                 string                 `json:"id"`
    Type               int                    `json:"type"`
    Status             int                    `json:"status"`
    Amount             int64                  `json:"amount"`
    MinAmount          int64                  `json:"minAmount"`
    Balance            int64                  `json:"balance"`
    TransactionMinutes int                    `json:"transactionMinutes"`
    User               map[string]interface{} `json:"user"`
    BankCard           map[string]interface{} `json:"bankcard"`
    CreateAt           string                 `json:"createAt"`
    CancelAmount       int64                  `json:"cancelAmount"`
    ProcessAmount      int64                  `json:"processAmount"`
    DoneAmount         int64                  `json:"doneAmount"`
    CancelCount        int                    `json:"cancelCount"`
    DoneCount          int                    `json:"doneCount"`
    ProcessCount       int                    `json:"processCount"`
}
```

##### PendingOrderListResponse
```go
type PendingOrderListResponse struct {
    Count int64                   `json:"count"`
    Rows  []*PendingOrderResponse `json:"rows"`
}
```

#### 介面定義

##### PendingOrderServiceInterface
```go
type PendingOrderServiceInterface interface {
    GetList(query *PendingOrderListQuery) (*PendingOrderListResponse, error)
    Stop(pendingOrderID string) error
    Open(pendingOrderID string) error
    Cancel(pendingOrderID string) error
    Delete(pendingOrderID string) error
}
```

##### PendingOrderHandlersInterface
```go
type PendingOrderHandlersInterface interface {
    GetList(c *gin.Context)
    Stop(c *gin.Context)
    Open(c *gin.Context)
    Cancel(c *gin.Context)
    Delete(c *gin.Context)
}
```

### 2. 服務層 (pendingOrderService.go)

#### GetList 方法實作

**功能**: 根據查詢條件取得掛單列表，支援分頁和多種過濾條件。

**實作重點**:
1. **參數驗證**: 設定預設分頁參數（page=1, size=10）
2. **UUID 處理**: 使用 `uuid.Parse()` 處理掛單 ID
3. **時間過濾**: 使用 `time.Parse()` 解析時間字串
4. **金額範圍**: 支援最小/最大金額和餘額過濾
5. **關聯查詢**: 使用 `Joins` 進行使用者過濾，使用 `Preload` 載入關聯資料
6. **分頁實作**: 使用 `Offset` 和 `Limit` 實現分頁
7. **排序**: 按創建時間降序排列

```go
// 使用 GORM Joins 進行過濾
if query.Account != "" || query.UserID != nil {
    db = db.Joins("User")
    if query.Account != "" {
        db = db.Where("User.account LIKE ?", "%"+query.Account+"%")
    }
    if query.UserID != nil {
        db = db.Where("User.id = ?", *query.UserID)
    }
}

// 使用 Preload 載入關聯資料
db.Preload("User").Preload("BankCard").
    Order("pending_orders.created_at DESC").
    Offset(offset).Limit(query.Size).
    Find(&pendingOrders)
```

#### Stop、Open 方法實作

**功能**: 更新掛單狀態（暫停/開啟）。

**實作重點**:
1. **UUID 驗證**: 驗證掛單 ID 格式
2. **存在性檢查**: 確認掛單是否存在
3. **狀態檢查**: 防止重複操作或操作已取消/刪除的掛單
4. **狀態更新**: 使用 `Save()` 更新狀態

**狀態流轉規則**:
- **Stop**: 只能暫停狀態為「掛單中」(0) 的掛單
- **Open**: 只能開啟狀態為「暫停掛單」(1) 的掛單

#### Cancel 方法實作

**功能**: 取消掛單。

**實作重點**:
1. **事務處理**: 使用 `db.Transaction()` 確保資料一致性
2. **狀態驗證**: 防止重複取消或取消已刪除的掛單
3. **擴展性**: 預留 TODO 註解，方便後續添加業務邏輯（如退還保證金、發送通知等）

```go
err = s.db.Transaction(func(tx *gorm.DB) error {
    pendingOrder.Status = 2
    if err := tx.Save(&pendingOrder).Error; err != nil {
        return err
    }
    // TODO: 這裡可以添加其他業務邏輯
    return nil
})
```

#### Delete 方法實作

**功能**: 軟刪除掛單。

**實作重點**:
1. **軟刪除**: 使用 GORM 的 `Delete()` 方法，自動設置 `deleted_at` 時間戳
2. **靈活性**: 可以刪除任何狀態的掛單（根據業務需求可以調整）

### 3. 處理器層 (pendingOrder.go)

#### 統一的錯誤處理

每個處理器方法都實作了詳細的錯誤處理：

```go
switch err.Error() {
case "掛單 ID 格式錯誤":
    response.BadRequest(c, err.Error())
case "掛單不存在":
    response.NotFound(c, err.Error())
case "掛單已暫停", "掛單已取消或刪除":
    response.BadRequest(c, err.Error())
default:
    response.InternalError(c, "暫停掛單失敗")
}
```

#### Swagger 文檔

所有處理器方法都添加了完整的 Swagger 註解：

```go
// @Summary 掛單列表
// @Description 取得掛單列表，支援多種過濾條件和分頁
// @Tags 掛單
// @Accept json
// @Produce json
// @Security Bearer
// @Param pendingOrderId query string false "掛單 ID (UUID)"
// ...
// @Success 200 {object} response.Response{data=interfaces.PendingOrderListResponse}
// @Failure 400 {object} response.ErrorResponse
// @Router /pending/orders [get]
```

### 4. 路由註冊 (router.go)

所有掛單管理端點都在認證中間件保護下：

```go
// Pending Order routes
authenticated.GET("/pending/orders", r.pendingOrderHandlers.GetList)
authenticated.PUT("/pending/orders/:pendingOrderId/stop", r.pendingOrderHandlers.Stop)
authenticated.PUT("/pending/orders/:pendingOrderId/open", r.pendingOrderHandlers.Open)
authenticated.PUT("/pending/orders/:pendingOrderId/cancel", r.pendingOrderHandlers.Cancel)
authenticated.DELETE("/pending/orders/:pendingOrderId", r.pendingOrderHandlers.Delete)
```

## 重構與優化

### 資料結構統一

在實作過程中，發現 `PendingOrderResponse` 在 `userInterfaces.go` 中已有定義，但欠缺部分欄位。進行了以下優化：

1. **擴展 PendingOrderResponse**: 添加 `CancelAmount`、`ProcessAmount`、`DoneAmount`、`CancelCount`、`DoneCount`、`ProcessCount` 欄位
2. **統一使用**: 在 `pendingOrderInterfaces.go` 中重用 `userInterfaces.go` 的定義，避免重複
3. **更新 userService**: 更新 `GetPendingOrders` 方法以填充新增的欄位

### GORM 最佳實踐

遵循 `GORM_BEST_PRACTICES.md` 文檔中的建議：

1. **Joins vs Preload**:
   - 使用 `Joins` 進行過濾條件（如 `User.account LIKE ?`）
   - 使用 `Preload` 載入關聯資料（如 `Preload("User").Preload("BankCard")`）

2. **查詢效率**:
   - 在計算總數時使用 `Session` 避免影響主查詢
   - 使用明確的表名前綴避免欄位衝突

3. **事務處理**:
   - 在 `Cancel` 方法中使用事務確保資料一致性

## 測試建議

### 單元測試

建議為以下方法編寫單元測試：

1. **GetList**:
   - 測試各種過濾條件
   - 測試分頁功能
   - 測試空結果

2. **Stop/Open**:
   - 測試正常狀態轉換
   - 測試非法狀態轉換
   - 測試不存在的掛單

3. **Cancel**:
   - 測試正常取消
   - 測試已取消的掛單
   - 測試事務回滾

4. **Delete**:
   - 測試軟刪除
   - 測試不存在的掛單

### 整合測試

建議測試完整的 API 流程：

1. 創建掛單（可能需要先實作創建功能）
2. 查詢掛單列表
3. 暫停掛單
4. 開啟掛單
5. 取消掛單
6. 刪除掛單
7. 驗證查詢結果不包含已刪除的掛單

## 未來擴展

### 待實作功能

1. **創建掛單**: `POST /pending/orders`
2. **更新掛單**: `PUT /pending/orders/{pendingOrderId}`
3. **掛單詳情**: `GET /pending/orders/{pendingOrderId}`

### 業務邏輯擴展

在 `Cancel` 方法的事務中，可以添加：

1. **保證金退還**: 如果掛單有保證金，需要退還
2. **通知系統**: 發送取消通知給使用者
3. **統計更新**: 更新相關的統計資料
4. **訂單處理**: 處理關聯的進行中訂單

### 效能優化

1. **快取**: 對熱門查詢結果進行快取
2. **索引**: 確保資料庫有適當的索引（created_at、user_id、status 等）
3. **分頁優化**: 對大量資料的分頁查詢進行優化

## 相關文件

- [GOLANG_REFACTOR_SPEC.md](./GOLANG_REFACTOR_SPEC.md) - API 規格文件
- [GORM_BEST_PRACTICES.md](./GORM_BEST_PRACTICES.md) - GORM 最佳實踐
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API 文檔

## 結論

掛單管理功能已成功實作，遵循了 Clean Code 原則和專案架構規範：

1. ✅ **單一職責原則**: 每個層級只負責自己的職責
2. ✅ **介面隔離**: 明確定義服務和處理器介面
3. ✅ **依賴注入**: 使用 FX 框架進行依賴管理
4. ✅ **錯誤處理**: 完善的錯誤處理和使用者友好的錯誤訊息
5. ✅ **文檔完整**: 包含完整的 Swagger 文檔
6. ✅ **程式碼品質**: 通過所有 linter 檢查
7. ✅ **GORM 最佳實踐**: 正確使用 Joins、Preload 和事務

所有功能均已通過 linter 驗證，沒有錯誤或警告。

