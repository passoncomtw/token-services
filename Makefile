# ==================== 變數定義 ====================
GOPATH := $(shell go env GOPATH)
DOCS_DIR := cmd/token-admin-api/internal/docs

# ==================== 執行指令 ====================

.PHONY: run-token-admin-api
run-token-admin-api: ## 使用 air 執行 token-admin-api
	@echo "📚 檢查 swagger 文檔..."
	@if [ ! -d "$(DOCS_DIR)" ]; then \
		echo "⚠️  swagger 文檔不存在，正在生成..."; \
		if ! command -v $(GOPATH)/bin/swag >/dev/null 2>&1; then \
			echo "⚠️  swag 未安裝，正在安裝..."; \
			go install github.com/swaggo/swag/cmd/swag@latest; \
		fi; \
		mkdir -p $(DOCS_DIR); \
		$(GOPATH)/bin/swag init -g cmd/token-admin-api/main.go -o ./$(DOCS_DIR) --parseDependency --parseInternal; \
	fi
	@echo "🔥 使用 air 啟動 token-admin-api..."
	@if ! command -v $(GOPATH)/bin/air >/dev/null 2>&1; then \
		echo "⚠️  air 未安裝，正在安裝..."; \
		go install github.com/air-verse/air@latest; \
	fi
	$(GOPATH)/bin/air
