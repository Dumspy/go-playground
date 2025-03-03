package api

import (
	"go-playground/internal/database/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// BookDTO is used for both create and update operations
// Using pointers for fields allows us to distinguish between zero values and not provided values
type BookDTO struct {
	ID            *uint      `json:"id" binding:"-"` // Added ID field for validation purposes
	Title         *string    `json:"title" binding:"required_without=ID"`
	PublishedDate *time.Time `json:"published_date" binding:"required_without=ID"`
	Pages         *uint      `json:"pages" binding:"required_without=ID"`
	Description   *string    `json:"description" binding:"required_without=ID"`
	DigitalOnly   *bool      `json:"digital_only" binding:"required_without=ID"`
	ISBN          *string    `json:"isbn" binding:"required_without=ID"`
	Price         *float32   `json:"price" binding:"required_without=ID"`
	AuthorID      *uint      `json:"author_id" binding:"required_without=ID"`
}

// ApplyToModel applies the DTO data to a model instance
func (dto *BookDTO) ApplyToModel(book *models.Book) {
	if dto.Title != nil {
		book.Title = *dto.Title
	}
	if dto.PublishedDate != nil {
		book.PublishedDate = *dto.PublishedDate
	}
	if dto.Pages != nil {
		book.Pages = *dto.Pages
	}
	if dto.Description != nil {
		book.Description = *dto.Description
	}
	if dto.ISBN != nil {
		book.ISBN = *dto.ISBN
	}
	if dto.Price != nil {
		book.Price = *dto.Price
	}
	if dto.DigitalOnly != nil {
		book.DigitalOnly = *dto.DigitalOnly
	}
	if dto.AuthorID != nil {
		book.AuthorID = *dto.AuthorID
	}
}

// ToModel creates a new model from the DTO
func (dto *BookDTO) ToModel() models.Book {
	book := models.Book{}
	dto.ApplyToModel(&book)
	return book
}

// Register routes for the books module
func (s *Server) RegisterBooksAdminRoutes(r *gin.RouterGroup) {
	r.GET("", s.listBooksAdminHandler)
	r.POST("", s.createBookHandler)
	r.DELETE("/:id", s.deleteBookHandler)
	r.PATCH("/:id", s.updateBookHandler)
}

// @Summary List books
// @Description Get a list of all books with pagination
// @Tags books admin
// @Produce json
// @Param limit query int false "Limit number of books returned"
// @Param offset query int false "Offset for pagination"
// @Success 200 {array} models.Book
// @Router /admin/books [get]
// @Authorize Bearer
func (s *Server) listBooksAdminHandler(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	var books []models.Book
	s.db.List(&books, limit, offset)

	c.JSON(http.StatusOK, books)
}

// @Summary Create book
// @Description Create a new book
// @Tags books admin
// @Accept json
// @Produce json
// @Param book body BookDTO true "Book to create"
// @Success 201 {object} models.Book
// @Failure 400 {string} string
// @Router /admin/books [post]
// @Authorize Bearer
func (s *Server) createBookHandler(c *gin.Context) {
	var inputDTO BookDTO
	if err := c.ShouldBindJSON(&inputDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	book := inputDTO.ToModel()
	s.db.Create(&book)
	c.JSON(http.StatusCreated, book)
}

// @Summary Delete book
// @Description Delete a book by ID
// @Tags books admin
// @Produce json
// @Param id path int true "Book ID"
// @Success 204
// @Failure 404 {string} string
// @Router /admin/books/{id} [delete]
// @Authorize Bearer
func (s *Server) deleteBookHandler(c *gin.Context) {
	id, err := GetIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var book models.Book
	if err := s.db.Read(&book, uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	s.db.Delete(&book, uint(id))
	c.JSON(http.StatusNoContent, nil)
}

// @Summary Update book
// @Description Update a book by ID
// @Tags books admin
// @Accept json
// @Produce json
// @Param id path int true "Book ID"
// @Param book body BookDTO true "Book fields to update"
// @Success 200 {object} models.Book
// @Failure 400 {string} string
// @Failure 404 {string} string
// @Router /admin/books/{id} [patch]
// @Authorize Bearer
func (s *Server) updateBookHandler(c *gin.Context) {
	id, err := GetIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var book models.Book
	if err := s.db.Read(&book, uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	var updateDTO BookDTO
	// Set the ID to enable partial updates through the required_without=ID validation
	updateDTO.ID = &id

	if err := c.ShouldBindJSON(&updateDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateDTO.ApplyToModel(&book)
	s.db.Update(&book)
	c.JSON(http.StatusOK, book)
}
