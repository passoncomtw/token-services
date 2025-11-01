package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

/**
 * @brief Response 統一回應格式
 */
type Response struct {
	Success bool        `json:"success" example:"true"`
	Message string      `json:"message" example:"操作成功"`
	Data    interface{} `json:"data,omitempty"`
	Code    string      `json:"code,omitempty" example:"SUCCESS"`
}

/**
 * @brief ErrorResponse 錯誤回應格式
 */
type ErrorResponse struct {
	Success bool   `json:"success" example:"false"`
	Message string `json:"message" example:"操作失敗"`
	Code    string `json:"code" example:"ERROR"`
	Error   string `json:"error,omitempty" example:"詳細錯誤訊息"`
}

/**
 * @brief ValidationErrorResponse 驗證錯誤回應格式
 */
type ValidationErrorResponse struct {
	Success bool                   `json:"success" example:"false"`
	Message string                 `json:"message" example:"資料驗證失敗"`
	Code    string                 `json:"code" example:"VALIDATION_ERROR"`
	Errors  map[string]interface{} `json:"errors,omitempty"`
}

// 常用的錯誤碼
const (
	CodeSuccess          = "SUCCESS"
	CodeError            = "ERROR"
	CodeValidationError  = "VALIDATION_ERROR"
	CodeUnauthorized     = "UNAUTHORIZED"
	CodeForbidden        = "FORBIDDEN"
	CodeNotFound         = "NOT_FOUND"
	CodeInternalError    = "INTERNAL_ERROR"
	CodeBadRequest       = "BAD_REQUEST"
	CodeConflict         = "CONFLICT"
	CodeTooManyRequests  = "TOO_MANY_REQUESTS"
	CodeServiceUnavailable = "SERVICE_UNAVAILABLE"
)

/**
 * @brief Success 回傳成功訊息
 * @param c Gin Context
 * @param data 回應資料
 */
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "操作成功",
		Data:    data,
		Code:    CodeSuccess,
	})
}

/**
 * @brief SuccessWithMessage 回傳成功訊息（自訂訊息）
 * @param c Gin Context
 * @param message 訊息內容
 * @param data 回應資料
 */
func SuccessWithMessage(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: message,
		Data:    data,
		Code:    CodeSuccess,
	})
}

/**
 * @brief Error 回傳錯誤訊息
 * @param c Gin Context
 * @param statusCode HTTP 狀態碼
 * @param message 錯誤訊息
 */
func Error(c *gin.Context, statusCode int, message string) {
	code := getCodeByStatus(statusCode)
	c.JSON(statusCode, ErrorResponse{
		Success: false,
		Message: message,
		Code:    code,
	})
}

/**
 * @brief ErrorWithCode 回傳錯誤訊息（自訂錯誤碼）
 * @param c Gin Context
 * @param statusCode HTTP 狀態碼
 * @param code 錯誤碼
 * @param message 錯誤訊息
 */
func ErrorWithCode(c *gin.Context, statusCode int, code string, message string) {
	c.JSON(statusCode, ErrorResponse{
		Success: false,
		Message: message,
		Code:    code,
	})
}

/**
 * @brief ErrorWithDetail 回傳錯誤訊息（含詳細錯誤）
 * @param c Gin Context
 * @param statusCode HTTP 狀態碼
 * @param message 錯誤訊息
 * @param err 錯誤詳情
 */
func ErrorWithDetail(c *gin.Context, statusCode int, message string, err error) {
	code := getCodeByStatus(statusCode)
	errorDetail := ""
	if err != nil {
		errorDetail = err.Error()
	}
	c.JSON(statusCode, ErrorResponse{
		Success: false,
		Message: message,
		Code:    code,
		Error:   errorDetail,
	})
}

/**
 * @brief ValidationError 回傳驗證錯誤訊息
 * @param c Gin Context
 * @param errors 驗證錯誤詳情
 */
func ValidationError(c *gin.Context, errors map[string]interface{}) {
	c.JSON(http.StatusBadRequest, ValidationErrorResponse{
		Success: false,
		Message: "資料驗證失敗",
		Code:    CodeValidationError,
		Errors:  errors,
	})
}

/**
 * @brief BadRequest 回傳 400 錯誤
 * @param c Gin Context
 * @param message 錯誤訊息
 */
func BadRequest(c *gin.Context, message string) {
	Error(c, http.StatusBadRequest, message)
}

/**
 * @brief Unauthorized 回傳 401 錯誤
 * @param c Gin Context
 * @param message 錯誤訊息
 */
func Unauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, message)
}

/**
 * @brief Forbidden 回傳 403 錯誤
 * @param c Gin Context
 * @param message 錯誤訊息
 */
func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, message)
}

/**
 * @brief NotFound 回傳 404 錯誤
 * @param c Gin Context
 * @param message 錯誤訊息
 */
func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message)
}

/**
 * @brief Conflict 回傳 409 錯誤
 * @param c Gin Context
 * @param message 錯誤訊息
 */
func Conflict(c *gin.Context, message string) {
	Error(c, http.StatusConflict, message)
}

/**
 * @brief InternalError 回傳 500 錯誤
 * @param c Gin Context
 * @param message 錯誤訊息
 */
func InternalError(c *gin.Context, message string) {
	Error(c, http.StatusInternalServerError, message)
}

/**
 * @brief InternalErrorWithDetail 回傳 500 錯誤（含詳細錯誤）
 * @param c Gin Context
 * @param message 錯誤訊息
 * @param err 錯誤詳情
 */
func InternalErrorWithDetail(c *gin.Context, message string, err error) {
	ErrorWithDetail(c, http.StatusInternalServerError, message, err)
}

/**
 * @brief getCodeByStatus 根據 HTTP 狀態碼取得對應的錯誤碼
 * @param statusCode HTTP 狀態碼
 * @return string 錯誤碼
 */
func getCodeByStatus(statusCode int) string {
	switch statusCode {
	case http.StatusBadRequest:
		return CodeBadRequest
	case http.StatusUnauthorized:
		return CodeUnauthorized
	case http.StatusForbidden:
		return CodeForbidden
	case http.StatusNotFound:
		return CodeNotFound
	case http.StatusConflict:
		return CodeConflict
	case http.StatusTooManyRequests:
		return CodeTooManyRequests
	case http.StatusInternalServerError:
		return CodeInternalError
	case http.StatusServiceUnavailable:
		return CodeServiceUnavailable
	default:
		return CodeError
	}
}
