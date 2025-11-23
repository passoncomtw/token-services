package modules

import (
	"go.uber.org/fx"

	"passontw-backend-services/cmd/pos-backend-service/internal/services"
)

// ServicesModule 服務模組 (遵循 SRP)
var ServicesModule = fx.Module("services",
	fx.Provide(
		// 業務服務在這裡註冊
		services.NewMerchantService,
	),
)
