package services

import (
	"context"
	"fmt"

	"go.uber.org/zap"
	"gorm.io/gorm"

	"passontw-backend-services/cmd/pos-merchant-service/internal/config"
	"passontw-backend-services/cmd/pos-merchant-service/internal/models"
)

// gRPC 請求與回應結構
type HelloRequest struct {
	Name string `json:"name"`
}

type HelloReply struct {
	Message string `json:"message"`
}

// merchantService 商戶服務實現 (遵循 SRP - 只負責商戶相關業務邏輯)
type MerchantService struct {
	config *config.Config
	logger *zap.Logger
	db     *gorm.DB
}

// NewMerchantService 創建新的商戶服務
func NewMerchantService(cfg *config.Config, logger *zap.Logger, db *gorm.DB) *MerchantService {
	return &MerchantService{
		config: cfg,
		logger: logger,
		db:     db,
	}
}

// SayHello 實現 SayHello gRPC 方法
func (s *MerchantService) SayHello(ctx context.Context, req *HelloRequest) (*HelloReply, error) {
	s.logger.Info("SayHello called",
		zap.String("name", req.Name),
		zap.String("merchant_id", s.config.Server.MerchantID))

	// 簡化的問候訊息，包含商戶 ID
	message := fmt.Sprintf("Hello, %s from Merchant Service! (Merchant ID: %s)",
		req.Name, s.config.Server.MerchantID)

	return &HelloReply{Message: message}, nil
}

// GetMerchantInfo 根據商家 ID 查詢商家資訊
func (s *MerchantService) GetMerchantInfo(ctx context.Context, merchantID string) (*models.Merchant, error) {
	s.logger.Info("GetMerchantInfo called",
		zap.String("merchant_id", merchantID))

	merchant, err := models.GetMerchantByID(s.db, merchantID)
	if err != nil {
		s.logger.Error("Failed to get merchant info",
			zap.String("merchant_id", merchantID),
			zap.Error(err))
		return nil, err
	}

	s.logger.Info("Successfully retrieved merchant info",
		zap.String("merchant_id", merchantID),
		zap.String("merchant_name", merchant.MerchantName))

	return merchant, nil
}
