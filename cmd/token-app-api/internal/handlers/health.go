package handlers

import (
	"token-services/pkg/logger"
	"token-services/pkg/response"

	"github.com/gin-gonic/gin"
)

type HealthHandlers struct {
	logger logger.Logger
}

func NewHealthHandlers(logger logger.Logger) *HealthHandlers {
	return &HealthHandlers{
		logger: logger,
	}
}

// ==================== Health Handlers ====================

// HealthCheck godoc
// @Summary 健康檢查
// @Description 檢查 API 伺服器健康狀態
// @Tags 檢查服務狀態
// @Accept json
// @Produce json
// @Success 200 {object} response.Response "服務狀態"
// @Router /health-check [get]
func (h *HealthHandlers) HealthCheck(c *gin.Context) {
	h.logger.Debug("健康檢查請求")
	
	response.Success(c, gin.H{
		"status": "WORKING", // WORKING: 正常, STOP: 停止, MAINTAIN: 維護中
	})
}
