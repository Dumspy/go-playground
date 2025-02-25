package server

import (
	"go-playground/internal/database/models"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	docs "go-playground/docs"

	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Add your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true, // Enable cookies/auth
	}))

	r.GET("/health", s.healthHandler)

	docs.SwaggerInfo.BasePath = "/api/v1"
	api := r.Group("/api/v1")
	{
		api.Group("/authors")
		{
			api.GET("/", s.listAuthorsHandler)
			api.POST("/", s.createAuthorHandler)
		}
	}

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	return r
}

func (s *Server) healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, s.db.Health())
}

// Authors
// @Summary List authors
// @Description List all authors
// @Tags authors
// @Produce json
// @Success 200 {array} models.Author
// @Failure 500 {string} string
// @Router /authors [get]
func (s *Server) listAuthorsHandler(c *gin.Context) {
	authors, err := s.db.List(models.Author{}, 0, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, authors)
}

// Authors
// @Summary Create author
// @Description Create a new author
// @Tags authors
// @Accept json
// @Produce json
// @Param author body models.Author true "Author object"
// @Success 201 {object} models.Author
// @Failure 400 {object} string
// @Failure 500 {object} string
// @Router /authors [post]
func (s *Server) createAuthorHandler(c *gin.Context) {
	var author models.Author
	if err := c.ShouldBindJSON(&author); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := s.db.Create(author); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, author)
}
