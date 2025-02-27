package types

// ListAuthorResponse is the response struct for the listAuthorsHandler
type ListAuthorResponse struct {
	ID        uint   `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}
