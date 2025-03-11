package utils

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

// Argon2 parameters
const (
	argonTime    uint32 = 1         // Number of iterations
	argonMemory  uint32 = 64 * 1024 // Memory in KiB (64MB)
	argonThreads uint8  = 4         // Number of threads
	argonKeyLen  uint32 = 32        // Length of the generated key
	saltLength   uint32 = 16        // Length of the salt in bytes
)

// PasswordConfig holds the parameters used for generating the Argon2 hash
type PasswordConfig struct {
	Time    uint32
	Memory  uint32
	Threads uint8
	KeyLen  uint32
	SaltLen uint32
}

// defaultPasswordConfig returns the default Argon2 configuration
func defaultPasswordConfig() *PasswordConfig {
	return &PasswordConfig{
		Time:    argonTime,
		Memory:  argonMemory,
		Threads: argonThreads,
		KeyLen:  argonKeyLen,
		SaltLen: saltLength,
	}
}

// generateRandomSalt generates a cryptographically secure random salt
func generateRandomSalt(saltLength uint32) ([]byte, error) {
	salt := make([]byte, saltLength)
	_, err := rand.Read(salt)
	if err != nil {
		return nil, err
	}
	return salt, nil
}

// HashPassword hashes a password using Argon2id
// Returns a string in the format: $argon2id$v=19$m=memory,t=time,p=threads$salt$hash
func HashPassword(password string) (string, error) {
	config := defaultPasswordConfig()

	// Generate a random salt
	salt, err := generateRandomSalt(config.SaltLen)
	if err != nil {
		return "", err
	}

	// Generate the hash
	hash := argon2.IDKey(
		[]byte(password),
		salt,
		config.Time,
		config.Memory,
		config.Threads,
		config.KeyLen,
	)

	// Encode as base64
	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)

	// Format the final string
	encodedHash := fmt.Sprintf(
		"$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
		config.Memory, config.Time, config.Threads, b64Salt, b64Hash,
	)

	return encodedHash, nil
}

// VerifyPassword checks if a password matches a stored hash
// Using the hardcoded configuration parameters
func VerifyPassword(storedHash, password string) (bool, error) {
	// Extract just the salt and hash from the stored hash
	parts := strings.Split(storedHash, "$")
	fmt.Println(parts)

	// Decode the salt and hash
	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false, err
	}

	storedKey, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false, err
	}

	// Use the hardcoded config, only keyLen needs to match the stored key length
	config := defaultPasswordConfig()

	// Compute the hash of the provided password using the same parameters
	computedKey := argon2.IDKey(
		[]byte(password),
		salt,
		config.Time,
		config.Memory,
		config.Threads,
		config.KeyLen,
	)

	// Compare the computed hash with the stored hash in constant time
	return subtle.ConstantTimeCompare(storedKey, computedKey) == 1, nil
}

func GenerateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawStdEncoding.EncodeToString(b), nil
}

func VerifyRefreshToken(storedToken, providedToken string) bool {
	return subtle.ConstantTimeCompare([]byte(storedToken), []byte(providedToken)) == 1
}
