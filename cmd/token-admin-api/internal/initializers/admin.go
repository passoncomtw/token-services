package initializers

import (
	"context"
	"log"

	"passontw-backend-services/pkg/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

/**
 * @brief Admin account initializer
 */
type AdminInitializer struct {
	db *gorm.DB
}

/**
 * @brief Create new admin initializer
 * @param db Database connection
 * @return AdminInitializer instance
 */
func NewAdminInitializer(db *gorm.DB) *AdminInitializer {
	return &AdminInitializer{db: db}
}

/**
 * @brief Initialize admin account
 * @return error if initialization fails
 */
func (a *AdminInitializer) Initialize() error {
	log.Println("🔍 Checking for admin account...")

	// Check if admin account exists
	var count int64
	if err := a.db.Model(&models.BackendUser{}).Where("account = ?", "admin").Count(&count).Error; err != nil {
		log.Printf("❌ Error checking admin account: %v", err)
		return err
	}

	if count > 0 {
		log.Println("✅ Admin account already exists")
		return nil
	}

	// Create admin account if it doesn't exist
	log.Println("📝 Creating default admin account...")

	// Begin transaction
	return a.db.Transaction(func(tx *gorm.DB) error {
		// 1. Create admin actor (role)
		actor := models.BackendActor{
			Name:   "管理員",
			Markup: "系統預設管理員角色",
		}

		if err := tx.Create(&actor).Error; err != nil {
			log.Printf("❌ Error creating admin actor: %v", err)
			return err
		}

		// 2. Hash the default password "a12345678"
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("a12345678"), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("❌ Error hashing password: %v", err)
			return err
		}

		// 3. Create admin user
		user := models.BackendUser{
			ActorID:  &actor.ID,
			Status:   0, // status: 0 = 啟用
			Name:     "Administrator",
			Account:  "admin",
			Password: string(hashedPassword),
		}

		if err := tx.Create(&user).Error; err != nil {
			log.Printf("❌ Error creating admin user: %v", err)
			return err
		}

		log.Println("✅ Admin account created successfully")
		log.Println("   📌 帳號: admin")
		log.Println("   📌 密碼: a12345678")
		log.Println("   📌 角色: 管理員")
		return nil
	})
}

/**
 * @brief Initialize admin account on startup
 * @param lc FX lifecycle
 * @param db Database connection
 */
func InitializeAdmin(lc context.Context, db *gorm.DB) error {
	initializer := NewAdminInitializer(db)
	return initializer.Initialize()
}
