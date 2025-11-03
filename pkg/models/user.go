package models

import (
	"database/sql"
	"time"
)

/**
 * @brief User 使用者資料模型（前台使用者）
 * @description 對應資料庫 users 表
 */
type User struct {
	ID                int            `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	ReferralID        sql.NullInt32  `gorm:"column:referral_id" json:"referral_id,omitempty"`
	CreatedAt         time.Time      `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
	UpdatedAt         time.Time      `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
	DeletedAt         *time.Time     `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`
	Type              int            `gorm:"column:type;not null" json:"type"`                                       // 0: 一般使用者, 1: 商家使用者
	Status            int            `gorm:"column:status;not null;default:0" json:"status"`                         // 0: 啟用, 1: 凍結
	TransactionStatus int            `gorm:"column:transaction_status;not null;default:1" json:"transaction_status"` // 1: 可以交易, 0: 凍結交易
	OrderStatus       int            `gorm:"column:order_status;not null;default:1" json:"order_status"`             // 1: 允許掛單, 0: 不可掛單
	LoginTime         *time.Time     `gorm:"column:login_time;type:timestamptz" json:"login_time,omitempty"`
	Phone             sql.NullString `gorm:"column:phone;type:varchar(255)" json:"phone,omitempty"`
	Account           string         `gorm:"column:account;type:varchar(255);not null" json:"account"`
	Name              string         `gorm:"column:name;type:varchar(255);not null" json:"name"`
	Email             string         `gorm:"column:email;type:varchar(255);not null" json:"email"`
	Password          string         `gorm:"column:password;type:varchar(255);not null" json:"-"`
	ReferralCode      string         `gorm:"column:referral_code;type:varchar(255);not null" json:"referral_code"`
	TransactionCode   string         `gorm:"column:transaction_code;type:varchar(255);not null" json:"-"`
	Markup            sql.NullString `gorm:"column:markup;type:varchar(255)" json:"markup,omitempty"`
	NotificationToken sql.NullString `gorm:"column:notification_token;type:varchar(255)" json:"notification_token,omitempty"`

	// 關聯
	Merchant *Merchant `gorm:"foreignKey:UserID;references:ID" json:"merchant,omitempty"`
	Wallet   *Wallet   `gorm:"foreignKey:UserID;references:ID" json:"wallet,omitempty"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (User) TableName() string {
	return "users"
}
