package server

import (
	"go-playground/internal/database/models"
)

// ListAuthorResponse is the response struct for the listAuthorsHandler
type ListAuthorResponse struct {
	ID        uint   `json:"id"`
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
}

// CreateBookInput represents the request body for creating a book
// By using fields from models.Book directly, we ensure that changes to the model
// will cause compile-time errors in this struct
type CreateBookInput struct {
	// Embed fields directly from models.Book, but not the gorm.Model
	Title         string                   `json:"Title" binding:"required"`
	PublishedDate models.BookPublishedDate `json:"PublishedDate" binding:"required"`
	AuthorID      uint                     `json:"AuthorID" binding:"required"`
}

// ToModel converts the input to a database model
func (input *CreateBookInput) ToModel() models.Book {
	return models.Book{
		Title:         input.Title,
		PublishedDate: input.PublishedDate,
		AuthorID:      input.AuthorID,
	}
}
