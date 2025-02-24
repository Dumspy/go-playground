package models

import (
	"gorm.io/gorm"
)

// Author represents an author in the database.
type Author struct {
	gorm.Model
	FirstName string `json:"firstname" binding:"required"`
	LastName  string `json:"lastname" binding:"required"`
	Books     []Book
}
