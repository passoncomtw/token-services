package modules

import (
	"go.uber.org/fx"

	"passontw-backend-services/cmd/pos-merchant-service/internal/repository"
	"passontw-backend-services/cmd/pos-merchant-service/internal/services"
)

// ServicesModule 服務模組 (遵循 SRP - 只負責業務服務相關依賴)
var ServicesModule = fx.Module("services",
	fx.Provide(
		services.NewMerchantService,
		repository.NewProductRepository,
		services.NewProductService,
	),
)

// 這裡可以添加服務相關的配置函數
// 例如：設置服務間的依賴關係、初始化參數等
