package handlers

import (
	"token-admin-api/cmd/token-admin-api/internal/interfaces"

	"go.uber.org/fx"
)

var HandlerModule = fx.Module("handlers",
	fx.Provide(fx.Annotate(NewHealthHandlers, fx.As(new(interfaces.HealthHandlersInterface)))),
	fx.Provide(fx.Annotate(NewAuthHandlers, fx.As(new(interfaces.AuthHandlersInterface)))),
	fx.Provide(fx.Annotate(NewBackendActorHandlers, fx.As(new(interfaces.BackendActorHandlersInterface)))),
)
