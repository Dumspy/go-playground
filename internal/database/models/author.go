package models

import (
	"gorm.io/gorm"
)

// Author represents an author in the database.
type Author struct {
	gorm.Model
	FirstName string `gorm:"size:255" json:"firstname" binding:"required"`
	LastName  string `gorm:"size:255" json:"lastname" binding:"required"`
}
