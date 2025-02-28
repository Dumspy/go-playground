package types

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
