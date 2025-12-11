-- -------------------------------------------------------------
-- TablePlus 6.7.3(640)
--
-- https://tableplus.com/
--
-- Database: pos_dev
-- Generation Time: 2025-11-27 14:21:50.6950
-- -------------------------------------------------------------






















DROP TABLE IF EXISTS "public"."merchant_info";
-- Table Definition
CREATE TABLE "public"."merchant_info" (
    "merchant_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "merchant_name" varchar(255) NOT NULL,
    "address" text,
    "phone" varchar(20),
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("merchant_id")
);

DROP TABLE IF EXISTS "public"."users";
-- Table Definition
CREATE TABLE "public"."users" (
    "user_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "merchant_id" uuid NOT NULL,
    "username" varchar(100) NOT NULL,
    "email" varchar(255) NOT NULL DEFAULT ''::character varying,
    "pin_hash" varchar(255) NOT NULL,
    "role" varchar(50) NOT NULL DEFAULT 'staff'::character varying CHECK ((role)::text = ANY ((ARRAY['admin'::character varying, 'manager'::character varying, 'staff'::character varying])::text[])),
    "is_active" bool NOT NULL DEFAULT true,
    "last_login_at" timestamptz,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("user_id")
);

DROP TABLE IF EXISTS "public"."customization_values";
-- Table Definition
CREATE TABLE "public"."customization_values" (
    "value_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "option_id" uuid NOT NULL,
    "name" varchar(100) NOT NULL,
    "price_modifier" numeric(10,2) NOT NULL DEFAULT 0 CHECK (price_modifier >= '-999.99'::numeric),
    "is_default" bool NOT NULL DEFAULT false,
    "display_order" int4 NOT NULL DEFAULT 0,
    PRIMARY KEY ("value_id")
);

DROP TABLE IF EXISTS "public"."products";
-- Table Definition
CREATE TABLE "public"."products" (
    "product_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "merchant_id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "category" varchar(100) NOT NULL CHECK ((category)::text = ANY ((ARRAY['drink'::character varying, 'oden'::character varying])::text[])),
    "price" numeric(10,2) NOT NULL CHECK (price >= (0)::numeric),
    "unit" varchar(20) NOT NULL DEFAULT '個'::character varying,
    "description" text,
    "customizable" bool NOT NULL DEFAULT false,
    "is_active" bool NOT NULL DEFAULT true,
    "display_order" int4 NOT NULL DEFAULT 0,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("product_id")
);

DROP TABLE IF EXISTS "public"."customization_options";
-- Table Definition
CREATE TABLE "public"."customization_options" (
    "option_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" uuid NOT NULL,
    "type" varchar(50) NOT NULL CHECK ((type)::text = ANY ((ARRAY['sugar'::character varying, 'ice'::character varying, 'size'::character varying, 'temperature'::character varying])::text[])),
    "name" varchar(100) NOT NULL,
    "display_order" int4 NOT NULL DEFAULT 0,
    PRIMARY KEY ("option_id")
);

DROP TABLE IF EXISTS "public"."orders";
-- Table Definition
CREATE TABLE "public"."orders" (
    "order_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "merchant_id" uuid NOT NULL,
    "order_number" varchar(50) NOT NULL,
    "original_amount" numeric(10,2) NOT NULL CHECK (original_amount >= (0)::numeric),
    "discount_amount" numeric(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= (0)::numeric),
    "final_amount" numeric(10,2) NOT NULL CHECK (final_amount >= (0)::numeric),
    "cash_received" numeric(10,2) NOT NULL CHECK (cash_received >= (0)::numeric),
    "change_amount" numeric(10,2) NOT NULL DEFAULT 0 CHECK (change_amount >= (0)::numeric),
    "applied_promotions" jsonb DEFAULT '[]'::jsonb,
    "item_count" int4 NOT NULL CHECK (item_count > 0),
    "status" varchar(50) NOT NULL DEFAULT 'completed'::character varying CHECK ((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])),
    "payment_method" varchar(50) NOT NULL DEFAULT 'cash'::character varying CHECK ((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'card'::character varying, 'mobile'::character varying])::text[])),
    "staff_id" uuid,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("order_id")
);

DROP TABLE IF EXISTS "public"."backend_users";
-- Table Definition
CREATE TABLE "public"."backend_users" (
    "user_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "account" text NOT NULL,
    "password_hash" text NOT NULL,
    "email" text,
    "role" varchar(50) NOT NULL DEFAULT 'admin'::character varying CHECK ((role)::text = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::text[])),
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("user_id")
);

DROP TABLE IF EXISTS "public"."merchants";
-- Table Definition
CREATE TABLE "public"."merchants" (
    "merchant_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "merchant_name" text NOT NULL,
    "category" text NOT NULL,
    "status" varchar(20) NOT NULL DEFAULT 'offline'::character varying CHECK ((status)::text = ANY ((ARRAY['online'::character varying, 'offline'::character varying])::text[])),
    "email" text,
    "phone" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("merchant_id")
);

DROP TABLE IF EXISTS "public"."order_items";
-- Table Definition
CREATE TABLE "public"."order_items" (
    "item_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "order_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "quantity" int4 NOT NULL CHECK (quantity > 0),
    "price" numeric(10,2) NOT NULL CHECK (price >= (0)::numeric),
    "customizations" jsonb DEFAULT '{}'::jsonb,
    "total_price" numeric(10,2) NOT NULL CHECK (total_price >= (0)::numeric),
    PRIMARY KEY ("item_id")
);

DROP TABLE IF EXISTS "public"."hardware_config";
-- Table Definition
CREATE TABLE "public"."hardware_config" (
    "device_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "merchant_id" uuid NOT NULL,
    "device_type" varchar(50) NOT NULL CHECK ((device_type)::text = ANY ((ARRAY['printer'::character varying, 'scanner'::character varying, 'cash_drawer'::character varying])::text[])),
    "device_name" varchar(255) NOT NULL,
    "connection_type" varchar(50) NOT NULL CHECK ((connection_type)::text = ANY ((ARRAY['usb'::character varying, 'network'::character varying, 'serial'::character varying])::text[])),
    "port" varchar(255),
    "status" varchar(50) NOT NULL DEFAULT 'disconnected'::character varying CHECK ((status)::text = ANY ((ARRAY['connected'::character varying, 'disconnected'::character varying, 'error'::character varying, 'busy'::character varying, 'ready'::character varying])::text[])),
    "config_data" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("device_id")
);

DROP TABLE IF EXISTS "public"."print_logs";
-- Table Definition
CREATE TABLE "public"."print_logs" (
    "log_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "order_id" uuid NOT NULL,
    "device_id" uuid,
    "print_type" varchar(50) NOT NULL DEFAULT 'receipt'::character varying CHECK ((print_type)::text = ANY ((ARRAY['receipt'::character varying, 'test'::character varying])::text[])),
    "print_time" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "status" varchar(50) NOT NULL CHECK ((status)::text = ANY ((ARRAY['success'::character varying, 'failed'::character varying, 'retry'::character varying])::text[])),
    "error_message" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("log_id")
);

DROP TABLE IF EXISTS "public"."schema_migrations";
-- Table Definition
CREATE TABLE "public"."schema_migrations" (
    "version" int4 NOT NULL,
    "name" varchar(255) NOT NULL,
    "applied_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("version")
);

-- Indices
CREATE INDEX idx_merchant_info_name ON public.merchant_info USING btree (merchant_name);
ALTER TABLE "public"."users" ADD FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant_info"("merchant_id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX users_merchant_id_username_key ON public.users USING btree (merchant_id, username);
CREATE INDEX idx_users_merchant_id ON public.users USING btree (merchant_id);
CREATE INDEX idx_users_username ON public.users USING btree (username);
CREATE INDEX idx_users_active ON public.users USING btree (is_active);
ALTER TABLE "public"."customization_values" ADD FOREIGN KEY ("option_id") REFERENCES "public"."customization_options"("option_id") ON DELETE CASCADE;


-- Indices
CREATE INDEX idx_customization_values_option_id ON public.customization_values USING btree (option_id);
CREATE INDEX idx_customization_values_display_order ON public.customization_values USING btree (display_order);
ALTER TABLE "public"."products" ADD FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant_info"("merchant_id") ON DELETE CASCADE;


-- Indices
CREATE INDEX idx_products_merchant_id ON public.products USING btree (merchant_id);
CREATE INDEX idx_products_category ON public.products USING btree (category);
CREATE INDEX idx_products_name ON public.products USING btree (name);
CREATE INDEX idx_products_active ON public.products USING btree (is_active);
CREATE INDEX idx_products_display_order ON public.products USING btree (display_order);
ALTER TABLE "public"."customization_options" ADD FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE CASCADE;


-- Indices
CREATE INDEX idx_customization_options_product_id ON public.customization_options USING btree (product_id);
CREATE INDEX idx_customization_options_type ON public.customization_options USING btree (type);
CREATE INDEX idx_customization_options_display_order ON public.customization_options USING btree (display_order);
ALTER TABLE "public"."orders" ADD FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant_info"("merchant_id") ON DELETE CASCADE;
ALTER TABLE "public"."orders" ADD FOREIGN KEY ("staff_id") REFERENCES "public"."users"("user_id");


-- Indices
CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);
CREATE INDEX idx_orders_merchant_id ON public.orders USING btree (merchant_id);
CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);
CREATE INDEX idx_orders_staff_id ON public.orders USING btree (staff_id);


-- Indices
CREATE INDEX idx_backend_users_role ON public.backend_users USING btree (role);
CREATE UNIQUE INDEX backend_users_account_key ON public.backend_users USING btree (account);
CREATE INDEX idx_backend_users_account ON public.backend_users USING btree (account);


-- Indices
CREATE INDEX idx_merchants_status ON public.merchants USING btree (status);
CREATE INDEX idx_merchants_created_at ON public.merchants USING btree (created_at);
CREATE INDEX idx_merchants_category ON public.merchants USING btree (category);
ALTER TABLE "public"."order_items" ADD FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id");
ALTER TABLE "public"."order_items" ADD FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE CASCADE;


-- Indices
CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);
ALTER TABLE "public"."hardware_config" ADD FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant_info"("merchant_id") ON DELETE CASCADE;


-- Indices
CREATE INDEX idx_hardware_config_merchant_id ON public.hardware_config USING btree (merchant_id);
CREATE INDEX idx_hardware_config_type ON public.hardware_config USING btree (device_type);
CREATE INDEX idx_hardware_config_status ON public.hardware_config USING btree (status);
ALTER TABLE "public"."print_logs" ADD FOREIGN KEY ("device_id") REFERENCES "public"."hardware_config"("device_id");
ALTER TABLE "public"."print_logs" ADD FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id");


-- Indices
CREATE INDEX idx_print_logs_order_id ON public.print_logs USING btree (order_id);
CREATE INDEX idx_print_logs_device_id ON public.print_logs USING btree (device_id);
CREATE INDEX idx_print_logs_status ON public.print_logs USING btree (status);
CREATE INDEX idx_print_logs_print_time ON public.print_logs USING btree (print_time);
