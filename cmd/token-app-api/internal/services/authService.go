package services

import (
	"database/sql"
	"errors"

	"github.com/yourusername/project/cmd/github.com/yourusername/project/internal/interfaces"
	"github.com/yourusername/project/pkg/auth"
	"github.com/yourusername/project/pkg/config"

	"go.uber.org/fx"
	"golang.org/x/crypto/bcrypt"
)

// AuthService 認證服務
type AuthService struct {
	db        *sql.DB
	jwtConfig *auth.Config
}

// NewAuthService 建立新的認證服務
func NewAuthService(db *sql.DB, cfg *config.Config) *AuthService {
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

// Login 使用者登入
func (s *AuthService) Login(account, password string) (*interfaces.LoginResponse, error) {
	// 查詢使用者
	var userID int
	var name string
	var hashedPassword string

	err := s.db.QueryRow(
		"SELECT id, name, password FROM users WHERE account = $1",
		account,
	).Scan(&userID, &name, &hashedPassword)

	if err == sql.ErrNoRows {
		return nil, errors.New("帳號或密碼錯誤")
	}
	if err != nil {
		return nil, err
	}

	// 驗證密碼
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return nil, errors.New("帳號或密碼錯誤")
	}

	// 生成 JWT token
	token, err := auth.GenerateToken(s.jwtConfig, userID, account)
	if err != nil {
		return nil, err
	}

	return &interfaces.LoginResponse{
		Token:   token,
		UserID:  userID,
		Account: account,
		Name:    name,
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
