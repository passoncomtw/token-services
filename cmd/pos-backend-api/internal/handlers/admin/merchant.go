package admin

import (
	"net/http"
	"strconv"
	"time"

	"passontw-backend-services/cmd/pos-backend-api/internal/models"
	"passontw-backend-services/cmd/pos-backend-api/internal/services"

	"github.com/gin-gonic/gin"
)

// GetMerchantList godoc
// @Summary 取得商家列表
// @Description 取得商家列表，支援分頁和搜尋
// @Tags admin-merchant
// @Security BearerAuth
// @Produce json
// @Param page query int false "頁碼" default(1) example(1)
// @Param limit query int false "每頁筆數" default(10) example(10)
// @Param search query string false "搜尋關鍵字" example("測試")
// @Success 200 {object} models.MerchantListResponse "商家列表"
// @Failure 400 {object} models.ErrorResponse "參數錯誤"
// @Failure 401 {object} models.ErrorResponse "Token 無效"
// @Failure 500 {object} models.ErrorResponse "伺服器錯誤"
// @Router /api/admin/merchants [get]
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
				Status:       m.Status,
				UpdatedAt:    m.UpdatedAt.Format(time.RFC3339),
				CreatedAt:    m.CreatedAt.Format(time.RFC3339),
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
