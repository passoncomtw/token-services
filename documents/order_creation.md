# 訂單新增功能說明

## 資料表結構

```sql
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY,                  -- 訂單唯一識別碼（使用雪花演算法生成）
    user_id VARCHAR(100) NOT NULL,          -- 使用者識別碼
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### 重要變更
- **移除 `order_id` 欄位**：直接使用 `id` 作為訂單唯一識別碼
- **`id` 型別改為 BIGINT**：支援雪花演算法生成的 64-bit 整數
- **移除 `SERIAL`**：不使用自動遞增,改用應用層雪花演算法生成

## 雪花演算法 (Snowflake ID)

訂單 ID 使用雪花演算法生成,具有以下特性:

- **全域唯一**: 分散式環境下保證唯一性
- **趨勢遞增**: ID 隨時間遞增,有利於資料庫索引效能
- **高效能**: 本地生成,無需查詢資料庫
- **64-bit 整數**: 適合作為主鍵,空間效率高

## 程式碼架構

### 1. Order Model (`internal/models/order.go`)

```go
type Order struct {
    ID        int64     `gorm:"column:id;primaryKey" json:"id"`
    UserID    string    `gorm:"column:user_id;type:varchar(100);index;not null" json:"user_id"`
    CreatedAt time.Time `gorm:"column:created_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"created_at"`
    UpdatedAt time.Time `gorm:"column:updated_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

// BeforeCreate Hook 自動生成 Snowflake ID
func (o *Order) BeforeCreate(tx *gorm.DB) error {
    if o.ID == 0 {
        o.ID = snowflake.GenerateID()
    }
    return nil
}
```

### 2. OrderService (`internal/services/orderService.go`)

```go
func (s *OrderService) CreateOrder(userID string) (string, error) {
    order := &models.Order{
        UserID: userID,
    }

    // 寫入資料庫 (ID 會在 BeforeCreate hook 中自動生成)
    if err := s.db.Create(order).Error; err != nil {
        return "", fmt.Errorf("failed to create order: %w", err)
    }

    orderID := fmt.Sprintf("%d", order.ID)
    return orderID, nil
}
```

### 3. API Handler (`internal/handlers/order.go`)

```go
func (r *OrderHandlers) CreateOrder(c *gin.Context) {
    var req CreateOrderRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        response.BadRequest(c, "請求參數錯誤")
        return
    }

    orderID, err := r.orderService.CreateOrder(req.UserID)
    if err != nil {
        response.InternalError(c, "建立訂單失敗: "+err.Error())
        return
    }

    response.Success(c, gin.H{
        "order_id": orderID,
    })
}
```

## API 使用方式

### 建立訂單

**Endpoint:** `POST /api/v1/orders`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "user_id": "user_test_001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "order_id": "1234567890123456789"
  }
}
```

## 測試流程

1. **啟動服務**
   ```bash
   ./bin/fxdemo
   ```

2. **登入取得 Token**
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "account": "admin",
       "password": "admin123"
     }'
   ```

3. **建立訂單**
   ```bash
   curl -X POST http://localhost:8080/api/v1/orders \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {token}" \
     -d '{
       "user_id": "user_test_001"
     }'
   ```

4. **驗證資料庫**
   ```sql
   SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
   ```

## 執行測試腳本

專案提供自動化測試腳本:

```bash
./test_create_order.sh
```

腳本會自動完成:
1. 登入取得 Token
2. 建立訂單
3. 顯示訂單 ID
4. 提供資料庫查詢指令

## 技術特點

1. **遵循 SOLID 原則**
   - **單一職責**: OrderService 只負責訂單業務邏輯
   - **依賴反轉**: 透過介面注入依賴

2. **錯誤處理**
   - 完整的錯誤傳遞鏈
   - 友善的錯誤訊息

3. **資料一致性**
   - GORM 事務支援
   - BeforeCreate Hook 確保 ID 生成

4. **效能優化**
   - 使用索引加速查詢
   - 雪花演算法本地生成 ID,無需查詢資料庫
   - 連線池管理

5. **Doxygen 註解**
   - 所有函數都有完整的 Doxygen 格式註解
   - 符合企業開發規範
