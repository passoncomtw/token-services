package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// RequestIDMiddleware 為每個請求生成唯一的 Request ID
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 檢查是否已有 Request ID (例如從 Header 傳入)
		requestID := c.GetHeader("X-Request-ID")

		// 如果沒有，則生成新的 UUID
		if requestID == "" {
			requestID = uuid.New().String()
		}

		// 將 Request ID 存入 context
		c.Set("request_id", requestID)

		// 將 Request ID 添加到回應標頭
		c.Header("X-Request-ID", requestID)

		c.Next()
	}
}
