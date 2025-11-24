package models

import (
	"net"
	"time"

	"gorm.io/gorm"
)

// LoginLog 登入日誌模型
type LoginLog struct {
	LogID           string    `gorm:"column:log_id;primary_key" json:"log_id"`
	MerchantID      *string   `gorm:"column:merchant_id" json:"merchant_id,omitempty"`
	UserID          *string   `gorm:"column:user_id" json:"user_id,omitempty"`
	Username        string    `gorm:"column:username" json:"username"`
	ClientIP        net.IP    `gorm:"column:client_ip;type:inet" json:"client_ip"`
	UserAgent       string    `gorm:"column:user_agent" json:"user_agent,omitempty"`
	LoginStatus     string    `gorm:"column:login_status" json:"login_status"`
	FailureReason   *string   `gorm:"column:failure_reason" json:"failure_reason,omitempty"`
	AttemptedAt     time.Time `gorm:"column:attempted_at" json:"attempted_at"`
	SessionDuration *int      `gorm:"column:session_duration" json:"session_duration,omitempty"`
	CreatedAt       time.Time `gorm:"column:created_at" json:"created_at"`
}

func (LoginLog) TableName() string {
	return "login_logs"
}

// LoginLogRequest 創建登入日誌的請求結構
type LoginLogRequest struct {
	MerchantID    *string `json:"merchant_id,omitempty"`
	UserID        *string `json:"user_id,omitempty"`
	Username      string  `json:"username"`
	ClientIP      string  `json:"client_ip"`
	UserAgent     string  `json:"user_agent,omitempty"`
	LoginStatus   string  `json:"login_status"` // success, failed, rate_limited
	FailureReason *string `json:"failure_reason,omitempty"`
}

// CreateLoginLog 創建登入日誌記錄
func CreateLoginLog(db *gorm.DB, req LoginLogRequest) error {
	clientIP := net.ParseIP(req.ClientIP)
	if clientIP == nil {
		// 如果解析失敗，使用預設值
		clientIP = net.ParseIP("0.0.0.0")
	}

	log := &LoginLog{
		MerchantID:    req.MerchantID,
		UserID:        req.UserID,
		Username:      req.Username,
		ClientIP:      clientIP,
		UserAgent:     req.UserAgent,
		LoginStatus:   req.LoginStatus,
		FailureReason: req.FailureReason,
		AttemptedAt:   time.Now(),
		CreatedAt:     time.Now(),
	}

	return db.Create(log).Error
}

// GetLoginLogsByIP 獲取特定 IP 的登入日誌
func GetLoginLogsByIP(db *gorm.DB, clientIP string, limit int) ([]LoginLog, error) {
	var logs []LoginLog

	ip := net.ParseIP(clientIP)
	if ip == nil {
		return logs, nil
	}

	err := db.Where("client_ip = ?", ip).
		Order("attempted_at DESC").
		Limit(limit).
		Find(&logs).Error

	return logs, err
}

// GetLoginLogsByUser 獲取特定用戶的登入日誌
func GetLoginLogsByUser(db *gorm.DB, userID string, limit int) ([]LoginLog, error) {
	var logs []LoginLog

	err := db.Where("user_id = ?", userID).
		Order("attempted_at DESC").
		Limit(limit).
		Find(&logs).Error

	return logs, err
}

// GetLoginLogsByMerchant 獲取特定商家的登入日誌
func GetLoginLogsByMerchant(db *gorm.DB, merchantID string, limit int) ([]LoginLog, error) {
	var logs []LoginLog

	err := db.Where("merchant_id = ?", merchantID).
		Order("attempted_at DESC").
		Limit(limit).
		Find(&logs).Error

	return logs, err
}

// GetRecentFailedLogins 獲取最近的失敗登入嘗試
func GetRecentFailedLogins(db *gorm.DB, clientIP string, since time.Time) ([]LoginLog, error) {
	var logs []LoginLog

	ip := net.ParseIP(clientIP)
	if ip == nil {
		return logs, nil
	}

	err := db.Where("client_ip = ? AND login_status = ? AND attempted_at > ?",
		ip, "failed", since).
		Order("attempted_at DESC").
		Find(&logs).Error

	return logs, err
}

// GetLoginStats 獲取登入統計信息
type LoginStats struct {
	TotalAttempts   int64   `json:"total_attempts"`
	SuccessAttempts int64   `json:"success_attempts"`
	FailedAttempts  int64   `json:"failed_attempts"`
	RateLimited     int64   `json:"rate_limited"`
	SuccessRate     float64 `json:"success_rate"`
}

// GetLoginStatsByMerchant 獲取商家的登入統計
func GetLoginStatsByMerchant(db *gorm.DB, merchantID string, since time.Time) (*LoginStats, error) {
	stats := &LoginStats{}

	// 總嘗試次數
	db.Model(&LoginLog{}).
		Where("merchant_id = ? AND attempted_at > ?", merchantID, since).
		Count(&stats.TotalAttempts)

	// 成功登入次數
	db.Model(&LoginLog{}).
		Where("merchant_id = ? AND login_status = ? AND attempted_at > ?",
			merchantID, "success", since).
		Count(&stats.SuccessAttempts)

	// 失敗登入次數
	db.Model(&LoginLog{}).
		Where("merchant_id = ? AND login_status = ? AND attempted_at > ?",
			merchantID, "failed", since).
		Count(&stats.FailedAttempts)

	// 被限制次數
	db.Model(&LoginLog{}).
		Where("merchant_id = ? AND login_status = ? AND attempted_at > ?",
			merchantID, "rate_limited", since).
		Count(&stats.RateLimited)

	// 計算成功率
	if stats.TotalAttempts > 0 {
		stats.SuccessRate = float64(stats.SuccessAttempts) / float64(stats.TotalAttempts) * 100
	}

	return stats, nil
}
