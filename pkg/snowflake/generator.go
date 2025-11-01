package snowflake

import (
	"sync"

	"github.com/bwmarrin/snowflake"
)

/**
 * @brief Generator Snowflake ID 生成器介面
 */
type Generator interface {
	Generate() int64
}

/**
 * @brief snowflakeGenerator Snowflake ID 生成器實作
 */
type snowflakeGenerator struct {
	node *snowflake.Node
	mu   sync.Mutex
}

/**
 * @brief NewGenerator 建立新的 Snowflake 生成器
 * @param nodeID 節點 ID (0-1023)
 * @return Generator 生成器實例
 * @return error 錯誤訊息
 */
func NewGenerator(nodeID int64) (Generator, error) {
	node, err := snowflake.NewNode(nodeID)
	if err != nil {
		return nil, err
	}

	return &snowflakeGenerator{
		node: node,
	}, nil
}

/**
 * @brief Generate 生成一個新的 Snowflake ID
 * @return int64 生成的 ID
 */
func (g *snowflakeGenerator) Generate() int64 {
	g.mu.Lock()
	defer g.mu.Unlock()
	return g.node.Generate().Int64()
}
