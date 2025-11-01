package snowflake

import (
	"sync"
)

var (
	globalGenerator Generator
	once            sync.Once
)

/**
 * @brief SetGlobalGenerator 設定全域 Snowflake 生成器
 * @param generator 生成器實例
 */
func SetGlobalGenerator(generator Generator) {
	once.Do(func() {
		globalGenerator = generator
	})
}

/**
 * @brief GetGlobalGenerator 取得全域 Snowflake 生成器
 * @return Generator 生成器實例
 */
func GetGlobalGenerator() Generator {
	return globalGenerator
}

/**
 * @brief GenerateID 使用全域生成器生成 ID
 * @return int64 生成的 ID
 */
func GenerateID() int64 {
	if globalGenerator == nil {
		panic("Snowflake 生成器尚未初始化，請先呼叫 SetGlobalGenerator")
	}
	return globalGenerator.Generate()
}
