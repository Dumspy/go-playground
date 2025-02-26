package models

import (
	"gorm.io/gorm"
)

type Author struct {
	gorm.Model
	FirstName string `json:"FirstName" binding:"required"`
	LastName  string `json:"LastName" binding:"required"`
	Books     []Book
}
