package response

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

type APIResponse struct {
	Success   bool        `json:"success"`
	Data      any         `json:"data,omitempty"`
	Error     *APIError   `json:"error,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

func JSON(c *fiber.Ctx, statusCode int, data any) error {
	return c.Status(statusCode).JSON(APIResponse{
		Success:   true,
		Data:      data,
		Timestamp: time.Now(),
	})
}

func Error(c *fiber.Ctx, statusCode int, code string, message string, details ...any) error {
	var detailData any
	if len(details) > 0 {
		detailData = details[0]
	}

	return c.Status(statusCode).JSON(APIResponse{
		Success: false,
		Error: &APIError{
			Code:    code,
			Message: message,
			Details: detailData,
		},
		Timestamp: time.Now(),
	})
}
