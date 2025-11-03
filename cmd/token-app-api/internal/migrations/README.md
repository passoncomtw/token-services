# 資料庫遷移

## 概述

此目錄包含所有資料庫遷移檔案，使用自定義的遷移系統。

## 遷移檔案命名規則

```
{version}_{description}.{direction}.sql
```

- **version**: 三位數字版本號 (001, 002, 003...)
- **description**: 遷移描述（使用底線分隔）
- **direction**: `up` 或 `down`

### 範例

- `001_create_users_table.up.sql` - 建立 users 表（向上遷移）
- `001_create_users_table.down.sql` - 刪除 users 表（回滾遷移）

## 執行遷移

### 向上遷移（執行）

```bash
make db-migrate
```

或直接使用：

```bash
go run cmd/migrate/main.go -action=up
```

### 向下遷移（回滾）

回滾最後一次遷移：

```bash
make db-rollback
```

回滾所有遷移：

```bash
make db-rollback-all
```

或直接使用：

```bash
# 回滾 1 次
go run cmd/migrate/main.go -action=down -steps=1

# 回滾所有
go run cmd/migrate/main.go -action=down -steps=0
```

### 查看遷移狀態

```bash
make db-status
```

或直接使用：

```bash
go run cmd/migrate/main.go -action=status
```

## 建立新的遷移

1. 確定下一個版本號（查看現有檔案）
2. 建立向上遷移檔案：`{version}_{description}.up.sql`
3. 建立向下遷移檔案：`{version}_{description}.down.sql`
4. 在 up 檔案中寫入建立/修改的 SQL
5. 在 down 檔案中寫入回滾的 SQL

### 範例

```sql
-- 003_add_user_email.up.sql
ALTER TABLE users ADD COLUMN email VARCHAR(255);
CREATE INDEX idx_users_email ON users(email);
```

```sql
-- 003_add_user_email.down.sql
DROP INDEX IF EXISTS idx_users_email;
ALTER TABLE users DROP COLUMN IF EXISTS email;
```

## 遷移記錄

系統會自動建立 `schema_migrations` 表來追蹤已執行的遷移：

```sql
CREATE TABLE schema_migrations (
    version INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
```

## 最佳實踐

1. **向後相容**：盡量設計向後相容的遷移
2. **原子性**：每個遷移在事務中執行，確保原子性
3. **可回滾**：每個 up 遷移都應該有對應的 down 遷移
4. **測試**：在開發環境測試遷移後再應用到生產環境
5. **順序執行**：遷移按版本號順序執行
6. **最小化欄位**：只建立必要的欄位，避免冗余

## 當前資料表

### users
- `id` SERIAL PRIMARY KEY
- `user_id` VARCHAR(100) NOT NULL UNIQUE
- `name` VARCHAR(100) NOT NULL
- `created_at` TIMESTAMP WITH TIME ZONE
- `updated_at` TIMESTAMP WITH TIME ZONE

### orders
- `id` SERIAL PRIMARY KEY
- `order_id` VARCHAR(100) NOT NULL UNIQUE
- `user_id` VARCHAR(100) NOT NULL
- `created_at` TIMESTAMP WITH TIME ZONE
- `updated_at` TIMESTAMP WITH TIME ZONE
