package handlers

import (
	"token-admin-api/cmd/token-admin-api/internal/interfaces"

	"go.uber.org/fx"
)

var HandlerModule = fx.Module("handlers",
	fx.Provide(fx.Annotate(NewHealthHandlers, fx.As(new(interfaces.HealthHandlersInterface)))),
	fx.Provide(fx.Annotate(NewAuthHandlers, fx.As(new(interfaces.AuthHandlersInterface)))),
	fx.Provide(fx.Annotate(NewBackendActorHandlers, fx.As(new(interfaces.BackendActorHandlersInterface)))),
	fx.Provide(fx.Annotate(NewBackendUserHandlers, fx.As(new(interfaces.BackendUserHandlersInterface)))),
	fx.Provide(fx.Annotate(NewUserHandlers, fx.As(new(interfaces.UserHandlersInterface)))),
	fx.Provide(fx.Annotate(NewBankHandlers, fx.As(new(interfaces.BankHandlersInterface)))),
	fx.Provide(fx.Annotate(NewBankCardHandlers, fx.As(new(interfaces.BankCardHandlersInterface)))),
	fx.Provide(fx.Annotate(NewOrderHandlers, fx.As(new(interfaces.OrderHandlersInterface)))),
)
