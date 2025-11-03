package services

import (
	"database/sql"
	"errors"
	"fmt"

	"token-services/cmd/token-app-api/internal/interfaces"
	"token-services/pkg/models"

	"go.uber.org/fx"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserService 使用者服務
type UserService struct {
	db *gorm.DB
}

// NewUserService 建立新的使用者服務
func NewUserService(db *gorm.DB) *UserService {
	return &UserService{
		db: db,
	}
}

// Register 使用者註冊
func (s *UserService) Register(req *interfaces.RegisterRequest) (*interfaces.UserDetail, error) {
	// 檢查帳號是否已存在
	var existingUser models.User
	if err := s.db.Where("account = ? AND deleted_at IS NULL", req.Account).First(&existingUser).Error; err == nil {
		return nil, errors.New("帳號已存在")
	}

	// 加密密碼
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("密碼加密失敗: %w", err)
	}

	// 加密交易密碼
	hashedTransactionCode, err := bcrypt.GenerateFromPassword([]byte(req.TransactionCode), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("交易密碼加密失敗: %w", err)
	}

	// 處理推薦碼
	var referralID sql.NullInt32
	if req.ReferralCode != "" {
		var referralUser models.User
		if err := s.db.Where("referral_code = ? AND deleted_at IS NULL", req.ReferralCode).First(&referralUser).Error; err == nil {
			referralID = sql.NullInt32{Int32: int32(referralUser.ID), Valid: true}
		}
	}

	// 生成推薦碼（使用 account 作為基礎）
	referralCode := fmt.Sprintf("REF_%s", req.Account)

	// 開始事務
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 建立使用者
	user := &models.User{
		Type:              req.Type,
		Account:           req.Account,
		Name:              req.Name,
		Email:             req.Email,
		Password:          string(hashedPassword),
		TransactionCode:   string(hashedTransactionCode),
		ReferralCode:      referralCode,
		ReferralID:        referralID,
		Status:            0, // 0: 啟用
		TransactionStatus: 1, // 1: 可以交易
		OrderStatus:       1, // 1: 允許掛單
	}

	if err := tx.Create(user).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("建立使用者失敗: %w", err)
	}

	// 建立錢包
	userIDPtr := &user.ID
	wallet := &models.Wallet{
		UserID:            userIDPtr,
		Status:            1, // 1: 啟用
		UsefulBalance:     0,
		GuaranteedBalance: 0,
		FreezeBalance:     0,
	}

	if err := tx.Create(wallet).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("建立錢包失敗: %w", err)
	}

	// 提交事務
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("提交事務失敗: %w", err)
	}

	// 重新載入使用者資料（包含關聯）
	if err := s.db.Where("id = ?", user.ID).Preload("Wallet").First(user).Error; err != nil {
		return nil, err
	}

	return s.convertToUserDetail(user), nil
}

// GetUser 取回使用者資訊
func (s *UserService) GetUser(userID int) (*interfaces.UserDetail, error) {
	var user models.User
	if err := s.db.Where("id = ? AND deleted_at IS NULL", userID).
		Preload("Wallet").
		First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	return s.convertToUserDetail(&user), nil
}

// UpdateUser 更新使用者資訊
func (s *UserService) UpdateUser(userID int, req *interfaces.UpdateUserRequest) (*interfaces.UserDetail, error) {
	var user models.User
	if err := s.db.Where("id = ? AND deleted_at IS NULL", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	// 更新欄位
	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}

	if len(updates) > 0 {
		if err := s.db.Model(&user).Updates(updates).Error; err != nil {
			return nil, fmt.Errorf("更新使用者失敗: %w", err)
		}
	}

	// 重新載入使用者資料
	if err := s.db.Where("id = ?", userID).Preload("Wallet").First(&user).Error; err != nil {
		return nil, err
	}

	return s.convertToUserDetail(&user), nil
}

// UpdateLoginPassword 更新登入密碼
func (s *UserService) UpdateLoginPassword(userID int, req *interfaces.UpdateLoginPasswordRequest) error {
	var user models.User
	if err := s.db.Where("id = ? AND deleted_at IS NULL", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("使用者不存在")
		}
		return err
	}

	// 驗證原密碼
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return errors.New("原密碼錯誤")
	}

	// 加密新密碼
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("新密碼加密失敗: %w", err)
	}

	// 更新密碼
	if err := s.db.Model(&user).Update("password", string(hashedPassword)).Error; err != nil {
		return fmt.Errorf("更新密碼失敗: %w", err)
	}

	return nil
}

// UpdateTransactionCode 更新交易密碼
func (s *UserService) UpdateTransactionCode(userID int, req *interfaces.UpdateTransactionCodeRequest) error {
	var user models.User
	if err := s.db.Where("id = ? AND deleted_at IS NULL", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("使用者不存在")
		}
		return err
	}

	// 驗證原交易密碼
	if err := bcrypt.CompareHashAndPassword([]byte(user.TransactionCode), []byte(req.Password)); err != nil {
		return errors.New("原交易密碼錯誤")
	}

	// 加密新交易密碼
	hashedTransactionCode, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("新交易密碼加密失敗: %w", err)
	}

	// 更新交易密碼
	if err := s.db.Model(&user).Update("transaction_code", string(hashedTransactionCode)).Error; err != nil {
		return fmt.Errorf("更新交易密碼失敗: %w", err)
	}

	return nil
}

// StoreValue 自動儲值（測試用）
func (s *UserService) StoreValue(userID int) (*interfaces.UserDetail, error) {
	var user models.User
	if err := s.db.Where("id = ? AND deleted_at IS NULL", userID).
		Preload("Wallet").
		First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	if user.Wallet == nil {
		return nil, errors.New("錢包不存在")
	}

	// 增加 1000 到可用餘額
	if err := s.db.Model(user.Wallet).Update("useful_balance", gorm.Expr("useful_balance + ?", 1000)).Error; err != nil {
		return nil, fmt.Errorf("儲值失敗: %w", err)
	}

	// 重新載入使用者資料
	if err := s.db.Where("id = ?", userID).Preload("Wallet").First(&user).Error; err != nil {
		return nil, err
	}

	return s.convertToUserDetail(&user), nil
}

// convertToUserDetail 轉換 User 模型為 UserDetail
func (s *UserService) convertToUserDetail(user *models.User) *interfaces.UserDetail {
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

var UserModule = fx.Module("user",
	fx.Provide(fx.Annotate(NewUserService, fx.As(new(interfaces.UserServiceInterface)))),
)
