package admin

import (
	"go-playground/internal/database"
	"go-playground/internal/database/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AuthorsController handles author-related routes
type AuthorsController struct {
	db database.Service
}

// Register routes for the authors module
func RegisterAuthorRoutes(r *gin.RouterGroup) {
	controller := &AuthorsController{
		db: database.New(),
	}

	r.GET("", controller.listAuthorsHandler)
	r.POST("", controller.createAuthorHandler)
	r.DELETE("/:id", controller.deleteAuthorHandler)
	r.PATCH("/:id", controller.updateAuthorHandler)
}

// @Summary List authors
// @Description Get a list of all authors with pagination
// @Tags authors admin
// @Produce json
// @Param limit query int false "Limit number of authors returned"
// @Param offset query int false "Offset for pagination"
// @Success 200 {array} models.Author
// @Router /admin/authors [get]
func (controller *AuthorsController) listAuthorsHandler(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	var authors []models.Author
	controller.db.List(&authors, limit, offset)

	c.JSON(http.StatusOK, authors)
}

// @Summary Create author
// @Description Create a new author
// @Tags authors admin
// @Accept json
// @Produce json
// @Param author body models.Author true "Author to create"
// @Success 201 {object} models.Author
// @Failure 400 {string} string
// @Router /admin/authors [post]
func (controller *AuthorsController) createAuthorHandler(c *gin.Context) {
	var author models.Author
	if err := c.ShouldBindJSON(&author); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	controller.db.Create(&author)

	c.JSON(http.StatusCreated, author)
}

// @Summary Delete author
// @Description Delete an author by ID
// @Tags authors admin
// @Produce json
// @Param id path int true "Author ID"
// @Success 204
// @Failure 404 {string} string
// @Router /admin/authors/{id} [delete]
func (controller *AuthorsController) deleteAuthorHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var author models.Author
	if err := controller.db.Read(&author, uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	controller.db.Delete(&author, uint(id))
	c.JSON(http.StatusNoContent, nil)

	controller.db.Delete(&models.Book{}, uint(id))

	c.Status(http.StatusNoContent)
}

// @Summary Update author
// @Description Update an author by ID
// @Tags authors admin
// @Accept json
// @Produce json
// @Param id path int true "Author ID"
// @Param author body models.Author true "Updated author data"
// @Success 200 {object} models.Author
// @Failure 400 {string} string
// @Failure 404 {string} string
// @Router /admin/authors/{id} [patch]
func (controller *AuthorsController) updateAuthorHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var author models.Author
	if err := controller.db.Read(&author, uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Author not found"})
		return
	}

	if err := c.ShouldBindJSON(&author); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	controller.db.Update(&author)
	c.JSON(http.StatusOK, author)
}
