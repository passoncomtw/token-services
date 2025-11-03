package services

import (
	"token-services/cmd/token-app-api/internal/interfaces"
	"token-services/pkg/logger"
	"token-services/pkg/models"

	"go.uber.org/fx"
	"gorm.io/gorm"
)

// BankService 銀行服務
type BankService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewBankService 建立新的銀行服務
func NewBankService(db *gorm.DB, logger logger.Logger) *BankService {
	return &BankService{
		db:     db,
		logger: logger,
	}
}

// GetBanks 取回銀行列表
func (s *BankService) GetBanks() ([]*interfaces.BankDetail, error) {
	var banks []models.Bank
	if err := s.db.Where("deleted_at IS NULL").
		Order("id ASC").
		Find(&banks).Error; err != nil {
		return nil, err
	}

	// 轉換為 BankDetail
	bankDetails := make([]*interfaces.BankDetail, 0, len(banks))
	for _, bank := range banks {
		bankDetails = append(bankDetails, &interfaces.BankDetail{
			ID:       bank.ID,
			BankName: bank.BankName,
			BankCode: bank.BankCode,
		})
	}

	return bankDetails, nil
}

var BankModule = fx.Module("bank",
	fx.Provide(fx.Annotate(NewBankService, fx.As(new(interfaces.BankServiceInterface)))),
)

