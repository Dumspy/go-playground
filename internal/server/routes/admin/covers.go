package admin

import (
	"go-playground/internal/database"
	"go-playground/internal/database/models"
	"go-playground/internal/server/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CoverController handles cover-related routes
type CoverController struct {
	db database.Service
}

// CoverDTO is used for both create and update operations
// Using pointers for fields allows us to distinguish between zero values and not provided values
type CoverDTO struct {
	ID          *uint   `json:"id" binding:"-"` // Added ID field for validation purposes
	DesignIdeas *string `json:"design_ideas" binding:"required_without=ID"`
	ImageURL    *string `json:"image_url" binding:"required_without=ID"`
	BookID      *uint   `json:"book_id" binding:"required_without=ID"`
	ArtistIDs   *[]uint `json:"artist_ids" binding:"required_without=ID"`
}

// ApplyToModel applies the DTO data to a model instance
func (dto *CoverDTO) ApplyToModel(cover *models.Cover) {
	if dto.DesignIdeas != nil {
		cover.DesignIdeas.String = *dto.DesignIdeas
		cover.DesignIdeas.Valid = true
	}
	if dto.ImageURL != nil {
		cover.ImageURL.String = *dto.ImageURL
		cover.ImageURL.Valid = true
	}
	if dto.BookID != nil {
		cover.BookID = *dto.BookID
	}
}

// ToModel creates a new model from the DTO
func (dto *CoverDTO) ToModel() models.Cover {
	cover := models.Cover{}
	dto.ApplyToModel(&cover)
	return cover
}

// Register routes for the books module
func RegisterCoverRoutes(r *gin.RouterGroup) {
	controller := &CoverController{
		db: database.New(),
	}

	r.GET("", controller.listCoversHandler)
	r.POST("", controller.createCoverHandler)
	r.DELETE("/:id", controller.deleteCoverHandler)
	r.PATCH("/:id", controller.updateCoverHandler)
}

// @Summary List covers
// @Description Get a list of all covers with pagination
// @Tags covers admin
// @Produce json
// @Param limit query int false "Limit number of covers returned"
// @Param offset query int false "Offset for pagination"
// @Success 200 {array} models.Cover
// @Router /admin/covers [get]
// @Authorize Bearer
func (b *CoverController) listCoversHandler(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	covers, err := b.db.ListCovers(limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, covers)
}

// @Summary Create cover
// @Description Create a new cover
// @Tags covers admin
// @Accept json
// @Produce json
// @Param cover body CoverDTO true "Cover to create"
// @Success 201 {object} models.Cover
// @Failure 400 {string} string
// @Router /admin/covers [post]
// @Authorize Bearer
func (b *CoverController) createCoverHandler(c *gin.Context) {
	var inputDTO CoverDTO
	if err := c.ShouldBindJSON(&inputDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cover := inputDTO.ToModel()

	// Handle artist associations if provided
	if inputDTO.ArtistIDs != nil && len(*inputDTO.ArtistIDs) > 0 {
		var artists []*models.Artist
		for _, artistID := range *inputDTO.ArtistIDs {
			artist := &models.Artist{}
			if err := b.db.Read(artist, artistID); err == nil {
				artists = append(artists, artist)
			}
		}
		cover.Artists = artists
	}

	b.db.Create(&cover)
	c.JSON(http.StatusCreated, cover)
}

// @Summary Delete cover
// @Description Delete a cover by ID
// @Tags covers admin
// @Produce json
// @Param id path int true "Cover ID"
// @Success 204
// @Failure 404 {string} string
// @Router /admin/covers/{id} [delete]
// @Authorize Bearer
func (b *CoverController) deleteCoverHandler(c *gin.Context) {
	id, err := utils.GetIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var cover models.Cover
	if err := b.db.Read(&cover, uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cover not found"})
		return
	}

	b.db.Delete(&cover, uint(id))
	c.JSON(http.StatusNoContent, nil)
}

// @Summary Update cover
// @Description Update a cover by ID
// @Tags covers admin
// @Accept json
// @Produce json
// @Param id path int true "Cover ID"
// @Param cover body CoverDTO true "Cover fields to update"
// @Success 200 {object} models.Cover
// @Failure 400 {string} string
// @Failure 404 {string} string
// @Router /admin/covers/{id} [patch]
// @Authorize Bearer
func (b *CoverController) updateCoverHandler(c *gin.Context) {
	id, err := utils.GetIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var cover models.Cover
	if err := b.db.Read(&cover, uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cover not found"})
		return
	}

	var updateDTO CoverDTO
	// Set the ID to enable partial updates through the required_without=ID validation
	updateDTO.ID = &id

	if err := c.ShouldBindJSON(&updateDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateDTO.ApplyToModel(&cover)

	// Handle artist associations if provided
	if updateDTO.ArtistIDs != nil {
		var artists []*models.Artist
		for _, artistID := range *updateDTO.ArtistIDs {
			artist := &models.Artist{}
			if err := b.db.Read(artist, artistID); err == nil {
				artists = append(artists, artist)
			}
		}
		cover.Artists = artists
	}

	b.db.Update(&cover)
	c.JSON(http.StatusOK, cover)
}
