package models

import (
	"time"

	"github.com/google/uuid"
)

/**
 * @brief Product DB model
 */
type Product struct {
	ProductID    uuid.UUID `db:"product_id"`
	MerchantID   uuid.UUID `db:"merchant_id"`
	Name         string    `db:"name"`
	Category     string    `db:"category"`
	Price        float64   `db:"price"`
	Description  string    `db:"description"`
	Customizable bool      `db:"customizable"`
	IsActive     bool      `db:"is_active"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}

/**
 * @brief CustomizationOption DB model
 */
type CustomizationOption struct {
	OptionID     uuid.UUID `db:"option_id"`
	ProductID    uuid.UUID `db:"product_id"`
	Type         string    `db:"type"`
	Name         string    `db:"name"`
	DisplayOrder int       `db:"display_order"`
}

/**
 * @brief CustomizationValue DB model
 */
type CustomizationValue struct {
	ValueID       uuid.UUID `db:"value_id"`
	OptionID      uuid.UUID `db:"option_id"`
	Name          string    `db:"name"`
	PriceModifier float64   `db:"price_modifier"`
	IsDefault     bool      `db:"is_default"`
	DisplayOrder  int       `db:"display_order"`
}
