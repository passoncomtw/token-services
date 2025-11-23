package services

import (
	"go.uber.org/zap"
	"gorm.io/gorm"

	"passontw-backend-services/cmd/pos-backend-service/internal/models"
	"passontw-backend-services/cmd/pos-backend-service/internal/utils"
	"passontw-backend-services/pkg/logger"
)

type DBInitService struct {
	db     *gorm.DB
	logger logger.Logger
}

func NewDBInitService(db *gorm.DB, lgr logger.Logger) *DBInitService {
	return &DBInitService{
		db:     db,
		logger: lgr,
	}
}

// InitializeDatabase 初始化數據庫，包括自動遷移和創建默認管理員
func (s *DBInitService) InitializeDatabase() error {
	// 自動遷移
	if err := s.db.AutoMigrate(&models.BackendUser{}, &models.Merchant{}); err != nil {
		s.logger.Error("Failed to migrate database", zap.Error(err))
		return err
	}

	// 創建默認管理員帳號
	if err := s.createDefaultAdmin(); err != nil {
		s.logger.Error("Failed to create default admin", zap.Error(err))
		return err
	}

	s.logger.Info("Database initialized successfully")
	return nil
}

// createDefaultAdmin 創建默認管理員帳號
func (s *DBInitService) createDefaultAdmin() error {
	// 檢查是否已存在 admin 帳號
	var count int64
	if err := s.db.Model(&models.BackendUser{}).Where("account = ?", "admin").Count(&count).Error; err != nil {
		return err
	}

	// 如果已存在，跳過創建
	if count > 0 {
		s.logger.Info("Admin user already exists, skipping creation")
		return nil
	}

	// 創建密碼 hash
	passwordHash, err := utils.HashPassword("a12345678")
	if err != nil {
		return err
	}

	// 創建默認管理員
	admin := models.BackendUser{
		Name:         "系統管理員",
		Account:      "admin",
		PasswordHash: passwordHash,
		Email:        "admin@example.com",
		Role:         "super_admin",
	}

	if err := s.db.Create(&admin).Error; err != nil {
		return err
	}

	s.logger.Info("Default admin user created successfully",
		zap.String("account", admin.Account),
		zap.String("role", admin.Role))

	return nil
}
