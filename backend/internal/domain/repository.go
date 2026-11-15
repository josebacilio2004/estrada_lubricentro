package domain

import (
	"context"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type SaleRepository interface {
	LockSeriesForUpdate(ctx context.Context, series string) (currentCorrelative int64, docTypeCode string, err error)
	IncrementSeriesCorrelative(ctx context.Context, series string, newCorrelative int64) error
	CreateSale(ctx context.Context, sale *Sale) error
	CreateSaleItem(ctx context.Context, item *SaleItem) error
	CreateSunatTransmission(ctx context.Context, transmission *SunatTransmission) error
}

type ProductRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*Product, error)
	LockForUpdate(ctx context.Context, id uuid.UUID) (stock decimal.Decimal, price decimal.Decimal, unitCost decimal.Decimal, unitCode string, err error)
	DeductStock(ctx context.Context, id uuid.UUID, quantity decimal.Decimal) error
	RecordInventoryMovement(ctx context.Context, movement *InventoryMovement) error
	Search(ctx context.Context, query string, viscosity string, limit, offset int) ([]Product, error)
}

type CustomerRepository interface {
	Upsert(ctx context.Context, customer *Customer) (uuid.UUID, error)
	GetByDoc(ctx context.Context, docNumber string) (*Customer, error)
}

type VehicleRepository interface {
	Upsert(ctx context.Context, vehicle *Vehicle) (uuid.UUID, error)
	GetByPlate(ctx context.Context, plate string) (*Vehicle, error)
}

type MaintenanceRepository interface {
	CreateLog(ctx context.Context, log *ServiceMaintenanceLog) error
	RenewPreviousLogs(ctx context.Context, vehicleID uuid.UUID) error
	GetLastByPlate(ctx context.Context, plate string) (*NextServiceQueryResponse, error)
	GetDueReminders(ctx context.Context) ([]ReminderDispatchItem, error)
	UpdateLifecycleStatus(ctx context.Context, logID uuid.UUID, status string) error
	RecordNotification(ctx context.Context, notif *NotificationLog) error
}

type InventoryMovement struct {
	ID           uuid.UUID
	ProductID    uuid.UUID
	MovementType string
	Quantity     decimal.Decimal
	StockBefore  decimal.Decimal
	StockAfter   decimal.Decimal
	UnitCost     decimal.Decimal
	ReferenceDoc string
	CreatedBy    *uuid.UUID
}

type Sale struct {
	ID               uuid.UUID
	CustomerID       uuid.UUID
	VehicleID        *uuid.UUID
	DocTypeCode      string
	Series           string
	Correlative      int64
	FullNumber       string
	TotalGravadas    decimal.Decimal
	TotalIGV         decimal.Decimal
	TotalAmount      decimal.Decimal
	AmountInWords    string
	PaymentMethod    string
	PaymentCondition string
}

type SaleItem struct {
	SaleID      uuid.UUID
	ProductID   uuid.UUID
	Description string
	UnitCode    string
	Quantity    decimal.Decimal
	UnitValue   decimal.Decimal
	UnitPrice   decimal.Decimal
	IGVAmount   decimal.Decimal
	Subtotal    decimal.Decimal
	Total       decimal.Decimal
}

type SunatTransmission struct {
	SaleID   uuid.UUID
	HashCPE  string
	QRString string
	Status   string
}

type ServiceMaintenanceLog struct {
	SaleID             uuid.UUID
	VehicleID          uuid.UUID
	CustomerID         uuid.UUID
	MileageAtService   int32
	NextServiceMileage int32
	OilAppliedName     string
	OilViscosity       string
	ChangedOilFilter   bool
	ChangedAirFilter   bool
	ChangedCabinFilter bool
	EstimatedNextDate  any
	LifecycleStatus    string
}

type NotificationLog struct {
	MaintenanceLogID uuid.UUID
	CustomerID       uuid.UUID
	Channel          string
	Stage            string
	RecipientPhone   string
	MessageSent      string
	DeliveryStatus   string
}

type ReminderDispatchItem struct {
	LogID           uuid.UUID
	CustomerID      uuid.UUID
	EstimatedDate   any
	OilAppliedName  string
	OilViscosity    string
	LicensePlate    string
	VehicleBrand    string
	VehicleModel    string
	ClientName      string
	PhoneWhatsApp   string
	LifecycleStatus string
}
