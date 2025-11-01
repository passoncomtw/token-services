# Snowflake ID 生成器模組

這個模組提供了基於 Snowflake 演算法的分散式 ID 生成器。

## 功能特性

- ✅ 基於 Twitter Snowflake 演算法
- ✅ 支援分散式環境（透過 Node ID）
- ✅ 整合 Uber FX 依賴注入
- ✅ GORM Hook 自動生成 ID
- ✅ 執行緒安全

## 架構設計

```
pkg/snowflake/
├── generator.go   # Snowflake 生成器核心實作
├── module.go      # FX 模組定義
├── context.go     # 全域生成器管理
└── README.md      # 說明文件
```

## 使用方式

### 1. 在 main.go 引入 SnowflakeModule

```go
package main

import (
    "github.com/yourusername/project/pkg/snowflake"
    "go.uber.org/fx"
)

func main() {
    fx.New(
        snowflake.SnowflakeModule,  // 加入 Snowflake 模組
        // ... 其他模組
    ).Run()
}
```

### 2. 在 Model 中使用 BeforeCreate Hook

```go
package models

import (
    "github.com/yourusername/project/pkg/snowflake"
    "gorm.io/gorm"
)

type Order struct {
    ID        int64     `gorm:"column:id;primaryKey" json:"id"`
    UserID    string    `gorm:"column:user_id;type:varchar(100);index;not null" json:"user_id"`
    CreatedAt time.Time `gorm:"column:created_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"created_at"`
    UpdatedAt time.Time `gorm:"column:updated_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
    if o.ID == 0 {
        o.ID = snowflake.GenerateID()
    }
    return nil
}
```

### 3. 在 Service 中直接注入使用

```go
package services

import (
    "github.com/yourusername/project/pkg/snowflake"
)

type OrderService struct {
    generator snowflake.Generator
}

func NewOrderService(generator snowflake.Generator) *OrderService {
    return &OrderService{
        generator: generator,
    }
}

func (s *OrderService) CreateOrder() {
    orderID := s.generator.Generate()
    // 使用生成的 ID
}
```

### 4. 直接使用全域函數（最簡單）

```go
package services

import (
    "github.com/yourusername/project/pkg/snowflake"
)

func CreateSomething() {
    id := snowflake.GenerateID()
    // 使用生成的 ID
}
```

## 環境變數配置

```bash
# 設定節點 ID (0-1023)，預設為 1
export SNOWFLAKE_NODE_ID=1
```

### 分散式部署建議

在分散式環境中，每個服務實例應該設定不同的 Node ID：

```bash
# 服務實例 1
export SNOWFLAKE_NODE_ID=1

# 服務實例 2
export SNOWFLAKE_NODE_ID=2

# 服務實例 3
export SNOWFLAKE_NODE_ID=3
```

## Snowflake ID 結構

```
+--------------------------------------------------------------------------+
| 1 Bit Unused | 41 Bit Timestamp |  10 Bit NodeID  |   12 Bit Sequence  |
+--------------------------------------------------------------------------+
```

- **41 位時間戳記**：精確到毫秒，可使用約 69 年
- **10 位節點 ID**：支援最多 1024 個節點
- **12 位序列號**：每毫秒每節點可生成 4096 個 ID

## API 說明

### Generator 介面

```go
type Generator interface {
    Generate() int64
}
```

### 主要函數

#### NewGenerator
```go
func NewGenerator(nodeID int64) (Generator, error)
```
建立新的 Snowflake 生成器實例。

**參數**：
- `nodeID`: 節點 ID (0-1023)

**回傳**：
- `Generator`: 生成器實例
- `error`: 錯誤訊息

#### GenerateID
```go
func GenerateID() int64
```
使用全域生成器生成一個新的 ID。

**回傳**：
- `int64`: 生成的 Snowflake ID

#### SetGlobalGenerator
```go
func SetGlobalGenerator(generator Generator)
```
設定全域生成器（由 FX 模組自動呼叫）。

#### GetGlobalGenerator
```go
func GetGlobalGenerator() Generator
```
取得全域生成器實例。

## 注意事項

1. **Node ID 範圍**：必須在 0-1023 之間
2. **時鐘同步**：確保所有服務器時鐘同步（建議使用 NTP）
3. **ID 唯一性**：在分散式環境中，不同節點必須使用不同的 Node ID
4. **執行緒安全**：生成器是執行緒安全的，可在併發環境使用

## 最佳實踐

1. **在 Model 層使用 Hook**：讓 ID 生成對業務層透明
2. **環境變數配置**：不同環境使用不同的 Node ID
3. **監控 ID 生成**：記錄 ID 生成情況，避免序列號耗盡
4. **錯誤處理**：檢查生成器是否正確初始化

## 範例

### 完整的 FX 應用程式範例

```go
package main

import (
    "github.com/yourusername/project/pkg/database"
    "github.com/yourusername/project/pkg/snowflake"
    "github.com/yourusername/project/internal/services"
    "go.uber.org/fx"
)

func main() {
    fx.New(
        // 核心模組
        snowflake.SnowflakeModule,
        database.DatabaseModule,

        // 業務模組
        services.OrderModule,

        fx.Invoke(func() {
            // 應用程式啟動邏輯
        }),
    ).Run()
}
```

## 相關資源

- [Twitter Snowflake](https://github.com/twitter-archive/snowflake)
- [bwmarrin/snowflake](https://github.com/bwmarrin/snowflake)
- [Uber FX](https://uber-go.github.io/fx/)
