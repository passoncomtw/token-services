package admin

import (
	"net/http"
	"strconv"

	"passontw-backend-services/cmd/pos-backend-service/internal/models"
	"passontw-backend-services/cmd/pos-backend-service/internal/services"

	"github.com/gin-gonic/gin"
)

// GetMerchantList godoc
// @Summary 取得商家列表
// @Description 取得商家列表，支援分頁和搜尋
// @Tags admin-merchant
// @Security BearerAuth
// @Produce json
// @Success 200 {object} models.MerchantListResponse "商家列表"
// @Failure 401 {object} models.ErrorResponse "Token 無效"
// @Router /api/admin/merchant [get]
func GetMerchantListHandler(svc services.MerchantService) gin.HandlerFunc {
	return func(c *gin.Context) {
		pageStr := c.DefaultQuery("page", "1")
		limitStr := c.DefaultQuery("limit", "10")
		search := c.DefaultQuery("search", "")

		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Success:   false,
				Message:   "頁碼必須大於 0",
				ErrorCode: "INVALID_PARAMETERS",
				Errors:    []models.FieldError{{Field: "page", Message: "頁碼必須大於 0"}},
			})
			return
		}
		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit < 1 || limit > 100 {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Success:   false,
				Message:   "每頁筆數必須介於 1~100",
				ErrorCode: "INVALID_PARAMETERS",
				Errors:    []models.FieldError{{Field: "limit", Message: "每頁筆數必須介於 1~100"}},
			})
			return
		}
		if len(search) > 255 {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Success:   false,
				Message:   "搜尋字串長度超過 255 字元",
				ErrorCode: "INVALID_PARAMETERS",
				Errors:    []models.FieldError{{Field: "search", Message: "搜尋字串長度超過 255 字元"}},
			})
			return
		}

		merchants, total, err := svc.ListMerchants(c.Request.Context(), page, limit, search)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Success:   false,
				Message:   "查詢失敗",
				ErrorCode: "INTERNAL_ERROR",
			})
			return
		}

		var merchantDTOs []models.MerchantDTO
		for _, m := range merchants {
			merchantDTOs = append(merchantDTOs, models.MerchantDTO{
				MerchantID:   m.MerchantID,
				MerchantName: m.MerchantName,
			})
		}

		totalPages := (total + limit - 1) / limit
		resp := models.MerchantListResponse{
			Success: true,
			Message: "查詢成功",
			Data: models.MerchantListData{
				Merchants: merchantDTOs,
				Pagination: models.Pagination{
					CurrentPage: page,
					PerPage:     limit,
					TotalPages:  totalPages,
					TotalCount:  total,
					HasNext:     page < totalPages,
					HasPrevious: page > 1,
				},
			},
		}
		c.JSON(http.StatusOK, resp)
	}
}
