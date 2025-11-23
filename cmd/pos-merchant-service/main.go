package main

import (
	"log"

	"github.com/joho/godotenv"
	"go.uber.org/fx"

	_ "passontw-backend-services/cmd/pos-merchant-service/internal/docs" // 導入 swagger docs
	"passontw-backend-services/cmd/pos-merchant-service/internal/modules"
)

// @title PassonTW Merchant Service API
// @version 1.0
// @description PassonTW POS 商店管理後端服務 API 文件
// @host localhost:8080
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description 請在 Authorization 欄位中填入 Bearer Token，格式為 "Bearer <token>"
// @BasePath /
func main() {
	// 載入 .env 檔案（使用 air 時工作目錄在 cmd/pos-merchant-service）
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found or failed to load .env, using system env only.")
	}
	// 使用 fx 啟動應用 (依賴注入容器管理)
	fx.New(
		modules.AppModule,
	).Run()
}
