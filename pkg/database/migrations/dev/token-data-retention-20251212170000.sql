-- Migration: Data Retention Policy for orders, pending_orders, order_statistics
-- Created: 2025-12-12 17:00:00
-- Description: 設定訂單相關表的資料保留政策（僅保留 7 天）

-- ============================================
-- 1. 建立清理函數
-- ============================================

-- 清理超過 7 天的訂單資料（包含關聯的 orders, pending_orders, order_statistics）
CREATE OR REPLACE FUNCTION cleanup_old_token_orders()
RETURNS TABLE(
    deleted_orders bigint,
    deleted_pending_orders bigint,
    deleted_order_statistics bigint
) AS $$
DECLARE
    v_deleted_orders bigint;
    v_deleted_pending_orders bigint;
    v_deleted_order_statistics bigint;
    v_cutoff_date timestamptz;
BEGIN
    -- 計算截止日期（7 天前）
    v_cutoff_date := CURRENT_TIMESTAMP - INTERVAL '7 days';
    
    -- 1. 先刪除超過 7 天的 orders（必須先刪除，因為 pending_orders 被 orders 依賴）
    --    注意：orders 有外鍵到 pending_orders，所以必須先刪除 orders
    DELETE FROM public.orders
    WHERE created_at < v_cutoff_date;
    GET DIAGNOSTICS v_deleted_orders = ROW_COUNT;
    
    -- 2. 刪除超過 7 天的 pending_orders（在 orders 刪除後才能安全刪除）
    --    注意：只刪除沒有關聯 orders 的 pending_orders（雖然外鍵是 CASCADE，但為了安全起見）
    DELETE FROM public.pending_orders
    WHERE created_at < v_cutoff_date
      AND NOT EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.pending_order_id = pending_orders.id
      );
    GET DIAGNOSTICS v_deleted_pending_orders = ROW_COUNT;
    
    -- 3. 刪除超過 7 天的 order_statistics
    --    注意：order_statistics 有外鍵到 users (ON DELETE SET NULL)，可以安全刪除
    DELETE FROM public.order_statistics
    WHERE created_at < v_cutoff_date;
    GET DIAGNOSTICS v_deleted_order_statistics = ROW_COUNT;
    
    -- 返回統計資訊
    RETURN QUERY SELECT v_deleted_orders, v_deleted_pending_orders, v_deleted_order_statistics;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. 建立清理函數的註解
-- ============================================

COMMENT ON FUNCTION cleanup_old_token_orders() IS 
'清理超過 7 天的訂單相關資料（orders, pending_orders, order_statistics）。返回刪除的記錄數統計。';

-- ============================================
-- 3. 手動執行清理（可選，用於立即清理現有舊資料）
-- ============================================

-- 如果需要立即清理現有的舊資料，可以取消下面的註解
-- SELECT * FROM cleanup_old_token_orders();

-- ============================================
-- 4. 建立自動清理排程（使用 pg_cron，如果已安裝）
-- ============================================

-- 注意：pg_cron 需要先安裝並啟用擴展
-- 如果資料庫沒有安裝 pg_cron，請使用應用層的定時任務來調用 cleanup_old_token_orders()

-- 檢查 pg_cron 是否可用，如果可用則建立每日清理任務
DO $$
BEGIN
    -- 嘗試建立每日凌晨 2 點執行的清理任務
    -- 如果 pg_cron 未安裝，此操作會失敗但不影響 migration
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- 刪除可能存在的舊任務
        PERFORM cron.unschedule('cleanup-old-token-orders');
        
        -- 建立新的每日清理任務（每天凌晨 2:00 執行）
        PERFORM cron.schedule(
            'cleanup-old-token-orders',
            '0 2 * * *',  -- Cron 表達式：每天凌晨 2:00
            $$SELECT cleanup_old_token_orders()$$
        );
        
        RAISE NOTICE 'pg_cron 已安裝，已建立每日自動清理任務';
    ELSE
        RAISE NOTICE 'pg_cron 未安裝，請使用應用層定時任務調用 cleanup_old_token_orders() 函數';
    END IF;
END $$;

-- ============================================
-- 5. 建立索引優化清理效能（如果尚未存在）
-- ============================================

-- 確保 created_at 欄位有索引，以加速清理查詢

-- orders.created_at 索引
CREATE INDEX IF NOT EXISTS idx_orders_created_at_retention 
ON public.orders(created_at) 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days';

-- pending_orders.created_at 索引
CREATE INDEX IF NOT EXISTS idx_pending_orders_created_at_retention 
ON public.pending_orders(created_at) 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days';

-- order_statistics.created_at 索引
CREATE INDEX IF NOT EXISTS idx_order_statistics_created_at_retention 
ON public.order_statistics(created_at) 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days';

-- ============================================
-- 6. 使用說明
-- ============================================

-- 手動執行清理：
--   SELECT * FROM cleanup_old_token_orders();
--
-- 查看清理統計：
--   SELECT * FROM cleanup_old_token_orders();
--
-- 如果使用應用層定時任務（推薦，不依賴 pg_cron）：
--   在應用程式中建立定時任務，每天調用：
--   SELECT cleanup_old_token_orders();
--
-- 檢查即將被清理的資料數量：
--   SELECT 
--     (SELECT COUNT(*) FROM orders WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days') as old_orders,
--     (SELECT COUNT(*) FROM pending_orders WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days') as old_pending_orders,
--     (SELECT COUNT(*) FROM order_statistics WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days') as old_order_statistics;

