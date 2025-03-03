package types

// ListArtistResponse is the response struct for the listArtistsHandler
type ListArtistResponse struct {
	ID        uint   `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}
