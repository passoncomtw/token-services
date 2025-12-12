-- Migration: Data Retention Policy for orders, order_items, print_logs
-- Created: 2025-12-12 17:00:00
-- Description: 設定訂單相關表的資料保留政策（僅保留 7 天）

-- ============================================
-- 1. 建立清理函數
-- ============================================

-- 清理超過 7 天的訂單資料（包含關聯的 order_items 和 print_logs）
CREATE OR REPLACE FUNCTION cleanup_old_orders()
RETURNS TABLE(
    deleted_orders bigint,
    deleted_order_items bigint,
    deleted_print_logs bigint
) AS $$
DECLARE
    v_deleted_orders bigint;
    v_deleted_order_items bigint;
    v_deleted_print_logs bigint;
    v_cutoff_date timestamptz;
BEGIN
    -- 計算截止日期（7 天前）
    v_cutoff_date := CURRENT_TIMESTAMP - INTERVAL '7 days';
    
    -- 1. 先刪除超過 7 天的 print_logs（必須先刪除，因為有外鍵依賴 orders）
    --    注意：print_logs 的外鍵沒有 ON DELETE CASCADE，所以必須手動刪除
    DELETE FROM public.print_logs
    WHERE created_at < v_cutoff_date
       OR order_id IN (
           SELECT order_id FROM public.orders WHERE created_at < v_cutoff_date
       );
    GET DIAGNOSTICS v_deleted_print_logs = ROW_COUNT;
    
    -- 2. 統計即將被刪除的 order_items 數量（用於返回統計）
    --    注意：order_items 有 ON DELETE CASCADE，會隨著 orders 一起刪除
    SELECT COUNT(*) INTO v_deleted_order_items
    FROM public.order_items oi
    WHERE EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.order_id = oi.order_id
        AND o.created_at < v_cutoff_date
    );
    
    -- 3. 刪除超過 7 天的 orders（會自動 CASCADE 刪除關聯的 order_items）
    DELETE FROM public.orders
    WHERE created_at < v_cutoff_date;
    GET DIAGNOSTICS v_deleted_orders = ROW_COUNT;
    
    -- 返回統計資訊
    RETURN QUERY SELECT v_deleted_orders, v_deleted_order_items, v_deleted_print_logs;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. 建立清理函數的註解
-- ============================================

COMMENT ON FUNCTION cleanup_old_orders() IS 
'清理超過 7 天的訂單相關資料（orders, order_items, print_logs）。返回刪除的記錄數統計。';

-- ============================================
-- 3. 手動執行清理（可選，用於立即清理現有舊資料）
-- ============================================

-- 如果需要立即清理現有的舊資料，可以取消下面的註解
-- SELECT * FROM cleanup_old_orders();

-- ============================================
-- 4. 建立自動清理排程（使用 pg_cron，如果已安裝）
-- ============================================

-- 注意：pg_cron 需要先安裝並啟用擴展
-- 如果資料庫沒有安裝 pg_cron，請使用應用層的定時任務來調用 cleanup_old_orders()

-- 檢查 pg_cron 是否可用，如果可用則建立每日清理任務
DO $$
BEGIN
    -- 嘗試建立每日凌晨 2 點執行的清理任務
    -- 如果 pg_cron 未安裝，此操作會失敗但不影響 migration
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- 刪除可能存在的舊任務
        PERFORM cron.unschedule('cleanup-old-orders');
        
        -- 建立新的每日清理任務（每天凌晨 2:00 執行）
        PERFORM cron.schedule(
            'cleanup-old-orders',
            '0 2 * * *',  -- Cron 表達式：每天凌晨 2:00
            $$SELECT cleanup_old_orders()$$
        );
        
        RAISE NOTICE 'pg_cron 已安裝，已建立每日自動清理任務';
    ELSE
        RAISE NOTICE 'pg_cron 未安裝，請使用應用層定時任務調用 cleanup_old_orders() 函數';
    END IF;
END $$;

-- ============================================
-- 5. 建立索引優化清理效能（如果尚未存在）
-- ============================================

-- 確保 created_at 欄位有索引，以加速清理查詢
-- 這些索引應該已經在 pos-initial migration 中建立，但為了確保，我們檢查並建立

-- orders.created_at 索引（應該已存在）
CREATE INDEX IF NOT EXISTS idx_orders_created_at_retention 
ON public.orders(created_at) 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days';

-- print_logs.created_at 索引（應該已存在）
CREATE INDEX IF NOT EXISTS idx_print_logs_created_at_retention 
ON public.print_logs(created_at) 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days';

-- ============================================
-- 6. 使用說明
-- ============================================

-- 手動執行清理：
--   SELECT * FROM cleanup_old_orders();
--
-- 查看清理統計：
--   SELECT * FROM cleanup_old_orders();
--
-- 如果使用應用層定時任務（推薦，不依賴 pg_cron）：
--   在應用程式中建立定時任務，每天調用：
--   SELECT cleanup_old_orders();
--
-- 檢查即將被清理的資料數量：
--   SELECT 
--     (SELECT COUNT(*) FROM orders WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days') as old_orders,
--     (SELECT COUNT(*) FROM order_items oi 
--      JOIN orders o ON o.order_id = oi.order_id 
--      WHERE o.created_at < CURRENT_TIMESTAMP - INTERVAL '7 days') as old_order_items,
--     (SELECT COUNT(*) FROM print_logs WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days') as old_print_logs;

