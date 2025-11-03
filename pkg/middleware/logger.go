package middleware

import (
	"time"

	"token-admin-api/pkg/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// LoggerMiddleware 建立新的日誌中間件
type LoggerMiddleware struct {
	logger logger.Logger
}

// NewLoggerMiddleware 建立新的日誌中間件實例
func NewLoggerMiddleware(log logger.Logger) *LoggerMiddleware {
	return &LoggerMiddleware{
		logger: log.With(zap.String("middleware", "Logger")),
	}
}

// Handler HTTP 請求日誌中間件
func (m *LoggerMiddleware) Handler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 開始時間
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		// 處理請求
		c.Next()

		// 結束時間
		end := time.Now()
		latency := end.Sub(start)

		// 記錄請求信息
		fields := []zap.Field{
			zap.Int("status", c.Writer.Status()),
			zap.String("method", c.Request.Method),
			zap.String("path", path),
			zap.String("query", query),
			zap.String("ip", c.ClientIP()),
			zap.String("user-agent", c.Request.UserAgent()),
			zap.Duration("latency", latency),
			zap.Int("body_size", c.Writer.Size()),
		}

		// 如果有錯誤，記錄錯誤
		if len(c.Errors) > 0 {
			fields = append(fields, zap.String("errors", c.Errors.ByType(gin.ErrorTypePrivate).String()))
		}

		// 根據狀態碼決定日誌級別
		switch {
		case c.Writer.Status() >= 500:
			m.logger.Error("Server error", fields...)
		case c.Writer.Status() >= 400:
			m.logger.Warn("Client error", fields...)
		case c.Writer.Status() >= 300:
			m.logger.Info("Redirection", fields...)
		default:
			m.logger.Info("Request completed", fields...)
		}
	}
}

