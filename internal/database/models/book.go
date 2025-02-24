package models

import (
	"time"

	"gorm.io/gorm"
)

type Book struct {
	gorm.Model
	Title         string    `json:"title" binding:"required"`
	PublishedDate time.Time `json:"published_date" binding:"required"`
	AuthorID      uint
}
