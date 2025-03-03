package api

import (
	"go-playground/internal/database/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ArtistDTO is used for both create and update operations
// Using pointers for fields allows us to distinguish between zero values and not provided values
type ArtistDTO struct {
	ID        *uint   `json:"id" binding:"-"` // Added ID field for validation purposes
	FirstName *string `json:"first_name" binding:"required_without=ID"`
	LastName  *string `json:"last_name" binding:"required_without=ID"`
}

// ApplyToModel applies the DTO data to a model instance
func (dto *ArtistDTO) ApplyToModel(artist *models.Artist) {
	if dto.FirstName != nil {
		artist.FirstName = *dto.FirstName
	}
	if dto.LastName != nil {
		artist.LastName = *dto.LastName
	}
}

// ToModel creates a new model from the DTO
func (dto *ArtistDTO) ToModel() models.Artist {
	artist := models.Artist{}
	dto.ApplyToModel(&artist)
	return artist
}

// Register routes for the artists module
func (s *Server) RegisterArtistAdminRoutes(r *gin.RouterGroup) {
	r.GET("", s.listArtistsAdminHandler)
	r.POST("", s.createArtistHandler)
	r.DELETE("/:id", s.deleteArtistHandler)
	r.PATCH("/:id", s.updateArtistHandler)
}

// @Summary List artists
// @Description Get a list of all artists with pagination
// @Tags artists admin
// @Produce json
// @Param limit query int false "Limit number of artists returned"
// @Param offset query int false "Offset for pagination"
// @Success 200 {array} models.Artist
// @Router /admin/artists [get]
// @Authorize Bearer
func (s *Server) listArtistsAdminHandler(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	var artists []models.Artist
	s.db.List(&artists, limit, offset)

	c.JSON(http.StatusOK, artists)
}

// @Summary Create artist
// @Description Create a new artist
// @Tags artists admin
// @Accept json
// @Produce json
// @Param artist body ArtistDTO true "Artist to create"
// @Success 201 {object} models.Artist
// @Failure 400 {string} string
// @Router /admin/artists [post]
// @Authorize Bearer
func (s *Server) createArtistHandler(c *gin.Context) {
	var inputDTO ArtistDTO
	if err := c.ShouldBindJSON(&inputDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	artist := inputDTO.ToModel()

	s.db.Create(&artist)
	c.JSON(http.StatusCreated, artist)
}

// @Summary Delete artist
// @Description Delete an artist by ID
// @Tags artists admin
// @Produce json
// @Param id path int true "Artist ID"
// @Success 204
// @Failure 404 {string} string
// @Router /admin/artists/{id} [delete]
// @Authorize Bearer
func (s *Server) deleteArtistHandler(c *gin.Context) {
	id, err := GetIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var artist models.Artist
	if err := s.db.Read(&artist, uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artist not found"})
		return
	}

	s.db.Delete(&artist, uint(id))
	c.JSON(http.StatusNoContent, nil)
}

// @Summary Update artist
// @Description Update an artist by ID
// @Tags artists admin
// @Accept json
// @Produce json
// @Param id path int true "Artist ID"
// @Param artist body ArtistDTO true "Artist fields to update"
// @Success 200 {object} models.Artist
// @Failure 400 {string} string
// @Failure 404 {string} string
// @Router /admin/artists/{id} [patch]
// @Authorize Bearer
func (s *Server) updateArtistHandler(c *gin.Context) {
	id, err := GetIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var artist models.Artist
	if err := s.db.Read(&artist, uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artist not found"})
		return
	}

	var updateDTO ArtistDTO
	// Set the ID to enable partial updates through the required_without=ID validation
	updateDTO.ID = &id

	if err := c.ShouldBindJSON(&updateDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateDTO.ApplyToModel(&artist)

	s.db.Update(&artist)
	c.JSON(http.StatusOK, artist)
}
