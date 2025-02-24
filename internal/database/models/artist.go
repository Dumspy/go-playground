package models

import (
	"gorm.io/gorm"
)

type Artist struct {
	gorm.Model
	FirstName string   `json:"firstname" binding:"required"`
	LastName  string   `json:"lastname" binding:"required"`
	Covers    []*Cover `gorm:"many2many:artist_covers;"`
}
