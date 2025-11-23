package handlers

import (
	"passontw-backend-services/cmd/pos-backend-service/internal/handlers/admin"
	"passontw-backend-services/cmd/pos-backend-service/internal/services"

	"go.uber.org/zap"
)

type Handlers struct {
	AdminAuth *admin.AuthHandler
}

func NewHandlers(authService *services.AuthService, logger *zap.Logger) *Handlers {
	return &Handlers{
		AdminAuth: admin.NewAuthHandler(authService, logger),
	}
}
