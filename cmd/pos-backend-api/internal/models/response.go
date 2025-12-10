package models

// ========== 通用響應結構 ==========

// ErrorResponse 錯誤響應
type ErrorResponse struct {
	Success   bool         `json:"success" example:"false"`                     // 是否成功
	Message   string       `json:"message" example:"請求參數錯誤"`                   // 錯誤訊息
	ErrorCode string       `json:"error_code" example:"BAD_REQUEST"`            // 錯誤代碼
	Errors    []FieldError `json:"errors,omitempty"`                           // 詳細錯誤列表（可選）
}

// FieldError 欄位錯誤
type FieldError struct {
	Field   string `json:"field" example:"account"`        // 欄位名稱
	Message string `json:"message" example:"帳號不能為空"`     // 錯誤訊息
}

// Pagination 分頁資訊
type Pagination struct {
	CurrentPage int  `json:"current_page" example:"1"`   // 當前頁碼
	PerPage     int  `json:"per_page" example:"10"`      // 每頁筆數
	TotalPages  int  `json:"total_pages" example:"5"`    // 總頁數
	TotalCount  int  `json:"total_count" example:"47"`   // 總筆數
	HasNext     bool `json:"has_next" example:"true"`    // 是否有下一頁
	HasPrevious bool `json:"has_previous" example:"false"` // 是否有上一頁
}

// ========== 商家相關 ==========

// MerchantDTO 商家資料傳輸物件
type MerchantDTO struct {
	MerchantID   string `json:"merchant_id" example:"MCH001"`                    // 商家 ID
	MerchantName string `json:"merchant_name" example:"測試商家A"`                 // 商家名稱
	Status       string `json:"status" example:"online"`                       // 連線狀態 (online/offline)
	UpdatedAt    string `json:"updated_at" example:"2024-01-15T10:30:00Z"`        // 最後更新時間
	CreatedAt    string `json:"created_at" example:"2024-01-01T08:00:00Z"`       // 註冊時間
}

// MerchantListData 商家列表資料
type MerchantListData struct {
	Merchants  []MerchantDTO `json:"merchants"`  // 商家列表
	Pagination Pagination    `json:"pagination"` // 分頁資訊
}

// MerchantListResponse 商家列表響應
type MerchantListResponse struct {
	Success bool             `json:"success" example:"true"`  // 是否成功
	Message string           `json:"message" example:"查詢成功"`  // 訊息
	Data    MerchantListData `json:"data"`                    // 資料
}

// ========== 認證相關 ==========

// LoginRequest 登入請求
type LoginRequest struct {
	Account  string `json:"account" binding:"required" example:"admin"`      // 帳號
	Password string `json:"password" binding:"required" example:"a12345678"` // 密碼
}

// UserDTO 使用者資料傳輸物件
type UserDTO struct {
	UserID  string `json:"user_id" example:"1"`                  // 使用者 ID
	Account string `json:"account" example:"admin"`              // 帳號
	Name    string `json:"name" example:"系統管理員"`                // 姓名
	Role    string `json:"role" example:"admin"`                 // 角色
	Email   string `json:"email" example:"admin@passon.tw"`      // 電子郵件
}

// LoginData 登入響應資料
type LoginData struct {
	AccessToken string  `json:"access_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzMzMTIzNDU2fQ.abc123"` // JWT Token
	TokenType   string  `json:"token_type" example:"Bearer"`                                                                            // Token 類型
	User        UserDTO `json:"user"`                                                                                                   // 使用者資訊
}

// LoginResponse 登入響應
type LoginResponse struct {
	Success bool      `json:"success" example:"true"`   // 是否成功
	Message string    `json:"message" example:"登入成功"`   // 訊息
	Data    LoginData `json:"data"`                     // 資料
}

