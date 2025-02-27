package models

import (
	"gorm.io/gorm"
)

type Artist struct {
	gorm.Model
	FirstName string   `json:"first_name" binding:"required"`
	LastName  string   `json:"last_name" binding:"required"`
	Covers    []*Cover `gorm:"many2many:artist_covers;"`
}
