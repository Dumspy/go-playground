package api

import (
	"go-playground/internal/api/middleware"
	"go-playground/internal/api/types"
	"go-playground/internal/database/models"
	"go-playground/openapi"
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var APIv1 *gin.RouterGroup

func (s *Server) StartServer() http.Handler {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Add your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type", "Origin"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true, // Enable cookies/auth
	}))

	APIv1 = r.Group("/api/v1")

	s.RegisterRoutes()
	openapi.RegisterOpenApiRoute(r)

	return r
}

func (s *Server) RegisterRoutes() {
	APIv1.GET("/health", s.healthHandler)

	APIv1 = APIv1.Group("/api/v1")

	APIv1.GET("/health", s.healthHandler)
	s.RegisterAdminRoutes(APIv1)

	authors := APIv1.Group("/authors")
	{
		authors.GET("", s.listAuthorsHandler)
		authors.GET("/:id", s.getAuthorHandler)
	}

	books := APIv1.Group("/books")
	{
		books.GET("", s.listBooksHandler)
		books.GET("/:id", s.getBookHandler)
	}

	artists := APIv1.Group("/artists")
	{
		artists.GET("", s.ListArtistsHandler)
		artists.GET("/:id", s.GetArtistHandler)
	}

	auth := APIv1.Group("/auth")
	{
		RegisterAuthRoutes(auth)
	}

	admin := APIv1.Group("/admin")
	admin.Use(middleware.AuthMiddleware())
	{
	}
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
// @Success 200 {array} types.ListAuthorResponse
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

	var response []types.ListAuthorResponse
	for _, author := range authors {
		response = append(response, types.ListAuthorResponse{
			ID:        author.ID,
			FirstName: author.FirstName,
			LastName:  author.LastName,
		})
	}

	c.JSON(http.StatusOK, response)
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
// @Summary List books
// @Description List all books
// @Tags books
// @Produce json
// @Param limit query int false "Limit"
// @Param offset query int false "Offset"
// @Success 200 {array} types.ListBookResponse
// @Failure 500 {string} string
// @Router /books [get]
func (s *Server) listBooksHandler(c *gin.Context) {
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

	books, err := s.db.ListBooks(limit, offset)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []types.ListBookResponse
	for _, book := range books {
		response = append(response, types.ListBookResponse{
			ID:            book.ID,
			Title:         book.Title,
			DigitalOnly:   book.DigitalOnly,
			PublishedDate: book.PublishedDate.Format("2006-01-02"),
			Author:        types.ListAuthorResponse{ID: book.Author.ID, FirstName: book.Author.FirstName, LastName: book.Author.LastName},
			Cover:         types.ListCoverResponse{ID: book.Cover.ID, ImageURL: book.Cover.ImageURL.String},
		})
	}

	c.JSON(http.StatusOK, response)
}

// Books
// @Summary Get book
// @Description Get book by ID
// @Tags books
// @Produce json
// @Param id path int true "Book ID"
// @Success 200 {object} models.Book
// @Failure 404 {object} string
// @Failure 500 {object} string
// @Router /books/{id} [get]
func (s *Server) getBookHandler(c *gin.Context) {
	idStr := c.Param("id")
	id64, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	book, err := s.db.GetBook(uint(id64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, book)
}

// Artists
// @Summary List artists
// @Description List all artists
// @Tags artists
// @Produce json
// @Param limit query int false "Limit"
// @Param offset query int false "Offset"
// @Success 200 {array} types.ListArtistResponse
// @Failure 500 {string} string
// @Router /artists [get]
func (s *Server) ListArtistsHandler(c *gin.Context) {
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

	var artists []models.Artist
	if err := s.db.List(&artists, limit, offset); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []types.ListArtistResponse
	for _, author := range artists {
		response = append(response, types.ListArtistResponse{
			ID:        author.ID,
			FirstName: author.FirstName,
			LastName:  author.LastName,
		})
	}

	c.JSON(http.StatusOK, response)
}

// Artists
// @Summary Get artist
// @Description Get artist by ID
// @Tags artists
// @Produce json
// @Param id path int true "Artist ID"
// @Success 200 {object} models.Artist
// @Failure 404 {object} string
// @Failure 500 {object} string
// @Router /artists/{id} [get]
func (s *Server) GetArtistHandler(c *gin.Context) {
	idStr := c.Param("id")
	id64, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	author, err := s.db.GetArtist(uint(id64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, author)
}
