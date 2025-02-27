package models

import (
	"database/sql"

	"gorm.io/gorm"
)

type Cover struct {
	gorm.Model
	DesignIdeas sql.NullString `json:"design_ideas" binding:"required"`
	ImageURL    sql.NullString `json:"image_url"`
	BookID      uint           `json:"book_id" binding:"required"`
	Artists     []*Artist      `gorm:"many2many:artist_covers;"`
}
