package models

import (
	"gorm.io/gorm"
)

type Artist struct {
	gorm.Model
	FirstName string   `json:"FirstName" binding:"required"`
	LastName  string   `json:"LastName" binding:"required"`
	Covers    []*Cover `gorm:"many2many:artist_covers;"`
}
