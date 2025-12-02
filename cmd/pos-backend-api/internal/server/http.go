package server

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"passontw-backend-services/cmd/pos-backend-api/internal/config"
	"passontw-backend-services/cmd/pos-backend-api/internal/docs"
	"passontw-backend-services/cmd/pos-backend-api/internal/handlers"
	"passontw-backend-services/cmd/pos-backend-api/internal/middleware"
	"passontw-backend-services/pkg/logger"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type HTTPServer struct {
	server *http.Server
	engine *gin.Engine
	logger logger.Logger
	config *config.Config
}

func NewHTTPServer(cfg *config.Config, lgr logger.Logger, handlers *handlers.Handlers) (*HTTPServer, error) {
	gin.SetMode(gin.ReleaseMode)
	engine := gin.New()
	engine.Use(gin.Recovery())
	engine.Use(middleware.CORSMiddleware())
	engine.Use(gin.LoggerWithWriter(gin.DefaultWriter, "/api/admin/auth"))

	// Health check endpoints
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "backend-service"})
	})

	engine.GET("/ready", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ready", "service": "backend-service"})
	})

	// Swagger UI
	engine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// 管理員認證 API
	adminGroup := engine.Group("/api/admin/auth")
	{
		adminGroup.POST("/login", handlers.AdminAuth.Login)
		adminGroup.POST("/logout", middleware.AuthMiddleware(cfg), handlers.AdminAuth.Logout)
	}

	// 動態設定 Swagger Host
	// Swagger Host 將由環境變數 SWAGGER_BASE_DOMAIN 控制
	// 如果未設置，默認使用 0.0.0.0:port（綁定所有接口）
	docs.SwaggerInfo.Host = "0.0.0.0:" + cfg.HTTP.Port

	// 在 Kubernetes 中，始終綁定到所有接口
	// HTTP_HOST 僅用於 Swagger 文檔顯示，不用於服務器綁定
	addr := ":" + cfg.HTTP.Port
	server := &http.Server{
		Addr:    addr,
		Handler: engine,
	}
	return &HTTPServer{
		server: server,
		engine: engine,
		logger: lgr,
		config: cfg,
	}, nil
}

func (s *HTTPServer) Start() error {
	s.logger.Info("Starting HTTP server", zap.String("port", s.config.HTTP.Port))
	return s.server.ListenAndServe()
}

func (s *HTTPServer) Stop(ctx context.Context) error {
	s.logger.Info("Stopping HTTP server")
	return s.server.Shutdown(ctx)
}
