package domain

import "errors"

var (
	ErrProductNotFound       = errors.New("producto no encontrado en catálogo")
	ErrInsufficientStock     = errors.New("stock insuficiente para completar la venta")
	ErrInvalidSeries         = errors.New("serie de comprobante inválida o inactiva")
	ErrInvalidDocumentNumber = errors.New("número de documento (DNI/RUC) no cumple con el formato oficial")
	ErrCustomerNotFound      = errors.New("cliente no registrado en el sistema")
	ErrVehicleNotFound       = errors.New("vehículo con la placa especificada no encontrado")
	ErrSaleItemsEmpty        = errors.New("la venta debe contener al menos un producto o servicio")
	ErrSunatRejected         = errors.New("comprobante rechazado por los servicios de SUNAT")
	ErrDatabaseTimeout       = errors.New("tiempo de espera agotado al comunicar con la base de datos")
)
