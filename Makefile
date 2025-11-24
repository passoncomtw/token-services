# ==================== 變數定義 ====================
GOPATH := $(shell go env GOPATH)
DOCS_DIR_ADMIN := cmd/token-admin-api/internal/docs
DOCS_DIR_APP := cmd/token-app-api/internal/docs
DOCS_DIR_POS := cmd/pos-backend-api/internal/docs
DOCS_DIR_MERCHANT := cmd/pos-merchant-service/internal/docs

# ==================== Swagger 文檔 ====================

.PHONY: build-token-admin-swagger
build-token-admin-swagger: ## 生成 token-admin-api 的 Swagger 文檔
	@echo "📚 生成 token-admin-api Swagger 文檔..."
	@if ! command -v $(GOPATH)/bin/swag >/dev/null 2>&1; then \
		echo "⚠️  swag 未安裝，正在安裝..."; \
		go install github.com/swaggo/swag/cmd/swag@latest; \
	fi
	@mkdir -p $(DOCS_DIR_ADMIN)
	@cd cmd/token-admin-api && $(GOPATH)/bin/swag init \
		-g main.go \
		-o internal/docs \
		--parseDependency \
		--parseInternal \
		--quiet
	@echo "✅ Swagger 文檔已生成至 $(DOCS_DIR_ADMIN)"

.PHONY: build-token-app-swagger
build-token-app-swagger: ## 生成 token-app-api 的 Swagger 文檔
	@echo "📚 生成 token-app-api Swagger 文檔..."
	@if ! command -v $(GOPATH)/bin/swag >/dev/null 2>&1; then \
		echo "⚠️  swag 未安裝，正在安裝..."; \
		go install github.com/swaggo/swag/cmd/swag@latest; \
	fi
	@mkdir -p $(DOCS_DIR_APP)
	@cd cmd/token-app-api && $(GOPATH)/bin/swag init \
		-g main.go \
		-o internal/docs \
		--parseDependency \
		--parseInternal \
		--quiet
	@echo "✅ Swagger 文檔已生成至 $(DOCS_DIR_APP)"

.PHONY: build-pos-backend-swagger
build-pos-backend-swagger: ## 生成 pos-backend-api 的 Swagger 文檔
	@echo "📚 生成 pos-backend-api Swagger 文檔..."
	@if ! command -v $(GOPATH)/bin/swag >/dev/null 2>&1; then \
		echo "⚠️  swag 未安裝，正在安裝..."; \
		go install github.com/swaggo/swag/cmd/swag@latest; \
	fi
	@mkdir -p $(DOCS_DIR_POS)
	@cd cmd/pos-backend-api && $(GOPATH)/bin/swag init \
		-g main.go \
		-o internal/docs \
		--parseDependency \
		--parseInternal \
		--quiet
	@echo "✅ Swagger 文檔已生成至 $(DOCS_DIR_POS)"

.PHONY: build-pos-merchant-swagger
build-pos-merchant-swagger: ## 生成 pos-merchant-service 的 Swagger 文檔
	@echo "📚 生成 pos-merchant-service Swagger 文檔..."
	@if ! command -v $(GOPATH)/bin/swag >/dev/null 2>&1; then \
		echo "⚠️  swag 未安裝，正在安裝..."; \
		go install github.com/swaggo/swag/cmd/swag@latest; \
	fi
	@mkdir -p $(DOCS_DIR_MERCHANT)
	@cd cmd/pos-merchant-service && $(GOPATH)/bin/swag init \
		-g main.go \
		-o internal/docs \
		--parseDependency \
		--parseInternal \
		--quiet
	@echo "✅ Swagger 文檔已生成至 $(DOCS_DIR_MERCHANT)"

# ==================== 執行指令 ====================

.PHONY: run-token-admin-api
run-token-admin-api: ## 使用 air 執行 token-admin-api
	@echo "📚 檢查 swagger 文檔..."
	@if [ ! -d "$(DOCS_DIR_ADMIN)" ]; then \
		echo "⚠️  swagger 文檔不存在，正在生成..."; \
		$(MAKE) build-token-admin-swagger; \
	fi
	@echo "🔥 使用 air 啟動 token-admin-api..."
	@if ! command -v $(GOPATH)/bin/air >/dev/null 2>&1; then \
		echo "⚠️  air 未安裝，正在安裝..."; \
		go install github.com/air-verse/air@latest; \
	fi
	@cd cmd/token-admin-api && $(GOPATH)/bin/air

.PHONY: run-token-app-api
run-token-app-api: ## 使用 air 執行 token-app-api
	@echo "📚 檢查 swagger 文檔..."
	@if [ ! -d "$(DOCS_DIR_APP)" ]; then \
		echo "⚠️  swagger 文檔不存在，正在生成..."; \
		$(MAKE) build-token-app-swagger; \
	fi
	@echo "🔥 使用 air 啟動 token-app-api..."
	@if ! command -v $(GOPATH)/bin/air >/dev/null 2>&1; then \
		echo "⚠️  air 未安裝，正在安裝..."; \
		go install github.com/air-verse/air@latest; \
	fi
	@cd cmd/token-app-api && $(GOPATH)/bin/air

.PHONY: run-pos-backend-api
run-pos-backend-api: ## 使用 air 執行 pos-backend-api
	@echo "📚 檢查 swagger 文檔..."
	@if [ ! -d "$(DOCS_DIR_POS)" ]; then \
		echo "⚠️  swagger 文檔不存在，正在生成..."; \
		$(MAKE) build-pos-backend-swagger; \
	fi
	@echo "🔥 使用 air 啟動 pos-backend-api..."
	@if ! command -v $(GOPATH)/bin/air >/dev/null 2>&1; then \
		echo "⚠️  air 未安裝，正在安裝..."; \
		go install github.com/air-verse/air@latest; \
	fi
	@cd cmd/pos-backend-api && $(GOPATH)/bin/air

.PHONY: run-pos-merchant-service
run-pos-merchant-service: ## 使用 air 執行 pos-merchant-service
	@echo "📚 檢查 swagger 文檔..."
	@if [ ! -d "$(DOCS_DIR_MERCHANT)" ]; then \
		echo "⚠️  swagger 文檔不存在，正在生成..."; \
		$(MAKE) build-pos-merchant-swagger; \
	fi
	@echo "🔥 使用 air 啟動 pos-merchant-service..."
	@if ! command -v $(GOPATH)/bin/air >/dev/null 2>&1; then \
		echo "⚠️  air 未安裝，正在安裝..."; \
		go install github.com/air-verse/air@latest; \
	fi
	@cd cmd/pos-merchant-service && $(GOPATH)/bin/air
