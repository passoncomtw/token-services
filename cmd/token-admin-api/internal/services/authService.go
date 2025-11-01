package services

import (
	"errors"

	"token-admin-api/cmd/token-admin-api/internal/interfaces"
	"token-admin-api/pkg/auth"
	"token-admin-api/pkg/config"
	"token-admin-api/pkg/models"

	"go.uber.org/fx"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthService 認證服務
type AuthService struct {
	db        *gorm.DB
	jwtConfig *auth.Config
}

// NewAuthService 建立新的認證服務
func NewAuthService(db *gorm.DB, cfg *config.Config) *AuthService {
	return &AuthService{
		db:        db,
		jwtConfig: auth.NewConfigFromAppConfig(cfg),
	}
}

// LoginRequest 登入請求
type LoginRequest struct {
	Account  string `json:"account" binding:"required" example:"admin"`
	Password string `json:"password" binding:"required" example:"a12345678"`
}

// Login 使用者登入（後台管理員）
func (s *AuthService) Login(account, password string) (*interfaces.LoginResponse, error) {
	// 查詢後台使用者
	var user models.BackendUser
	err := s.db.Where("account = ?", account).First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("帳號或密碼錯誤")
		}
		return nil, err
	}

	// 檢查帳號狀態
	if user.Status != 0 {
		return nil, errors.New("帳號已被停用")
	}

	// 驗證密碼
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("帳號或密碼錯誤")
	}

	// 生成 JWT token
	token, err := auth.GenerateToken(s.jwtConfig, user.ID, user.Account)
	if err != nil {
		return nil, err
	}

	return &interfaces.LoginResponse{
		Token:   token,
		UserID:  user.ID,
		Account: user.Account,
		Name:    user.Name,
	}, nil
}

// Logout 使用者登出（目前為無狀態實作）
func (s *AuthService) Logout() error {
	// JWT 無狀態登出，客戶端需自行刪除 token
	// 如需伺服器端登出，可實作 token 黑名單機制
	return nil
}

var AuthModule = fx.Module("auth",
	fx.Provide(fx.Annotate(NewAuthService, fx.As(new(interfaces.AuthServiceInterface)))),
)
