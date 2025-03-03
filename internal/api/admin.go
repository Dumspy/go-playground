package api

import (
	"go-playground/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterAdminRoutes(router *gin.RouterGroup) {
	// Register admin routes
	admin := router.Group("/admin")
	admin.Use(middleware.AuthMiddleware())

	s.RegisterCoversAdminRoutes(admin)
	s.RegisterBooksAdminRoutes(admin)
	s.RegisterArtistAdminRoutes(admin)
	s.RegisterAuthorAdminRoutes(admin)
}
