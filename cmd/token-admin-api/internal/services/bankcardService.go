package services

import (
	"errors"

	"passontw-backend-services/cmd/token-admin-api/internal/interfaces"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/models"

	"go.uber.org/fx"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// BankCardService 銀行卡服務
type BankCardService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewBankCardService 建立新的銀行卡服務
func NewBankCardService(db *gorm.DB, log logger.Logger) *BankCardService {
	return &BankCardService{
		db:     db,
		logger: log.With(zap.String("service", "BankCardService")),
	}
}

// GetList 取得銀行卡列表
func (s *BankCardService) GetList(query *interfaces.BankCardListQuery) (*interfaces.BankCardListResponse, error) {
	// 建立基礎查詢
	db := s.db.Model(&models.BankCard{})

	// 銀行卡本身的過濾條件
	if query.CardNumber != "" {
		db = db.Where("bank_cards.card_number LIKE ?", "%"+query.CardNumber+"%")
	}
	if query.BranchName != "" {
		db = db.Where("bank_cards.branch_name LIKE ?", "%"+query.BranchName+"%")
	}
	if query.Name != "" {
		db = db.Where("bank_cards.name LIKE ?", "%"+query.Name+"%")
	}

	// 使用 GORM Joins 方式進行關聯查詢和過濾
	// 銀行相關過濾
	if query.BankCode != "" || query.BankName != "" {
		db = db.Joins("Bank") // GORM 會自動根據 model 的關聯處理 JOIN
		if query.BankCode != "" {
			db = db.Where("Bank.bank_code LIKE ?", "%"+query.BankCode+"%")
		}
		if query.BankName != "" {
			db = db.Where("Bank.bank_name LIKE ?", "%"+query.BankName+"%")
		}
	}

	// 使用者帳號過濾
	if query.Account != "" {
		db = db.Joins("User") // GORM 會自動根據 model 的關聯處理 JOIN
		db = db.Where("User.account LIKE ?", "%"+query.Account+"%")
	}

	// 查詢總數（需要使用相同的過濾條件）
	var count int64
	countDB := db.Session(&gorm.Session{})
	if err := countDB.Count(&count).Error; err != nil {
		return nil, err
	}

	// 分頁查詢
	offset := (query.Page - 1) * query.Size

	// 執行查詢並使用 Preload 載入關聯資料
	var bankCards []models.BankCard
	if err := db.Preload("Bank").Preload("User").
		Offset(offset).Limit(query.Size).
		Find(&bankCards).Error; err != nil {
		return nil, err
	}

	// 轉換為回應格式
	var rows []*interfaces.BankCardDetailResponse
	for _, card := range bankCards {
		rows = append(rows, interfaces.ConvertToBankCardDetailResponse(&card))
	}

	return &interfaces.BankCardListResponse{
		Count: count,
		Rows:  rows,
	}, nil
}

// GetDetail 取得銀行卡詳細資訊
func (s *BankCardService) GetDetail(id int) (*interfaces.BankCardDetailResponse, error) {
	var bankCard models.BankCard
	if err := s.db.Preload("Bank").Preload("User").First(&bankCard, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("銀行卡不存在")
		}
		return nil, err
	}

	return interfaces.ConvertToBankCardDetailResponse(&bankCard), nil
}

// BankCardModule FX module
var BankCardModule = fx.Module("bankcard",
	fx.Provide(fx.Annotate(NewBankCardService, fx.As(new(interfaces.BankCardServiceInterface)))),
)
