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
		// 預設允許所有來源（開發階段使用）
		// 注意：生產環境建議限制特定來源以提高安全性
		allowOrigins = []string{"*"}
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
		// 注意：當 AllowOrigins 為 "*" 時，必須設為 false
		AllowCredentials: false,

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
