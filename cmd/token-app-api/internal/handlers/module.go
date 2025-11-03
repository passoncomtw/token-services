package handlers

import (
	"token-services/cmd/token-app-api/internal/interfaces"

	"go.uber.org/fx"
)

var HandlerModule = fx.Module("handlers",
	fx.Provide(fx.Annotate(NewHealthHandlers, fx.As(new(interfaces.HealthHandlersInterface)))),
	fx.Provide(fx.Annotate(NewAuthHandlers, fx.As(new(interfaces.AuthHandlersInterface)))),
	fx.Provide(fx.Annotate(NewUserHandlers, fx.As(new(interfaces.UserHandlersInterface)))),
	fx.Provide(fx.Annotate(NewBankHandlers, fx.As(new(interfaces.BankHandlersInterface)))),
	fx.Provide(fx.Annotate(NewBankCardHandlers, fx.As(new(interfaces.BankCardHandlersInterface)))),
)
