package models

import (
	"gorm.io/gorm"
)

type Cover struct {
	gorm.Model
	DesignIdeas string `json:"DesignIdeas" binding:"required"`
	DigitalOnly bool   `json:"DigitalOnly" binding:"required"`
	BookID      uint
	Book        Book
	Artists     []*Artist `gorm:"many2many:artist_covers;"`
}
