-- Seed demo data for POS (示範商家 + demo staff PIN 1234)
-- bcrypt hash generated via htpasswd (cost 10)

INSERT INTO "public"."merchant_info" ("merchant_id", "merchant_name", "address", "phone", "created_at", "updated_at") VALUES
('a7b9ff08-c708-479a-b1ae-66baae3409d5', '示範商家', '台北市信義區信義路五段7號', '02-2345-6789', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "public"."users" (
    user_id, merchant_id, username, email, pin_hash, role, is_active, created_at, updated_at
) VALUES (
    'b2f9e43f-7b1e-4f3a-9a5a-1c2d3e4f5a6b',
    'a7b9ff08-c708-479a-b1ae-66baae3409d5',
    'demo_staff',
    'demo.staff@passon.tw',
    '$2y$10$QFuke74bXl0t.AEiMBbj3.d/zWDf79RyDsdFtSkYaZcgCQTc4j.9y',
    'staff',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);


