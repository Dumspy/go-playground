package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"my_project/internal/database/models"

	_ "github.com/joho/godotenv/autoload"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Service represents a service that interacts with a database.
type Service interface {
	// Health returns a map of health status information.
	// The keys and values in the map are service-specific.
	Health() map[string]string

	// Close terminates the database connection.
	// It returns an error if the connection cannot be closed.
	Close() error

	// ListAuthors returns a list of authors from the database.
	Create(entity any) error
	Read(entity any, id uint) error
	Update(entity any) error
	Delete(entity any, id uint) error
	List(entity any, limit int, offset int) ([]any, error)
}

type service struct {
	db *gorm.DB
}

var (
	dburl      = os.Getenv("BLUEPRINT_DB_URL")
	dbInstance *service
)

func New() Service {
	// Reuse Connection
	if dbInstance != nil {
		return dbInstance
	}

	db, err := gorm.Open(sqlite.Open(dburl), &gorm.Config{})
	if err != nil {
		// This will not be a connection error, but a DSN parse error or
		// another initialization error.
		log.Fatal(err)
	}

	// AutoMigrate the models to create the table if it doesn't exist
	err = db.AutoMigrate(&models.Author{}, &models.Artist{}, &models.Book{}, &models.Cover{})
	if err != nil {
		log.Fatal(err)
	}

	dbInstance = &service{
		db: db,
	}
	return dbInstance
}

// Health checks the health of the database connection by pinging the database.
// It returns a map with keys indicating various health statistics.
func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	stats := make(map[string]string)

	sqlDB, err := s.db.DB()
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		log.Fatalf("db down: %v", err) // Log the error and terminate the program
		return stats
	}

	// Ping the database
	err = sqlDB.PingContext(ctx)
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		log.Fatalf("db down: %v", err) // Log the error and terminate the program
		return stats
	}

	// Database is up, add more statistics
	stats["status"] = "up"
	stats["message"] = "It's healthy"

	// Get database stats (like open connections, in use, idle, etc.)
	dbStats := sqlDB.Stats()
	stats["open_connections"] = strconv.Itoa(dbStats.OpenConnections)
	stats["in_use"] = strconv.Itoa(dbStats.InUse)
	stats["idle"] = strconv.Itoa(dbStats.Idle)
	stats["wait_count"] = strconv.FormatInt(dbStats.WaitCount, 10)
	stats["wait_duration"] = dbStats.WaitDuration.String()
	stats["max_idle_closed"] = strconv.FormatInt(dbStats.MaxIdleClosed, 10)
	stats["max_lifetime_closed"] = strconv.FormatInt(dbStats.MaxLifetimeClosed, 10)

	// Evaluate stats to provide a health message
	if dbStats.OpenConnections > 40 { // Assuming 50 is the max for this example
		stats["message"] = "The database is experiencing heavy load."
	}

	if dbStats.WaitCount > 1000 {
		stats["message"] = "The database has a high number of wait events, indicating potential bottlenecks."
	}

	if dbStats.MaxIdleClosed > int64(dbStats.OpenConnections)/2 {
		stats["message"] = "Many idle connections are being closed, consider revising the connection pool settings."
	}

	if dbStats.MaxLifetimeClosed > int64(dbStats.OpenConnections)/2 {
		stats["message"] = "Many connections are being closed due to max lifetime, consider increasing max lifetime or revising the connection usage pattern."
	}

	return stats
}

// Close closes the database connection.
// It logs a message indicating the disconnection from the specific database.
// If the connection is successfully closed, it returns nil.
// If an error occurs while closing the connection, it returns the error.
func (s *service) Close() error {
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}

	log.Printf("Disconnected from database: %s", dburl)
	return sqlDB.Close()
}

func (s *service) Create(entity any) error {
	if !s.db.Migrator().HasTable(entity) {
		return fmt.Errorf("a table for %v does not exist", entity)
	}

	result := s.db.Create(entity)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (s *service) Read(entity any, id uint) error {
	if !s.db.Migrator().HasTable(entity) {
		return fmt.Errorf("a table for %v does not exist", entity)
	}

	result := s.db.First(entity, id)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (s *service) Update(entity any) error {
	if !s.db.Migrator().HasTable(entity) {
		return fmt.Errorf("a table for %v does not exist", entity)
	}

	result := s.db.Save(entity)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (s *service) Delete(entity any, id uint) error {
	if !s.db.Migrator().HasTable(entity) {
		return fmt.Errorf("a table for %v does not exist", entity)
	}

	result := s.db.Delete(entity, id)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (s *service) List(entity any, limit int, offset int) ([]any, error) {
	if !s.db.Migrator().HasTable(entity) {
		return nil, fmt.Errorf("a table for %v does not exist", entity)
	}

	var entities []any
	result := s.db.Model(entity).Limit(limit).Offset(offset).Find(&entities)
	if result.Error != nil {
		return nil, result.Error
	}
	return entities, nil
}
