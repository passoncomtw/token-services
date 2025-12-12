package services

import (
	"context"
	"errors"
	"fmt"

	"passontw-backend-services/cmd/pos-merchant-api/internal/models"
	"passontw-backend-services/cmd/pos-merchant-api/internal/repository"

	"github.com/google/uuid"
)

/**
 * @brief ProductService interface
 */
type ProductService interface {
	// 現有方法
	CreateProduct(ctx context.Context, merchantID uuid.UUID, req *models.CreateProductRequest) (*models.ProductDTO, error)

	// 新增方法 (支援 Issue #10 規格的完整查詢參數)
	GetAllProducts(ctx context.Context, merchantID uuid.UUID) ([]*models.ProductDTO, error)
	GetProducts(ctx context.Context, merchantID uuid.UUID, page, limit int, category, search, sortBy, sortOrder string, activeOnly bool) ([]*models.ProductDTO, int64, error)
	GetProductByID(ctx context.Context, productID, merchantID uuid.UUID) (*models.ProductDTO, error)
	UpdateProduct(ctx context.Context, productID, merchantID uuid.UUID, req *models.UpdateProductRequest) (*models.ProductDTO, error)
	DeleteProduct(ctx context.Context, productID, merchantID uuid.UUID) error
	GetProductCustomizations(ctx context.Context, productID, merchantID uuid.UUID) ([]*models.CustomizationOptionResponse, error)
}

/**
 * @brief ProductServiceImpl implements ProductService
 */
type ProductServiceImpl struct {
	Repo repository.ProductRepository
}

// NewProductService 創建新的 ProductService 實例
func NewProductService(repo repository.ProductRepository) ProductService {
	return &ProductServiceImpl{
		Repo: repo,
	}
}

/**
 * @brief Create product with validation and transaction
 * @param ctx context.Context
 * @param merchantID uuid.UUID
 * @param req *models.CreateProductRequest
 * @return *models.ProductDTO, error
 */
func (s *ProductServiceImpl) CreateProduct(ctx context.Context, merchantID uuid.UUID, req *models.CreateProductRequest) (*models.ProductDTO, error) {
	// 欄位驗證
	if len(req.Name) == 0 || len(req.Name) > 255 {
		return nil, errors.New("name must be 1-255 chars")
	}
	if req.Category != "drink" && req.Category != "oden" {
		return nil, errors.New("invalid category")
	}
	if req.Price < 0 {
		return nil, errors.New("price must >= 0")
	}
	if len(req.Description) > 1000 {
		return nil, errors.New("description too long")
	}
	// 商品名稱唯一性
	unique, err := s.Repo.IsProductNameUnique(ctx, merchantID, req.Name)
	if err != nil {
		return nil, err
	}
	if !unique {
		return nil, fmt.Errorf("product name already exists")
	}

	// 組裝 DB model
	product := &models.Product{
		MerchantID:   merchantID,
		Name:         req.Name,
		Category:     req.Category,
		Price:        req.Price,
		Description:  req.Description,
		Customizable: req.Customizable,
		IsActive:     req.IsActive,
	}

	// 組裝客製化
	var options []*models.CustomizationOption
	values := make(map[int][]*models.CustomizationValue)
	if req.Customizable {
		for i, opt := range req.Customizations {
			option := &models.CustomizationOption{
				Type:         opt.Type,
				Name:         opt.Name,
				DisplayOrder: 0,
			}
			options = append(options, option)
			var valList []*models.CustomizationValue
			defaultCount := 0
			for _, v := range opt.Options {
				if v.IsDefault {
					defaultCount++
				}
				valList = append(valList, &models.CustomizationValue{
					Name:          v.Name,
					PriceModifier: v.PriceModifier,
					IsDefault:     v.IsDefault,
					DisplayOrder:  int(v.DisplayOrder),
				})
			}
			if defaultCount > 1 {
				return nil, fmt.Errorf("only one default value allowed per option")
			}
			values[i] = valList
		}
	}

	// 寫入 DB
	err = s.Repo.CreateProductTx(ctx, product, options, values)
	if err != nil {
		return nil, err
	}

	// 組裝回傳 DTO
	return &models.ProductDTO{
		ID:           product.ProductID.String(),
		MerchantID:   product.MerchantID.String(),
		Name:         product.Name,
		Category:     product.Category,
		Price:        product.Price,
		Description:  product.Description,
		Customizable: product.Customizable,
		IsActive:     product.IsActive,
		CreatedAt:    product.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    product.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

// GetProducts 獲取商品列表；當 limit <= 0 時，回傳所有符合條件的商品（無分頁）
func (s *ProductServiceImpl) GetProducts(ctx context.Context, merchantID uuid.UUID, page, limit int, category, search, sortBy, sortOrder string, activeOnly bool) ([]*models.ProductDTO, int64, error) {
	// 參數驗證
	if page < 1 {
		page = 1
	}
	// limit <= 0 代表不分頁；僅在需要分頁時才限制範圍
	if limit > 0 && (limit < 1 || limit > 100) {
		limit = 20
	}

	var (
		products []*models.Product
		total    int64
		err      error
	)

	// limit <= 0 代表不分頁，使用獨立函數取回全部
	if limit <= 0 {
		products, err = s.Repo.GetAllProductsByMerchant(ctx, merchantID, category, search, sortBy, sortOrder, activeOnly)
		if err != nil {
			return nil, 0, err
		}
		total = int64(len(products))
	} else {
		products, total, err = s.Repo.GetProductsByMerchant(ctx, merchantID, page, limit, category, search, sortBy, sortOrder, activeOnly)
		if err != nil {
			return nil, 0, err
		}
	}

	// 轉換為 DTO 格式 (包含客製化選項，符合 Issue #10 要求)
	var productDTOs []*models.ProductDTO
	for _, product := range products {
		productDTO := s.convertToProductDTO(product)

		// 為可客製化商品獲取客製化選項
		if product.Customizable {
			customizations, err := s.getProductCustomizationsForList(ctx, product.ProductID, merchantID)
			if err == nil {
				productDTO.Customizations = customizations
			}
		}

		productDTOs = append(productDTOs, productDTO)
	}

	return productDTOs, total, nil
}

// GetAllProducts 獲取商家的全部商品（不分頁，預設啟用商品，依 created_at desc 排序）
func (s *ProductServiceImpl) GetAllProducts(ctx context.Context, merchantID uuid.UUID) ([]*models.ProductDTO, error) {
	products, err := s.Repo.GetAllProductsByMerchant(ctx, merchantID, "all", "", "created_at", "desc", true)
	if err != nil {
		return nil, err
	}

	var productDTOs []*models.ProductDTO
	for _, product := range products {
		productDTO := s.convertToProductDTO(product)

		if product.Customizable {
			customizations, err := s.getProductCustomizationsForList(ctx, product.ProductID, merchantID)
			if err == nil {
				productDTO.Customizations = customizations
			}
		}

		productDTOs = append(productDTOs, productDTO)
	}

	return productDTOs, nil
}

// GetProductByID 獲取單一商品
func (s *ProductServiceImpl) GetProductByID(ctx context.Context, productID, merchantID uuid.UUID) (*models.ProductDTO, error) {
	product, err := s.Repo.GetProductByID(ctx, productID, merchantID)
	if err != nil {
		return nil, err
	}

	return s.convertToProductDTO(product), nil
}

// UpdateProduct 更新商品
func (s *ProductServiceImpl) UpdateProduct(ctx context.Context, productID, merchantID uuid.UUID, req *models.UpdateProductRequest) (*models.ProductDTO, error) {
	// 欄位驗證
	if req.Name != "" && (len(req.Name) == 0 || len(req.Name) > 255) {
		return nil, errors.New("name must be 1-255 chars")
	}
	if req.Category != "" && req.Category != "drink" && req.Category != "oden" {
		return nil, errors.New("invalid category")
	}
	if req.Price < 0 {
		return nil, errors.New("price must >= 0")
	}
	if len(req.Description) > 1000 {
		return nil, errors.New("description too long")
	}

	// 準備更新資料
	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Category != "" {
		updates["category"] = req.Category
	}
	if req.Price > 0 {
		updates["price"] = req.Price
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}

	if len(updates) == 0 {
		return nil, errors.New("no fields to update")
	}

	// 執行更新
	err := s.Repo.UpdateProduct(ctx, productID, merchantID, updates)
	if err != nil {
		return nil, err
	}

	// 回傳更新後的商品
	return s.GetProductByID(ctx, productID, merchantID)
}

// DeleteProduct 軟刪除商品
func (s *ProductServiceImpl) DeleteProduct(ctx context.Context, productID, merchantID uuid.UUID) error {
	return s.Repo.SoftDeleteProduct(ctx, productID, merchantID)
}

// GetProductCustomizations 獲取商品客製化選項
func (s *ProductServiceImpl) GetProductCustomizations(ctx context.Context, productID, merchantID uuid.UUID) ([]*models.CustomizationOptionResponse, error) {
	options, valueMap, err := s.Repo.GetProductCustomizations(ctx, productID, merchantID)
	if err != nil {
		return nil, err
	}

	var responses []*models.CustomizationOptionResponse
	for _, option := range options {
		response := &models.CustomizationOptionResponse{
			OptionID:     option.OptionID.String(),
			Type:         option.Type,
			Name:         option.Name,
			DisplayOrder: option.DisplayOrder,
		}

		// 添加選項值
		if values, exists := valueMap[option.OptionID]; exists {
			for _, value := range values {
				valueResponse := models.CustomizationValueResponse{
					ValueID:       value.ValueID.String(),
					Name:          value.Name,
					PriceModifier: value.PriceModifier,
					IsDefault:     value.IsDefault,
					DisplayOrder:  value.DisplayOrder,
				}
				response.Values = append(response.Values, valueResponse)
			}
		}

		responses = append(responses, response)
	}

	return responses, nil
}

// convertToProductDTO 轉換 models.Product 為 ProductDTO
func (s *ProductServiceImpl) convertToProductDTO(product *models.Product) *models.ProductDTO {
	return &models.ProductDTO{
		ID:           product.ProductID.String(),
		MerchantID:   product.MerchantID.String(),
		Name:         product.Name,
		Category:     product.Category,
		Price:        product.Price,
		Description:  product.Description,
		Customizable: product.Customizable,
		IsActive:     product.IsActive,
		CreatedAt:    product.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    product.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// getProductCustomizationsForList 為商品列表獲取客製化選項 (符合 Issue #10 要求)
func (s *ProductServiceImpl) getProductCustomizationsForList(ctx context.Context, productID, merchantID uuid.UUID) ([]models.CustomizationOptionDTO, error) {
	// 呼叫 Repository 獲取客製化選項
	options, valuesMap, err := s.Repo.GetProductCustomizations(ctx, productID, merchantID)
	if err != nil {
		return nil, err
	}

	// 轉換為 DTO 格式
	var dtoOptions []models.CustomizationOptionDTO
	for _, option := range options {
		values := valuesMap[option.OptionID]

		var dtoValues []models.CustomizationValueDTO
		for _, value := range values {
			dtoValues = append(dtoValues, models.CustomizationValueDTO{
				ID:            value.ValueID.String(),
				Name:          value.Name,
				PriceModifier: value.PriceModifier,
				IsDefault:     value.IsDefault,
				DisplayOrder:  value.DisplayOrder,
			})
		}

		dtoOptions = append(dtoOptions, models.CustomizationOptionDTO{
			Type:    option.Type,
			Name:    option.Name,
			Options: dtoValues,
		})
	}

	return dtoOptions, nil
}
