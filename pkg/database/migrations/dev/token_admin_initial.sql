-- -------------------------------------------------------------
-- TablePlus 6.7.1(636)
--
-- https://tableplus.com/
--
-- Database: token_admin
-- Generation Time: 2025-11-01 12:51:19.4710
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."SequelizeMeta";
-- Table Definition
CREATE TABLE "public"."SequelizeMeta" (
    "name" varchar(255) NOT NULL,
    PRIMARY KEY ("name")
);

DROP TABLE IF EXISTS "public"."orders";
-- Table Definition
CREATE TABLE "public"."orders" (
    "id" uuid NOT NULL,
    "user_id" int4 NOT NULL,
    "pending_order_id" uuid NOT NULL,
    "bank_card_id" int4 NOT NULL,
    "status" int4 NOT NULL,
    "amount" float8 NOT NULL,
    "cancel_reason" varchar(255),
    "expected_finish_at" timestamptz NOT NULL,
    "finish_at" timestamptz,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

-- Column Comment
COMMENT ON COLUMN "public"."orders"."id" IS '訂單 Id';

DROP TABLE IF EXISTS "public"."users";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS users_id_seq;

-- Table Definition
CREATE TABLE "public"."users" (
    "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    "referral_id" int4,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    "type" int4 NOT NULL,
    "status" int4 NOT NULL DEFAULT 0,
    "transaction_status" int4 NOT NULL DEFAULT 1,
    "order_status" int4 NOT NULL DEFAULT 1,
    "login_time" timestamptz,
    "phone" varchar(255) DEFAULT NULL::character varying,
    "account" varchar(255) NOT NULL,
    "name" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    "referral_code" varchar(255) NOT NULL,
    "transaction_code" varchar(255) NOT NULL,
    "markup" varchar(255),
    "notification_token" varchar(255),
    PRIMARY KEY ("id")
);

-- Column Comment
COMMENT ON COLUMN "public"."users"."id" IS '使用者 Id';
COMMENT ON COLUMN "public"."users"."type" IS '使用者類型: 0: 一般使用者, 1: 商家使用者';
COMMENT ON COLUMN "public"."users"."status" IS '使用者類型: 0: 啟用, 1: 凍結';
COMMENT ON COLUMN "public"."users"."transaction_status" IS '交易狀態: 1: 可以交易, false: 凍結交易';
COMMENT ON COLUMN "public"."users"."order_status" IS '掛單狀態: 1: 允許掛單, false: 不可掛單';
COMMENT ON COLUMN "public"."users"."login_time" IS '登入的時間';
COMMENT ON COLUMN "public"."users"."phone" IS '使用者電話';
COMMENT ON COLUMN "public"."users"."account" IS '使用者帳號';
COMMENT ON COLUMN "public"."users"."name" IS '使用者名稱';
COMMENT ON COLUMN "public"."users"."email" IS '使用者信箱';
COMMENT ON COLUMN "public"."users"."password" IS '使用者密碼';
COMMENT ON COLUMN "public"."users"."referral_code" IS '推薦碼';
COMMENT ON COLUMN "public"."users"."transaction_code" IS '交易密碼';
COMMENT ON COLUMN "public"."users"."markup" IS '註記';

DROP TABLE IF EXISTS "public"."merchants";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS merchants_id_seq;

-- Table Definition
CREATE TABLE "public"."merchants" (
    "id" int4 NOT NULL DEFAULT nextval('merchants_id_seq'::regclass),
    "user_id" int4,
    "telegram" varchar(255) NOT NULL,
    "contactor" varchar(255) NOT NULL,
    "buy_fee_type" int4 NOT NULL,
    "sell_fee_type" int4 NOT NULL,
    "buy_percentage_fee" json NOT NULL,
    "buy_ladder_fee" json NOT NULL,
    "sell_percentage_fee" json NOT NULL,
    "sell_ladder_fee" json NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

-- Column Comment
COMMENT ON COLUMN "public"."merchants"."telegram" IS 'Telegram id';
COMMENT ON COLUMN "public"."merchants"."contactor" IS '聯絡人';
COMMENT ON COLUMN "public"."merchants"."buy_fee_type" IS '購買的手續費類型: 0: 百分比, 1: 階梯型';
COMMENT ON COLUMN "public"."merchants"."sell_fee_type" IS '販賣的手續費類型: 0: 百分比, 1: 階梯型';
COMMENT ON COLUMN "public"."merchants"."buy_percentage_fee" IS '百分比類型';
COMMENT ON COLUMN "public"."merchants"."buy_ladder_fee" IS '階梯型';
COMMENT ON COLUMN "public"."merchants"."sell_percentage_fee" IS '百分比類型';
COMMENT ON COLUMN "public"."merchants"."sell_ladder_fee" IS '階梯型';

DROP TABLE IF EXISTS "public"."pending_orders";
-- Table Definition
CREATE TABLE "public"."pending_orders" (
    "id" uuid NOT NULL,
    "user_id" int4,
    "bank_card_id" int4,
    "type" int4 NOT NULL,
    "status" int4 NOT NULL,
    "transaction_minutes" int4 NOT NULL,
    "process_count" int4 NOT NULL,
    "cancel_count" int4 NOT NULL,
    "done_count" int4 NOT NULL,
    "telegram" varchar(255),
    "contactor" varchar(255),
    "min_amount" numeric(18,0) NOT NULL,
    "balance" numeric(18,0) NOT NULL,
    "amount" numeric(18,0) NOT NULL,
    "process_amount" numeric(18,0) NOT NULL,
    "cancel_amount" numeric(18,0) NOT NULL,
    "done_amount" numeric(18,0) NOT NULL,
    "is_split" bool NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

-- Column Comment
COMMENT ON COLUMN "public"."pending_orders"."id" IS '掛單 Id';
COMMENT ON COLUMN "public"."pending_orders"."type" IS '訂單類型: 0: 買幣, 1: 賣幣';
COMMENT ON COLUMN "public"."pending_orders"."status" IS '訂單狀態: 0: 等待付款, 1: 已付款等待放行, 2: 買家取消, 3: 賣家取消, 4: 已放行';
COMMENT ON COLUMN "public"."pending_orders"."transaction_minutes" IS '每筆交易的限制時間';
COMMENT ON COLUMN "public"."pending_orders"."process_count" IS '現在正在交易的訂單數量';
COMMENT ON COLUMN "public"."pending_orders"."cancel_count" IS '取消交易的訂單數量';
COMMENT ON COLUMN "public"."pending_orders"."done_count" IS '完成交易的訂單數量';
COMMENT ON COLUMN "public"."pending_orders"."telegram" IS 'Telegram ID';
COMMENT ON COLUMN "public"."pending_orders"."contactor" IS '聯絡人';
COMMENT ON COLUMN "public"."pending_orders"."min_amount" IS '交易最小值';
COMMENT ON COLUMN "public"."pending_orders"."balance" IS '剩餘額度';
COMMENT ON COLUMN "public"."pending_orders"."amount" IS '掛單數量';
COMMENT ON COLUMN "public"."pending_orders"."process_amount" IS '0: 購買, 1: 販賣 進行交易的數量';
COMMENT ON COLUMN "public"."pending_orders"."cancel_amount" IS '0: 購買, 1: 販賣 取消的數量';
COMMENT ON COLUMN "public"."pending_orders"."done_amount" IS '0: 購買, 1: 販賣 交易成功的數量';
COMMENT ON COLUMN "public"."pending_orders"."is_split" IS '是否拆單';

DROP TABLE IF EXISTS "public"."bank_cards";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS bank_cards_id_seq;

-- Table Definition
CREATE TABLE "public"."bank_cards" (
    "id" int4 NOT NULL DEFAULT nextval('bank_cards_id_seq'::regclass),
    "user_id" int4,
    "bank_id" int4,
    "name" varchar(255) NOT NULL,
    "card_number" varchar(255) NOT NULL,
    "status" varchar(255) NOT NULL,
    "branch_name" varchar(255) NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

-- Column Comment
COMMENT ON COLUMN "public"."bank_cards"."name" IS '銀行卡擁有者姓名';
COMMENT ON COLUMN "public"."bank_cards"."card_number" IS '銀行卡號';
COMMENT ON COLUMN "public"."bank_cards"."status" IS '銀行卡狀態: 0: 正常, 1: 停用, 2: 凍結';
COMMENT ON COLUMN "public"."bank_cards"."branch_name" IS '分行名稱';

DROP TABLE IF EXISTS "public"."banks";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS banks_id_seq;

-- Table Definition
CREATE TABLE "public"."banks" (
    "id" int4 NOT NULL DEFAULT nextval('banks_id_seq'::regclass),
    "status" int4 NOT NULL,
    "bank_name" varchar(255) NOT NULL,
    "bank_code" varchar(255) NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

-- Column Comment
COMMENT ON COLUMN "public"."banks"."status" IS '銀行卡狀態: 0: 正常, 1: 停用, 2: 凍結';
COMMENT ON COLUMN "public"."banks"."bank_name" IS '銀行名稱';
COMMENT ON COLUMN "public"."banks"."bank_code" IS '銀行代碼';

DROP TABLE IF EXISTS "public"."wallets";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS wallets_id_seq;

-- Table Definition
CREATE TABLE "public"."wallets" (
    "id" int4 NOT NULL DEFAULT nextval('wallets_id_seq'::regclass),
    "user_id" int4,
    "status" int4 NOT NULL,
    "useful_balance" float8 NOT NULL,
    "guaranteed_balance" float8 NOT NULL,
    "freeze_balance" float8 NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

-- Column Comment
COMMENT ON COLUMN "public"."wallets"."id" IS '使用者 錢包 Id';

DROP TABLE IF EXISTS "public"."order_statistics";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS order_statistics_id_seq;

-- Table Definition
CREATE TABLE "public"."order_statistics" (
    "id" int4 NOT NULL DEFAULT nextval('order_statistics_id_seq'::regclass),
    "user_id" int4,
    "successful_withdrawal_count" int4 NOT NULL,
    "successful_comments_count" int4 NOT NULL,
    "fail_comments_count" int4 NOT NULL,
    "average_transaction_time" timestamptz NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

-- Column Comment
COMMENT ON COLUMN "public"."order_statistics"."id" IS '使用者 Id';

DROP TABLE IF EXISTS "public"."backend_actors";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS backend_actors_id_seq;

-- Table Definition
CREATE TABLE "public"."backend_actors" (
    "id" int4 NOT NULL DEFAULT nextval('backend_actors_id_seq'::regclass),
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    "name" varchar(255) NOT NULL,
    "markup" varchar(255) NOT NULL,
    "permissions" json NOT NULL,
    PRIMARY KEY ("id")
);

-- Column Comment
COMMENT ON COLUMN "public"."backend_actors"."id" IS '角色 Id';

DROP TABLE IF EXISTS "public"."backend_users";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS backend_users_id_seq;

-- Table Definition
CREATE TABLE "public"."backend_users" (
    "id" int4 NOT NULL DEFAULT nextval('backend_users_id_seq'::regclass),
    "actor_id" int4,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    "status" int4 NOT NULL,
    "name" varchar(255) NOT NULL,
    "account" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    PRIMARY KEY ("id")
);

-- Column Comment
COMMENT ON COLUMN "public"."backend_users"."id" IS '使用者 Id';
COMMENT ON COLUMN "public"."backend_users"."status" IS '使用者 狀態';

ALTER TABLE "public"."orders" ADD FOREIGN KEY ("pending_order_id") REFERENCES "public"."pending_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."orders" ADD FOREIGN KEY ("bank_card_id") REFERENCES "public"."bank_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."orders" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."merchants" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."pending_orders" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."pending_orders" ADD FOREIGN KEY ("bank_card_id") REFERENCES "public"."bank_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."bank_cards" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."bank_cards" ADD FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."wallets" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."order_statistics" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."backend_users" ADD FOREIGN KEY ("actor_id") REFERENCES "public"."backend_actors"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Indices
CREATE UNIQUE INDEX backend_users_account_key ON public.backend_users USING btree (account);
