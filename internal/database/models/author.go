package models

import (
	"gorm.io/gorm"
)

type Author struct {
	gorm.Model
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Books     []Book
}
