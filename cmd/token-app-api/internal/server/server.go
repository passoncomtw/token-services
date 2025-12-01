package server

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"passontw-backend-services/cmd/token-app-api/internal/docs"
	"passontw-backend-services/pkg/config"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/pkg/middleware"
	"passontw-backend-services/pkg/swagger"

	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
	"go.uber.org/zap"
)

// Server HTTP 服務器
type Server struct {
	engine   *gin.Engine
	port     int
	localIP  string
	swagHost string
	logger   logger.Logger
}

/**
 * @brief 建立新的 Server 實例
 * @param router 路由管理器
 * @param cfg 應用程式配置
 * @param log Logger 實例
 * @param loggerMw Logger 中間件
 * @param corsMw CORS 中間件
 * @param swaggerMgr Swagger 管理器
 * @return Server 指標
 */
func NewServer(router *Router, cfg *config.Config, log logger.Logger, loggerMw *middleware.LoggerMiddleware, corsMw *middleware.CORSMiddleware, swaggerMgr *swagger.SwaggerManager) *Server {
	// 設定 Gin 模式
	gin.SetMode(gin.ReleaseMode)

	// 建立 Gin 引擎
	engine := gin.New()
	engine.Use(gin.Recovery())
	engine.Use(corsMw.Handler())   // 使用 CORS 中間件（必須在其他中間件之前）
	engine.Use(loggerMw.Handler()) // 使用我們的日誌中間件

	// 取得本機 IP
	localIP := cfg.GetLocalIP()

	// 使用 Swagger 模組初始化文檔
	swaggerMgr.InitializeDocs(docs.SwaggerInfo)

	log.Info("Server configuration",
		zap.String("localIP", localIP),
		zap.String("swaggerHost", swaggerMgr.GetConfig().Host),
		zap.String("version", cfg.AppVersion),
		zap.Int("port", cfg.HTTPPort),
	)

	// 設定路由
	router.SetupRoutes(engine)
	
	// 註冊 Swagger 路由
	swaggerMgr.RegisterRoutes(engine)

	return &Server{
		engine:   engine,
		port:     cfg.HTTPPort,
		localIP:  localIP,
		swagHost: swaggerMgr.GetConfig().Host,
		logger:   log.With(zap.String("component", "Server")),
	}
}

/**
 * @brief 啟動 HTTP 服務器
 * @param lc FX Lifecycle
 */
func (s *Server) Start(lc fx.Lifecycle) {
	// 監聽 0.0.0.0（所有網卡），這樣可以通過任何 IP 訪問
	srv := &http.Server{
		Addr:    fmt.Sprintf("0.0.0.0:%d", s.port),
		Handler: s.engine,
	}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			go func() {
				s.logger.Info("========================================")
				s.logger.Info("🚀 Token App API Server Starting...")
				s.logger.Info("========================================")
				s.logger.Info(fmt.Sprintf("📍 Local:   http://localhost:%d", s.port))
				s.logger.Info(fmt.Sprintf("📍 Network: http://%s:%d", s.localIP, s.port))
				s.logger.Info("========================================")
				s.logger.Info(fmt.Sprintf("📚 Swagger UI (Local):   http://localhost:%d/swagger/index.html", s.port))
				s.logger.Info(fmt.Sprintf("📚 Swagger UI (Network): http://%s:%d/swagger/index.html", s.localIP, s.port))
				s.logger.Info("========================================")

				if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
					s.logger.Fatal("Failed to start server", zap.Error(err))
				}
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			s.logger.Info("🛑 Shutting down server...")
			shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			return srv.Shutdown(shutdownCtx)
		},
	})
}
