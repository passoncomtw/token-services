package swagger

/**
 * 這個檔案提供 Swagger 模組的使用範例
 *
 * 注意：這個檔案僅供參考，不會被編譯到最終的二進制文件中
 */

// 範例 1: 在 main.go 中引入 Swagger 模組
//
// package main
//
// import (
//     "passontw-backend-services/pkg/config"
//     "passontw-backend-services/pkg/logger"
//     "passontw-backend-services/pkg/swagger"
//     "passontw-backend-services/pkg/middleware"
//     "passontw-backend-services/pkg/database"
//
//     "passontw-backend-services/cmd/your-service/internal/server"
//
//     "go.uber.org/fx"
// )
//
// // @title           Your Service API
// // @version         1.0
// // @description     Your Service API 文檔
// // @termsOfService  http://swagger.io/terms/
// //
// // @contact.name   API Support
// // @contact.email  support@example.com
// //
// // @license.name  Apache 2.0
// // @license.url   http://www.apache.org/licenses/LICENSE-2.0.html
// //
// // @host      localhost:8080
// // @BasePath  /
// //
// // @securityDefinitions.apikey BearerAuth
// // @in header
// // @name Authorization
//
// func main() {
//     fx.New(
//         // 核心模組
//         config.ConfigModule,
//         logger.LoggerModule,
//         swagger.SwaggerModule,  // 新增 Swagger 模組
//
//         // 基礎設施模組
//         middleware.MiddlewareModule,
//         database.DatabaseModule,
//
//         // 服務模組
//         server.ServerModule,
//     ).Run()
// }

// 範例 2: 在 Server 中使用 SwaggerManager
//
// package server
//
// import (
//     "context"
//     "fmt"
//     "net/http"
//     "time"
//
//     "passontw-backend-services/cmd/your-service/internal/docs"
//     "passontw-backend-services/pkg/config"
//     "passontw-backend-services/pkg/logger"
//     "passontw-backend-services/pkg/middleware"
//     "passontw-backend-services/pkg/swagger"
//
//     "github.com/gin-gonic/gin"
//     "go.uber.org/fx"
//     "go.uber.org/zap"
// )
//
// type Server struct {
//     engine         *gin.Engine
//     port           int
//     logger         logger.Logger
//     swaggerManager *swagger.SwaggerManager
// }
//
// func NewServer(
//     router *Router,
//     cfg *config.Config,
//     log logger.Logger,
//     loggerMw *middleware.LoggerMiddleware,
//     corsMw *middleware.CORSMiddleware,
//     swaggerManager *swagger.SwaggerManager,  // 注入 SwaggerManager
// ) *Server {
//     gin.SetMode(gin.ReleaseMode)
//
//     engine := gin.New()
//     engine.Use(gin.Recovery())
//     engine.Use(corsMw.Handler())
//     engine.Use(loggerMw.Handler())
//
//     // 初始化 Swagger 文檔（動態設定 Host、Version 等）
//     swaggerManager.InitializeDocs(docs.SwaggerInfo)
//
//     // 註冊 Swagger 路由（只有在啟用時才會註冊）
//     swaggerManager.RegisterRoutes(engine)
//
//     // 設定其他業務路由
//     router.SetupRoutes(engine)
//
//     return &Server{
//         engine:         engine,
//         port:           cfg.HTTPPort,
//         logger:         log.With(zap.String("component", "Server")),
//         swaggerManager: swaggerManager,
//     }
// }
//
// func (s *Server) Start(lc fx.Lifecycle) {
//     srv := &http.Server{
//         Addr:    fmt.Sprintf("0.0.0.0:%d", s.port),
//         Handler: s.engine,
//     }
//
//     lc.Append(fx.Hook{
//         OnStart: func(ctx context.Context) error {
//             go func() {
//                 s.logger.Info("🚀 Server starting", zap.Int("port", s.port))
//
//                 // 顯示 Swagger UI URL（只有在啟用時才顯示）
//                 if s.swaggerManager.IsEnabled() {
//                     s.logger.Info("📚 Swagger UI",
//                         zap.String("local", s.swaggerManager.GetSwaggerURL(true)),
//                         zap.String("network", s.swaggerManager.GetSwaggerURL(false)),
//                     )
//                 }
//
//                 if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
//                     s.logger.Fatal("Failed to start server", zap.Error(err))
//                 }
//             }()
//             return nil
//         },
//         OnStop: func(ctx context.Context) error {
//             s.logger.Info("🛑 Shutting down server...")
//             shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
//             defer cancel()
//             return srv.Shutdown(shutdownCtx)
//         },
//     })
// }

// 範例 3: Handler 中的 Swagger 註解
//
// package handlers
//
// import (
//     "passontw-backend-services/pkg/response"
//     "github.com/gin-gonic/gin"
// )
//
// type UserHandlers struct {
//     // ...
// }
//
// // GetList 取得用戶列表
// // @Summary 取得用戶列表
// // @Description 取得所有用戶的列表，支援分頁和搜尋
// // @Tags users
// // @Accept json
// // @Produce json
// // @Param page query int false "頁碼" default(1)
// // @Param pageSize query int false "每頁筆數" default(10)
// // @Param keyword query string false "搜尋關鍵字"
// // @Security BearerAuth
// // @Success 200 {object} response.Response{data=[]models.User} "成功返回用戶列表"
// // @Failure 400 {object} response.Response "請求參數錯誤"
// // @Failure 401 {object} response.Response "未授權"
// // @Failure 500 {object} response.Response "伺服器錯誤"
// // @Router /users [get]
// func (h *UserHandlers) GetList(c *gin.Context) {
//     // 實作邏輯...
//     response.Success(c, nil)
// }
//
// // GetDetail 取得用戶詳情
// // @Summary 取得用戶詳情
// // @Description 根據用戶 ID 取得用戶詳細資訊
// // @Tags users
// // @Accept json
// // @Produce json
// // @Param userId path string true "用戶 ID"
// // @Security BearerAuth
// // @Success 200 {object} response.Response{data=models.User} "成功返回用戶詳情"
// // @Failure 404 {object} response.Response "用戶不存在"
// // @Failure 500 {object} response.Response "伺服器錯誤"
// // @Router /users/{userId} [get]
// func (h *UserHandlers) GetDetail(c *gin.Context) {
//     // 實作邏輯...
//     response.Success(c, nil)
// }
//
// // Create 建立新用戶
// // @Summary 建立新用戶
// // @Description 建立一個新的用戶帳號
// // @Tags users
// // @Accept json
// // @Produce json
// // @Param body body models.CreateUserRequest true "用戶資料"
// // @Security BearerAuth
// // @Success 201 {object} response.Response{data=models.User} "成功建立用戶"
// // @Failure 400 {object} response.Response "請求參數錯誤"
// // @Failure 401 {object} response.Response "未授權"
// // @Failure 500 {object} response.Response "伺服器錯誤"
// // @Router /users [post]
// func (h *UserHandlers) Create(c *gin.Context) {
//     // 實作邏輯...
//     response.Success(c, nil)
// }

// 範例 4: 環境變數配置
//
// .env 檔案內容：
//
// # Swagger 配置
// SWAGGER_ENABLED=true                          # 啟用 Swagger（預設: true）
// SWAGGER_BASE_DOMAIN=api.example.com          # Swagger Host（選擇性）
// APP_VERSION=v1.0.0                            # API 版本號（預設: dev）
//
// # HTTP Server 配置
// HTTP_PORT=8080
//
// # 其他配置...

// 範例 5: 進階使用 - 自訂 Swagger 路徑
//
// func NewServer(...) *Server {
//     // ...
//
//     // 使用自訂路徑註冊 Swagger
//     swaggerManager.RegisterRoutes(engine, "/api/docs/*any")
//
//     // 這樣 Swagger UI 就會在 http://localhost:8080/api/docs/index.html
//
//     // ...
// }

// 範例 6: 進階使用 - 檢查 Swagger 狀態
//
// func SomeFunction(swaggerManager *swagger.SwaggerManager) {
//     if swaggerManager.IsEnabled() {
//         // Swagger 已啟用時才執行的邏輯
//         fmt.Println("Swagger is enabled")
//         fmt.Println("Swagger URL:", swaggerManager.GetSwaggerURL())
//     } else {
//         fmt.Println("Swagger is disabled")
//     }
// }

// 範例 7: 取得 Swagger 配置信息
//
// func LogSwaggerInfo(swaggerManager *swagger.SwaggerManager) {
//     cfg := swaggerManager.GetConfig()
//     fmt.Printf("Swagger Enabled: %v\n", cfg.Enabled)
//     fmt.Printf("Swagger Host: %s\n", cfg.Host)
//     fmt.Printf("Swagger Version: %s\n", cfg.Version)
//     fmt.Printf("Swagger BasePath: %s\n", cfg.BasePath)
//     fmt.Printf("Swagger Schemes: %v\n", cfg.Schemes)
// }
