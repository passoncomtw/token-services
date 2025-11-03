package interfaces

import (
	"token-admin-api/pkg/models"

	"github.com/gin-gonic/gin"
)

// ==================== Backend Actor 介面定義 ====================

// BackendActorResponse 後台角色回應
type BackendActorResponse struct {
	ID          int                    `json:"id"`
	Name        string                 `json:"name"`
	Markup      string                 `json:"markup"`
	Permissions map[string]interface{} `json:"permissions"`
}

// CreateBackendActorRequest 新增後台角色請求
type CreateBackendActorRequest struct {
	Name        string                 `json:"name" binding:"required"`
	Markup      string                 `json:"markup" binding:"required"`
	Permissions map[string]interface{} `json:"permissions" binding:"required"`
}

// UpdateBackendActorRequest 編輯後台角色請求
type UpdateBackendActorRequest struct {
	Name        string                 `json:"name" binding:"required"`
	Markup      string                 `json:"markup" binding:"required"`
	Permissions map[string]interface{} `json:"permissions" binding:"required"`
}

// PermissionNode 權限樹節點
type PermissionNode struct {
	FunctionName     string            `json:"functionName"`
	FunctionIdentify string            `json:"functionIdentify"`
	ParentID         *string           `json:"parentId"`
	Children         []*PermissionNode `json:"children,omitempty"`
}

// BackendActorServiceInterface 後台角色服務介面
type BackendActorServiceInterface interface {
	GetAll() ([]*BackendActorResponse, error)
	Create(req *CreateBackendActorRequest) (*BackendActorResponse, error)
	GetPermissions() (*PermissionNode, error)
}

// BackendActorHandlersInterface 後台角色處理器介面
type BackendActorHandlersInterface interface {
	GetAll(c *gin.Context)
	Create(c *gin.Context)
	GetPermissions(c *gin.Context)
}

// ConvertToBackendActorResponse 將 model 轉換為回應格式
func ConvertToBackendActorResponse(actor *models.BackendActor) *BackendActorResponse {
	return &BackendActorResponse{
		ID:          actor.ID,
		Name:        actor.Name,
		Markup:      actor.Markup,
		Permissions: actor.Permissions,
	}
}
