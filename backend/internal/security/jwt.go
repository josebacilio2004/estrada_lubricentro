package security

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AdminClaims struct {
	UserID   uuid.UUID `json:"user_id"`
	Email    string    `json:"email"`
	FullName string    `json:"full_name"`
	Role     string    `json:"role"`
	jwt.RegisteredClaims
}

type PortalClaims struct {
	VehicleID    uuid.UUID `json:"vehicle_id"`
	LicensePlate string    `json:"license_plate"`
	CustomerID   uuid.UUID `json:"customer_id"`
	jwt.RegisteredClaims
}

// HashPassword genera hash bcrypt con coste 10
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

// CheckPasswordHash compara contraseña en texto plano con hash bcrypt
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateAdminToken crea un JWT firmado para administradores y operadores ERP
func GenerateAdminToken(userID uuid.UUID, email, fullName, role, secret string) (string, error) {
	claims := AdminClaims{
		UserID:   userID,
		Email:    email,
		FullName: fullName,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "estrada-erp-auth",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidateAdminToken valida el token y extrae los claims
func ValidateAdminToken(tokenString, secret string) (*AdminClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &AdminClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", t.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*AdminClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("token administrativo inválido")
}

// GeneratePortalToken crea un JWT para el portal de clientes con la placa
func GeneratePortalToken(vehicleID, customerID uuid.UUID, plate, secret string) (string, error) {
	claims := PortalClaims{
		VehicleID:    vehicleID,
		LicensePlate: plate,
		CustomerID:   customerID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(72 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "estrada-portal-auth",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidatePortalToken valida el token del cliente
func ValidatePortalToken(tokenString, secret string) (*PortalClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &PortalClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inválido")
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*PortalClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("token de portal inválido")
}
