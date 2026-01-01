package interfaces

import (
	"passontw-backend-services/pkg/models"

	"github.com/gin-gonic/gin"
)

// ==================== Backend User 介面定義 ====================

// ActorInfo 角色基本資訊
type ActorInfo struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Markup string `json:"markup"`
}

// BackendUserResponse 後台使用者回應
type BackendUserResponse struct {
	ID      int        `json:"id"`
	Name    string     `json:"name"`
	Account string     `json:"account"`
	Status  int        `json:"status"`
	Actor   *ActorInfo `json:"actor,omitempty"`
}

// BackendUserListQuery 後台使用者列表查詢參數
type BackendUserListQuery struct {
	Account string `form:"account"`
	Name    string `form:"name"`
	Status  *int   `form:"status"`
	Page    int    `form:"page" binding:"omitempty,min=1"`
	Size    int    `form:"size" binding:"omitempty,min=1,max=100"`
}

// CreateBackendUserRequest 新增後台使用者請求
type CreateBackendUserRequest struct {
	Name     string `json:"name" binding:"required"`
	Account  string `json:"account" binding:"required"`
	Password string `json:"password" binding:"required,min=6,max=20"`
	ActorID  int    `json:"actorId" binding:"required"`
}

// UpdateBackendUserRequest 編輯後台使用者請求
type UpdateBackendUserRequest struct {
	Name    string `json:"name" binding:"required"`
	Account string `json:"account" binding:"required"`
	Status  int    `json:"status" binding:"omitempty,oneof=0 1"`
	ActorID *int   `json:"actorId" binding:"omitempty"`
}

// BackendUserServiceInterface 後台使用者服務介面
type BackendUserServiceInterface interface {
	GetList(query *BackendUserListQuery) ([]*BackendUserResponse, int64, error)
	Create(req *CreateBackendUserRequest) (*BackendUserResponse, error)
	Update(id int, req *UpdateBackendUserRequest) (*BackendUserResponse, error)
	Delete(id int) error
}

// BackendUserHandlersInterface 後台使用者處理器介面
type BackendUserHandlersInterface interface {
	GetList(c *gin.Context)
	Create(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
}

// ConvertToBackendUserResponse 將 model 轉換為回應格式
func ConvertToBackendUserResponse(user *models.BackendUser) *BackendUserResponse {
	resp := &BackendUserResponse{
		ID:      user.ID,
		Name:    user.Name,
		Account: user.Account,
		Status:  user.Status,
	}

	// 從 Actor 取得 actor 資訊
	if user.Actor != nil {
		resp.Actor = &ActorInfo{
			ID:     user.Actor.ID,
			Name:   user.Actor.Name,
			Markup: user.Actor.Markup,
		}
	}

	return resp
}
