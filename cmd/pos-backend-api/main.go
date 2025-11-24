package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.uber.org/fx"

	"passontw-backend-services/cmd/pos-backend-api/internal/modules"
)

func init() {
	// 當使用 air 時，工作目錄在 cmd/pos-backend-api，所以直接載入 .env
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Warning: .env not loaded", err)
	}
	log.Println("DB_NAME:", os.Getenv("DB_NAME"))
}

// @title PassonTW Backend Service API
// @version 1.0
// @description PassonTW POS 平台後端服務 API 文件
// @host localhost:8080
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description 請在 Authorization 欄位中填入 Bearer Token，格式為 "Bearer <token>"
// @BasePath /
func main() {
	// 使用 fx 啟動應用 (依賴注入容器管理)
	fx.New(
		modules.AppModule,
	).Run()
}
