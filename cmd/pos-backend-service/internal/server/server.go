package server

import (
	"context"
	"sync"

	"go.uber.org/zap"
)

type ServerManager struct {
	httpServer *HTTPServer
	logger     *zap.Logger
	wg         sync.WaitGroup
}

func NewServerManager(httpServer *HTTPServer, logger *zap.Logger) *ServerManager {
	return &ServerManager{
		httpServer: httpServer,
		logger:     logger,
	}
}

func (sm *ServerManager) Start() error {
	sm.wg.Add(1)
	go func() {
		defer sm.wg.Done()
		if err := sm.httpServer.Start(); err != nil {
			sm.logger.Error("HTTP server failed", zap.Error(err))
		}
	}()

	sm.logger.Info("All servers started successfully")
	return nil
}

func (sm *ServerManager) Stop(ctx context.Context) error {
	sm.logger.Info("Stopping all servers")
	if err := sm.httpServer.Stop(ctx); err != nil {
		sm.logger.Error("Failed to stop HTTP server", zap.Error(err))
	}
	sm.wg.Wait()
	sm.logger.Info("All servers stopped")
	return nil
}
