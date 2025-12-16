package services

import (
	"errors"
	"strconv"

	"passontw-backend-services/cmd/token-app-api/internal/interfaces"
	"passontw-backend-services/pkg/auth"
	"passontw-backend-services/pkg/config"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/models"

	"go.uber.org/fx"
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
func NewAuthService(db *gorm.DB, cfg *config.Config, logger logger.Logger) *AuthService {
	return &AuthService{
		db:        db,
		jwtConfig: auth.NewConfigFromAppConfig(cfg),
		logger:    logger,
	}
}

// Login 使用者登入
func (s *AuthService) Login(req *interfaces.LoginRequest) (*interfaces.LoginResponse, error) {
	// 查詢使用者（包含錢包和銀行卡資訊）
	var user models.User
	err := s.db.Where("account = ? AND deleted_at IS NULL", req.Account).
		Preload("Wallet").
		Preload("BankCards", "deleted_at IS NULL").
		Preload("BankCards.Bank").
		First(&user).Error

	if err == gorm.ErrRecordNotFound {
		return nil, errors.New("帳號或密碼錯誤")
	}
	if err != nil {
		return nil, err
	}

	// 檢查使用者狀態
	if user.Status != 0 {
		return nil, errors.New("帳號已被凍結")
	}

	// 驗證密碼
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return nil, errors.New("帳號或密碼錯誤")
	}

	// 更新 notification token（如果有提供）
	if req.NotificationToken != "" {
		user.NotificationToken.String = req.NotificationToken
		user.NotificationToken.Valid = true
		s.db.Model(&user).Update("notification_token", user.NotificationToken)
	}

	// 生成 JWT token
	token, err := auth.GenerateToken(s.jwtConfig, user.ID, user.Account)
	if err != nil {
		return nil, err
	}

	// 計算 token 過期時間
	expireIn := s.jwtConfig.GetExpireTime()

	return &interfaces.LoginResponse{
		AccessToken: token,
		ExpireIn:    expireIn,
		User:        s.convertToUserDetail(&user),
	}, nil
}

// convertToUserDetail 轉換 User 模型為 UserDetail
func (s *AuthService) convertToUserDetail(user *models.User) *interfaces.UserDetail {
	userDetail := &interfaces.UserDetail{
		ID:           user.ID,
		Type:         user.Type,
		Account:      user.Account,
		Name:         user.Name,
		Email:        user.Email,
		CreateAt:     user.CreatedAt.Format("2006-01-02 15:04:05"),
		ReferralCode: user.ReferralCode,
	}

	// 添加錢包資訊
	if user.Wallet != nil {
		userDetail.Wallet = &interfaces.WalletDetail{
			Status:            user.Wallet.Status,
			UsefulBalance:     user.Wallet.UsefulBalance,
			GuaranteedBalance: user.Wallet.GuaranteedBalance,
			FreezeBalance:     user.Wallet.FreezeBalance,
		}
	}

	// 添加銀行卡資訊（預設為空陣列）
	userDetail.BankCards = make([]*interfaces.BankCardDetail, 0)
	if len(user.BankCards) > 0 {
		for _, card := range user.BankCards {
			// 將 Status 從 string 轉換為 int
			status, _ := strconv.Atoi(card.Status)
			bankCardDetail := &interfaces.BankCardDetail{
				ID:         card.ID,
				CreatedAt:  card.CreatedAt.Format("2006-01-02 15:04:05"),
				Name:       card.Name,
				CardNumber: card.CardNumber,
				BranchName: card.BranchName,
				Status:     status,
			}
			if card.BankID != nil {
				bankCardDetail.BankID = *card.BankID
			}
			// 添加銀行資訊
			if card.Bank != nil {
				bankCardDetail.Bank = &interfaces.BankDetail{
					ID:       card.Bank.ID,
					BankName: card.Bank.BankName,
					BankCode: card.Bank.BankCode,
				}
			}
			userDetail.BankCards = append(userDetail.BankCards, bankCardDetail)
		}
	}

	// 添加推薦人資訊
	if user.ReferralID.Valid {
		var referralUser models.User
		if err := s.db.Where("id = ?", user.ReferralID.Int32).First(&referralUser).Error; err == nil {
			userDetail.ReferralUser = &interfaces.ReferralUser{
				ID:      referralUser.ID,
				Type:    referralUser.Type,
				Account: referralUser.Account,
				Name:    referralUser.Name,
				Email:   referralUser.Email,
			}
		}
	}

	return userDetail
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
