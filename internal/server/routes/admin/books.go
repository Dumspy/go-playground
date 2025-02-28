package admin

import (
	"go-playground/internal/database"
	"go-playground/internal/database/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// BooksController handles book-related routes
type BooksController struct {
	db database.Service
}

// Register routes for the books module
func RegisterBookRoutes(r *gin.RouterGroup) {
	controller := &BooksController{
		db: database.New(),
	}

	r.GET("", controller.listBooksHandler)
	r.POST("", controller.createBookHandler)
	r.DELETE("/:id", controller.deleteBookHandler)
	r.PATCH("/:id", controller.updateBookHandler)
}

// @Summary List books
// @Description Get a list of all books with pagination
// @Tags books admin
// @Produce json
// @Param limit query int false "Limit number of books returned"
// @Param offset query int false "Offset for pagination"
// @Success 200 {array} models.Book
// @Router /admin/books [get]
func (b *BooksController) listBooksHandler(c *gin.Context) {
	limit, _ := strconv.Atoi(c.Query("limit"))
	offset, _ := strconv.Atoi(c.Query("offset"))

	var books []models.Book
	b.db.List(&books, limit, offset)

	c.JSON(http.StatusOK, books)
}

// @Summary Create book
// @Description Create a new book
// @Tags books admin
// @Accept json
// @Produce json
// @Param book body models.Book true "Book to create"
// @Success 201 {object} models.Book
// @Failure 400 {string} string
// @Router /admin/books [post]
func (b *BooksController) createBookHandler(c *gin.Context) {
	var book models.Book
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	b.db.Create(&book)
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
func (b *BooksController) deleteBookHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var book models.Book
	if err := b.db.Read(&book, uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	b.db.Delete(&book, uint(id))
	c.JSON(http.StatusNoContent, nil)
}

// @Summary Update book
// @Description Update a book by ID
// @Tags books admin
// @Accept json
// @Produce json
// @Param id path int true "Book ID"
// @Param book body models.Book true "Updated book data"
// @Success 200 {object} models.Book
// @Failure 400 {string} string
// @Failure 404 {string} string
// @Router /admin/books/{id} [patch]
func (b *BooksController) updateBookHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var book models.Book
	if err := b.db.Read(&book, uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	var updatedBook models.Book
	if err := c.ShouldBindJSON(&updatedBook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	book.Title = updatedBook.Title
	book.AuthorID = updatedBook.AuthorID
	b.db.Update(&book)
	c.JSON(http.StatusOK, book)
}
