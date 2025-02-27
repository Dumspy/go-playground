package types

// ListCoverResponse is the response struct for the listCoversHandler
type ListCoverResponse struct {
	ID       uint   `json:"id"`
	ImageURL string `json:"image_url"`
}
