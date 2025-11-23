package server

import (
	"context"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"

	"go.uber.org/fx"
	"go.uber.org/zap"

	"passontw-backend-services/cmd/pos-merchant-service/internal/config"
	"passontw-backend-services/pkg/logger"
	"passontw-backend-services/cmd/pos-merchant-service/internal/docs"
	"passontw-backend-services/cmd/pos-merchant-service/internal/handlers"
	"passontw-backend-services/cmd/pos-merchant-service/internal/middleware"
	"passontw-backend-services/cmd/pos-merchant-service/internal/repository"
	"passontw-backend-services/cmd/pos-merchant-service/internal/services"
)

func StartHTTPServer(lc fx.Lifecycle, log logger.Logger, db *gorm.DB, productSvc services.ProductService) {
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			// 載入設定
			cfg, err := config.LoadConfig()
			if err != nil {
				log.Fatal("載入設定失敗", zap.Error(err))
			}

			// 動態設定 Swagger Host
			httpHost := getEnvOrDefault("HTTP_HOST", "localhost")
			port := getEnvOrDefault("HTTP_PORT", "8080")
			
			// 設定 Swagger Host - 在 k8s 環境中使用外部域名
			swaggerHost := "merchant-api.passon.tw"
			if httpHost == "localhost" {
				swaggerHost = httpHost + ":" + port
			}
			docs.SwaggerInfo.Host = swaggerHost

			router := gin.Default()

			// 全局中間件
			router.Use(middleware.RequestIDMiddleware())

			// 健康檢查端點
			router.GET("/health", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "merchant-service"})
			})
			
			router.GET("/ready", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"status": "ready", "service": "merchant-service"})
			})

			// Swagger 路由
			router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

			// 認證路由組
			authGroup := router.Group("/api/v1/auth")
			authGroup.POST("/login", middleware.LoginRateLimitMiddleware(db), handlers.LoginHandler(db))
			authGroup.POST("/logout", middleware.AuthMiddleware(cfg), handlers.LogoutHandler)
			authGroup.POST("/change-pin", middleware.AuthMiddleware(cfg), handlers.ChangePinHandler(db))

			// 產品路由組
			productGroup := router.Group("/api/v1/products")
			productGroup.GET("/", middleware.AuthMiddleware(cfg), handlers.GetProductsHandler(productSvc))
			productGroup.GET("/:id", middleware.AuthMiddleware(cfg), handlers.GetProductByIDHandler(productSvc))
			productGroup.POST("/", middleware.AuthMiddleware(cfg), handlers.CreateProductHandler(productSvc, cfg))
			productGroup.PUT("/:id", middleware.AuthMiddleware(cfg), handlers.UpdateProductHandler(productSvc))
			productGroup.DELETE("/:id", middleware.AuthMiddleware(cfg), handlers.DeleteProductHandler(productSvc))
			productGroup.GET("/:id/customizations", middleware.AuthMiddleware(cfg), handlers.GetProductCustomizationsHandler(productSvc))

			// 初始化訂單相關 repository/service
			orderRepo := repository.NewOrderRepository(db)
			productRepo := &repository.ProductRepositoryImpl{Db: db}
			orderSvc := services.NewOrderService(orderRepo, productRepo)

			// 訂單路由組
			orderGroup := router.Group("/api/orders")
			orderGroup.Use(middleware.AuthMiddleware(cfg))
			orderGroup.POST("/", handlers.CreateOrderHandler(orderSvc))
			orderGroup.GET("/:id", handlers.GetOrderHandler(orderSvc))

			// 商家路由組
			merchantGroup := router.Group("/api/merchant")
			merchantGroup.GET("/info", middleware.AuthMiddleware(cfg), handlers.GetMerchantInfoHandler(db))

			httpServer := &http.Server{
				Addr:    ":" + port,
				Handler: router,
			}

			go func() {
				log.Info("啟動 HTTP server", zap.String("port", port))
				if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
					log.Fatal("HTTP server 啟動失敗", zap.Error(err))
				}
			}()

			return nil
		},
		OnStop: func(ctx context.Context) error {
			log.Info("關閉 HTTP server ...")
			// 若有 httpServer 可呼叫 Shutdown
			return nil
		},
	})
}

// getEnvOrDefault 獲取環境變數或預設值
func getEnvOrDefault(key, defaultValue string) string {
	if v := getenv(key); v != "" {
		return v
	}
	return defaultValue
}

// getenv 包裝 os.Getenv 方便測試
var getenv = func(key string) string {
	return configGetenv(key)
}

// configGetenv 實際呼叫 os.Getenv
func configGetenv(key string) string {
	return configGetenvOrig(key)
}

// configGetenvOrig 實際呼叫 os.Getenv
func configGetenvOrig(key string) string {
	return os.Getenv(key)
}
