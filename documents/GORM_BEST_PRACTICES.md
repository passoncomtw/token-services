# GORM 最佳實踐指南

## 目錄
1. [Model 定義](#model-定義)
2. [關聯查詢](#關聯查詢)
3. [查詢建構](#查詢建構)
4. [分頁處理](#分頁處理)
5. [事務處理](#事務處理)
6. [效能優化](#效能優化)

---

## Model 定義

### ✅ 正確的 Model 定義

```go
type BankCard struct {
    ID         int        `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
    UserID     *int       `gorm:"column:user_id" json:"user_id,omitempty"`
    BankID     *int       `gorm:"column:bank_id" json:"bank_id,omitempty"`
    Name       string     `gorm:"column:name;type:varchar(255);not null" json:"name"`
    CardNumber string     `gorm:"column:card_number;type:varchar(255);not null" json:"card_number"`
    Status     string     `gorm:"column:status;type:varchar(255);not null" json:"status"`
    BranchName string     `gorm:"column:branch_name;type:varchar(255);not null" json:"branch_name"`
    CreatedAt  time.Time  `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
    UpdatedAt  time.Time  `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
    DeletedAt  *time.Time `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`

    // 關聯定義
    User *User `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
    Bank *Bank `gorm:"foreignKey:BankID;references:ID" json:"bank,omitempty"`
}

func (BankCard) TableName() string {
    return "bank_cards"
}
```

### 關鍵點
- ✅ 使用 `gorm` tag 明確定義欄位屬性
- ✅ 使用指標型別 (`*int`, `*time.Time`) 處理可選欄位
- ✅ 在 struct 中定義關聯關係
- ✅ 實作 `TableName()` 方法指定資料表名稱

---

## 關聯查詢

### ✅ 使用 Preload 預載入關聯

```go
// 正確：使用 Preload 預載入關聯資料
var bankCard models.BankCard
db.Preload("Bank").Preload("User").First(&bankCard, id)
```

### ❌ 避免：手動 JOIN

```go
// 錯誤：不要手動寫 SQL JOIN
db.Joins("JOIN banks ON banks.id = bank_cards.bank_id")
```

### ✅ 使用 GORM Joins 進行關聯過濾

```go
// 正確：使用 GORM 的 Joins 方法
db := s.db.Model(&models.BankCard{})

// GORM 會自動根據 model 的關聯定義生成正確的 JOIN
if query.BankCode != "" {
    db = db.Joins("Bank").Where("Bank.bank_code LIKE ?", "%"+query.BankCode+"%")
}

if query.Account != "" {
    db = db.Joins("User").Where("User.account LIKE ?", "%"+query.Account+"%")
}

// 最後使用 Preload 載入完整的關聯資料
db.Preload("Bank").Preload("User").Find(&bankCards)
```

### Preload vs Joins 的使用時機

| 場景 | 使用方法 | 說明 |
|------|---------|------|
| 需要載入關聯資料顯示 | `Preload` | 會執行額外的 SELECT 查詢載入關聯資料 |
| 需要根據關聯資料過濾 | `Joins` | 會使用 JOIN 進行過濾，但不會載入完整關聯資料 |
| 同時需要過濾和載入 | `Joins` + `Preload` | 先用 Joins 過濾，再用 Preload 載入 |

---

## 查詢建構

### ✅ 使用鏈式調用建構查詢

```go
func (s *BankCardService) GetList(query *BankCardListQuery) (*BankCardListResponse, error) {
    // 建立基礎查詢
    db := s.db.Model(&models.BankCard{})
    
    // 逐步添加過濾條件
    if query.CardNumber != "" {
        db = db.Where("bank_cards.card_number LIKE ?", "%"+query.CardNumber+"%")
    }
    if query.BranchName != "" {
        db = db.Where("bank_cards.branch_name LIKE ?", "%"+query.BranchName+"%")
    }
    
    // 關聯過濾
    if query.BankCode != "" {
        db = db.Joins("Bank").Where("Bank.bank_code LIKE ?", "%"+query.BankCode+"%")
    }
    
    // 執行查詢
    var bankCards []models.BankCard
    if err := db.Preload("Bank").Preload("User").Find(&bankCards).Error; err != nil {
        return nil, err
    }
    
    return bankCards, nil
}
```

### 關鍵點
- ✅ 使用 `Model()` 指定查詢的 model
- ✅ 使用 `Where()` 添加條件，自動參數化防止 SQL 注入
- ✅ 使用鏈式調用建構複雜查詢
- ✅ 最後才執行 `Find()` 或 `First()`

---

## 分頁處理

### ✅ 正確的分頁實作

```go
func (s *BankCardService) GetList(query *BankCardListQuery) (*BankCardListResponse, error) {
    // 建立查詢（包含所有過濾條件）
    db := s.db.Model(&models.BankCard{})
    
    if query.CardNumber != "" {
        db = db.Where("card_number LIKE ?", "%"+query.CardNumber+"%")
    }
    
    // 計算總數（使用相同的過濾條件）
    var count int64
    countDB := db.Session(&gorm.Session{}) // 創建新的 session 避免影響原查詢
    if err := countDB.Count(&count).Error; err != nil {
        return nil, err
    }
    
    // 分頁查詢
    offset := (query.Page - 1) * query.Size
    var bankCards []models.BankCard
    if err := db.Offset(offset).Limit(query.Size).Find(&bankCards).Error; err != nil {
        return nil, err
    }
    
    return &BankCardListResponse{
        Count: count,
        Rows:  bankCards,
    }, nil
}
```

### 關鍵點
- ✅ 使用 `Session()` 創建新的查詢實例用於 Count
- ✅ Count 和 Find 使用相同的過濾條件
- ✅ 使用 `Offset()` 和 `Limit()` 實現分頁

---

## 事務處理

### ✅ 使用 GORM 事務

```go
func (s *UserService) Create(req *CreateUserRequest) (*UserResponse, error) {
    var user models.User
    
    // 使用事務確保資料一致性
    err := s.db.Transaction(func(tx *gorm.DB) error {
        // 建立使用者
        user = models.User{
            Account: req.Account,
            Name:    req.Name,
            // ... 其他欄位
        }
        
        if err := tx.Create(&user).Error; err != nil {
            return err // 自動 rollback
        }
        
        // 建立錢包
        wallet := models.Wallet{
            UserID: &user.ID,
            Status: 1,
        }
        
        if err := tx.Create(&wallet).Error; err != nil {
            return err // 自動 rollback
        }
        
        // 如果有商家資料，建立商家
        if req.Contactor != "" {
            merchant := models.Merchant{
                UserID:    &user.ID,
                Contactor: req.Contactor,
            }
            
            if err := tx.Create(&merchant).Error; err != nil {
                return err // 自動 rollback
            }
        }
        
        return nil // 自動 commit
    })
    
    if err != nil {
        return nil, err
    }
    
    return ConvertToUserResponse(&user), nil
}
```

### 關鍵點
- ✅ 使用 `db.Transaction()` 包裹需要事務的操作
- ✅ 在事務函數中使用 `tx` 而非 `db`
- ✅ 返回 error 會自動 rollback
- ✅ 返回 nil 會自動 commit

---

## 效能優化

### 1. 使用 Select 指定欄位

```go
// ✅ 只查詢需要的欄位
db.Select("id", "name", "account").Find(&users)

// ❌ 避免查詢所有欄位（如果不需要）
db.Find(&users)
```

### 2. 批次查詢

```go
// ✅ 使用 FindInBatches 處理大量資料
db.Where("status = ?", 1).FindInBatches(&users, 100, func(tx *gorm.DB, batch int) error {
    // 處理每批資料
    for _, user := range users {
        // 業務邏輯
    }
    return nil
})
```

### 3. 使用索引

```go
// 在 model 中定義索引
type BankCard struct {
    ID         int    `gorm:"column:id;primaryKey;autoIncrement;index" json:"id"`
    CardNumber string `gorm:"column:card_number;type:varchar(255);not null;index" json:"card_number"`
    // ...
}
```

### 4. 避免 N+1 查詢

```go
// ❌ 錯誤：會產生 N+1 查詢
users, _ := db.Find(&users).Error
for _, user := range users {
    db.First(&user.Wallet, "user_id = ?", user.ID) // N 次查詢
}

// ✅ 正確：使用 Preload 一次載入
db.Preload("Wallet").Find(&users)
```

### 5. 使用 Session 進行查詢優化

```go
// 禁用自動 Preload（如果不需要）
db.Session(&gorm.Session{PrepareStmt: true}).Find(&users)
```

---

## 常見問題

### Q1: 什麼時候使用 Joins，什麼時候使用 Preload？

**A:** 
- 使用 `Joins` 當你需要**根據關聯資料進行過濾**時
- 使用 `Preload` 當你需要**載入並顯示關聯資料**時
- 兩者可以**同時使用**：先用 Joins 過濾，再用 Preload 載入完整資料

### Q2: 如何處理軟刪除？

**A:** GORM 會自動處理有 `DeletedAt` 欄位的 model：

```go
// DeletedAt 欄位定義
DeletedAt *time.Time `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`

// 軟刪除（會設置 DeletedAt）
db.Delete(&user)

// 查詢會自動過濾已刪除的記錄
db.Find(&users) // 不包含已刪除的

// 如果需要包含已刪除的記錄
db.Unscoped().Find(&users)
```

### Q3: 如何處理 NULL 值？

**A:** 使用指標類型或 sql.Null* 類型：

```go
type User struct {
    Phone   *string         `gorm:"column:phone;type:varchar(255)" json:"phone,omitempty"`
    Markup  sql.NullString  `gorm:"column:markup;type:varchar(255)" json:"markup,omitempty"`
}
```

---

## 檢查清單

在編寫資料庫操作時，請檢查：

- [ ] Model 是否正確定義了 GORM tag
- [ ] 是否使用了 Preload 載入關聯資料
- [ ] 是否使用了參數化查詢防止 SQL 注入
- [ ] 分頁查詢是否正確實作（Count + Offset/Limit）
- [ ] 是否在需要的地方使用了事務
- [ ] 是否避免了 N+1 查詢問題
- [ ] 是否只查詢需要的欄位（效能考量）
- [ ] 錯誤處理是否完整（使用 errors.Is(err, gorm.ErrRecordNotFound)）

---

## 範例：完整的 Service 實作

```go
package services

import (
    "errors"
    "token-admin-api/cmd/token-admin-api/internal/interfaces"
    "token-admin-api/pkg/models"
    "go.uber.org/fx"
    "gorm.io/gorm"
)

type BankCardService struct {
    db *gorm.DB
}

func NewBankCardService(db *gorm.DB) *BankCardService {
    return &BankCardService{db: db}
}

// GetList 取得銀行卡列表（使用 GORM 最佳實踐）
func (s *BankCardService) GetList(query *interfaces.BankCardListQuery) (*interfaces.BankCardListResponse, error) {
    // 1. 建立基礎查詢
    db := s.db.Model(&models.BankCard{})
    
    // 2. 添加過濾條件
    if query.CardNumber != "" {
        db = db.Where("bank_cards.card_number LIKE ?", "%"+query.CardNumber+"%")
    }
    if query.BranchName != "" {
        db = db.Where("bank_cards.branch_name LIKE ?", "%"+query.BranchName+"%")
    }
    
    // 3. 關聯過濾（使用 GORM Joins）
    if query.BankCode != "" || query.BankName != "" {
        db = db.Joins("Bank")
        if query.BankCode != "" {
            db = db.Where("Bank.bank_code LIKE ?", "%"+query.BankCode+"%")
        }
        if query.BankName != "" {
            db = db.Where("Bank.bank_name LIKE ?", "%"+query.BankName+"%")
        }
    }
    
    if query.Account != "" {
        db = db.Joins("User").Where("User.account LIKE ?", "%"+query.Account+"%")
    }
    
    // 4. 計算總數
    var count int64
    countDB := db.Session(&gorm.Session{})
    if err := countDB.Count(&count).Error; err != nil {
        return nil, err
    }
    
    // 5. 分頁查詢
    offset := (query.Page - 1) * query.Size
    var bankCards []models.BankCard
    if err := db.Preload("Bank").Preload("User").
        Offset(offset).Limit(query.Size).
        Find(&bankCards).Error; err != nil {
        return nil, err
    }
    
    // 6. 轉換為回應格式
    var rows []*interfaces.BankCardDetailResponse
    for _, card := range bankCards {
        rows = append(rows, interfaces.ConvertToBankCardDetailResponse(&card))
    }
    
    return &interfaces.BankCardListResponse{
        Count: count,
        Rows:  rows,
    }, nil
}

// GetDetail 取得銀行卡詳細資訊
func (s *BankCardService) GetDetail(id int) (*interfaces.BankCardDetailResponse, error) {
    var bankCard models.BankCard
    
    // 使用 Preload 載入關聯資料
    if err := s.db.Preload("Bank").Preload("User").First(&bankCard, id).Error; err != nil {
        // 正確處理 RecordNotFound 錯誤
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("銀行卡不存在")
        }
        return nil, err
    }
    
    return interfaces.ConvertToBankCardDetailResponse(&bankCard), nil
}

// BankCardModule FX module
var BankCardModule = fx.Module("bankcard",
    fx.Provide(fx.Annotate(NewBankCardService, fx.As(new(interfaces.BankCardServiceInterface)))),
)
```

---

## 總結

使用 GORM 時的核心原則：

1. **充分利用 GORM 的 model 定義和關聯功能**
2. **使用 Preload 預載入關聯資料**
3. **使用 Joins 進行關聯過濾**
4. **使用參數化查詢防止 SQL 注入**
5. **使用事務保證資料一致性**
6. **避免 N+1 查詢問題**
7. **正確處理錯誤（特別是 RecordNotFound）**

遵循這些最佳實踐，可以寫出高效、安全、易維護的資料庫操作程式碼。

