package api

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetIDParam extracts and validates the 'id' parameter from the request URL.
// It returns the ID as uint and an error if the ID is invalid.
func GetIDParam(c *gin.Context) (uint, error) {
	idStr := c.Param("id")
	if idStr == "" {
		return 0, errors.New("missing id parameter")
	}

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return 0, errors.New("invalid id format: must be a postive number")
	}

	return uint(id), nil
}
