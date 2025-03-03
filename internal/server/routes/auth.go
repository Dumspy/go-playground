package routes

import (
	"go-playground/internal/database"
	"go-playground/internal/server/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(r *gin.RouterGroup) {
	controller := &AuthController{
		db: database.New(),
	}

	r.POST("/login", controller.loginHandler)
	r.POST("/logout", controller.logoutHandler)
	r.POST("/refresh", controller.refreshHandler)
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	AuthToken string `json:"authToken" binding:"required"`
}

type AuthController struct {
	db database.Service
}

// @Summary Login
// @Description Login user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param login body LoginRequest true "Login request"
// @Success 200 {object} LoginResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/login [post]
func (controller *AuthController) loginHandler(c *gin.Context) {
	var loginReq LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := controller.db.GetUser(loginReq.Username)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	validLogin, err := utils.VerifyPassword(user.Password, loginReq.Password)
	if err != nil || !validLogin {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := utils.GenerateJWT(*user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	user.RefreshToken, err = utils.GenerateRefreshToken()
	user.ExpriesAt = time.Now().Add(time.Hour * 24 * 7)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate refresh token"})
		return
	}

	controller.db.Update(user)

	c.SetCookie("refreshToken", user.RefreshToken, 60*60*24*7, "/", "", true, true)

	c.JSON(http.StatusOK, gin.H{
		"authToken": token,
	})
}

// @Summary Logout
// @Description Logout user and clear JWT token
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]string
// @Router /auth/logout [post]
func (controller *AuthController) logoutHandler(c *gin.Context) {
	token, err := c.Cookie("refreshToken")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	// Clear the cookie
	c.SetCookie("refreshToken", "", -1, "/", "", true, true)
	// Clear the refresh token in the database
	controller.db.ClearRefreshToken(token)

	c.JSON(http.StatusOK, gin.H{
		"message": "Logout successful",
	})
}

// @Summary Refresh token
// @Description Refresh JWT token
// @Tags auth
// @Produce json
// @Success 200 {object} LoginResponse
// @Failure 401 {object} map[string]string
// @Router /auth/refresh [post]
func (controller *AuthController) refreshHandler(c *gin.Context) {
	refreshToken, err := c.Cookie("refreshToken")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	user, err := controller.db.GetUserByRefreshToken(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := utils.GenerateJWT(*user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"authToken": token,
	})
}
