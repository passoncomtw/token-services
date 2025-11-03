package handlers

import (
	"github.com/yourusername/project/pkg/response"

	"github.com/gin-gonic/gin"
)

type HealthHandlers struct {
}

func NewHealthHandlers() *HealthHandlers {
	return &HealthHandlers{}
}

// ==================== Health Handlers ====================

// HealthCheck godoc
// @Summary 健康檢查
// @Description 檢查服務是否正常運行
// @Tags health
// @Accept json
// @Produce json
// @Success 200 {object} response.Response
// @Router /health [get]
func (r *HealthHandlers) HealthCheck(c *gin.Context) {
	response.Success(c, gin.H{
		"status":  "ok",
		"service": "sk-demo",
	})
}
