package services

import (
	"errors"

	"passontw-backend-services/cmd/pos-backend-service/internal/models"
	"passontw-backend-services/cmd/pos-backend-service/internal/utils"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AuthService struct {
	DB        *gorm.DB
	Logger    *zap.Logger
	JWTSecret string
}

func NewAuthService(db *gorm.DB, logger *zap.Logger, jwtSecret string) *AuthService {
	return &AuthService{
		DB:        db,
		Logger:    logger,
		JWTSecret: jwtSecret,
	}
}

// Login 驗證帳號密碼，回傳用戶與 JWT token
func (s *AuthService) Login(account, password string) (*models.BackendUser, string, error) {
	var user models.BackendUser
	if err := s.DB.Where("account = ?", account).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", errors.New("INVALID_CREDENTIALS")
		}
		return nil, "", err
	}
	if !utils.CheckPassword(password, user.PasswordHash) {
		return nil, "", errors.New("INVALID_CREDENTIALS")
	}
	token, err := utils.GenerateToken(s.JWTSecret, user.UserID, user.Account, user.Name, user.Role, user.Email)
	if err != nil {
		s.Logger.Error("failed to generate token", zap.Error(err))
		return nil, "", errors.New("TOKEN_GENERATION_FAILED")
	}
	return &user, token, nil
}

// VerifyToken 驗證 JWT token 並回傳用戶資訊
func (s *AuthService) VerifyToken(token string) (*models.BackendUser, error) {
	claims, err := utils.ValidateToken(s.JWTSecret, token)
	if err != nil {
		return nil, errors.New("INVALID_TOKEN")
	}
	var user models.BackendUser
	if err := s.DB.Where("user_id = ?", claims.UserID).First(&user).Error; err != nil {
		return nil, errors.New("INVALID_TOKEN")
	}
	return &user, nil
}
