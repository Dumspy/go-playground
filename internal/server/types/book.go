package types

import (
	"go-playground/internal/database/models"
	"time"
)

// ListBookResponse is the response struct for the listBooksHandler
type ListBookResponse struct {
	ID            uint     `json:"id"`
	Title         string   `json:"title"`
	PublishedDate string   `json:"published_date"`
	DigitalOnly   bool     `json:"digital_only"`
	Pages         uint     `json:"pages"`
	Description   string   `json:"description"`
	ISBN          string   `json:"isbn"`
	Price         float32  `json:"price"`
	Genres        []string `json:"genres"`
	AuthorID      uint     `json:"author_id"`
	Cover         ListCoverResponse
}

// CreateBookInput represents the request body for creating a book
type CreateBookInput struct {
	Title         string    `json:"title" binding:"required"`
	PublishedDate time.Time `json:"published_date" binding:"required"`
	AuthorID      uint      `json:"author_id" binding:"required"`
}

// ToModel converts the input to a database model
func (input *CreateBookInput) ToModel() models.Book {
	return models.Book{
		Title:         input.Title,
		PublishedDate: input.PublishedDate,
		AuthorID:      input.AuthorID,
	}
}
