-- 建立 orders 資料表
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 新增註解
COMMENT ON TABLE orders IS '訂單資料表';
COMMENT ON COLUMN orders.id IS '訂單唯一識別碼（使用雪花演算法生成）';
COMMENT ON COLUMN orders.user_id IS '使用者識別碼';
COMMENT ON COLUMN orders.created_at IS '建立時間';
COMMENT ON COLUMN orders.updated_at IS '更新時間';
