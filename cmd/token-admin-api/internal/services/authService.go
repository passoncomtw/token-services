package services

import (
	"errors"

	"token-admin-api/cmd/token-admin-api/internal/interfaces"
	"token-admin-api/pkg/auth"
	"token-admin-api/pkg/config"
	"token-admin-api/pkg/logger"
	"token-admin-api/pkg/models"

	"go.uber.org/fx"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthService 認證服務
type AuthService struct {
	db        *gorm.DB
	jwtConfig *auth.Config
	logger    logger.Logger
}

// NewAuthService 建立新的認證服務
func NewAuthService(db *gorm.DB, cfg *config.Config, log logger.Logger) *AuthService {
	return &AuthService{
		db:        db,
		jwtConfig: auth.NewConfigFromAppConfig(cfg),
		logger:    log.With(zap.String("service", "AuthService")),
	}
}

// LoginRequest 登入請求
type LoginRequest struct {
	Account  string `json:"account" binding:"required" example:"admin"`
	Password string `json:"password" binding:"required" example:"a12345678"`
}

// Login 使用者登入（後台管理員）
func (s *AuthService) Login(account, password string) (*interfaces.LoginResponse, error) {
	s.logger.Info("Login attempt",
		zap.String("account", account),
	)

	// 查詢後台使用者並預載入角色
	var user models.BackendUser
	err := s.db.Preload("Actor").Where("account = ?", account).First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			s.logger.Warn("Login failed: account not found",
				zap.String("account", account),
			)
			return nil, errors.New("帳號或密碼錯誤")
		}
		s.logger.Error("Login failed: database error",
			zap.Error(err),
			zap.String("account", account),
		)
		return nil, err
	}

	// 檢查帳號狀態 (0 = 啟用)
	if user.Status != 0 {
		s.logger.Warn("Login failed: account disabled",
			zap.String("account", account),
			zap.Int("status", user.Status),
		)
		return nil, errors.New("帳號已被停用")
	}

	// 驗證密碼
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		s.logger.Warn("Login failed: invalid password",
			zap.String("account", account),
		)
		return nil, errors.New("帳號或密碼錯誤")
	}

	// 取得 permissions（從關聯的 actor）
	var permissions map[string]interface{}
	if user.Actor != nil {
		permissions = user.Actor.Permissions
	} else {
		permissions = make(map[string]interface{})
	}

	// 生成 JWT token 和過期時間
	token, err := auth.GenerateToken(s.jwtConfig, user.ID, user.Account)
	if err != nil {
		s.logger.Error("Login failed: token generation error",
			zap.Error(err),
			zap.String("account", account),
		)
		return nil, err
	}

	// 計算過期時間（秒）
	expireIn := int64(s.jwtConfig.ExpirationTime.Seconds())

	s.logger.Info("Login successful",
		zap.String("account", account),
		zap.Int("userId", user.ID),
	)

	return &interfaces.LoginResponse{
		AccessToken: token,
		ExpireIn:    expireIn,
		User: interfaces.LoginUser{
			ID:          user.ID,
			Type:        0, // 後台使用者統一設為 0
			Account:     user.Account,
			Name:        user.Name,
			CreateAt:    user.CreatedAt.Unix(),
			Permissions: permissions,
		},
	}, nil
}

// Logout 使用者登出（目前為無狀態實作）
func (s *AuthService) Logout() error {
	s.logger.Debug("Logout called (stateless implementation)")
	// JWT 無狀態登出，客戶端需自行刪除 token
	// 如需伺服器端登出，可實作 token 黑名單機制
	return nil
}

var AuthModule = fx.Module("auth",
	fx.Provide(fx.Annotate(NewAuthService, fx.As(new(interfaces.AuthServiceInterface)))),
)
