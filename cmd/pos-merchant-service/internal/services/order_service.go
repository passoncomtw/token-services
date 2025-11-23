package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"passontw-backend-services/cmd/pos-merchant-service/internal/models"
	"passontw-backend-services/cmd/pos-merchant-service/internal/repository"

	"github.com/google/uuid"
)

// OrderService 處理訂單業務邏輯
// 包含驗證、計算、儲存、編號產生

type OrderService struct {
	OrderRepo   *repository.OrderRepository
	ProductRepo *repository.ProductRepositoryImpl
}

// NewOrderService 建立 OrderService 實例
func NewOrderService(orderRepo *repository.OrderRepository, productRepo *repository.ProductRepositoryImpl) *OrderService {
	return &OrderService{
		OrderRepo:   orderRepo,
		ProductRepo: productRepo,
	}
}

// CreateOrderRequest 建立訂單請求結構
// handler 層與 service 層共用
// Items 不可為空，CashReceived 必填
// Customizations 可為任意 key-value
type CreateOrderRequest struct {
	Items        []OrderItemRequest `json:"items" binding:"required"`
	CashReceived float64            `json:"cash_received" binding:"required"`
}

type OrderItemRequest struct {
	ProductID      string                 `json:"product_id" binding:"required"`
	Quantity       int                    `json:"quantity" binding:"required,min=1"`
	Customizations map[string]interface{} `json:"customizations"`
}

// CreateOrder 建立訂單（完整驗證與流程）
func (s *OrderService) CreateOrder(ctx context.Context, merchantID, staffID string, req *CreateOrderRequest) (*models.Order, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("訂單商品不能為空")
	}

	merchantUUID, err := uuid.Parse(merchantID)
	if err != nil {
		return nil, errors.New("商家 ID 格式錯誤")
	}

	var (
		orderItems  []models.OrderItem
		originalAmt float64
	)

	// 驗證商品、計算金額
	for _, item := range req.Items {
		productUUID, err := uuid.Parse(item.ProductID)
		if err != nil {
			return nil, fmt.Errorf("商品 ID 格式錯誤: %s", item.ProductID)
		}
		product, err := s.ProductRepo.GetProductByID(ctx, productUUID, merchantUUID)
		if err != nil {
			return nil, fmt.Errorf("商品不存在: %s", item.ProductID)
		}
		if !product.IsActive {
			return nil, fmt.Errorf("商品已下架: %s", item.ProductID)
		}
		if item.Quantity <= 0 {
			return nil, fmt.Errorf("商品數量需大於 0: %s", item.ProductID)
		}
		itemTotal := product.Price * float64(item.Quantity)
		originalAmt += itemTotal

		customizations, _ := json.Marshal(item.Customizations)
		orderItems = append(orderItems, models.OrderItem{
			ProductID:      product.ProductID.String(),
			Name:           product.Name,
			Quantity:       item.Quantity,
			Price:          product.Price,
			Customizations: customizations,
			TotalPrice:     itemTotal,
		})
	}

	if req.CashReceived < originalAmt {
		return nil, errors.New("實收金額不足")
	}

	now := time.Now()
	orderNumber := s.generateOrderNumber(now)

	order := &models.Order{
		OrderID:           generateUUID(),
		OrderNumber:       orderNumber,
		MerchantID:        merchantID,
		StaffID:           staffID,
		OriginalAmount:    originalAmt,
		DiscountAmount:    0,
		FinalAmount:       originalAmt,
		CashReceived:      req.CashReceived,
		ChangeAmount:      req.CashReceived - originalAmt,
		AppliedPromotions: json.RawMessage("[]"),
		ItemCount:         len(orderItems),
		Status:            "completed",
		PaymentMethod:     "cash",
		CreatedAt:         now,
		OrderItems:        orderItems,
	}

	if err := s.OrderRepo.CreateOrder(order); err != nil {
		return nil, err
	}
	return order, nil
}

// GetOrderByID 查詢訂單（含明細）
func (s *OrderService) GetOrderByID(ctx context.Context, orderID, merchantID string) (*models.Order, error) {
	return s.OrderRepo.GetOrderByID(orderID, merchantID)
}

// generateOrderNumber 產生訂單編號（YYYYMMDD-HHMMSS-XXX）
func (s *OrderService) generateOrderNumber(t time.Time) string {
	// 這裡僅簡化為時間戳，實務應查詢當日序號
	return t.Format("20060102-150405-001")
}

// generateUUID 產生 UUID（可用現有 util 實作取代）
func generateUUID() string {
	return fmt.Sprintf("uuid-%d", time.Now().UnixNano())
}
