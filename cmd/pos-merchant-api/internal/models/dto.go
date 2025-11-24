package models

// ========== 商品相關 DTO ==========

// CreateProductRequest 創建商品請求
type CreateProductRequest struct {
	Name           string                       `json:"name" binding:"required"`
	Category       string                       `json:"category" binding:"required"`
	Price          float64                      `json:"price" binding:"required"`
	Description    string                       `json:"description"`
	Customizable   bool                         `json:"customizable"`
	IsActive       bool                         `json:"is_active"`
	Customizations []CustomizationOptionRequest `json:"customizations,omitempty"`
}

// CustomizationOptionRequest 客製化選項請求
type CustomizationOptionRequest struct {
	Type    string                       `json:"type"`
	Name    string                       `json:"name"`
	Options []CustomizationValueRequest  `json:"options"`
}

// CustomizationValueRequest 客製化選項值請求
type CustomizationValueRequest struct {
	Name          string  `json:"name"`
	PriceModifier float64 `json:"price_modifier"`
	IsDefault     bool    `json:"is_default"`
	DisplayOrder  int32   `json:"display_order"`
}

// UpdateProductRequest 更新商品請求
type UpdateProductRequest struct {
	Name        string  `json:"name,omitempty"`
	Category    string  `json:"category,omitempty"`
	Price       float64 `json:"price,omitempty"`
	Description string  `json:"description,omitempty"`
}

// ProductDTO 商品數據傳輸對象
type ProductDTO struct {
	ID             string                   `json:"id"`
	MerchantID     string                   `json:"merchant_id"`
	Name           string                   `json:"name"`
	Category       string                   `json:"category"`
	Price          float64                  `json:"price"`
	Description    string                   `json:"description"`
	Customizable   bool                     `json:"customizable"`
	IsActive       bool                     `json:"is_active"`
	Customizations []CustomizationOptionDTO `json:"customizations,omitempty"`
	CreatedAt      string                   `json:"created_at"`
	UpdatedAt      string                   `json:"updated_at"`
}

// CustomizationOptionDTO 客製化選項 DTO
type CustomizationOptionDTO struct {
	Type    string                   `json:"type"`
	Name    string                   `json:"name"`
	Options []CustomizationValueDTO  `json:"options"`
}

// CustomizationValueDTO 客製化選項值 DTO
type CustomizationValueDTO struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	PriceModifier float64 `json:"price_modifier"`
	IsDefault     bool    `json:"is_default"`
	DisplayOrder  int     `json:"display_order"`
}

// CreateProductResponse 創建商品響應
type CreateProductResponse struct {
	Product *ProductDTO `json:"product"`
}

// CustomizationOptionResponse 客製化選項響應
type CustomizationOptionResponse struct {
	OptionID     string                        `json:"option_id"`
	Type         string                        `json:"type"`
	Name         string                        `json:"name"`
	DisplayOrder int                           `json:"display_order"`
	Values       []CustomizationValueResponse  `json:"values"`
}

// CustomizationValueResponse 客製化選項值響應
type CustomizationValueResponse struct {
	ValueID       string  `json:"value_id"`
	Name          string  `json:"name"`
	PriceModifier float64 `json:"price_modifier"`
	IsDefault     bool    `json:"is_default"`
	DisplayOrder  int     `json:"display_order"`
}

