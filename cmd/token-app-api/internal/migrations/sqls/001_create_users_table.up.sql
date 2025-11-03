-- 建立 users 資料表（已整合所有欄位）
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(100) NOT NULL,
    account VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立 account 索引
CREATE INDEX idx_users_account ON users(account);

-- 新增註解
COMMENT ON TABLE users IS '使用者資料表';
COMMENT ON COLUMN users.id IS '主鍵 ID（自動增加）';
COMMENT ON COLUMN users.name IS '使用者名稱';
COMMENT ON COLUMN users.account IS '使用者帳號（唯一）';
COMMENT ON COLUMN users.password IS '使用者密碼（bcrypt 加密）';
COMMENT ON COLUMN users.created_at IS '建立時間';
COMMENT ON COLUMN users.updated_at IS '更新時間';
