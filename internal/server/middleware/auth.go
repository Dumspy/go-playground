package middleware

import (
	"go-playground/internal/server/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware is a middleware that checks for a valid JWT token in the request header
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// Check if the header has the Bearer prefix
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(401, gin.H{"error": "Authorization header format must be Bearer {token}"})
			c.Abort()
			return
		}

		// Safely extract the token
		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == "" {
			c.JSON(401, gin.H{"error": "Token is required"})
			c.Abort()
			return
		}

		// Validate the token (this is a placeholder, implement your own validation logic)
		claims, err := utils.ValidateJWT(token)
		if err != nil {
			c.JSON(401, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("user", claims)

		c.Next()
	}
}
