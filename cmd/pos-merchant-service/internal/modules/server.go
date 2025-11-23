package modules

import (
	"passontw-backend-services/cmd/pos-merchant-service/internal/server"

	"go.uber.org/fx"
)

// ServerModule 服務器模組 (遵循 SRP - 只負責服務器相關依賴)
var ServerModule = fx.Module("server",
	fx.Invoke(server.StartHTTPServer),
)
