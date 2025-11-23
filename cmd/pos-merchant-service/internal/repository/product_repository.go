package repository

import (
	"context"
	"passontw-backend-services/cmd/pos-merchant-service/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

/**
 * @brief ProductRepository interface
 */
type ProductRepository interface {
	// 現有方法
	IsProductNameUnique(ctx context.Context, merchantID uuid.UUID, name string) (bool, error)
	CreateProductTx(ctx context.Context, product *models.Product, options []*models.CustomizationOption, values map[int][]*models.CustomizationValue) error

	// 新增方法 (支援 Issue #10 規格的完整查詢參數)
	GetProductsByMerchant(ctx context.Context, merchantID uuid.UUID, page, limit int, category, search, sortBy, sortOrder string, activeOnly bool) ([]*models.Product, int64, error)
	GetProductByID(ctx context.Context, productID, merchantID uuid.UUID) (*models.Product, error)
	UpdateProduct(ctx context.Context, productID, merchantID uuid.UUID, updates map[string]interface{}) error
	SoftDeleteProduct(ctx context.Context, productID, merchantID uuid.UUID) error
	GetProductCustomizations(ctx context.Context, productID, merchantID uuid.UUID) ([]*models.CustomizationOption, map[uuid.UUID][]*models.CustomizationValue, error)
}

/**
 * @brief ProductRepositoryImpl implements ProductRepository
 */
type ProductRepositoryImpl struct {
	Db *gorm.DB
}

// NewProductRepository 創建新的 ProductRepository 實例
func NewProductRepository(db *gorm.DB) ProductRepository {
	return &ProductRepositoryImpl{
		Db: db,
	}
}

/**
 * @brief Check if product name is unique for merchant (case-sensitive)
 * @param ctx context.Context
 * @param merchantID uuid.UUID
 * @param name string
 * @return bool, error
 */
func (r *ProductRepositoryImpl) IsProductNameUnique(ctx context.Context, merchantID uuid.UUID, name string) (bool, error) {
	var count int64
	err := r.Db.WithContext(ctx).Model(&models.Product{}).
		Where("merchant_id = ? AND name = ?", merchantID, name).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count == 0, nil
}

/**
 * @brief Create product and customizations in a transaction
 * @param ctx context.Context
 * @param product *models.Product
 * @param options []*models.CustomizationOption
 * @param values map[int][]*models.CustomizationValue (key: index of option in options)
 * @return error
 */
func (r *ProductRepositoryImpl) CreateProductTx(ctx context.Context, product *models.Product, options []*models.CustomizationOption, values map[int][]*models.CustomizationValue) error {
	return r.Db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 1. 新增產品
		if err := tx.Create(product).Error; err != nil {
			return err
		}

		// 2. 新增客製化選項
		for i, option := range options {
			option.ProductID = product.ProductID
			if err := tx.Create(option).Error; err != nil {
				return err
			}

			// 3. 新增客製化值
			if vals, exists := values[i]; exists {
				for _, val := range vals {
					val.OptionID = option.OptionID
					if err := tx.Create(val).Error; err != nil {
						return err
					}
				}
			}
		}

		return nil
	})
}

// GetProductsByMerchant 獲取商家的商品列表（支援 Issue #10 規格的完整查詢參數）
func (r *ProductRepositoryImpl) GetProductsByMerchant(ctx context.Context, merchantID uuid.UUID, page, limit int, category, search, sortBy, sortOrder string, activeOnly bool) ([]*models.Product, int64, error) {
	var products []*models.Product
	var total int64

	query := r.Db.WithContext(ctx).Model(&models.Product{}).Where("merchant_id = ?", merchantID)

	// active_only 篩選
	if activeOnly {
		query = query.Where("is_active = ?", true)
	}

	// 分類篩選
	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}

	// 搜尋功能（搜尋商品名稱和描述）
	if search != "" {
		query = query.Where("(name ILIKE ? OR description ILIKE ?)", "%"+search+"%", "%"+search+"%")
	}

	// 計算總數
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 排序
	orderClause := "created_at DESC" // 預設排序
	if sortBy != "" {
		switch sortBy {
		case "name":
			orderClause = "name " + sortOrder
		case "price":
			orderClause = "price " + sortOrder
		case "created_at":
			orderClause = "created_at " + sortOrder
		}
	}

	// 分頁查詢
	offset := (page - 1) * limit
	if err := query.Order(orderClause).
		Offset(offset).Limit(limit).
		Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

// GetProductByID 獲取單一商品
func (r *ProductRepositoryImpl) GetProductByID(ctx context.Context, productID, merchantID uuid.UUID) (*models.Product, error) {
	var product models.Product
	err := r.Db.WithContext(ctx).
		Where("product_id = ? AND merchant_id = ? AND is_active = ?", productID, merchantID, true).
		First(&product).Error

	if err != nil {
		return nil, err
	}

	return &product, nil
}

// UpdateProduct 更新商品
func (r *ProductRepositoryImpl) UpdateProduct(ctx context.Context, productID, merchantID uuid.UUID, updates map[string]interface{}) error {
	result := r.Db.WithContext(ctx).Model(&models.Product{}).
		Where("product_id = ? AND merchant_id = ? AND is_active = ?", productID, merchantID, true).
		Updates(updates)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

// SoftDeleteProduct 軟刪除商品
func (r *ProductRepositoryImpl) SoftDeleteProduct(ctx context.Context, productID, merchantID uuid.UUID) error {
	result := r.Db.WithContext(ctx).Model(&models.Product{}).
		Where("product_id = ? AND merchant_id = ? AND is_active = ?", productID, merchantID, true).
		Update("is_active", false)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

// GetProductCustomizations 獲取商品的客製化選項
func (r *ProductRepositoryImpl) GetProductCustomizations(ctx context.Context, productID, merchantID uuid.UUID) ([]*models.CustomizationOption, map[uuid.UUID][]*models.CustomizationValue, error) {
	// 先驗證商品存在且屬於該商家
	var product models.Product
	err := r.Db.WithContext(ctx).
		Where("product_id = ? AND merchant_id = ? AND is_active = ?", productID, merchantID, true).
		First(&product).Error
	if err != nil {
		return nil, nil, err
	}

	// 獲取客製化選項
	var options []*models.CustomizationOption
	err = r.Db.WithContext(ctx).
		Where("product_id = ?", productID).
		Order("display_order ASC").
		Find(&options).Error
	if err != nil {
		return nil, nil, err
	}

	// 獲取所有選項的值
	valueMap := make(map[uuid.UUID][]*models.CustomizationValue)
	for _, option := range options {
		var values []*models.CustomizationValue
		err = r.Db.WithContext(ctx).
			Where("option_id = ?", option.OptionID).
			Order("display_order ASC").
			Find(&values).Error
		if err != nil {
			return nil, nil, err
		}
		valueMap[option.OptionID] = values
	}

	return options, valueMap, nil
}
