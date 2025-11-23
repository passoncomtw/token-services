package services

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"passontw-backend-services/cmd/pos-backend-service/internal/models"
)

/**
 * @brief MerchantService interface for business logic
 */
type MerchantService interface {
	ListMerchants(ctx context.Context, page, limit int, search string) ([]models.Merchant, int, error)
}

type merchantService struct {
	DB *sql.DB
}

func NewMerchantService(db *sql.DB) MerchantService {
	return &merchantService{DB: db}
}

/**
 * @brief List merchants with pagination and search
 * @param ctx context
 * @param page page number
 * @param limit items per page
 * @param search search keyword
 * @return merchants, total count, error
 */
func (s *merchantService) ListMerchants(ctx context.Context, page, limit int, search string) ([]models.Merchant, int, error) {
	offset := (page - 1) * limit
	var args []interface{}
	var where []string

	query := `SELECT merchant_id, merchant_name, status, created_at, updated_at FROM merchants`
	countQuery := `SELECT COUNT(*) FROM merchants`

	if search != "" {
		where = append(where, "merchant_name ILIKE ?")
		args = append(args, "%"+search+"%")
	}

	if len(where) > 0 {
		cond := " WHERE " + strings.Join(where, " AND ")
		query += cond
		countQuery += cond
	}

	query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)

	// 查詢總數
	var total int
	err := s.DB.QueryRowContext(ctx, countQuery, args[:len(args)-2]...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count error: %w", err)
	}

	// 查詢分頁資料
	rows, err := s.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

	var merchants []models.Merchant
	for rows.Next() {
		var m models.Merchant
		if err := rows.Scan(&m.MerchantID, &m.MerchantName, &m.Status, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan error: %w", err)
		}
		merchants = append(merchants, m)
	}
	return merchants, total, nil
}
