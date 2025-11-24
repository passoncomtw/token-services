package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"passontw-backend-services/cmd/pos-merchant-api/internal/models"
	"passontw-backend-services/cmd/pos-merchant-api/internal/utils"
)

// LoginAttempt 登入嘗試記錄
type LoginAttempt struct {
	Count       int
	LastTry     time.Time
	LockedUntil time.Time
}

// RateLimiter 頻率限制器
type RateLimiter struct {
	mu       sync.RWMutex
	attempts map[string]*LoginAttempt

	// 配置參數
	MaxAttempts  int           // 最大嘗試次數
	WindowPeriod time.Duration // 時間窗口期間
	LockDuration time.Duration // 鎖定時間
}

// NewRateLimiter 創建新的頻率限制器
func NewRateLimiter() *RateLimiter {
	return &RateLimiter{
		attempts:     make(map[string]*LoginAttempt),
		MaxAttempts:  5,                // 5次嘗試
		WindowPeriod: 15 * time.Minute, // 15分鐘時間窗口
		LockDuration: 30 * time.Minute, // 鎖定30分鐘
	}
}

// 全局 rate limiter 實例
var globalRateLimiter = NewRateLimiter()

// LoginRateLimitMiddleware 登入頻率限制中間件
func LoginRateLimitMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()

		if !globalRateLimiter.AllowRequest(clientIP) {
			// 記錄被限制的登入嘗試
			logRateLimitedAttempt(db, c)
			utils.RespondWithError(c, utils.ErrRateLimited)
			c.Abort()
			return
		}

		c.Next()

		// 檢查登入是否成功
		if c.Writer.Status() == http.StatusUnauthorized {
			// 登入失敗，記錄失敗嘗試
			globalRateLimiter.RecordFailedAttempt(clientIP)
		} else if c.Writer.Status() == http.StatusOK {
			// 登入成功，重置嘗試次數
			globalRateLimiter.ResetAttempts(clientIP)
		}
	}
}

// AllowRequest 檢查是否允許請求
func (rl *RateLimiter) AllowRequest(clientIP string) bool {
	rl.mu.RLock()
	attempt, exists := rl.attempts[clientIP]
	rl.mu.RUnlock()

	now := time.Now()

	if !exists {
		return true
	}

	// 檢查是否還在鎖定期間
	if now.Before(attempt.LockedUntil) {
		return false
	}

	// 檢查時間窗口是否已過期
	if now.Sub(attempt.LastTry) > rl.WindowPeriod {
		rl.mu.Lock()
		attempt.Count = 0
		attempt.LockedUntil = time.Time{}
		rl.mu.Unlock()
		return true
	}

	// 檢查是否超過最大嘗試次數
	return attempt.Count < rl.MaxAttempts
}

// RecordFailedAttempt 記錄失敗的登入嘗試
func (rl *RateLimiter) RecordFailedAttempt(clientIP string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	attempt, exists := rl.attempts[clientIP]

	if !exists {
		rl.attempts[clientIP] = &LoginAttempt{
			Count:   1,
			LastTry: now,
		}
		return
	}

	// 如果時間窗口已過期，重置計數
	if now.Sub(attempt.LastTry) > rl.WindowPeriod {
		attempt.Count = 1
		attempt.LockedUntil = time.Time{}
	} else {
		attempt.Count++
	}

	attempt.LastTry = now

	// 如果達到最大嘗試次數，設置鎖定時間
	if attempt.Count >= rl.MaxAttempts {
		attempt.LockedUntil = now.Add(rl.LockDuration)
	}
}

// ResetAttempts 重置指定 IP 的嘗試次數（登入成功時調用）
func (rl *RateLimiter) ResetAttempts(clientIP string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	delete(rl.attempts, clientIP)
}

// CleanupExpiredAttempts 清理過期的嘗試記錄（可定期調用）
func (rl *RateLimiter) CleanupExpiredAttempts() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for ip, attempt := range rl.attempts {
		// 如果記錄太舊且不在鎖定期間，則刪除
		if now.Sub(attempt.LastTry) > rl.WindowPeriod && now.After(attempt.LockedUntil) {
			delete(rl.attempts, ip)
		}
	}
}

// GetAttemptInfo 獲取指定 IP 的嘗試信息（用於調試）
func (rl *RateLimiter) GetAttemptInfo(clientIP string) *LoginAttempt {
	rl.mu.RLock()
	defer rl.mu.RUnlock()

	if attempt, exists := rl.attempts[clientIP]; exists {
		return &LoginAttempt{
			Count:       attempt.Count,
			LastTry:     attempt.LastTry,
			LockedUntil: attempt.LockedUntil,
		}
	}
	return nil
}

// logRateLimitedAttempt 記錄被頻率限制的登入嘗試
func logRateLimitedAttempt(db *gorm.DB, c *gin.Context) {
	failureReason := "rate_limited"

	logReq := models.LoginLogRequest{
		MerchantID:    nil, // Rate limit 時還不知道 merchant_id
		UserID:        nil, // Rate limit 時還不知道 user_id
		Username:      "",  // Rate limit 時還不知道 username
		ClientIP:      c.ClientIP(),
		UserAgent:     c.GetHeader("User-Agent"),
		LoginStatus:   "rate_limited",
		FailureReason: &failureReason,
	}

	// 異步記錄日誌，避免影響性能
	go func() {
		if err := models.CreateLoginLog(db, logReq); err != nil {
			// 靜默處理錯誤，不影響主要流程
		}
	}()
}
