package server

import (
	"go-playground/internal/database/models"
	"go-playground/openapi"
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Add your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type", "Origin"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true, // Enable cookies/auth
	}))

	// r.Use(cors.Default())

	r.GET("/health", s.healthHandler)

	api := r.Group("/api/v1")
	{
		api.GET("/health", s.healthHandler)
		authors := api.Group("/authors")
		{
			authors.GET("", s.listAuthorsHandler)
			authors.POST("", s.createAuthorHandler)
			authors.GET("/:id", s.getAuthorHandler)
		}

		books := api.Group("/books")
		{
			books.POST("", s.createBookHandler)
		}
	}

	openapi.RegisterOpenApiRoute(r)

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
// @Param limit query int false "Limit"
// @Param offset query int false "Offset"
// @Success 200 {array} ListAuthorResponse
// @Failure 500 {string} string
// @Router /authors [get]
func (s *Server) listAuthorsHandler(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit format"})
		return
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset format"})
		return
	}

	var authors []models.Author
	if err := s.db.List(&authors, limit, offset); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []ListAuthorResponse
	for _, author := range authors {
		response = append(response, ListAuthorResponse{
			ID:        author.ID,
			FirstName: author.FirstName,
			LastName:  author.LastName,
		})
	}

	c.JSON(http.StatusOK, response)
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

	if err := s.db.Create(&author); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, author)
}

// Authors
// @Summary Get author
// @Description Get author by ID
// @Tags authors
// @Produce json
// @Param id path int true "Author ID"
// @Success 200 {object} models.Author
// @Failure 404 {object} string
// @Failure 500 {object} string
// @Router /authors/{id} [get]
func (s *Server) getAuthorHandler(c *gin.Context) {
	idStr := c.Param("id")
	id64, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	author, err := s.db.GetAuthor(uint(id64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, author)
}

// Books
// @Summary Create book
// @Description Create a new book with a valid author
// @Tags books
// @Accept json
// @Produce json
// @Param book body CreateBookInput true "Book input object"
// @Success 201 {object} models.Book
// @Failure 400 {object} string "Invalid request or missing author"
// @Failure 404 {object} string "Author not found"
// @Failure 500 {object} string "Server error"
// @Router /books [post]
func (s *Server) createBookHandler(c *gin.Context) {
	var input CreateBookInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate that the book has an author
	if input.AuthorID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Book must have an author"})
		return
	}

	// Verify the author exists
	var author models.Author
	if err := s.db.Read(&author, input.AuthorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if author.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Author not found"})
		return
	}

	// Convert input to model and create the book
	book := input.ToModel()
	if err := s.db.Create(&book); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, book)
}
