package models

import (
	"time"

	"gorm.io/gorm"
)

// BookPublishedDate is a type alias to use in both model and input
// This ensures that changes to the type are reflected in both places
type BookPublishedDate = time.Time

type Book struct {
	gorm.Model
	Title         string            `json:"Title" binding:"required"`
	PublishedDate BookPublishedDate `json:"PublishedData" binding:"required"`
	AuthorID      uint
}
