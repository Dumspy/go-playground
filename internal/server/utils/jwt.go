package utils

import (
	"errors"
	"go-playground/internal/database/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("very_secret")

type Claims struct {
	UserID   uint
	Username string
	jwt.RegisteredClaims
}

func GenerateJWT(user models.User) (string, error) {
	// Create the JWT claims, which includes the username and expiry time
	claims := &Claims{
		UserID:   user.ID,
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "go-playground",
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
		},
	}

	// Create the JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Sign the token with the secret key
	tokenString, err := token.SignedString(jwtSecret)

	return tokenString, err
}

func ValidateJWT(tokenString string) (*Claims, error) {
	claims := &Claims{}

	// Parse the token
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	// Validate the token
	if !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
