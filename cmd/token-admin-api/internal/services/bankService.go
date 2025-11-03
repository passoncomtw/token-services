package services

import (
	"errors"

	"token-services/cmd/token-admin-api/internal/interfaces"
	"token-services/pkg/logger"
	"token-services/pkg/models"

	"go.uber.org/fx"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// BankService 銀行服務
type BankService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewBankService 建立新的銀行服務
func NewBankService(db *gorm.DB, log logger.Logger) *BankService {
	return &BankService{
		db:     db,
		logger: log.With(zap.String("service", "BankService")),
	}
}

// GetList 取得銀行列表
func (s *BankService) GetList() ([]*interfaces.BankResponse, error) {
	var banks []models.Bank
	if err := s.db.Find(&banks).Error; err != nil {
		return nil, err
	}

	// 轉換為回應格式
	var result []*interfaces.BankResponse
	for _, bank := range banks {
		result = append(result, interfaces.ConvertToBankResponse(&bank))
	}

	return result, nil
}

// Create 新增銀行
func (s *BankService) Create(req *interfaces.CreateBankRequest) (*interfaces.BankResponse, error) {
	// 檢查銀行代碼是否已存在
	var count int64
	if err := s.db.Model(&models.Bank{}).Where("bank_code = ?", req.BankCode).Count(&count).Error; err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, errors.New("銀行代碼已存在")
	}

	// 建立銀行
	bank := models.Bank{
		BankName: req.BankName,
		BankCode: req.BankCode,
		Status:   1, // 預設為啟用
	}

	if err := s.db.Create(&bank).Error; err != nil {
		return nil, err
	}

	return interfaces.ConvertToBankResponse(&bank), nil
}

// Update 編輯銀行
func (s *BankService) Update(id int, req *interfaces.UpdateBankRequest) (*interfaces.BankResponse, error) {
	var bank models.Bank
	if err := s.db.First(&bank, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("銀行不存在")
		}
		return nil, err
	}

	// 檢查銀行代碼是否被其他銀行使用
	if req.BankCode != bank.BankCode {
		var count int64
		if err := s.db.Model(&models.Bank{}).Where("bank_code = ? AND id != ?", req.BankCode, id).Count(&count).Error; err != nil {
			return nil, err
		}
		if count > 0 {
			return nil, errors.New("銀行代碼已被使用")
		}
	}

	// 更新銀行資訊
	bank.BankName = req.BankName
	bank.BankCode = req.BankCode

	if err := s.db.Save(&bank).Error; err != nil {
		return nil, err
	}

	return interfaces.ConvertToBankResponse(&bank), nil
}

// BankModule FX module
var BankModule = fx.Module("bank",
	fx.Provide(fx.Annotate(NewBankService, fx.As(new(interfaces.BankServiceInterface)))),
)
