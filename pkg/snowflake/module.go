package snowflake

import (
	"log"
	"os"
	"strconv"

	"go.uber.org/fx"
)

/**
 * @brief SnowflakeModule Snowflake ID 生成器的 FX 模組
 */
var SnowflakeModule = fx.Module("snowflake",
	fx.Provide(NewSnowflakeGenerator),
	fx.Invoke(func(gen Generator) {
		// 確保生成器被初始化
		log.Printf("✅ Snowflake generator initialized and ready")
	}),
)

/**
 * @brief NewSnowflakeGenerator 建立 Snowflake 生成器 (供 FX 使用)
 * @return Generator 生成器實例
 */
func NewSnowflakeGenerator() Generator {
	// 從環境變數讀取節點 ID，預設為 1
	nodeIDStr := os.Getenv("SNOWFLAKE_NODE_ID")
	nodeID := int64(1)

	if nodeIDStr != "" {
		if id, err := strconv.ParseInt(nodeIDStr, 10, 64); err == nil {
			nodeID = id
		}
	}

	// 確保節點 ID 在有效範圍內 (0-1023)
	if nodeID < 0 || nodeID > 1023 {
		log.Printf("警告: SNOWFLAKE_NODE_ID 超出範圍 (0-1023)，使用預設值 1")
		nodeID = 1
	}

	generator, err := NewGenerator(nodeID)
	if err != nil {
		log.Fatalf("無法建立 Snowflake 生成器: %v", err)
	}

	// 設定為全域生成器
	SetGlobalGenerator(generator)

	log.Printf("Snowflake 生成器已初始化，節點 ID: %d", nodeID)
	return generator
}
