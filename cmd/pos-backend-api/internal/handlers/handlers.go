package handlers

import (
	"passontw-backend-services/cmd/pos-backend-api/internal/handlers/admin"
	"passontw-backend-services/cmd/pos-backend-api/internal/services"
	"passontw-backend-services/pkg/logger"
)

type Handlers struct {
	AdminAuth       *admin.AuthHandler
	MerchantService services.MerchantService
}

func NewHandlers(authService *services.AuthService, merchantService services.MerchantService, logger logger.Logger) *Handlers {
	return &Handlers{
		AdminAuth:       admin.NewAuthHandler(authService, logger),
		MerchantService: merchantService,
	}
}
