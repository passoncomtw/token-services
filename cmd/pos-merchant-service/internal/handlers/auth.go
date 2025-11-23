package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"passontw-backend-services/cmd/pos-merchant-service/internal/config"
	"passontw-backend-services/cmd/pos-merchant-service/internal/models"
	"passontw-backend-services/cmd/pos-merchant-service/internal/utils"
)

// LoginRequest 登入請求
type LoginRequest struct {
	Pin string `json:"pin" binding:"required" example:"1234"` // 設定範例值
}

// ChangePinRequest 修改 PIN 請求
type ChangePinRequest struct {
	OldPin string `json:"old_pin" binding:"required" example:"1234"`
	NewPin string `json:"new_pin" binding:"required,min=4,max=8" example:"5678"`
}

// UserInfo 用戶資訊
type UserInfo struct {
	UserID     string `json:"user_id"`
	MerchantID string `json:"merchant_id"`
	Username   string `json:"username"`
	Email      string `json:"email"`
}

// LoginSuccessData 登入成功數據
type LoginSuccessData struct {
	Token string   `json:"token"`
	User  UserInfo `json:"user"`
}

// LoginHandler 處理登入請求
// @Summary 用戶登入
// @Description 使用 PIN 碼登入系統
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "登入資訊"
// @Success 200 {object} utils.SuccessResponse{data=LoginSuccessData} "登入成功"
// @Failure 400 {object} utils.ErrorResponse "請求格式錯誤"
// @Failure 401 {object} utils.ErrorResponse "PIN 錯誤"
// @Failure 429 {object} utils.ErrorResponse "請求過於頻繁"
// @Failure 500 {object} utils.ErrorResponse "系統錯誤"
// @Router /api/v1/auth/login [post]
func LoginHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			// 記錄無效請求的日誌
			logLoginAttempt(db, c, "", "", "failed", "invalid_request")
			utils.RespondWithError(c, utils.ErrInvalidRequest)
			return
		}

		cfg, err := config.LoadConfig()
		if err != nil {
			// 記錄設定載入失敗的日誌
			logLoginAttempt(db, c, "", "", "failed", "config_error")
			utils.RespondWithError(c, utils.WrapConfigError(err))
			return
		}

	user, err := models.FindActiveUserByPin(db, req.Pin)
	if err != nil {
		// 記錄 PIN 錯誤的日誌
		logLoginAttempt(db, c, "", "", "failed", "invalid_pin")
		utils.RespondWithError(c, utils.ErrInvalidPIN)
		return
	}

		jwtSecret := cfg.GetJWTSecret()
		token, err := utils.GenerateToken(jwtSecret, user.UserID, user.MerchantID, user.Username, user.Email)
		if err != nil {
			// 記錄 Token 生成失敗的日誌
			logLoginAttempt(db, c, user.UserID, user.MerchantID, "failed", "token_generation_error")
			utils.RespondWithError(c, utils.WrapInternalError(err))
			return
		}

		// 記錄成功登入的日誌
		logLoginAttempt(db, c, user.UserID, user.MerchantID, "success", "")

		// 回應成功登入
		responseData := LoginSuccessData{
			Token: token,
			User: UserInfo{
				UserID:     user.UserID,
				MerchantID: user.MerchantID,
				Username:   user.Username,
				Email:      user.Email,
			},
		}

		utils.RespondWithSuccess(c, "登入成功", responseData)
	}
}

// LogoutHandler 處理登出請求
// @Summary 用戶登出
// @Tags Auth
// @Accept json
// @Produce json
// @Success 200 {object} utils.SuccessResponse "登出成功"
// @Failure 401 {object} utils.ErrorResponse "未授權"
// @Security BearerAuth
// @Router /api/v1/auth/logout [post]
func LogoutHandler(c *gin.Context) {
	utils.RespondWithSuccess(c, "登出成功", nil)
}

// ChangePinHandler 處理修改 PIN 請求
// @Summary 修改用戶 PIN
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body ChangePinRequest true "修改 PIN 資訊"
// @Success 200 {object} utils.SuccessResponse "PIN 修改成功"
// @Failure 400 {object} utils.ErrorResponse "請求格式錯誤"
// @Failure 401 {object} utils.ErrorResponse "未授權或舊 PIN 錯誤"
// @Security BearerAuth
// @Router /api/v1/auth/change-pin [post]
func ChangePinHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req ChangePinRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			pinLengthErr := utils.NewAPIError(
				utils.ErrorCodeInvalidPINLength,
				"PIN 長度需在 4-8 位之間",
				http.StatusBadRequest,
				err,
			)
			utils.RespondWithError(c, pinLengthErr)
			return
		}

		// 從中間件獲取用戶信息
		claims, exists := c.Get("user_claims")
		if !exists {
			utils.RespondWithError(c, utils.ErrUnauthorized)
			return
		}

		customClaims, ok := claims.(*utils.CustomClaims)
		if !ok {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		// 驗證舊 PIN
		user, err := models.FindActiveUserByPin(db, req.OldPin)
		if err != nil || user.UserID != customClaims.UserID {
			utils.RespondWithError(c, utils.ErrInvalidPIN)
			return
		}

		// 檢查新舊 PIN 是否相同
		if req.OldPin == req.NewPin {
			sameErr := utils.NewAPIError(
				utils.ErrorCodePINSameAsOld,
				"新 PIN 不能與舊 PIN 相同",
				http.StatusBadRequest,
				nil,
			)
			utils.RespondWithError(c, sameErr)
			return
		}

		// 加密新 PIN
		newPinHash, err := utils.HashPin(req.NewPin)
		if err != nil {
			cryptoErr := utils.NewAPIError(
				utils.ErrorCodeCryptoError,
				"PIN 加密失敗",
				http.StatusInternalServerError,
				err,
			)
			utils.RespondWithError(c, cryptoErr)
			return
		}

		// 更新資料庫中的 PIN
		if err := models.UpdateUserPin(db, user.UserID, newPinHash); err != nil {
			utils.RespondWithError(c, utils.WrapDatabaseError(err))
			return
		}

		// 記錄 PIN 修改日誌
		logPinChangeAttempt(db, c, user.UserID, user.MerchantID, "success")

		utils.RespondWithSuccess(c, "PIN 修改成功", nil)
	}
}

// logLoginAttempt 記錄登入嘗試的輔助函數
func logLoginAttempt(db *gorm.DB, c *gin.Context, userID, merchantID, status, failureReason string) {
	var merchantIDPtr, userIDPtr, failureReasonPtr *string

	if merchantID != "" {
		merchantIDPtr = &merchantID
	}
	if userID != "" {
		userIDPtr = &userID
	}
	if failureReason != "" {
		failureReasonPtr = &failureReason
	}

	// 嘗試從 user_claims 獲取 username，如果沒有則使用空字符串
	username := ""
	if claims, exists := c.Get("user_claims"); exists {
		if customClaims, ok := claims.(*utils.CustomClaims); ok {
			username = customClaims.Username
		}
	}

	logReq := models.LoginLogRequest{
		MerchantID:    merchantIDPtr,
		UserID:        userIDPtr,
		Username:      username,
		ClientIP:      c.ClientIP(),
		UserAgent:     c.GetHeader("User-Agent"),
		LoginStatus:   status,
		FailureReason: failureReasonPtr,
	}

	// 異步記錄日誌，避免影響登入性能
	go func() {
		if err := models.CreateLoginLog(db, logReq); err != nil {
			// 這裡可以使用日誌記錄錯誤，但不影響主要登入流程
			// 可以考慮使用 zap logger
		}
	}()
}

// logPinChangeAttempt 記錄 PIN 修改嘗試的輔助函數
func logPinChangeAttempt(db *gorm.DB, c *gin.Context, userID, merchantID, status string) {
	var merchantIDPtr, userIDPtr *string

	if merchantID != "" {
		merchantIDPtr = &merchantID
	}
	if userID != "" {
		userIDPtr = &userID
	}

	username := ""
	if claims, exists := c.Get("user_claims"); exists {
		if customClaims, ok := claims.(*utils.CustomClaims); ok {
			username = customClaims.Username
		}
	}

	// 使用特殊的日誌狀態來標記這是 PIN 修改而非登入
	logReq := models.LoginLogRequest{
		MerchantID:    merchantIDPtr,
		UserID:        userIDPtr,
		Username:      username + "_pin_change",
		ClientIP:      c.ClientIP(),
		UserAgent:     c.GetHeader("User-Agent"),
		LoginStatus:   status,
		FailureReason: nil,
	}

	// 異步記錄日誌
	go func() {
		if err := models.CreateLoginLog(db, logReq); err != nil {
			// 靜默處理錯誤
		}
	}()
}

// MerchantInfoData 商家資訊回應資料
type MerchantInfoData struct {
	MerchantID   string `json:"merchant_id"`
	MerchantName string `json:"merchant_name"`
	Address      string `json:"address"`
	Phone        string `json:"phone"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

// GetMerchantInfoHandler 處理商家資訊查詢請求
// @Summary 查詢商家資訊
// @Description 查詢當前商家的基本資訊
// @Tags Merchant
// @Accept json
// @Produce json
// @Success 200 {object} utils.SuccessResponse{data=MerchantInfoData} "查詢成功"
// @Failure 401 {object} utils.ErrorResponse "無效的授權令牌"
// @Failure 404 {object} utils.ErrorResponse "商家資訊不存在"
// @Failure 500 {object} utils.ErrorResponse "系統錯誤"
// @Security BearerAuth
// @Router /api/merchant/info [get]
func GetMerchantInfoHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 從中間件獲取用戶信息
		claims, exists := c.Get("user_claims")
		if !exists {
			utils.RespondWithError(c, utils.ErrUnauthorized)
			return
		}

		customClaims, ok := claims.(*utils.CustomClaims)
		if !ok {
			utils.RespondWithError(c, utils.ErrInvalidToken)
			return
		}

		// 查詢商家資訊
		merchant, err := models.GetMerchantByID(db, customClaims.MerchantID)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				// 商家不存在
				merchantNotFoundErr := utils.NewAPIError(
					utils.ErrorCodeMerchantNotFound,
					"商家資訊不存在",
					http.StatusNotFound,
					err,
				)
				utils.RespondWithError(c, merchantNotFoundErr)
				return
			}
			// 其他資料庫錯誤
			utils.RespondWithError(c, utils.WrapDatabaseError(err))
			return
		}

		// 構建回應資料
		responseData := MerchantInfoData{
			MerchantID:   merchant.MerchantID,
			MerchantName: merchant.MerchantName,
			Address:      merchant.Address,
			Phone:        merchant.Phone,
			CreatedAt:    merchant.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:    merchant.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		}

		utils.RespondWithSuccess(c, "查詢成功", responseData)
	}
}
