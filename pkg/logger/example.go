package logger

import (
	"errors"
	"time"

	"go.uber.org/zap"
)

// ExampleUsage 展示如何使用 Logger
func ExampleUsage() {
	// 創建 Development 模式的 logger
	devLogger := New(&Config{
		Level: DebugLevel,
		Mode:  DevelopmentMode,
	})

	// 1. 基本日誌輸出
	devLogger.Debug("This is a debug message")
	devLogger.Info("Application started")
	devLogger.Warn("This is a warning")
	devLogger.Error("This is an error")

	// 2. 結構化日誌（推薦）
	devLogger.Info("User logged in",
		zap.String("userId", "12345"),
		zap.String("username", "john"),
		zap.String("ip", "192.168.1.1"),
		zap.Time("loginTime", time.Now()),
	)

	// 3. 格式化日誌
	username := "Alice"
	age := 25
	devLogger.Infof("User %s is %d years old", username, age)

	// 4. 錯誤日誌
	err := errors.New("database connection failed")
	devLogger.Error("Failed to connect to database",
		zap.Error(err),
		zap.String("host", "localhost"),
		zap.Int("port", 5432),
		zap.Duration("timeout", 5*time.Second),
	)

	// 5. 使用 With 創建子 logger
	requestLogger := devLogger.With(
		zap.String("requestId", "abc-123"),
		zap.String("method", "POST"),
		zap.String("path", "/api/users"),
	)

	// 子 logger 會自動帶上這些欄位
	requestLogger.Info("Processing request")
	requestLogger.Info("Request completed",
		zap.Int("statusCode", 200),
		zap.Duration("duration", 50*time.Millisecond),
	)

	// 6. 記錄複雜對象
	user := map[string]interface{}{
		"id":    123,
		"name":  "Bob",
		"email": "bob@example.com",
		"roles": []string{"admin", "user"},
	}
	devLogger.Info("User details", zap.Any("user", user))

	// 7. 記錄數組
	tags := []string{"golang", "logging", "zap"}
	devLogger.Info("Tags", zap.Strings("tags", tags))

	numbers := []int{1, 2, 3, 4, 5}
	devLogger.Info("Numbers", zap.Ints("numbers", numbers))

	// 8. Production 模式的 logger
	prodLogger := New(&Config{
		Level: InfoLevel,
		Mode:  ProductionMode,
	})

	prodLogger.Info("Production log in JSON format",
		zap.String("environment", "production"),
		zap.String("version", "1.0.0"),
	)

	// 確保所有日誌都被寫入
	_ = devLogger.Sync()
	_ = prodLogger.Sync()
}

// ExampleServiceUsage 展示在服務中如何使用
func ExampleServiceUsage() {
	logger := New(&Config{
		Level: InfoLevel,
		Mode:  DevelopmentMode,
	})

	// 為服務創建專屬的 logger
	serviceLogger := logger.With(
		zap.String("service", "UserService"),
		zap.String("component", "backend"),
	)

	// 模擬服務操作
	serviceLogger.Info("Starting user creation process")

	// 模擬業務邏輯
	userId := 12345
	serviceLogger.Info("Validating user data",
		zap.Int("userId", userId),
	)

	// 模擬錯誤場景
	err := errors.New("email already exists")
	if err != nil {
		serviceLogger.Error("User creation failed",
			zap.Error(err),
			zap.Int("userId", userId),
			zap.String("email", "user@example.com"),
		)
		return
	}

	serviceLogger.Info("User created successfully",
		zap.Int("userId", userId),
	)

	_ = serviceLogger.Sync()
}

// ExampleHTTPHandlerUsage 展示在 HTTP Handler 中如何使用
func ExampleHTTPHandlerUsage() {
	logger := New(&Config{
		Level: DebugLevel,
		Mode:  DevelopmentMode,
	})

	// 模擬 HTTP 請求
	requestId := "req-abc-123"
	method := "POST"
	path := "/api/v1/users"
	clientIP := "192.168.1.100"

	// 為每個請求創建帶上下文的 logger
	reqLogger := logger.With(
		zap.String("requestId", requestId),
		zap.String("method", method),
		zap.String("path", path),
		zap.String("clientIP", clientIP),
	)

	// 記錄請求開始
	start := time.Now()
	reqLogger.Info("Request received")

	// 記錄請求體驗證
	reqLogger.Debug("Validating request body")

	// 模擬處理邏輯
	time.Sleep(10 * time.Millisecond)

	// 記錄請求完成
	duration := time.Since(start)
	reqLogger.Info("Request completed",
		zap.Int("statusCode", 201),
		zap.Duration("duration", duration),
		zap.Int64("responseSize", 256),
	)

	_ = reqLogger.Sync()
}

// ExamplePerformanceTips 展示性能最佳實踐
func ExamplePerformanceTips() {
	logger := New(&Config{
		Level: InfoLevel,
		Mode:  ProductionMode,
	})

	// ✅ 推薦：使用結構化日誌（零分配）
	logger.Info("User action",
		zap.String("action", "login"),
		zap.Int("userId", 123),
	)

	// ❌ 避免：字串拼接
	// logger.Info(fmt.Sprintf("User %d performed action: %s", 123, "login"))

	// ✅ 推薦：批量處理時只記錄總結
	items := make([]int, 1000)
	logger.Info("Processing batch", zap.Int("count", len(items)))
	for _, item := range items {
		_ = item // process item
	}
	logger.Info("Batch processed", zap.Int("count", len(items)))

	// ❌ 避免：在循環中記錄每個項目
	// for _, item := range items {
	//     logger.Debug("Processing item", zap.Int("item", item))
	// }

	_ = logger.Sync()
}

