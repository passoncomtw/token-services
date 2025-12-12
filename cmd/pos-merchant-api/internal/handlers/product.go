package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"passontw-backend-services/cmd/pos-merchant-api/internal/config"
	"passontw-backend-services/cmd/pos-merchant-api/internal/models"
	"passontw-backend-services/cmd/pos-merchant-api/internal/services"
	"passontw-backend-services/cmd/pos-merchant-api/internal/utils"
)

// contains 檢查字串切片是否包含指定值
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// ProductListQuery 商品列表查詢參數
type ProductListQuery struct {
	Page       int    `form:"page" example:"1"`
	Limit      int    `form:"limit" example:"20"`
	Category   string `form:"category" example:"drink"`
	Search     string `form:"search" example:"奶茶"`
	SortBy     string `form:"sort_by" example:"created_at"`
	SortOrder  string `form:"sort_order" example:"desc"`
	ActiveOnly bool   `form:"active_only" example:"true"`
}

// ProductListResponse 商品列表回應格式 (符合 Issue #10 規格)
type ProductListResponse struct {
	Success    bool            `json:"success"`
	Data       []*ProductInfo  `json:"data"`
	Pagination *PaginationInfo `json:"pagination"`
}

// PaginationInfo 分頁資訊 (符合 Issue #10 規格)
type PaginationInfo struct {
	CurrentPage  int   `json:"current_page"`
	TotalPages   int   `json:"total_pages"`
	TotalItems   int64 `json:"total_items"`
	ItemsPerPage int   `json:"items_per_page"`
	HasNext      bool  `json:"has_next"`
	HasPrev      bool  `json:"has_prev"`
}

// ProductInfo 商品基本信息 (符合 Issue #10 規格)
type ProductInfo struct {
	ID             string                 `json:"id"`
	MerchantID     string                 `json:"merchant_id"`
	Name           string                 `json:"name"`
	Category       string                 `json:"category"`
	Price          float64                `json:"price"`
	Description    string                 `json:"description"`
	Customizable   bool                   `json:"customizable"`
	IsActive       bool                   `json:"is_active"`
	Customizations []*CustomizationOption `json:"customizations"`
	CreatedAt      string                 `json:"created_at"`
	UpdatedAt      string                 `json:"updated_at"`
}

// CustomizationOption 客製化選項 (符合 Issue #10 規格)
type CustomizationOption struct {
	Type    string                `json:"type"`
	Name    string                `json:"name"`
	Options []*CustomizationValue `json:"options"`
}

// CustomizationValue 客製化選項值 (符合 Issue #10 規格)
type CustomizationValue struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	PriceModifier float64 `json:"price_modifier"`
	IsDefault     bool    `json:"is_default"`
	DisplayOrder  int     `json:"display_order"`
}

// UpdateProductRequest 更新商品請求
type UpdateProductRequest struct {
	Name        string  `json:"name,omitempty" example:"珍珠奶茶"`
	Category    string  `json:"category,omitempty" example:"drink"`
	Price       float64 `json:"price,omitempty" example:"45.0"`
	Description string  `json:"description,omitempty" example:"香濃奶茶配上Q彈珍珠"`
}

// CustomizationValueInfo 客製化選項值信息
type CustomizationValueInfo struct {
	ValueID       string  `json:"value_id"`
	Name          string  `json:"name"`
	PriceModifier float64 `json:"price_modifier"`
	IsDefault     bool    `json:"is_default"`
	DisplayOrder  int     `json:"display_order"`
}

// CustomizationOptionInfo 客製化選項信息
type CustomizationOptionInfo struct {
	OptionID     string                    `json:"option_id"`
	Type         string                    `json:"type"`
	Name         string                    `json:"name"`
	DisplayOrder int                       `json:"display_order"`
	Values       []*CustomizationValueInfo `json:"values"`
}

// CreateProductHandlerWrapper 新增商品 (Swagger 用)
// @Summary 新增商品
// @Description 僅 admin 權限可用，新增商品與客製化選項
// @Tags products
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer JWT Token"
// @Param body body models.CreateProductRequest true "商品資料"
// @Success 200 {object} utils.SuccessResponse{data=models.CreateProductResponse} "新增成功"
// @Failure 400 {object} utils.ErrorResponse "請求格式錯誤"
// @Failure 401 {object} utils.ErrorResponse "未授權"
// @Failure 403 {object} utils.ErrorResponse "權限不足"
// @Failure 409 {object} utils.ErrorResponse "商品已存在"
// @Security BearerAuth
// @Router /api/v1/products [post]
func CreateProductHandlerWrapper(c *gin.Context) {
	// This is a wrapper function for swagger documentation
	// The actual implementation is in CreateProductHandler
}

// CreateProductHandler 新增商品
func CreateProductHandler(svc services.ProductService, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		jwtSecret := cfg.GetJWTSecret()
		if jwtSecret == "" {
			utils.RespondWithError(c, utils.ErrInternalError)
			return
		}

		// 解析 JWT（從中間件獲取）
		claims, exists := c.Get("user_claims")
		if !exists {
			utils.RespondWithError(c, utils.ErrUnauthorized)
			return
		}

		customClaims, ok := claims.(*utils.CustomClaims)
		if !ok {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		// 解析請求
		var req models.CreateProductRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			invalidReqErr := utils.NewAPIError(
				utils.ErrorCodeInvalidRequest,
				utils.ErrInvalidRequest.Message,
				http.StatusBadRequest,
				err,
			)
			utils.RespondWithError(c, invalidReqErr)
			return
		}

		// 驗證必填欄位
		if req.Name == "" || req.Price <= 0 {
			utils.RespondWithError(c, utils.ErrInvalidRequest)
			return
		}

		// 解析商家 ID
		merchantID, err := uuid.Parse(customClaims.MerchantID)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		// 呼叫服務層
		product, err := svc.CreateProduct(c, merchantID, &req)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInternalError)
			return
		}

		// 包裝回應
		response := &models.CreateProductResponse{
			Product: product,
		}

		utils.RespondWithSuccess(c, "商品新增成功", response)
	}
}

// GetProductsHandlerWrapper 獲取商品列表 (Swagger 用，符合 Issue #10 規格)
// @Summary 獲取商品列表
// @Description 獲取商家的商品列表，支援分類篩選、關鍵字搜尋、排序和分頁
// @Tags products
// @Accept json
// @Produce json
// @Param category query string false "商品分類篩選" default("all") example("drink") Enums(all, drink, oden)
// @Param search query string false "關鍵字搜尋 (商品名稱、描述)" example("奶茶")
// @Param page query int false "頁碼" default(1) example(1)
// @Param limit query int false "每頁筆數" default(20) example(10)
// @Param sort_by query string false "排序欄位" default("created_at") example("created_at") Enums(name, price, created_at)
// @Param sort_order query string false "排序方向" default("desc") example("desc") Enums(asc, desc)
// @Param active_only query bool false "只顯示啟用商品" default(true) example(true)
// @Success 200 {object} ProductListResponse "查詢成功"
// @Failure 400 {object} utils.ErrorResponse "請求參數錯誤"
// @Failure 401 {object} utils.ErrorResponse "未授權"
// @Failure 500 {object} utils.ErrorResponse "系統錯誤"
// @Security BearerAuth
// @Router /api/v1/products [get]
func GetProductsHandlerWrapper(c *gin.Context) {
	// This is a wrapper function for swagger documentation
	// The actual implementation is in GetProductsHandler
}

// GetProductsHandler 獲取商品列表
func GetProductsHandler(svc services.ProductService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 解析查詢參數
		var query ProductListQuery
		if err := c.ShouldBindQuery(&query); err != nil {
			utils.RespondWithError(c, utils.ErrInvalidRequest)
			return
		}

		// 預設值設定和參數驗證 (符合 Issue #10 規格)
		if query.Page < 1 {
			query.Page = 1
		}
		if query.Limit < 1 || query.Limit > 100 {
			query.Limit = 20 // 預設改為 20
		}
		if query.Category == "" {
			query.Category = "all"
		}
		if query.SortBy == "" {
			query.SortBy = "created_at"
		}
		if query.SortOrder == "" {
			query.SortOrder = "desc"
		}

		// 驗證 SortBy 參數值
		validSortBy := []string{"name", "price", "created_at"}
		if !contains(validSortBy, query.SortBy) {
			utils.RespondWithError(c, utils.ErrInvalidRequest)
			return
		}

		// 驗證 SortOrder 參數值
		if query.SortOrder != "asc" && query.SortOrder != "desc" {
			utils.RespondWithError(c, utils.ErrInvalidRequest)
			return
		}

		// 驗證 Category 參數值
		validCategories := []string{"all", "drink", "oden"}
		if !contains(validCategories, query.Category) {
			utils.RespondWithError(c, utils.ErrInvalidRequest)
			return
		}

		// 從中間件獲取商家 ID
		claims, exists := c.Get("user_claims")
		if !exists {
			utils.RespondWithError(c, utils.ErrUnauthorized)
			return
		}

		customClaims, ok := claims.(*utils.CustomClaims)
		if !ok {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		merchantID, err := uuid.Parse(customClaims.MerchantID)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		// 呼叫服務層 (傳入 Issue #10 規格的完整查詢參數)
		products, total, err := svc.GetProducts(c, merchantID, query.Page, query.Limit, query.Category, query.Search, query.SortBy, query.SortOrder, query.ActiveOnly)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInternalError)
			return
		}

		// 轉換回應格式 (包含客製化選項，符合 Issue #10 要求)
		var productInfos []*ProductInfo
		for _, product := range products {
			// 轉換客製化選項
			var customizations []*CustomizationOption
			for _, dtoOption := range product.Customizations {
				var optionValues []*CustomizationValue
				for _, dtoValue := range dtoOption.Options {
					optionValues = append(optionValues, &CustomizationValue{
						ID:            dtoValue.ID,
						Name:          dtoValue.Name,
						PriceModifier: dtoValue.PriceModifier,
						IsDefault:     dtoValue.IsDefault,
						DisplayOrder:  dtoValue.DisplayOrder,
					})
				}

				customizations = append(customizations, &CustomizationOption{
					Type:    dtoOption.Type,
					Name:    dtoOption.Name,
					Options: optionValues,
				})
			}

			productInfo := &ProductInfo{
				ID:             product.ID,
				MerchantID:     product.MerchantID,
				Name:           product.Name,
				Category:       product.Category,
				Price:          product.Price,
				Description:    product.Description,
				Customizable:   product.Customizable,
				IsActive:       product.IsActive,
				Customizations: customizations,
				CreatedAt:      product.CreatedAt,
				UpdatedAt:      product.UpdatedAt,
			}
			productInfos = append(productInfos, productInfo)
		}

		// 計算分頁資訊
		totalPages := int((total + int64(query.Limit) - 1) / int64(query.Limit))
		hasNext := query.Page < totalPages
		hasPrev := query.Page > 1

		response := &ProductListResponse{
			Success: true,
			Data:    productInfos,
			Pagination: &PaginationInfo{
				CurrentPage:  query.Page,
				TotalPages:   totalPages,
				TotalItems:   total,
				ItemsPerPage: query.Limit,
				HasNext:      hasNext,
				HasPrev:      hasPrev,
			},
		}

		c.JSON(http.StatusOK, response)
	}
}

// GetProductByIDHandlerWrapper 獲取單一商品 (Swagger 用)
// @Summary 獲取商品詳情
// @Description 根據商品 ID 獲取商品詳細信息
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "商品 ID" example("550e8400-e29b-41d4-a716-446655440000")
// @Success 200 {object} utils.SuccessResponse{data=ProductInfo} "查詢成功"
// @Failure 400 {object} utils.ErrorResponse "商品 ID 格式錯誤"
// @Failure 401 {object} utils.ErrorResponse "未授權"
// @Failure 404 {object} utils.ErrorResponse "商品不存在"
// @Failure 500 {object} utils.ErrorResponse "系統錯誤"
// @Security BearerAuth
// @Router /api/v1/products/{id} [get]
func GetProductByIDHandlerWrapper(c *gin.Context) {
	// This is a wrapper function for swagger documentation
	// The actual implementation is in GetProductByIDHandler
}

// GetProductByIDHandler 獲取單一商品
func GetProductByIDHandler(svc services.ProductService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 解析商品 ID
		productIDStr := c.Param("id")
		productID, err := uuid.Parse(productIDStr)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInvalidRequest)
			return
		}

		// 從中間件獲取商家 ID
		claims, exists := c.Get("user_claims")
		if !exists {
			utils.RespondWithError(c, utils.ErrUnauthorized)
			return
		}

		customClaims, ok := claims.(*utils.CustomClaims)
		if !ok {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		merchantID, err := uuid.Parse(customClaims.MerchantID)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		// 呼叫服務層
		product, err := svc.GetProductByID(c, productID, merchantID)
		if err != nil {
			if err.Error() == "record not found" {
				notFoundErr := utils.NewAPIError(
					utils.ErrorCodeProductNotFound,
					"商品不存在",
					http.StatusNotFound,
					err,
				)
				utils.RespondWithError(c, notFoundErr)
				return
			}
			utils.RespondWithError(c, utils.ErrInternalError)
			return
		}

		// 轉換回應格式
		productInfo := &ProductInfo{
			ID:           product.ID,
			MerchantID:   product.MerchantID,
			Name:         product.Name,
			Category:     product.Category,
			Price:        product.Price,
			Description:  product.Description,
			Customizable: product.Customizable,
			IsActive:     product.IsActive,
			CreatedAt:    product.CreatedAt,
			UpdatedAt:    product.UpdatedAt,
		}

		utils.RespondWithSuccess(c, "查詢成功", productInfo)
	}
}

// UpdateProductHandlerWrapper 更新商品 (Swagger 用)
// @Summary 更新商品信息
// @Description 更新商品的基本信息（名稱、價格、分類、描述）
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "商品 ID" example("550e8400-e29b-41d4-a716-446655440000")
// @Param request body UpdateProductRequest true "更新商品信息"
// @Success 200 {object} utils.SuccessResponse{data=ProductInfo} "更新成功"
// @Failure 400 {object} utils.ErrorResponse "請求格式錯誤"
// @Failure 401 {object} utils.ErrorResponse "未授權"
// @Failure 404 {object} utils.ErrorResponse "商品不存在"
// @Failure 500 {object} utils.ErrorResponse "系統錯誤"
// @Security BearerAuth
// @Router /api/v1/products/{id} [put]
func UpdateProductHandlerWrapper(c *gin.Context) {
	// This is a wrapper function for swagger documentation
	// The actual implementation is in UpdateProductHandler
}

// UpdateProductHandler 更新商品
func UpdateProductHandler(svc services.ProductService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 解析商品 ID
		productIDStr := c.Param("id")
		productID, err := uuid.Parse(productIDStr)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInvalidRequest)
			return
		}

		// 解析請求資料
		var req UpdateProductRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.RespondWithError(c, utils.ErrInvalidRequest)
			return
		}

		// 從中間件獲取商家 ID
		claims, exists := c.Get("user_claims")
		if !exists {
			utils.RespondWithError(c, utils.ErrUnauthorized)
			return
		}

		customClaims, ok := claims.(*utils.CustomClaims)
		if !ok {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		merchantID, err := uuid.Parse(customClaims.MerchantID)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		// 呼叫服務層
		updateReq := &models.UpdateProductRequest{
			Name:        req.Name,
			Category:    req.Category,
			Price:       req.Price,
			Description: req.Description,
		}

		product, err := svc.UpdateProduct(c, productID, merchantID, updateReq)
		if err != nil {
			if err.Error() == "record not found" {
				notFoundErr := utils.NewAPIError(
					utils.ErrorCodeProductNotFound,
					"商品不存在",
					http.StatusNotFound,
					err,
				)
				utils.RespondWithError(c, notFoundErr)
				return
			}
			utils.RespondWithError(c, utils.ErrInternalError)
			return
		}

		// 轉換回應格式
		productInfo := &ProductInfo{
			ID:           product.ID,
			MerchantID:   product.MerchantID,
			Name:         product.Name,
			Category:     product.Category,
			Price:        product.Price,
			Description:  product.Description,
			Customizable: product.Customizable,
			IsActive:     product.IsActive,
			CreatedAt:    product.CreatedAt,
			UpdatedAt:    product.UpdatedAt,
		}

		utils.RespondWithSuccess(c, "更新成功", productInfo)
	}
}

// DeleteProductHandlerWrapper 刪除商品 (Swagger 用)
// @Summary 刪除商品
// @Description 軟刪除商品（設置為非活躍狀態）
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "商品 ID" example("550e8400-e29b-41d4-a716-446655440000")
// @Success 200 {object} utils.SuccessResponse "刪除成功"
// @Failure 400 {object} utils.ErrorResponse "商品 ID 格式錯誤"
// @Failure 401 {object} utils.ErrorResponse "未授權"
// @Failure 404 {object} utils.ErrorResponse "商品不存在"
// @Failure 500 {object} utils.ErrorResponse "系統錯誤"
// @Security BearerAuth
// @Router /api/v1/products/{id} [delete]
func DeleteProductHandlerWrapper(c *gin.Context) {
	// This is a wrapper function for swagger documentation
	// The actual implementation is in DeleteProductHandler
}

// DeleteProductHandler 刪除商品
func DeleteProductHandler(svc services.ProductService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 解析商品 ID
		productIDStr := c.Param("id")
		productID, err := uuid.Parse(productIDStr)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInvalidRequest)
			return
		}

		// 從中間件獲取商家 ID
		claims, exists := c.Get("user_claims")
		if !exists {
			utils.RespondWithError(c, utils.ErrUnauthorized)
			return
		}

		customClaims, ok := claims.(*utils.CustomClaims)
		if !ok {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		merchantID, err := uuid.Parse(customClaims.MerchantID)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		// 呼叫服務層
		err = svc.DeleteProduct(c, productID, merchantID)
		if err != nil {
			if err.Error() == "record not found" {
				notFoundErr := utils.NewAPIError(
					utils.ErrorCodeProductNotFound,
					"商品不存在",
					http.StatusNotFound,
					err,
				)
				utils.RespondWithError(c, notFoundErr)
				return
			}
			utils.RespondWithError(c, utils.ErrInternalError)
			return
		}

		utils.RespondWithSuccess(c, "刪除成功", nil)
	}
}

// GetProductCustomizationsHandlerWrapper 獲取商品客製化選項 (Swagger 用)
// @Summary 獲取商品客製化選項
// @Description 獲取指定商品的所有客製化選項和選項值
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "商品 ID" example("550e8400-e29b-41d4-a716-446655440000")
// @Success 200 {object} utils.SuccessResponse{data=[]CustomizationOptionInfo} "查詢成功"
// @Failure 400 {object} utils.ErrorResponse "商品 ID 格式錯誤"
// @Failure 401 {object} utils.ErrorResponse "未授權"
// @Failure 404 {object} utils.ErrorResponse "商品不存在"
// @Failure 500 {object} utils.ErrorResponse "系統錯誤"
// @Security BearerAuth
// @Router /api/v1/products/{id}/customizations [get]
func GetProductCustomizationsHandlerWrapper(c *gin.Context) {
	// This is a wrapper function for swagger documentation
	// The actual implementation is in GetProductCustomizationsHandler
}

// GetProductCustomizationsHandler 獲取商品客製化選項
func GetProductCustomizationsHandler(svc services.ProductService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 解析商品 ID
		productIDStr := c.Param("id")
		productID, err := uuid.Parse(productIDStr)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInvalidRequest)
			return
		}

		// 從中間件獲取商家 ID
		claims, exists := c.Get("user_claims")
		if !exists {
			utils.RespondWithError(c, utils.ErrUnauthorized)
			return
		}

		customClaims, ok := claims.(*utils.CustomClaims)
		if !ok {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		merchantID, err := uuid.Parse(customClaims.MerchantID)
		if err != nil {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		// 呼叫服務層
		customizations, err := svc.GetProductCustomizations(c, productID, merchantID)
		if err != nil {
			if err.Error() == "record not found" {
				notFoundErr := utils.NewAPIError(
					utils.ErrorCodeProductNotFound,
					"商品不存在",
					http.StatusNotFound,
					err,
				)
				utils.RespondWithError(c, notFoundErr)
				return
			}
			utils.RespondWithError(c, utils.ErrInternalError)
			return
		}

		// 轉換回應格式
		var optionInfos []*CustomizationOptionInfo
		for _, option := range customizations {
			optionInfo := &CustomizationOptionInfo{
				OptionID:     option.OptionID,
				Type:         option.Type,
				Name:         option.Name,
				DisplayOrder: option.DisplayOrder,
			}

			// 轉換選項值
			for _, value := range option.Values {
				valueInfo := &CustomizationValueInfo{
					ValueID:       value.ValueID,
					Name:          value.Name,
					PriceModifier: value.PriceModifier,
					IsDefault:     value.IsDefault,
					DisplayOrder:  value.DisplayOrder,
				}
				optionInfo.Values = append(optionInfo.Values, valueInfo)
			}

			optionInfos = append(optionInfos, optionInfo)
		}

		utils.RespondWithSuccess(c, "查詢成功", optionInfos)
	}
}
