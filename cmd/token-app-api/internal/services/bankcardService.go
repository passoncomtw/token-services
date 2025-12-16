package services

import (
	"errors"
	"fmt"

	"passontw-backend-services/cmd/token-app-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/models"

	"go.uber.org/fx"
	"gorm.io/gorm"
)

// BankCardService 銀行卡服務
type BankCardService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewBankCardService 建立新的銀行卡服務
func NewBankCardService(db *gorm.DB, logger logger.Logger) *BankCardService {
	return &BankCardService{
		db:     db,
		logger: logger,
	}
}

// GetBankCards 取回使用者的銀行卡列表
func (s *BankCardService) GetBankCards(userID int) ([]*interfaces.BankCardDetail, error) {
	var bankCards []models.BankCard
	if err := s.db.Where("user_id = ? AND deleted_at IS NULL", userID).
		Preload("Bank").
		Order("created_at DESC").
		Find(&bankCards).Error; err != nil {
		return nil, err
	}

	// 轉換為 BankCardDetail
	bankCardDetails := make([]*interfaces.BankCardDetail, 0, len(bankCards))
	for _, bc := range bankCards {
		bankCardDetails = append(bankCardDetails, s.convertToBankCardDetail(&bc))
	}

	return bankCardDetails, nil
}

// CreateBankCard 新增銀行卡
func (s *BankCardService) CreateBankCard(userID int, req *interfaces.CreateBankCardRequest) (*interfaces.BankCardDetail, error) {
	// 驗證使用者是否存在
	var user models.User
	if err := s.db.Where("id = ? AND deleted_at IS NULL", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	// 驗證銀行是否存在
	var bank models.Bank
	if err := s.db.Where("id = ? AND deleted_at IS NULL", req.BankID).First(&bank).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("銀行不存在")
		}
		return nil, err
	}

	// 檢查同一使用者下是否已有相同卡號
	var existingCard models.BankCard
	if err := s.db.Where("user_id = ? AND card_number = ? AND deleted_at IS NULL", userID, req.CardNumber).First(&existingCard).Error; err == nil {
		return nil, errors.New("此銀行卡號已綁定")
	}

	// 建立銀行卡
	bankIDPtr := &req.BankID
	bankCard := &models.BankCard{
		UserID:     &userID,
		Name:       req.Name,
		CardNumber: req.CardNumber,
		BankID:     bankIDPtr,
		BranchName: req.BranchName,
		Status:     "0", // 預設為正常狀態
	}

	if err := s.db.Create(bankCard).Error; err != nil {
		return nil, fmt.Errorf("新增銀行卡失敗: %w", err)
	}

	// 重新載入銀行卡（含關聯）
	if err := s.db.Where("id = ?", bankCard.ID).Preload("Bank").First(bankCard).Error; err != nil {
		return nil, err
	}

	return s.convertToBankCardDetail(bankCard), nil
}

// UpdateBankCard 更新銀行卡
func (s *BankCardService) UpdateBankCard(userID int, bankcardID int, req *interfaces.UpdateBankCardRequest) (*interfaces.BankCardDetail, error) {
	// 查詢銀行卡
	var bankCard models.BankCard
	if err := s.db.Where("id = ? AND user_id = ? AND deleted_at IS NULL", bankcardID, userID).First(&bankCard).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("銀行卡不存在或無權操作")
		}
		return nil, err
	}

	// 如果要更新銀行 ID，驗證銀行是否存在
	if req.BankID > 0 && (bankCard.BankID == nil || req.BankID != *bankCard.BankID) {
		var bank models.Bank
		if err := s.db.Where("id = ? AND deleted_at IS NULL", req.BankID).First(&bank).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return nil, errors.New("銀行不存在")
			}
			return nil, err
		}
	}

	// 更新欄位
	updates := make(map[string]interface{})
	if req.CardNumber != "" {
		updates["card_number"] = req.CardNumber
	}
	if req.BankID > 0 {
		updates["bank_id"] = req.BankID
	}
	if req.BranchName != "" {
		updates["branch_name"] = req.BranchName
	}

	if len(updates) > 0 {
		if err := s.db.Model(&bankCard).Updates(updates).Error; err != nil {
			return nil, fmt.Errorf("更新銀行卡失敗: %w", err)
		}
	}

	// 重新載入銀行卡
	if err := s.db.Where("id = ?", bankcardID).Preload("Bank").First(&bankCard).Error; err != nil {
		return nil, err
	}

	return s.convertToBankCardDetail(&bankCard), nil
}

// DeleteBankCard 刪除銀行卡（軟刪除）
func (s *BankCardService) DeleteBankCard(userID int, bankcardID int) error {
	// 查詢銀行卡
	var bankCard models.BankCard
	if err := s.db.Where("id = ? AND user_id = ? AND deleted_at IS NULL", bankcardID, userID).First(&bankCard).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("銀行卡不存在或無權操作")
		}
		return err
	}

	// TODO: 檢查是否有進行中的交易
	// 可以檢查是否有關聯的訂單或掛單

	// 軟刪除
	if err := s.db.Delete(&bankCard).Error; err != nil {
		return fmt.Errorf("刪除銀行卡失敗: %w", err)
	}

	return nil
}

// convertToBankCardDetail 轉換 BankCard 模型為 BankCardDetail
func (s *BankCardService) convertToBankCardDetail(bc *models.BankCard) *interfaces.BankCardDetail {
	// 轉換 Status 從 string 到 int
	status := 0
	if bc.Status != "" {
		fmt.Sscanf(bc.Status, "%d", &status)
	}

	// 轉換 BankID
	bankID := 0
	if bc.BankID != nil {
		bankID = *bc.BankID
	}

	detail := &interfaces.BankCardDetail{
		ID:         bc.ID,
		CreatedAt:  bc.CreatedAt.Format("2006-01-02 15:04:05"),
		Name:       bc.Name,
		CardNumber: bc.CardNumber,
		BankID:     bankID,
		BranchName: bc.BranchName,
		Status:     status,
	}

	// 添加銀行資訊
	if bc.Bank != nil {
		detail.Bank = &interfaces.BankDetail{
			ID:       bc.Bank.ID,
			BankName: bc.Bank.BankName,
			BankCode: bc.Bank.BankCode,
		}
	}

	return detail
}

var BankCardModule = fx.Module("bankcard",
	fx.Provide(fx.Annotate(NewBankCardService, fx.As(new(interfaces.BankCardServiceInterface)))),
)
