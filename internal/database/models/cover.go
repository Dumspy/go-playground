package models

import (
	"gorm.io/gorm"
)

type Cover struct {
	gorm.Model
	DesignIdeas string `json:"design_ideas" binding:"required"`
	DigitalOnly bool   `json:"digital_only" binding:"required"`
	BookID      uint
	Book        Book
	Artists     []*Artist `gorm:"many2many:artist_covers;"`
}
