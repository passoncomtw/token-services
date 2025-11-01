package services

import (
	"fmt"

	"token-admin-api/cmd/token-admin-api/internal/interfaces"
	"token-admin-api/cmd/token-admin-api/internal/models"

	"go.uber.org/fx"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

/**
 * @brief UserService 使用者服務
 * @description 負責使用者相關業務邏輯
 */
type UserService struct {
	db *gorm.DB
}

/**
 * @brief NewUserService 建立使用者服務實例
 * @param db GORM 資料庫連線
 * @return interfaces.UserServiceInterface
 */
func NewUserService(db *gorm.DB) interfaces.UserServiceInterface {
	return &UserService{db: db}
}

/**
 * @brief CreateUser 建立新使用者
 * @param name 使用者名稱
 * @return string 使用者 ID
 */
func (s *UserService) CreateUser(name string) string {
	// 生成預設帳號和密碼
	account := fmt.Sprintf("user_%s", name)
	defaultPassword := "password123"

	// 加密密碼
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
	if err != nil {
		fmt.Printf("UserService: 加密密碼失敗: %v\n", err)
		return ""
	}

	user := &models.User{
		Name:     name,
		Account:  account,
		Password: string(hashedPassword),
	}

	// 寫入資料庫
	if err := s.db.Create(user).Error; err != nil {
		fmt.Printf("UserService: 建立使用者失敗: %v\n", err)
		return ""
	}

	userID := fmt.Sprintf("%d", user.ID)
	fmt.Printf("UserService: 成功建立使用者 %s (ID: %s, Account: %s)\n", name, userID, account)
	return userID
}

/**
 * @brief GetOrderCount 取得使用者的訂單數量
 * @param userID 使用者 ID
 * @return int 訂單數量
 */
func (s *UserService) GetOrderCount(userID string) int {
	var count int64
	s.db.Model(&models.Order{}).Where("user_id = ?", userID).Count(&count)
	fmt.Printf("UserService: 使用者 %s 的訂單數量: %d\n", userID, count)
	return int(count)
}

var UserModule = fx.Module("user",
	fx.Provide(fx.Annotate(NewUserService, fx.As(new(interfaces.UserServiceInterface)))),
)
