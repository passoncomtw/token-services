package models

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

/**
 * @brief PendingOrder 掛單資料模型
 * @description 對應資料庫 pending_orders 表
 */
type PendingOrder struct {
	ID                 uuid.UUID      `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	UserID             *int           `gorm:"column:user_id" json:"user_id,omitempty"`
	BankCardID         *int           `gorm:"column:bank_card_id" json:"bank_card_id,omitempty"`
	Type               int            `gorm:"column:type;not null" json:"type"`                                        // 0: 買幣, 1: 賣幣
	Status             int            `gorm:"column:status;not null" json:"status"`                                    // 0: 等待付款, 1: 已付款等待放行, 2: 買家取消, 3: 賣家取消, 4: 已放行
	TransactionMinutes int            `gorm:"column:transaction_minutes;not null" json:"transaction_minutes"`          // 每筆交易的限制時間
	ProcessCount       int            `gorm:"column:process_count;not null" json:"process_count"`                      // 現在正在交易的訂單數量
	CancelCount        int            `gorm:"column:cancel_count;not null" json:"cancel_count"`                        // 取消交易的訂單數量
	DoneCount          int            `gorm:"column:done_count;not null" json:"done_count"`                            // 完成交易的訂單數量
	Telegram           sql.NullString `gorm:"column:telegram;type:varchar(255)" json:"telegram,omitempty"`             // Telegram ID
	Contactor          sql.NullString `gorm:"column:contactor;type:varchar(255)" json:"contactor,omitempty"`           // 聯絡人
	MinAmount          int64          `gorm:"column:min_amount;type:numeric(18,0);not null" json:"min_amount"`         // 交易最小值
	Balance            int64          `gorm:"column:balance;type:numeric(18,0);not null" json:"balance"`               // 剩餘額度
	Amount             int64          `gorm:"column:amount;type:numeric(18,0);not null" json:"amount"`                 // 掛單數量
	ProcessAmount      int64          `gorm:"column:process_amount;type:numeric(18,0);not null" json:"process_amount"` // 進行交易的數量
	CancelAmount       int64          `gorm:"column:cancel_amount;type:numeric(18,0);not null" json:"cancel_amount"`   // 取消的數量
	DoneAmount         int64          `gorm:"column:done_amount;type:numeric(18,0);not null" json:"done_amount"`       // 交易成功的數量
	IsSplit            bool           `gorm:"column:is_split;not null" json:"is_split"`                                // 是否拆單
	CreatedAt          time.Time      `gorm:"column:created_at;type:timestamptz;not null" json:"created_at"`
	UpdatedAt          time.Time      `gorm:"column:updated_at;type:timestamptz;not null" json:"updated_at"`
	DeletedAt          *time.Time     `gorm:"column:deleted_at;type:timestamptz" json:"deleted_at,omitempty"`

	// 關聯
	User     *User     `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
	BankCard *BankCard `gorm:"foreignKey:BankCardID;references:ID" json:"bank_card,omitempty"`
}

/**
 * @brief TableName 指定資料表名稱
 * @return string 資料表名稱
 */
func (PendingOrder) TableName() string {
	return "pending_orders"
}
