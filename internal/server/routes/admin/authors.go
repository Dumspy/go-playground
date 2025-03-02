package admin

import (
	"go-playground/internal/database"
	"go-playground/internal/database/models"
	"go-playground/internal/server/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AuthorsController handles author-related routes
type AuthorsController struct {
	db database.Service
}

// AuthorDTO is used for both create and update operations
// Using pointers for fields allows us to distinguish between zero values and not provided values
type AuthorDTO struct {
	ID        *uint   `json:"id" binding:"-"` // Added ID field for validation purposes
	FirstName *string `json:"first_name" binding:"required_without=ID"`
	LastName  *string `json:"last_name" binding:"required_without=ID"`
}

// ApplyToModel applies the DTO data to a model instance
func (dto *AuthorDTO) ApplyToModel(author *models.Author) {
	if dto.FirstName != nil {
		author.FirstName = *dto.FirstName
	}
	if dto.LastName != nil {
		author.LastName = *dto.LastName
	}
}

// ToModel creates a new model from the DTO
func (dto *AuthorDTO) ToModel() models.Author {
	author := models.Author{}
	dto.ApplyToModel(&author)
	return author
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
// @Authorize Bearer
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
// @Param author body AuthorDTO true "Author to create"
// @Success 201 {object} models.Author
// @Failure 400 {string} string
// @Router /admin/authors [post]
// @Authorize Bearer
func (controller *AuthorsController) createAuthorHandler(c *gin.Context) {
	var inputDTO AuthorDTO
	if err := c.ShouldBindJSON(&inputDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	author := inputDTO.ToModel()
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
// @Authorize Bearer
func (controller *AuthorsController) deleteAuthorHandler(c *gin.Context) {
	id, err := utils.GetIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var author models.Author
	if err := controller.db.Read(&author, id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Author not found"})
		return
	}

	controller.db.Delete(&author, id)
	c.Status(http.StatusNoContent)
}

// @Summary Update author
// @Description Update an author by ID
// @Tags authors admin
// @Accept json
// @Produce json
// @Param id path int true "Author ID"
// @Param author body AuthorDTO true "Updated author data"
// @Success 200 {object} models.Author
// @Failure 400 {string} string
// @Failure 404 {string} string
// @Router /admin/authors/{id} [patch]
// @Authorize Bearer
func (controller *AuthorsController) updateAuthorHandler(c *gin.Context) {
	id, err := utils.GetIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var author models.Author
	if err := controller.db.Read(&author, id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Author not found"})
		return
	}

	var updateDTO AuthorDTO
	// Set the ID to enable partial updates through the required_without=ID validation
	updateDTO.ID = &id

	if err := c.ShouldBindJSON(&updateDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateDTO.ApplyToModel(&author)
	controller.db.Update(&author)
	c.JSON(http.StatusOK, author)
}
