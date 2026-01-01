package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Pagination struct {
	TotalCount int `json:"totalCount" example:"100"`
	Page       int `json:"page" example:"1"`
	Size       int `json:"size" example:"10"`
}

/**
 * @brief Response 統一回應格式
 */
type Response struct {
	Data interface{} `json:"data,omitempty"`
	Code string      `json:"code,omitempty" example:"200"`
}

/**
 * @brief Response 統一回應格式
 */
type ListResponse struct {
	Items      interface{} `json:"items,omitempty"`
	Code       string      `json:"code,omitempty" example:"200"`
	Pagination Pagination  `json:"pagination,omitempty"`
}

type ListResponseWithoutPagination struct {
	Items interface{} `json:"items,omitempty"`
	Code  string      `json:"code,omitempty" example:"200"`
}

/**
 * @brief ErrorResponse 錯誤回應格式
 */
type ErrorResponse struct {
	Code  string `json:"code" example:"500"`
	Error string `json:"error,omitempty" example:"詳細錯誤訊息"`
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
	CodeSuccess            = "200"
	CodeError              = "500"
	CodeValidationError    = "400"
	CodeUnauthorized       = "401"
	CodeForbidden          = "403"
	CodeNotFound           = "404"
	CodeInternalError      = "500"
	CodeBadRequest         = "400"
	CodeConflict           = "409"
	CodeTooManyRequests    = "429"
	CodeServiceUnavailable = "503"
)

func GetListResponse(c *gin.Context, respData interface{}, pagination Pagination) {
	c.JSON(http.StatusOK, ListResponse{
		Items:      respData,
		Pagination: pagination,
		Code:       "200",
	})
}

func GetListResponseWithoutPagination(c *gin.Context, respData interface{}) {
	c.JSON(http.StatusOK, ListResponseWithoutPagination{
		Items: respData,
		Code:  "200",
	})
}

/**
 * @brief Success 回傳成功訊息
 * @param c Gin Context
 * @param data 回應資料
 */
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Data: data,
		Code: "200",
	})
}

/**
 * @brief SuccessWithMessage 回傳成功訊息（自訂訊息）
 * @param c Gin Context
 * @param message 訊息內容
 * @param data 回應資料
 */
func SuccessWithMessage(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Data: data,
		Code: CodeSuccess,
	})
}

/**
 * @brief Error 回傳錯誤訊息
 * @param c Gin Context
 * @param statusCode HTTP 狀態碼
 * @param message 錯誤訊息
 */
func Error(c *gin.Context, statusCode int) {
	code := getCodeByStatus(statusCode)
	c.JSON(statusCode, ErrorResponse{
		Code: code,
	})
}

/**
 * @brief ErrorWithCode 回傳錯誤訊息（自訂錯誤碼）
 * @param c Gin Context
 * @param statusCode HTTP 狀態碼
 * @param code 錯誤碼
 * @param message 錯誤訊息
 */
func ErrorWithCode(c *gin.Context, statusCode int, code string) {
	c.JSON(statusCode, ErrorResponse{
		Code: code,
	})
}

/**
 * @brief ErrorWithDetail 回傳錯誤訊息（含詳細錯誤）
 * @param c Gin Context
 * @param statusCode HTTP 狀態碼
 * @param message 錯誤訊息
 * @param err 錯誤詳情
 */
func ErrorWithDetail(c *gin.Context, statusCode int, err error) {
	code := getCodeByStatus(statusCode)
	errorDetail := ""
	if err != nil {
		errorDetail = err.Error()
	}
	c.JSON(statusCode, ErrorResponse{
		Code:  code,
		Error: errorDetail,
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
func BadRequest(c *gin.Context) {
	Error(c, http.StatusBadRequest)
}

/**
 * @brief Unauthorized 回傳 401 錯誤
 * @param c Gin Context
 * @param message 錯誤訊息
 */
func Unauthorized(c *gin.Context) {
	Error(c, http.StatusUnauthorized)
}

/**
 * @brief Forbidden 回傳 403 錯誤
 * @param c Gin Context
 * @param message 錯誤訊息
 */
func Forbidden(c *gin.Context) {
	Error(c, http.StatusForbidden)
}

/**
 * @brief NotFound 回傳 404 錯誤
 * @param c Gin Context
 * @param message 錯誤訊息
 */
func NotFound(c *gin.Context) {
	Error(c, http.StatusNotFound)
}

/**
 * @brief Conflict 回傳 409 錯誤
 * @param c Gin Context
 * @param message 錯誤訊息
 */
func Conflict(c *gin.Context) {
	Error(c, http.StatusConflict)
}

/**
 * @brief InternalError 回傳 500 錯誤
 * @param c Gin Context
 */
func InternalError(c *gin.Context) {
	Error(c, http.StatusInternalServerError)
}

/**
 * @brief InternalErrorWithDetail 回傳 500 錯誤（含詳細錯誤）
 * @param c Gin Context
 * @param err 錯誤詳情
 */
func InternalErrorWithDetail(c *gin.Context, err error) {
	ErrorWithDetail(c, http.StatusInternalServerError, err)
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
