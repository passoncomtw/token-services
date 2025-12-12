-- Migration: Add login_logs table for POS Merchant API
-- Created: 2025-12-12 16:00:00
-- Description: 創建登入日誌表，用於記錄商家用戶的登入活動

DROP TABLE IF EXISTS "public"."login_logs";

-- Table Definition
CREATE TABLE "public"."login_logs" (
    "log_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "merchant_id" uuid,
    "user_id" uuid,
    "username" varchar(100) NOT NULL,
    "client_ip" inet NOT NULL,
    "user_agent" text,
    "login_status" varchar(50) NOT NULL CHECK ((login_status)::text = ANY ((ARRAY['success'::character varying, 'failed'::character varying, 'rate_limited'::character varying])::text[])),
    "failure_reason" text,
    "attempted_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_duration" int4,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("log_id")
);

-- Foreign Keys (optional, for referential integrity)
-- 注意：這些外鍵是可選的，因為 merchant_id 和 user_id 可能為 NULL
-- ALTER TABLE "public"."login_logs" ADD FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant_info"("merchant_id") ON DELETE SET NULL;
-- ALTER TABLE "public"."login_logs" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL;

-- Indices for performance
CREATE INDEX idx_login_logs_merchant_id ON public.login_logs USING btree (merchant_id);
CREATE INDEX idx_login_logs_user_id ON public.login_logs USING btree (user_id);
CREATE INDEX idx_login_logs_client_ip ON public.login_logs USING btree (client_ip);
CREATE INDEX idx_login_logs_login_status ON public.login_logs USING btree (login_status);
CREATE INDEX idx_login_logs_attempted_at ON public.login_logs USING btree (attempted_at);
CREATE INDEX idx_login_logs_merchant_attempted ON public.login_logs USING btree (merchant_id, attempted_at DESC);

-- Comments
COMMENT ON TABLE "public"."login_logs" IS '登入日誌表，記錄商家用戶的登入活動';
COMMENT ON COLUMN "public"."login_logs"."log_id" IS '日誌 ID (UUID)';
COMMENT ON COLUMN "public"."login_logs"."merchant_id" IS '商家 ID (可選)';
COMMENT ON COLUMN "public"."login_logs"."user_id" IS '用戶 ID (可選)';
COMMENT ON COLUMN "public"."login_logs"."username" IS '用戶名稱';
COMMENT ON COLUMN "public"."login_logs"."client_ip" IS '客戶端 IP 地址 (INET 類型)';
COMMENT ON COLUMN "public"."login_logs"."user_agent" IS '用戶代理字串';
COMMENT ON COLUMN "public"."login_logs"."login_status" IS '登入狀態: success, failed, rate_limited';
COMMENT ON COLUMN "public"."login_logs"."failure_reason" IS '失敗原因（僅當 login_status = failed 時使用）';
COMMENT ON COLUMN "public"."login_logs"."attempted_at" IS '登入嘗試時間';
COMMENT ON COLUMN "public"."login_logs"."session_duration" IS '會話持續時間（秒）';
COMMENT ON COLUMN "public"."login_logs"."created_at" IS '記錄創建時間';

