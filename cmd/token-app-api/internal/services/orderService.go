package services

import (
	"fmt"

	"github.com/yourusername/project/cmd/github.com/yourusername/project/internal/interfaces"
	"github.com/yourusername/project/cmd/github.com/yourusername/project/internal/models"

	"go.uber.org/fx"
	"gorm.io/gorm"
)

/**
 * @brief OrderService 訂單服務
 * @description 負責訂單相關業務邏輯
 */
type OrderService struct {
	db *gorm.DB
}

/**
 * @brief NewOrderService 建立訂單服務實例
 * @param db GORM 資料庫連線
 * @return interfaces.OrderServiceInterface
 */
func NewOrderService(db *gorm.DB) interfaces.OrderServiceInterface {
	return &OrderService{db: db}
}

/**
 * @brief CreateOrder 建立新訂單
 * @param userID 使用者 ID
 * @return string 訂單 ID
 * @return error 錯誤訊息
 */
func (s *OrderService) CreateOrder(userID string) (string, error) {
	order := &models.Order{
		UserID: userID,
	}

	// 寫入資料庫
	if err := s.db.Create(order).Error; err != nil {
		return "", fmt.Errorf("failed to create order: %w", err)
	}

	orderID := fmt.Sprintf("%d", order.ID)
	fmt.Printf("OrderService: 成功建立訂單 %s (UserID: %s)\n", orderID, userID)
	return orderID, nil
}

/**
 * @brief GetUserName 取得使用者名稱
 * @param userID 使用者 ID
 * @return string 使用者名稱
 */
func (s *OrderService) GetUserName(userID string) string {
	fmt.Printf("OrderService: 取得使用者 %s 的名稱\n", userID)
	return "John Doe" // 模擬數據
}

var OrderModule = fx.Module("order",
	fx.Provide(fx.Annotate(NewOrderService, fx.As(new(interfaces.OrderServiceInterface)))),
)
