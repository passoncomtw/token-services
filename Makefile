# ==================== 變數定義 ====================
GOPATH := $(shell go env GOPATH)
DOCS_DIR := cmd/token-admin-api/internal/docs

# ==================== Swagger 文檔 ====================

.PHONY: build-token-admin-swagger
build-token-admin-swagger: ## 生成 token-admin-api 的 Swagger 文檔
	@echo "📚 生成 Swagger 文檔..."
	@if ! command -v $(GOPATH)/bin/swag >/dev/null 2>&1; then \
		echo "⚠️  swag 未安裝，正在安裝..."; \
		go install github.com/swaggo/swag/cmd/swag@latest; \
	fi
	@mkdir -p $(DOCS_DIR)
	@cd cmd/token-admin-api && $(GOPATH)/bin/swag init \
		-g main.go \
		-o internal/docs \
		--parseDependency \
		--parseInternal \
		--quiet
	@echo "✅ Swagger 文檔已生成至 $(DOCS_DIR)"

# ==================== 執行指令 ====================

.PHONY: run-token-admin-api
run-token-admin-api: ## 使用 air 執行 token-admin-api
	@echo "📚 檢查 swagger 文檔..."
	@if [ ! -d "$(DOCS_DIR)" ]; then \
		echo "⚠️  swagger 文檔不存在，正在生成..."; \
		$(MAKE) build-token-admin-swagger; \
	fi
	@echo "🔥 使用 air 啟動 token-admin-api..."
	@if ! command -v $(GOPATH)/bin/air >/dev/null 2>&1; then \
		echo "⚠️  air 未安裝，正在安裝..."; \
		go install github.com/air-verse/air@latest; \
	fi
	@cd cmd/token-admin-api && $(GOPATH)/bin/air
