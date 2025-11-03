package services

import (
	"errors"

	"token-admin-api/cmd/token-admin-api/internal/interfaces"
	"token-admin-api/pkg/logger"
	"token-admin-api/pkg/models"

	"go.uber.org/fx"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// BackendUserService 後台使用者服務
type BackendUserService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewBackendUserService 建立新的後台使用者服務
func NewBackendUserService(db *gorm.DB, log logger.Logger) *BackendUserService {
	return &BackendUserService{
		db:     db,
		logger: log.With(zap.String("service", "BackendUserService")),
	}
}

// GetList 取得後台使用者列表
func (s *BackendUserService) GetList(query *interfaces.BackendUserListQuery) ([]*interfaces.BackendUserResponse, error) {
	// 設定預設值
	if query.Page == 0 {
		query.Page = 1
	}
	if query.Size == 0 {
		query.Size = 10
	}

	// 建立查詢
	db := s.db.Model(&models.BackendUser{}).Preload("Actor")

	// 過濾條件
	if query.Account != "" {
		db = db.Where("account LIKE ?", "%"+query.Account+"%")
	}
	if query.Name != "" {
		db = db.Where("name LIKE ?", "%"+query.Name+"%")
	}
	if query.Status != nil {
		db = db.Where("status = ?", *query.Status)
	}

	// 分頁
	offset := (query.Page - 1) * query.Size
	db = db.Offset(offset).Limit(query.Size)

	// 執行查詢
	var users []models.BackendUser
	if err := db.Find(&users).Error; err != nil {
		return nil, err
	}

	// 轉換為回應格式
	var result []*interfaces.BackendUserResponse
	for _, user := range users {
		result = append(result, interfaces.ConvertToBackendUserResponse(&user))
	}

	return result, nil
}

// Create 新增後台使用者
func (s *BackendUserService) Create(req *interfaces.CreateBackendUserRequest) (*interfaces.BackendUserResponse, error) {
	// 檢查帳號是否已存在
	var count int64
	if err := s.db.Model(&models.BackendUser{}).Where("account = ?", req.Account).Count(&count).Error; err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, errors.New("帳號已存在")
	}

	// 檢查 actor 是否存在
	var actor models.BackendActor
	if err := s.db.First(&actor, req.ActorID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("角色不存在")
		}
		return nil, err
	}

	// 加密密碼
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 建立使用者
	user := models.BackendUser{
		Name:     req.Name,
		Account:  req.Account,
		Password: string(hashedPassword),
		ActorID:  &req.ActorID,
		Status:   0, // 預設為啟用
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, err
	}

	// 重新載入 actor 資訊
	if err := s.db.Preload("Actor").First(&user, user.ID).Error; err != nil {
		return nil, err
	}

	return interfaces.ConvertToBackendUserResponse(&user), nil
}

// Update 編輯後台使用者
func (s *BackendUserService) Update(id int, req *interfaces.UpdateBackendUserRequest) (*interfaces.BackendUserResponse, error) {
	var user models.BackendUser
	if err := s.db.Preload("Actor").First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	// 檢查帳號是否被其他使用者使用
	if req.Account != user.Account {
		var count int64
		if err := s.db.Model(&models.BackendUser{}).Where("account = ? AND id != ?", req.Account, id).Count(&count).Error; err != nil {
			return nil, err
		}
		if count > 0 {
			return nil, errors.New("帳號已被使用")
		}
	}

	// 如果要更換角色，檢查角色是否存在
	if req.ActorID != nil && (user.ActorID == nil || *req.ActorID != *user.ActorID) {
		var actor models.BackendActor
		if err := s.db.First(&actor, *req.ActorID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("角色不存在")
			}
			return nil, err
		}
	}

	// 更新欄位
	user.Name = req.Name
	user.Account = req.Account
	user.Status = req.Status
	if req.ActorID != nil {
		user.ActorID = req.ActorID
	}

	if err := s.db.Save(&user).Error; err != nil {
		return nil, err
	}

	// 重新載入 actor 資訊
	if err := s.db.Preload("Actor").First(&user, user.ID).Error; err != nil {
		return nil, err
	}

	return interfaces.ConvertToBackendUserResponse(&user), nil
}

// Delete 刪除後台使用者
func (s *BackendUserService) Delete(id int) error {
	var user models.BackendUser
	if err := s.db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("使用者不存在")
		}
		return err
	}

	return s.db.Delete(&user).Error
}

// BackendUserModule FX module
var BackendUserModule = fx.Module("backendUser",
	fx.Provide(fx.Annotate(NewBackendUserService, fx.As(new(interfaces.BackendUserServiceInterface)))),
)


