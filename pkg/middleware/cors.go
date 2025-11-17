package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORSMiddleware CORS 中介軟體
type CORSMiddleware struct {
	allowOrigins []string
}

/**
 * @brief 建立新的 CORS 中介軟體
 * @param allowOrigins 允許的來源清單
 * @return CORSMiddleware 指標
 */
func NewCORSMiddleware(allowOrigins []string) *CORSMiddleware {
	if len(allowOrigins) == 0 {
		// 預設允許的來源
		allowOrigins = []string{
			"http://localhost:3000",             // 本地開發環境
			"http://localhost:3001",             // 備用開發端口
			"https://token-admin-api.passon.tw", // 生產環境 (admin-api)
			"https://token-app-api.passon.tw",   // 生產環境 (app-api)
		}
	}

	return &CORSMiddleware{
		allowOrigins: allowOrigins,
	}
}

/**
 * @brief 取得 CORS 處理器
 * @return Gin 處理器函數
 */
func (m *CORSMiddleware) Handler() gin.HandlerFunc {
	config := cors.Config{
		// 允許的來源
		AllowOrigins: m.allowOrigins,

		// 允許的 HTTP 方法（必須包含 OPTIONS）
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},

		// 允許的請求標頭
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
			"X-CSRF-Token",
		},

		// 暴露給前端的回應標頭
		ExposeHeaders: []string{
			"Content-Length",
			"Content-Type",
		},

		// 允許攜帶憑證（cookies, authorization headers）
		AllowCredentials: true,

		// 預檢請求結果快取時間（12 小時）
		MaxAge: 12 * time.Hour,
	}

	return cors.New(config)
}

/**
 * @brief 建立 CORS 中介軟體的工廠函數（用於 FX 依賴注入）
 * @return CORSMiddleware 指標
 */
func ProvideCORSMiddleware() *CORSMiddleware {
	return NewCORSMiddleware(nil)
}
