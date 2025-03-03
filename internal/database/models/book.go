package models

import (
	"time"

	"gorm.io/gorm"
)

type Book struct {
	gorm.Model
	Title         string    `json:"title" binding:"required"`
	PublishedDate time.Time `json:"published_date" binding:"required"`
	DigitalOnly   bool      `json:"digital_only" binding:"required" gorm:"default:false"`
	Pages         uint      `json:"pages" binding:"required"`
	Description   string    `json:"description" binding:"required"`
	ISBN          string    `json:"isbn" binding:"required"`
	Price         float32   `json:"price" binding:"required"`
	Genres        []*Genre  `json:"genres" gorm:"many2many:book_genres;"`
	Cover         Cover
	AuthorID      uint   `json:"author_id"`
	Author        Author `json:"author" gorm:"foreignKey:AuthorID"`
}
