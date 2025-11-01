package server

import (
	"go.uber.org/fx"
)

var ServerModule = fx.Module("server",
	fx.Provide(NewRouter),
	fx.Provide(NewServer),
	fx.Invoke(func(s *Server, lc fx.Lifecycle) {
		s.Start(lc)
	}),
)
