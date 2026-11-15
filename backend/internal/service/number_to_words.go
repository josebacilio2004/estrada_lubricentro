package service

import (
	"fmt"
	"strings"

	"github.com/shopspring/decimal"
)

var units = []string{"", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"}
var teens = []string{"DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"}
var tens = []string{"", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"}
var hundreds = []string{"", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"}

func convertChunk(n int) string {
	if n == 0 {
		return ""
	}
	if n == 100 {
		return "CIEN"
	}

	var res []string
	h := n / 100
	rem := n % 100

	if h > 0 {
		res = append(res, hundreds[h])
	}

	if rem >= 10 && rem <= 19 {
		res = append(res, teens[rem-10])
	} else if rem >= 20 && rem <= 29 {
		if rem == 20 {
			res = append(res, "VEINTE")
		} else {
			res = append(res, "VEINTI"+units[rem%10])
		}
	} else {
		t := rem / 10
		u := rem % 10
		if t > 0 {
			if u > 0 {
				res = append(res, tens[t]+" Y "+units[u])
			} else {
				res = append(res, tens[t])
			}
		} else if u > 0 {
			res = append(res, units[u])
		}
	}

	return strings.Join(res, " ")
}

// NumberToWordsSoles convierte un decimal a formato legal SUNAT
func NumberToWordsSoles(amount decimal.Decimal) string {
	intPart := int(amount.IntPart())
	fracPart := int(amount.Sub(decimal.NewFromInt(int64(intPart))).Mul(decimal.NewFromInt(100)).IntPart())

	if intPart == 0 {
		return fmt.Sprintf("SON: CERO CON %02d/100 SOLES", fracPart)
	}

	var parts []string
	thousands := intPart / 1000
	remainder := intPart % 1000

	if thousands > 0 {
		if thousands == 1 {
			parts = append(parts, "MIL")
		} else {
			parts = append(parts, convertChunk(thousands), "MIL")
		}
	}

	if remainder > 0 {
		parts = append(parts, convertChunk(remainder))
	}

	return fmt.Sprintf("SON: %s CON %02d/100 SOLES", strings.TrimSpace(strings.Join(parts, " ")), fracPart)
}
