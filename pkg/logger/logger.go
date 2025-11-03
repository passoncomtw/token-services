package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger 日誌接口
type Logger interface {
	Debug(msg string, fields ...zap.Field)
	Info(msg string, fields ...zap.Field)
	Warn(msg string, fields ...zap.Field)
	Error(msg string, fields ...zap.Field)
	Fatal(msg string, fields ...zap.Field)
	
	Debugf(template string, args ...interface{})
	Infof(template string, args ...interface{})
	Warnf(template string, args ...interface{})
	Errorf(template string, args ...interface{})
	Fatalf(template string, args ...interface{})
	
	With(fields ...zap.Field) Logger
	Sync() error
}

// ZapLogger Zap 日誌實現
type ZapLogger struct {
	logger *zap.Logger
	sugar  *zap.SugaredLogger
}

// LogLevel 日誌級別
type LogLevel string

const (
	DebugLevel LogLevel = "debug"
	InfoLevel  LogLevel = "info"
	WarnLevel  LogLevel = "warn"
	ErrorLevel LogLevel = "error"
	FatalLevel LogLevel = "fatal"
)

// LogMode 日誌模式
type LogMode string

const (
	DevelopmentMode LogMode = "development"
	ProductionMode  LogMode = "production"
)

// Config 日誌配置
type Config struct {
	Level LogLevel // 日誌級別
	Mode  LogMode  // 日誌模式（development/production）
}

/**
 * @brief 解析日誌級別字串
 * @param level 日誌級別字串
 * @return zapcore.Level
 */
func parseLogLevel(level LogLevel) zapcore.Level {
	switch level {
	case DebugLevel:
		return zapcore.DebugLevel
	case InfoLevel:
		return zapcore.InfoLevel
	case WarnLevel:
		return zapcore.WarnLevel
	case ErrorLevel:
		return zapcore.ErrorLevel
	case FatalLevel:
		return zapcore.FatalLevel
	default:
		return zapcore.InfoLevel
	}
}

/**
 * @brief 建立日誌編碼器配置
 * @param mode 日誌模式
 * @return zapcore.EncoderConfig
 */
func getEncoderConfig(mode LogMode) zapcore.EncoderConfig {
	if mode == DevelopmentMode {
		return zapcore.EncoderConfig{
			TimeKey:        "time",
			LevelKey:       "level",
			NameKey:        "logger",
			CallerKey:      "caller",
			FunctionKey:    zapcore.OmitKey,
			MessageKey:     "msg",
			StacktraceKey:  "stacktrace",
			LineEnding:     zapcore.DefaultLineEnding,
			EncodeLevel:    zapcore.CapitalColorLevelEncoder, // 彩色輸出
			EncodeTime:     zapcore.ISO8601TimeEncoder,
			EncodeDuration: zapcore.StringDurationEncoder,
			EncodeCaller:   zapcore.ShortCallerEncoder,
		}
	}

	// Production 模式
	return zapcore.EncoderConfig{
		TimeKey:        "ts",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		FunctionKey:    zapcore.OmitKey,
		MessageKey:     "msg",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.EpochTimeEncoder, // Unix timestamp
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}
}

/**
 * @brief 建立日誌編碼器
 * @param mode 日誌模式
 * @return zapcore.Encoder
 */
func getEncoder(mode LogMode) zapcore.Encoder {
	encoderConfig := getEncoderConfig(mode)
	
	if mode == DevelopmentMode {
		return zapcore.NewConsoleEncoder(encoderConfig)
	}
	
	// Production 使用 JSON 編碼器
	return zapcore.NewJSONEncoder(encoderConfig)
}

/**
 * @brief 建立新的日誌實例
 * @param cfg 日誌配置
 * @return Logger
 */
func New(cfg *Config) Logger {
	// 設定日誌級別
	level := parseLogLevel(cfg.Level)
	
	// 建立編碼器
	encoder := getEncoder(cfg.Mode)
	
	// 建立 WriteSyncer（輸出到 stdout）
	writeSyncer := zapcore.AddSync(os.Stdout)
	
	// 建立 Core
	core := zapcore.NewCore(
		encoder,
		writeSyncer,
		level,
	)
	
	// 建立 Logger
	var zapLogger *zap.Logger
	if cfg.Mode == DevelopmentMode {
		// Development 模式：顯示調用者、啟用 stacktrace
		zapLogger = zap.New(
			core,
			zap.AddCaller(),
			zap.AddCallerSkip(1),
			zap.AddStacktrace(zapcore.ErrorLevel),
			zap.Development(),
		)
	} else {
		// Production 模式：顯示調用者、只在 fatal 時顯示 stacktrace
		zapLogger = zap.New(
			core,
			zap.AddCaller(),
			zap.AddCallerSkip(1),
			zap.AddStacktrace(zapcore.FatalLevel),
		)
	}
	
	return &ZapLogger{
		logger: zapLogger,
		sugar:  zapLogger.Sugar(),
	}
}

// Debug 輸出 Debug 級別日誌
func (l *ZapLogger) Debug(msg string, fields ...zap.Field) {
	l.logger.Debug(msg, fields...)
}

// Info 輸出 Info 級別日誌
func (l *ZapLogger) Info(msg string, fields ...zap.Field) {
	l.logger.Info(msg, fields...)
}

// Warn 輸出 Warn 級別日誌
func (l *ZapLogger) Warn(msg string, fields ...zap.Field) {
	l.logger.Warn(msg, fields...)
}

// Error 輸出 Error 級別日誌
func (l *ZapLogger) Error(msg string, fields ...zap.Field) {
	l.logger.Error(msg, fields...)
}

// Fatal 輸出 Fatal 級別日誌並退出程式
func (l *ZapLogger) Fatal(msg string, fields ...zap.Field) {
	l.logger.Fatal(msg, fields...)
}

// Debugf 使用格式化字串輸出 Debug 日誌
func (l *ZapLogger) Debugf(template string, args ...interface{}) {
	l.sugar.Debugf(template, args...)
}

// Infof 使用格式化字串輸出 Info 日誌
func (l *ZapLogger) Infof(template string, args ...interface{}) {
	l.sugar.Infof(template, args...)
}

// Warnf 使用格式化字串輸出 Warn 日誌
func (l *ZapLogger) Warnf(template string, args ...interface{}) {
	l.sugar.Warnf(template, args...)
}

// Errorf 使用格式化字串輸出 Error 日誌
func (l *ZapLogger) Errorf(template string, args ...interface{}) {
	l.sugar.Errorf(template, args...)
}

// Fatalf 使用格式化字串輸出 Fatal 日誌並退出程式
func (l *ZapLogger) Fatalf(template string, args ...interface{}) {
	l.sugar.Fatalf(template, args...)
}

// With 建立帶有額外欄位的子 logger
func (l *ZapLogger) With(fields ...zap.Field) Logger {
	return &ZapLogger{
		logger: l.logger.With(fields...),
		sugar:  l.logger.With(fields...).Sugar(),
	}
}

// Sync 同步緩衝區（程式退出前應該呼叫）
func (l *ZapLogger) Sync() error {
	return l.logger.Sync()
}

