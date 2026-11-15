package service

import (
	"testing"
	"time"

	"lubricentro-estrada-core/internal/domain"
)

func TestCalculateNextService(t *testing.T) {
	baseDate := time.Date(2026, 10, 1, 10, 0, 0, 0, time.UTC)

	tests := []struct {
		name             string
		currentKM        int32
		oilLifespanKM    int32
		profile          string
		expectedNextKM   int32
		expectedMinDays  int
		expectedMaxDays  int
	}{
		{
			name:            "Vehículo Particular con Aceite Sintético 10,000 km",
			currentKM:       45000,
			oilLifespanKM:   10000,
			profile:         domain.ProfileParticular, // 35 km/día -> 10000/35 = 285 días -> acotado a 180 días (6 meses)
			expectedNextKM:  55000,
			expectedMinDays: 180,
			expectedMaxDays: 180,
		},
		{
			name:            "Vehículo Particular con Aceite Mineral 5,000 km",
			currentKM:       90000,
			oilLifespanKM:   5000,
			profile:         domain.ProfileParticular, // 5000/35 = ~142 días
			expectedNextKM:  95000,
			expectedMinDays: 140,
			expectedMaxDays: 145,
		},
		{
			name:            "Taxi Colectivo con Aceite Semisintético 7,500 km",
			currentKM:       120000,
			oilLifespanKM:   7500,
			profile:         domain.ProfileTaxiColectivo, // 140 km/día -> 7500/140 = 53 días
			expectedNextKM:  127500,
			expectedMinDays: 52,
			expectedMaxDays: 54,
		},
		{
			name:            "Flota Comercial con Aceite Mineral 5,000 km",
			currentKM:       80000,
			oilLifespanKM:   5000,
			profile:         domain.ProfileFlotaComercial, // 160 km/día -> 5000/160 = 31 días
			expectedNextKM:  85000,
			expectedMinDays: 30,
			expectedMaxDays: 32,
		},
		{
			name:            "Límite inferior (mínimo 15 días)",
			currentKM:       10000,
			oilLifespanKM:   1000,
			profile:         domain.ProfileFlotaComercial, // 1000/160 = 6 días -> debe ser mínimo 15
			expectedNextKM:  11000,
			expectedMinDays: 15,
			expectedMaxDays: 15,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			nextDate, nextKM := CalculateNextService(baseDate, tt.currentKM, tt.oilLifespanKM, tt.profile)

			if nextKM != tt.expectedNextKM {
				t.Errorf("nextKM = %d; want %d", nextKM, tt.expectedNextKM)
			}

			daysDiff := int(nextDate.Sub(baseDate).Hours() / 24)
			if daysDiff < tt.expectedMinDays || daysDiff > tt.expectedMaxDays {
				t.Errorf("daysDiff = %d; want between %d and %d", daysDiff, tt.expectedMinDays, tt.expectedMaxDays)
			}
		})
	}
}
