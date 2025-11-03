package services

import (
	"database/sql"
	"encoding/json"
	"errors"

	"token-services/cmd/token-admin-api/internal/interfaces"
	"token-services/pkg/logger"
	"token-services/pkg/models"

	"go.uber.org/fx"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserService 使用者服務
type UserService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewUserService 建立新的使用者服務
func NewUserService(db *gorm.DB, log logger.Logger) *UserService {
	return &UserService{
		db:     db,
		logger: log.With(zap.String("service", "UserService")),
	}
}

// GetList 取得使用者列表
func (s *UserService) GetList(query *interfaces.UserListQuery) ([]*interfaces.UserBasicResponse, error) {
	// 設定預設值
	if query.Page == 0 {
		query.Page = 1
	}
	if query.Size == 0 {
		query.Size = 10
	}

	// 建立查詢
	db := s.db.Model(&models.User{}).Preload("Merchant")

	// 過濾條件
	if query.Account != "" {
		db = db.Where("account LIKE ?", "%"+query.Account+"%")
	}
	if query.Email != "" {
		db = db.Where("email LIKE ?", "%"+query.Email+"%")
	}
	if query.Name != "" {
		db = db.Where("name LIKE ?", "%"+query.Name+"%")
	}
	if query.Status != nil {
		db = db.Where("status = ?", *query.Status)
	}
	if query.OrderStatus != nil {
		db = db.Where("order_status = ?", *query.OrderStatus)
	}
	if query.TransactionStatus != nil {
		db = db.Where("transaction_status = ?", *query.TransactionStatus)
	}
	if query.IsMerchant != nil {
		if *query.IsMerchant {
			// 有商家資料
			db = db.Joins("INNER JOIN merchants ON merchants.user_id = users.id")
		} else {
			// 沒有商家資料
			db = db.Joins("LEFT JOIN merchants ON merchants.user_id = users.id").Where("merchants.id IS NULL")
		}
	}

	// 分頁
	offset := (query.Page - 1) * query.Size
	db = db.Offset(offset).Limit(query.Size)

	// 執行查詢
	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		return nil, err
	}

	// 轉換為回應格式
	var result []*interfaces.UserBasicResponse
	for _, user := range users {
		result = append(result, interfaces.ConvertToUserBasicResponse(&user))
	}

	return result, nil
}

// Create 新增使用者
func (s *UserService) Create(req *interfaces.CreateUserRequest) (*interfaces.UserBasicResponse, error) {
	// 檢查帳號是否已存在
	var count int64
	if err := s.db.Model(&models.User{}).Where("account = ?", req.Account).Count(&count).Error; err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, errors.New("帳號已存在")
	}

	// 產生推薦碼（使用帳號的前8個字元）
	referralCode := req.Account
	if len(referralCode) > 8 {
		referralCode = referralCode[:8]
	}

	// 加密密碼
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 加密交易密碼
	hashedTransactionCode, err := bcrypt.GenerateFromPassword([]byte(req.TransactionCode), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 使用 transaction 建立使用者和相關資料
	var user models.User
	err = s.db.Transaction(func(tx *gorm.DB) error {
		// 查找推薦人
		var referralID sql.NullInt32
		if req.Referrer != "" {
			var referrer models.User
			if err := tx.Where("referral_code = ?", req.Referrer).First(&referrer).Error; err == nil {
				referralID = sql.NullInt32{Int32: int32(referrer.ID), Valid: true}
			}
		}

		// 建立使用者
		user = models.User{
			Type:              req.Type,
			Account:           req.Account,
			Name:              req.Name,
			Email:             req.Account + "@example.com", // 預設 email
			Password:          string(hashedPassword),
			ReferralCode:      referralCode,
			TransactionCode:   string(hashedTransactionCode),
			ReferralID:        referralID,
			Status:            1, // 預設啟用
			TransactionStatus: 1, // 預設可交易
			OrderStatus:       1, // 預設可掛單
		}

		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		// 如果有商家相關資訊，建立商家資料
		if req.Contactor != "" || req.Telegram != "" {
			// 將 map 轉換為 JSONRawMessage
			buyPercentageFee, _ := json.Marshal(req.BuyPercentageFee)
			sellPercentageFee, _ := json.Marshal(req.SellPercentageFee)
			buyLadderFee, _ := json.Marshal(req.BuyLadderFee)
			sellLadderFee, _ := json.Marshal(req.SellLadderFee)

			merchant := models.Merchant{
				UserID:            &user.ID,
				Contactor:         req.Contactor,
				Telegram:          req.Telegram,
				BuyFeeType:        req.BuyFeeType,
				SellFeeType:       req.SellFeeType,
				BuyPercentageFee:  buyPercentageFee,
				SellPercentageFee: sellPercentageFee,
				BuyLadderFee:      buyLadderFee,
				SellLadderFee:     sellLadderFee,
			}

			if err := tx.Create(&merchant).Error; err != nil {
				return err
			}
		}

		// 建立錢包
		wallet := models.Wallet{
			UserID:            &user.ID,
			Status:            1, // 預設啟用
			UsefulBalance:     0,
			GuaranteedBalance: 0,
			FreezeBalance:     0,
		}

		if err := tx.Create(&wallet).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// 重新載入使用者資料（含商家資訊）
	if err := s.db.Preload("Merchant").First(&user, user.ID).Error; err != nil {
		return nil, err
	}

	return interfaces.ConvertToUserBasicResponse(&user), nil
}

// GetDetail 取得使用者詳細資訊
func (s *UserService) GetDetail(id int) (*interfaces.UserDetailResponse, error) {
	var user models.User
	if err := s.db.Preload("Merchant").Preload("Wallet").First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	return interfaces.ConvertToUserDetailResponse(&user), nil
}

// Update 編輯使用者
func (s *UserService) Update(id int, req *interfaces.UpdateUserRequest) (*interfaces.UserBasicResponse, error) {
	var user models.User
	if err := s.db.Preload("Merchant").First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	// 使用 transaction 更新
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 更新使用者基本資料
		updates := map[string]interface{}{}
		if req.Phone != nil {
			updates["phone"] = req.Phone
		}
		if req.Name != "" {
			updates["name"] = req.Name
		}
		updates["status"] = req.Status
		updates["order_status"] = req.OrderStatus
		updates["transaction_status"] = req.TransactionStatus
		updates["type"] = req.Type

		if err := tx.Model(&user).Updates(updates).Error; err != nil {
			return err
		}

		// 更新或建立商家資料
		if req.Contactor != "" || req.Telegram != "" {
			// 將 map 轉換為 JSONRawMessage
			buyPercentageFee, _ := json.Marshal(req.BuyPercentageFee)
			sellPercentageFee, _ := json.Marshal(req.SellPercentageFee)
			buyLadderFee, _ := json.Marshal(req.BuyLadderFee)
			sellLadderFee, _ := json.Marshal(req.SellLadderFee)

			merchantUpdates := map[string]interface{}{
				"contactor":           req.Contactor,
				"telegram":            req.Telegram,
				"buy_fee_type":        req.BuyFeeType,
				"sell_fee_type":       req.SellFeeType,
				"buy_percentage_fee":  buyPercentageFee,
				"sell_percentage_fee": sellPercentageFee,
				"buy_ladder_fee":      buyLadderFee,
				"sell_ladder_fee":     sellLadderFee,
			}

			if user.Merchant != nil {
				// 更新現有商家
				if err := tx.Model(user.Merchant).Updates(merchantUpdates).Error; err != nil {
					return err
				}
			} else {
				// 建立新商家
				merchant := models.Merchant{
					UserID:            &user.ID,
					Contactor:         req.Contactor,
					Telegram:          req.Telegram,
					BuyFeeType:        req.BuyFeeType,
					SellFeeType:       req.SellFeeType,
					BuyPercentageFee:  buyPercentageFee,
					SellPercentageFee: sellPercentageFee,
					BuyLadderFee:      buyLadderFee,
					SellLadderFee:     sellLadderFee,
				}
				if err := tx.Create(&merchant).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// 重新載入使用者資料
	if err := s.db.Preload("Merchant").First(&user, user.ID).Error; err != nil {
		return nil, err
	}

	return interfaces.ConvertToUserBasicResponse(&user), nil
}

// Unlock 解鎖使用者
func (s *UserService) Unlock(id int) (*interfaces.UserDetailResponse, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	// 解鎖使用者：將所有狀態設為啟用
	user.Status = 1
	user.OrderStatus = 1
	user.TransactionStatus = 1

	if err := s.db.Save(&user).Error; err != nil {
		return nil, err
	}

	// 重新載入使用者資料
	if err := s.db.Preload("Merchant").Preload("Wallet").First(&user, user.ID).Error; err != nil {
		return nil, err
	}

	return interfaces.ConvertToUserDetailResponse(&user), nil
}

// UpdateLoginPassword 更新登入密碼
func (s *UserService) UpdateLoginPassword(id int, req *interfaces.UpdateLoginPasswordRequest) error {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("使用者不存在")
		}
		return err
	}

	// 驗證舊密碼
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return errors.New("舊密碼錯誤")
	}

	// 加密新密碼
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 更新密碼
	user.Password = string(hashedPassword)
	return s.db.Save(&user).Error
}

// UpdateTransactionPassword 更新交易密碼
func (s *UserService) UpdateTransactionPassword(id int, req *interfaces.UpdateTransactionPasswordRequest) (*interfaces.UserDetailResponse, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	// 加密交易密碼
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 更新交易密碼
	user.TransactionCode = string(hashedPassword)
	if err := s.db.Save(&user).Error; err != nil {
		return nil, err
	}

	// 重新載入使用者資料
	if err := s.db.Preload("Merchant").Preload("Wallet").First(&user, user.ID).Error; err != nil {
		return nil, err
	}

	return interfaces.ConvertToUserDetailResponse(&user), nil
}

// GetBankCards 取得使用者銀行卡列表
func (s *UserService) GetBankCards(userID int, query *interfaces.PaginationQuery) ([]*interfaces.BankCardResponse, error) {
	// 檢查使用者是否存在
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	// 設定預設值
	if query.Page == 0 {
		query.Page = 1
	}
	if query.Size == 0 {
		query.Size = 10
	}

	// 建立查詢
	db := s.db.Model(&models.BankCard{}).Preload("Bank").Where("user_id = ?", userID)

	// 分頁
	offset := (query.Page - 1) * query.Size
	db = db.Offset(offset).Limit(query.Size)

	// 執行查詢
	var bankCards []models.BankCard
	if err := db.Find(&bankCards).Error; err != nil {
		return nil, err
	}

	// 轉換為回應格式
	var result []*interfaces.BankCardResponse
	for _, card := range bankCards {
		resp := &interfaces.BankCardResponse{
			ID:         card.ID,
			CreateAt:   card.CreatedAt.Format("2006-01-02 15:04:05"),
			Name:       card.Name,
			CardNumber: card.CardNumber,
			BranchName: card.BranchName,
			Status:     card.Status,
		}

		if card.BankID != nil {
			resp.BankID = *card.BankID
		}
		if card.Bank != nil {
			resp.BankName = card.Bank.BankName
			resp.BankCode = card.Bank.BankCode
		}

		result = append(result, resp)
	}

	return result, nil
}

// GetOrders 取得使用者訂單列表
func (s *UserService) GetOrders(userID int) ([]*interfaces.OrderResponse, error) {
	// 檢查使用者是否存在
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	// 查詢訂單
	var orders []models.Order
	if err := s.db.Preload("User").Preload("PendingOrder").Preload("BankCard").
		Where("user_id = ?", userID).Find(&orders).Error; err != nil {
		return nil, err
	}

	// 轉換為回應格式
	var result []*interfaces.OrderResponse
	for _, order := range orders {
		var finishAt *int64
		if order.FinishAt != nil {
			timestamp := order.FinishAt.Unix()
			finishAt = &timestamp
		}

		resp := &interfaces.OrderResponse{
			ID:           order.ID.String(),
			Status:       order.Status,
			CancelReason: order.CancelReason,
			Amount:       order.Amount,
			FinishAt:     finishAt,
			PendingOrder: make(map[string]interface{}),
			BankCard:     make(map[string]interface{}),
			CreateAt:     order.CreatedAt.Format("2006-01-02 15:04:05"),
		}

		if order.User != nil {
			resp.User = interfaces.OrderUserInfo{
				ID:      order.User.ID,
				Name:    order.User.Name,
				Account: order.User.Account,
			}
		}

		result = append(result, resp)
	}

	return result, nil
}

// GetPendingOrders 取得使用者掛單列表
func (s *UserService) GetPendingOrders(userID int, query *interfaces.PaginationQuery) (*interfaces.PendingOrderListResponse, error) {
	// 檢查使用者是否存在
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("使用者不存在")
		}
		return nil, err
	}

	// 設定預設值
	if query.Page == 0 {
		query.Page = 1
	}
	if query.Size == 0 {
		query.Size = 10
	}

	// 查詢總數
	var count int64
	if err := s.db.Model(&models.PendingOrder{}).Where("user_id = ?", userID).Count(&count).Error; err != nil {
		return nil, err
	}

	// 建立查詢
	db := s.db.Model(&models.PendingOrder{}).Preload("User").Preload("BankCard").Where("user_id = ?", userID)

	// 分頁
	offset := (query.Page - 1) * query.Size
	db = db.Offset(offset).Limit(query.Size)

	// 執行查詢
	var pendingOrders []models.PendingOrder
	if err := db.Find(&pendingOrders).Error; err != nil {
		return nil, err
	}

	// 轉換為回應格式
	var rows []*interfaces.PendingOrderResponse
	for _, po := range pendingOrders {
		resp := &interfaces.PendingOrderResponse{
			ID:                 po.ID.String(),
			Type:               po.Type,
			Status:             po.Status,
			Amount:             po.Amount,
			MinAmount:          po.MinAmount,
			Balance:            po.Balance,
			TransactionMinutes: po.TransactionMinutes,
			User:               make(map[string]interface{}),
			BankCard:           make(map[string]interface{}),
			CreateAt:           po.CreatedAt.Format("2006-01-02 15:04:05"),
			CancelAmount:       po.CancelAmount,
			ProcessAmount:      po.ProcessAmount,
			DoneAmount:         po.DoneAmount,
			CancelCount:        po.CancelCount,
			DoneCount:          po.DoneCount,
			ProcessCount:       po.ProcessCount,
		}

		rows = append(rows, resp)
	}

	return &interfaces.PendingOrderListResponse{
		Count: count,
		Rows:  rows,
	}, nil
}

// UserModule FX module
var UserModule = fx.Module("user",
	fx.Provide(fx.Annotate(NewUserService, fx.As(new(interfaces.UserServiceInterface)))),
)
