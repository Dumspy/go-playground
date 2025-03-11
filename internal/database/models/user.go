package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username     string `json:"username" binding:"required" gorm:"unique"`
	Password     string `json:"password" binding:"required"`
	RefreshToken string `gorm:"unique"`
	ExpriesAt    time.Time
}
