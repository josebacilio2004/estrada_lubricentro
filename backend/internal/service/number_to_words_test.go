package service

import (
	"testing"

	"github.com/shopspring/decimal"
)

func TestNumberToWordsSoles(t *testing.T) {
	tests := []struct {
		name     string
		amount   decimal.Decimal
		expected string
	}{
		{
			name:     "Cero soles con centavos",
			amount:   decimal.NewFromFloat(0.50),
			expected: "SON: CERO CON 50/100 SOLES",
		},
		{
			name:     "Un sol exacto",
			amount:   decimal.NewFromFloat(1.00),
			expected: "SON: UN CON 00/100 SOLES",
		},
		{
			name:     "Veinte soles con ochenta centavos",
			amount:   decimal.NewFromFloat(20.80),
			expected: "SON: VEINTE CON 80/100 SOLES",
		},
		{
			name:     "Veinticinco soles con cincuenta centavos",
			amount:   decimal.NewFromFloat(25.50),
			expected: "SON: VEINTICINCO CON 50/100 SOLES",
		},
		{
			name:     "Cien soles exactos",
			amount:   decimal.NewFromFloat(100.00),
			expected: "SON: CIEN CON 00/100 SOLES",
		},
		{
			name:     "Ciento ochenta y cinco soles",
			amount:   decimal.NewFromFloat(185.00),
			expected: "SON: CIENTO OCHENTA Y CINCO CON 00/100 SOLES",
		},
		{
			name:     "Mil quinientos soles",
			amount:   decimal.NewFromFloat(1500.00),
			expected: "SON: MIL QUINIENTOS CON 00/100 SOLES",
		},
		{
			name:     "Monto compuesto",
			amount:   decimal.NewFromFloat(345.20),
			expected: "SON: TRESCIENTOS CUARENTA Y CINCO CON 20/100 SOLES",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NumberToWordsSoles(tt.amount)
			if got != tt.expected {
				t.Errorf("NumberToWordsSoles(%s) = %q; want %q", tt.amount.String(), got, tt.expected)
			}
		})
	}
}
