package models

// ========== 通用響應結構 ==========

// ErrorResponse 錯誤響應
type ErrorResponse struct {
	Success   bool         `json:"success"`
	Message   string       `json:"message"`
	ErrorCode string       `json:"error_code"`
	Errors    []FieldError `json:"errors,omitempty"`
}

// FieldError 欄位錯誤
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// Pagination 分頁資訊
type Pagination struct {
	CurrentPage int `json:"current_page"`
	PerPage     int `json:"per_page"`
	TotalPages  int `json:"total_pages"`
	TotalCount  int `json:"total_count"`
	HasNext     bool `json:"has_next"`
	HasPrevious bool `json:"has_previous"`
}

// ========== 商家相關 ==========

// MerchantDTO 商家資料傳輸物件
type MerchantDTO struct {
	MerchantID   string `json:"merchant_id"`
	MerchantName string `json:"merchant_name"`
}

// MerchantListData 商家列表資料
type MerchantListData struct {
	Merchants  []MerchantDTO `json:"merchants"`
	Pagination Pagination    `json:"pagination"`
}

// MerchantListResponse 商家列表響應
type MerchantListResponse struct {
	Success bool             `json:"success"`
	Message string           `json:"message"`
	Data    MerchantListData `json:"data"`
}

// ========== 認證相關 ==========

// LoginRequest 登入請求
type LoginRequest struct {
	Account  string `json:"account" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// UserDTO 使用者資料傳輸物件
type UserDTO struct {
	UserID  string `json:"user_id"`
	Account string `json:"account"`
	Name    string `json:"name"`
	Role    string `json:"role"`
	Email   string `json:"email"`
}

// LoginData 登入響應資料
type LoginData struct {
	AccessToken string  `json:"access_token"`
	TokenType   string  `json:"token_type"`
	User        UserDTO `json:"user"`
}

// LoginResponse 登入響應
type LoginResponse struct {
	Success bool      `json:"success"`
	Message string    `json:"message"`
	Data    LoginData `json:"data"`
}

