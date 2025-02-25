package models

import (
	"gorm.io/gorm"
)

type Author struct {
	gorm.Model
	FirstName string `json:"firstname" binding:"required"`
	LastName  string `json:"lastname" binding:"required"`
	Books     []Book
}
