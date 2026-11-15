package service

import (
	"math"
	"time"

	"lubricentro-estrada-core/internal/domain"
)

// ResolveDailyKM determina el promedio de kilometraje diario según el perfil del vehículo
func ResolveDailyKM(profile string) int32 {
	switch profile {
	case domain.ProfileTaxiColectivo:
		return 140
	case domain.ProfileFlotaComercial:
		return 160
	default:
		return 35 // Particular
	}
}

// CalculateNextService estima la fecha y kilometraje del próximo cambio de aceite
func CalculateNextService(serviceDate time.Time, currentKM int32, oilLifespanKM int32, profile string) (nextDate time.Time, nextKM int32) {
	dailyKM := ResolveDailyKM(profile)
	if dailyKM <= 0 {
		dailyKM = 35
	}

	days := float64(oilLifespanKM) / float64(dailyKM)
	days = math.Min(math.Max(days, 15), 180) // Límites seguros: 15 días a 180 días (6 meses)

	nextDate = serviceDate.AddDate(0, 0, int(days))
	nextKM = currentKM + oilLifespanKM
	return nextDate, nextKM
}
