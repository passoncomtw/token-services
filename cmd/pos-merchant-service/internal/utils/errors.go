package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorCode 錯誤代碼常數
const (
	// 認證相關錯誤
	ErrorCodeInvalidRequest = "INVALID_REQUEST"
	ErrorCodeUnauthorized   = "UNAUTHORIZED"
	ErrorCodeInvalidPIN     = "INVALID_PIN"
	ErrorCodeInvalidToken   = "INVALID_TOKEN"
	ErrorCodeTokenExpired   = "TOKEN_EXPIRED"
	ErrorCodeRateLimited    = "RATE_LIMITED"

	// 業務邏輯錯誤
	ErrorCodeUserNotFound     = "USER_NOT_FOUND"
	ErrorCodeUserInactive     = "USER_INACTIVE"
	ErrorCodePINSameAsOld     = "PIN_SAME_AS_OLD"
	ErrorCodeInvalidPINLength = "INVALID_PIN_LENGTH"
	ErrorCodeProductNotFound  = "PRODUCT_NOT_FOUND"
	ErrorCodeMerchantNotFound = "MERCHANT_NOT_FOUND"
	ErrorCodeOrderNotFound    = "ORDER_NOT_FOUND"
	ErrorCodeInsufficientCash = "INSUFFICIENT_CASH"

	// 系統錯誤
	ErrorCodeInternalError = "INTERNAL_ERROR"
	ErrorCodeDatabaseError = "DATABASE_ERROR"
	ErrorCodeConfigError   = "CONFIG_ERROR"
	ErrorCodeCryptoError   = "CRYPTO_ERROR"
)

// ErrorResponse 統一錯誤回應結構
type ErrorResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message"`
	ErrorCode string `json:"error_code"`
	RequestID string `json:"request_id,omitempty"`
}

// SuccessResponse 統一成功回應結構
type SuccessResponse struct {
	Success   bool        `json:"success"`
	Message   string      `json:"message,omitempty"`
	Data      interface{} `json:"data,omitempty"`
	RequestID string      `json:"request_id,omitempty"`
}

// APIError 自定義錯誤類型
type APIError struct {
	Code       string
	Message    string
	HTTPStatus int
	Internal   error // 內部錯誤，不會暴露給客戶端
}

func (e *APIError) Error() string {
	return e.Message
}

// NewAPIError 創建新的 API 錯誤
func NewAPIError(code, message string, httpStatus int, internal error) *APIError {
	return &APIError{
		Code:       code,
		Message:    message,
		HTTPStatus: httpStatus,
		Internal:   internal,
	}
}

// 預定義的常見錯誤
var (
	ErrInvalidRequest = NewAPIError(
		ErrorCodeInvalidRequest,
		"請求格式錯誤",
		http.StatusBadRequest,
		nil,
	)

	ErrUnauthorized = NewAPIError(
		ErrorCodeUnauthorized,
		"未授權",
		http.StatusUnauthorized,
		nil,
	)

	ErrInvalidPIN = NewAPIError(
		ErrorCodeInvalidPIN,
		"PIN 碼錯誤",
		http.StatusUnauthorized,
		nil,
	)

	ErrInvalidToken = NewAPIError(
		ErrorCodeInvalidToken,
		"Token 無效",
		http.StatusUnauthorized,
		nil,
	)

	ErrRateLimited = NewAPIError(
		ErrorCodeRateLimited,
		"請求過於頻繁，請稍後再試",
		http.StatusTooManyRequests,
		nil,
	)

	ErrUserNotFound = NewAPIError(
		ErrorCodeUserNotFound,
		"用戶不存在",
		http.StatusNotFound,
		nil,
	)

	ErrInternalError = NewAPIError(
		ErrorCodeInternalError,
		"系統暫時無法處理您的請求，請稍後再試",
		http.StatusInternalServerError,
		nil,
	)
)

// RespondWithError 回應錯誤
func RespondWithError(c *gin.Context, apiErr *APIError) {
	requestID := GetRequestID(c)

	response := ErrorResponse{
		Success:   false,
		Message:   apiErr.Message,
		ErrorCode: apiErr.Code,
		RequestID: requestID,
	}

	c.JSON(apiErr.HTTPStatus, response)
}

// RespondWithSuccess 回應成功
func RespondWithSuccess(c *gin.Context, message string, data interface{}) {
	requestID := GetRequestID(c)

	response := SuccessResponse{
		Success:   true,
		Message:   message,
		Data:      data,
		RequestID: requestID,
	}

	c.JSON(http.StatusOK, response)
}

// GetRequestID 獲取請求 ID
func GetRequestID(c *gin.Context) string {
	if requestID, exists := c.Get("request_id"); exists {
		if id, ok := requestID.(string); ok {
			return id
		}
	}
	return ""
}

// WrapInternalError 包裝內部錯誤為 API 錯誤
func WrapInternalError(internal error) *APIError {
	return NewAPIError(
		ErrorCodeInternalError,
		"系統暫時無法處理您的請求，請稍後再試",
		http.StatusInternalServerError,
		internal,
	)
}

// WrapDatabaseError 包裝資料庫錯誤
func WrapDatabaseError(internal error) *APIError {
	return NewAPIError(
		ErrorCodeDatabaseError,
		"資料處理失敗，請稍後再試",
		http.StatusInternalServerError,
		internal,
	)
}

// WrapConfigError 包裝配置錯誤
func WrapConfigError(internal error) *APIError {
	return NewAPIError(
		ErrorCodeConfigError,
		"系統配置錯誤，請聯繫系統管理員",
		http.StatusInternalServerError,
		internal,
	)
}
