package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"token-admin-api/pkg/config"

	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

// Server HTTP 服務器
type Server struct {
	engine *gin.Engine
	port   int
}

/**
 * @brief 建立新的 Server 實例
 * @param router 路由管理器
 * @param cfg 應用程式配置
 * @return Server 指標
 */
func NewServer(router *Router, cfg *config.Config) *Server {
	// 設定 Gin 模式
	gin.SetMode(gin.ReleaseMode)

	// 建立 Gin 引擎
	engine := gin.New()
	engine.Use(gin.Recovery())
	engine.Use(gin.Logger())

	// 設定路由
	router.SetupRoutes(engine)

	return &Server{
		engine: engine,
		port:   cfg.HTTPPort,
	}
}

/**
 * @brief 啟動 HTTP 服務器
 * @param lc FX Lifecycle
 */
func (s *Server) Start(lc fx.Lifecycle) {
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", s.port),
		Handler: s.engine,
	}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			go func() {
				log.Printf("🚀 Server starting on port %d", s.port)
				log.Printf("📚 Swagger UI: http://localhost:%d/swagger/index.html", s.port)
				if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
					log.Fatalf("Failed to start server: %v", err)
				}
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			log.Println("🛑 Shutting down server...")
			shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			return srv.Shutdown(shutdownCtx)
		},
	})
}
