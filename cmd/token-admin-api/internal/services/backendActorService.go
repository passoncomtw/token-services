package services

import (
	"token-admin-api/cmd/token-admin-api/internal/interfaces"
	"token-admin-api/pkg/logger"
	"token-admin-api/pkg/models"

	"go.uber.org/fx"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// BackendActorService 後台角色服務
type BackendActorService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewBackendActorService 建立新的後台角色服務
func NewBackendActorService(db *gorm.DB, log logger.Logger) *BackendActorService {
	return &BackendActorService{
		db:     db,
		logger: log.With(zap.String("service", "BackendActorService")),
	}
}

// GetAll 取得所有後台角色
func (s *BackendActorService) GetAll() ([]*interfaces.BackendActorResponse, error) {
	var actors []models.BackendActor
	if err := s.db.Find(&actors).Error; err != nil {
		return nil, err
	}

	var result []*interfaces.BackendActorResponse
	for _, actor := range actors {
		result = append(result, interfaces.ConvertToBackendActorResponse(&actor))
	}

	return result, nil
}

// Create 新增後台角色
func (s *BackendActorService) Create(req *interfaces.CreateBackendActorRequest) (*interfaces.BackendActorResponse, error) {
	actor := models.BackendActor{
		Name:        req.Name,
		Markup:      req.Markup,
		Permissions: models.PermissionsJSON(req.Permissions),
	}

	if err := s.db.Create(&actor).Error; err != nil {
		return nil, err
	}

	return interfaces.ConvertToBackendActorResponse(&actor), nil
}

// GetPermissions 取得所有權限（樹狀結構）
func (s *BackendActorService) GetPermissions() (*interfaces.PermissionNode, error) {
	// 建立完整的權限樹狀結構
	// 這裡返回一個固定的權限樹結構，用於前端顯示
	root := &interfaces.PermissionNode{
		FunctionName:     "系統管理",
		FunctionIdentify: "system",
		ParentID:         nil,
		Children: []*interfaces.PermissionNode{
			{
				FunctionName:     "後台使用者管理",
				FunctionIdentify: "system.backenduser",
				ParentID:         strPtr("system"),
				Children: []*interfaces.PermissionNode{
					{
						FunctionName:     "檢視",
						FunctionIdentify: "system.backenduser.read",
						ParentID:         strPtr("system.backenduser"),
					},
					{
						FunctionName:     "新增",
						FunctionIdentify: "system.backenduser.create",
						ParentID:         strPtr("system.backenduser"),
					},
					{
						FunctionName:     "刪除",
						FunctionIdentify: "system.backenduser.delete",
						ParentID:         strPtr("system.backenduser"),
					},
				},
			},
			{
				FunctionName:     "後台角色管理",
				FunctionIdentify: "system.backendactor",
				ParentID:         strPtr("system"),
				Children: []*interfaces.PermissionNode{
					{
						FunctionName:     "檢視",
						FunctionIdentify: "system.backendactor.read",
						ParentID:         strPtr("system.backendactor"),
					},
					{
						FunctionName:     "新增",
						FunctionIdentify: "system.backendactor.create",
						ParentID:         strPtr("system.backendactor"),
					},
					{
						FunctionName:     "刪除",
						FunctionIdentify: "system.backendactor.delete",
						ParentID:         strPtr("system.backendactor"),
					},
				},
			},
		},
	}

	return root, nil
}

// strPtr 輔助函數：將字串轉為指標
func strPtr(s string) *string {
	return &s
}

// BackendActorModule FX module
var BackendActorModule = fx.Module("backendActor",
	fx.Provide(fx.Annotate(NewBackendActorService, fx.As(new(interfaces.BackendActorServiceInterface)))),
)
