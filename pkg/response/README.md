# Response 統一回應格式模組

這個模組提供了統一的 API 回應格式，確保所有 API 端點返回一致的結構。

## 功能特性

- ✅ 統一的成功回應格式
- ✅ 統一的錯誤回應格式
- ✅ 標準化的錯誤碼
- ✅ 驗證錯誤專用格式
- ✅ 便捷的輔助函數
- ✅ 完整的 Swagger 註解

## 回應格式

### 成功回應

```json
{
  "success": true,
  "message": "操作成功",
  "code": "SUCCESS",
  "data": {
    // 實際資料
  }
}
```

### 錯誤回應

```json
{
  "success": false,
  "message": "操作失敗",
  "code": "ERROR",
  "error": "詳細錯誤訊息"
}
```

### 驗證錯誤回應

```json
{
  "success": false,
  "message": "資料驗證失敗",
  "code": "VALIDATION_ERROR",
  "errors": {
    "field1": "錯誤訊息1",
    "field2": "錯誤訊息2"
  }
}
```

## 標準錯誤碼

```go
const (
    CodeSuccess            = "SUCCESS"              // 成功
    CodeError              = "ERROR"                // 一般錯誤
    CodeValidationError    = "VALIDATION_ERROR"     // 驗證錯誤
    CodeUnauthorized       = "UNAUTHORIZED"         // 未認證
    CodeForbidden          = "FORBIDDEN"            // 無權限
    CodeNotFound           = "NOT_FOUND"            // 找不到資源
    CodeInternalError      = "INTERNAL_ERROR"       // 內部錯誤
    CodeBadRequest         = "BAD_REQUEST"          // 錯誤請求
    CodeConflict           = "CONFLICT"             // 衝突
    CodeTooManyRequests    = "TOO_MANY_REQUESTS"    // 請求過多
    CodeServiceUnavailable = "SERVICE_UNAVAILABLE"  // 服務不可用
)
```

## 使用方式

### 1. 成功回應

```go
package handlers

import (
    "github.com/yourusername/project/pkg/response"
    "github.com/gin-gonic/gin"
)

func (h *UserHandlers) GetUser(c *gin.Context) {
    user := // ... 取得使用者資料

    // 方式 1: 使用預設訊息
    response.Success(c, user)

    // 方式 2: 自訂訊息
    response.SuccessWithMessage(c, "成功取得使用者資料", user)
}
```

### 2. 錯誤回應

```go
func (h *UserHandlers) CreateUser(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        // 400 錯誤請求
        response.BadRequest(c, "請求參數錯誤")
        return
    }

    user, err := h.userService.Create(req)
    if err != nil {
        // 500 內部錯誤
        response.InternalError(c, "建立使用者失敗")
        return
    }

    response.Success(c, user)
}
```

### 3. 詳細錯誤訊息

```go
func (h *UserHandlers) UpdateUser(c *gin.Context) {
    user, err := h.userService.Update(id, data)
    if err != nil {
        // 包含詳細錯誤訊息（適合開發環境）
        response.InternalErrorWithDetail(c, "更新使用者失敗", err)
        return
    }

    response.Success(c, user)
}
```

### 4. 驗證錯誤

```go
func (h *UserHandlers) ValidateUser(c *gin.Context) {
    errors := make(map[string]interface{})

    if user.Email == "" {
        errors["email"] = "電子郵件不可為空"
    }
    if len(user.Password) < 8 {
        errors["password"] = "密碼長度至少 8 個字元"
    }

    if len(errors) > 0 {
        response.ValidationError(c, errors)
        return
    }

    response.Success(c, user)
}
```

### 5. 常用 HTTP 狀態碼回應

```go
// 400 Bad Request
response.BadRequest(c, "請求參數錯誤")

// 401 Unauthorized
response.Unauthorized(c, "未提供認證 token")

// 403 Forbidden
response.Forbidden(c, "無權限執行此操作")

// 404 Not Found
response.NotFound(c, "找不到指定資源")

// 409 Conflict
response.Conflict(c, "資源已存在")

// 500 Internal Server Error
response.InternalError(c, "內部伺服器錯誤")
```

### 6. 自訂錯誤碼

```go
func (h *UserHandlers) CustomError(c *gin.Context) {
    response.ErrorWithCode(c, http.StatusBadRequest, "CUSTOM_ERROR", "自訂錯誤訊息")
}
```

## Swagger 註解範例

### 成功回應（無資料）

```go
// @Success 200 {object} response.Response
```

### 成功回應（含資料）

```go
// @Success 200 {object} response.Response{data=models.User}
```

### 成功回應（含陣列資料）

```go
// @Success 200 {object} response.Response{data=[]models.User}
```

### 錯誤回應

```go
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
```

### 驗證錯誤

```go
// @Failure 400 {object} response.ValidationErrorResponse
```

## 完整範例

```go
package handlers

import (
    "github.com/yourusername/project/internal/interfaces"
    "github.com/yourusername/project/internal/models"
    "github.com/yourusername/project/pkg/response"
    "github.com/gin-gonic/gin"
)

type UserHandlers struct {
    userService interfaces.UserServiceInterface
}

// GetUser godoc
// @Summary 取得使用者
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "使用者 ID"
// @Success 200 {object} response.Response{data=models.User}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /api/v1/users/{id} [get]
func (h *UserHandlers) GetUser(c *gin.Context) {
    id := c.Param("id")
    if id == "" {
        response.BadRequest(c, "使用者 ID 不可為空")
        return
    }

    user, err := h.userService.GetByID(id)
    if err != nil {
        response.NotFound(c, "找不到指定使用者")
        return
    }

    response.SuccessWithMessage(c, "成功取得使用者資料", user)
}

// CreateUser godoc
// @Summary 建立使用者
// @Tags users
// @Accept json
// @Produce json
// @Param user body CreateUserRequest true "使用者資訊"
// @Success 200 {object} response.Response{data=models.User}
// @Failure 400 {object} response.ValidationErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /api/v1/users [post]
func (h *UserHandlers) CreateUser(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        response.BadRequest(c, "請求參數錯誤")
        return
    }

    // 驗證資料
    if errors := h.validateCreateUserRequest(req); len(errors) > 0 {
        response.ValidationError(c, errors)
        return
    }

    user, err := h.userService.Create(req)
    if err != nil {
        response.InternalErrorWithDetail(c, "建立使用者失敗", err)
        return
    }

    response.SuccessWithMessage(c, "成功建立使用者", user)
}
```

## API 文檔

### 類型定義

#### Response
```go
type Response struct {
    Success bool        `json:"success" example:"true"`
    Message string      `json:"message" example:"操作成功"`
    Data    interface{} `json:"data,omitempty"`
    Code    string      `json:"code,omitempty" example:"SUCCESS"`
}
```

#### ErrorResponse
```go
type ErrorResponse struct {
    Success bool   `json:"success" example:"false"`
    Message string `json:"message" example:"操作失敗"`
    Code    string `json:"code" example:"ERROR"`
    Error   string `json:"error,omitempty" example:"詳細錯誤訊息"`
}
```

#### ValidationErrorResponse
```go
type ValidationErrorResponse struct {
    Success bool                   `json:"success" example:"false"`
    Message string                 `json:"message" example:"資料驗證失敗"`
    Code    string                 `json:"code" example:"VALIDATION_ERROR"`
    Errors  map[string]interface{} `json:"errors,omitempty"`
}
```

### 函數列表

#### 成功回應
- `Success(c, data)` - 回傳成功訊息
- `SuccessWithMessage(c, message, data)` - 回傳成功訊息（自訂訊息）

#### 錯誤回應
- `Error(c, statusCode, message)` - 回傳錯誤訊息
- `ErrorWithCode(c, statusCode, code, message)` - 回傳錯誤訊息（自訂錯誤碼）
- `ErrorWithDetail(c, statusCode, message, err)` - 回傳錯誤訊息（含詳細錯誤）

#### 常用 HTTP 錯誤
- `BadRequest(c, message)` - 400 錯誤請求
- `Unauthorized(c, message)` - 401 未認證
- `Forbidden(c, message)` - 403 無權限
- `NotFound(c, message)` - 404 找不到資源
- `Conflict(c, message)` - 409 衝突
- `InternalError(c, message)` - 500 內部錯誤
- `InternalErrorWithDetail(c, message, err)` - 500 內部錯誤（含詳細錯誤）

#### 驗證錯誤
- `ValidationError(c, errors)` - 回傳驗證錯誤訊息

## 最佳實踐

1. **一致性**: 所有 API 端點都應使用這個模組的回應格式
2. **錯誤處理**: 使用適當的 HTTP 狀態碼和錯誤碼
3. **訊息清晰**: 錯誤訊息應該清楚說明問題
4. **詳細錯誤**: 開發環境可以使用 `ErrorWithDetail`，生產環境建議隱藏詳細錯誤
5. **驗證錯誤**: 使用 `ValidationError` 提供具體的欄位錯誤訊息
6. **Swagger 文檔**: 正確標註 Swagger 註解，讓 API 文檔清楚易懂

## 相關資源

- [Gin Web Framework](https://gin-gonic.com/)
- [Swagger/OpenAPI](https://swagger.io/)
- [REST API Best Practices](https://restfulapi.net/)
