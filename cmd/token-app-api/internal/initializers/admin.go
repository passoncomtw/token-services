package initializers

import (
	"context"
	"database/sql"
	"log"

	"golang.org/x/crypto/bcrypt"
)

/**
 * @brief Admin account initializer
 */
type AdminInitializer struct {
	db *sql.DB
}

/**
 * @brief Create new admin initializer
 * @param db Database connection
 * @return AdminInitializer instance
 */
func NewAdminInitializer(db *sql.DB) *AdminInitializer {
	return &AdminInitializer{db: db}
}

/**
 * @brief Initialize admin account
 * @return error if initialization fails
 */
func (a *AdminInitializer) Initialize() error {
	log.Println("🔍 Checking for admin account...")

	// Check if admin account exists
	var count int
	err := a.db.QueryRow("SELECT COUNT(*) FROM users WHERE account = $1", "admin").Scan(&count)
	if err != nil {
		log.Printf("❌ Error checking admin account: %v", err)
		return err
	}

	if count > 0 {
		log.Println("✅ Admin account already exists")
		return nil
	}

	// Create admin account if it doesn't exist
	log.Println("📝 Creating default admin account...")

	// Hash the default password "a12345678"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("a12345678"), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("❌ Error hashing password: %v", err)
		return err
	}

	// Insert admin user
	_, err = a.db.Exec(
		`INSERT INTO users (name, account, password, created_at, updated_at)
		 VALUES ($1, $2, $3, NOW(), NOW())`,
		"Administrator",
		"admin",
		string(hashedPassword),
	)
	if err != nil {
		log.Printf("❌ Error creating admin account: %v", err)
		return err
	}

	log.Println("✅ Admin account created successfully (account: admin, password: a12345678)")
	return nil
}

/**
 * @brief Initialize admin account on startup
 * @param lc FX lifecycle
 * @param db Database connection
 */
func InitializeAdmin(lc context.Context, db *sql.DB) error {
	initializer := NewAdminInitializer(db)
	return initializer.Initialize()
}
