package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// Document Type Codes SUNAT
const (
	DocTypeFactura = "01"
	DocTypeBoleta  = "03"
	DocTypeNotaCred = "07"
	DocTypeTicket   = "80"
)

// Usage Profiles
const (
	ProfileParticular     = "PARTICULAR"
	ProfileTaxiColectivo  = "TAXI_COLECTIVO"
	ProfileFlotaComercial = "FLOTA_COMERCIAL"
)

type Customer struct {
	ID                       uuid.UUID `json:"id"`
	DocTypeCode              string    `json:"doc_type_code"`
	DocNumber                string    `json:"doc_number"`
	FullNameOrBusinessName   string    `json:"full_name_or_business_name"`
	FiscalAddress            string    `json:"fiscal_address"`
	Ubigeo                   string    `json:"ubigeo"`
	PhoneWhatsApp            string    `json:"phone_whatsapp"`
	Email                    string    `json:"email"`
	AcceptsReminders         bool      `json:"accepts_reminders"`
	CreatedAt                time.Time `json:"created_at"`
	UpdatedAt                time.Time `json:"updated_at"`
}

type Vehicle struct {
	ID           uuid.UUID `json:"id"`
	CustomerID   uuid.UUID `json:"customer_id"`
	LicensePlate string    `json:"license_plate"`
	Brand        string    `json:"brand"`
	Model        string    `json:"model"`
	Year         int16     `json:"year"`
	EngineFuel   string    `json:"engine_fuel"`
	UsageProfile string    `json:"usage_profile"`
	DailyAvgKM   int32     `json:"daily_avg_km"`
	CreatedAt    time.Time `json:"created_at"`
}

type Product struct {
	ID                 uuid.UUID       `json:"id"`
	SKU                string          `json:"sku"`
	Barcode            string          `json:"barcode"`
	Name               string          `json:"name"`
	Description        string          `json:"description"`
	CategoryID         uuid.UUID       `json:"category_id"`
	BrandID            uuid.UUID       `json:"brand_id"`
	UnitCode           string          `json:"unit_code"`
	Presentation       string          `json:"presentation"`
	TechnicalSpecs     map[string]any  `json:"technical_specs"`
	PurchasePrice      decimal.Decimal `json:"purchase_price"`
	SalePrice          decimal.Decimal `json:"sale_price"`
	StockCurrent       decimal.Decimal `json:"stock_current"`
	StockMin           decimal.Decimal `json:"stock_min"`
	ImageURL           string          `json:"image_url"`
	IsPublishedWeb     bool            `json:"is_published_web"`
	IsActive           bool            `json:"is_active"`
	BrandName          string          `json:"brand_name,omitempty"`
	CategoryName       string          `json:"category_name,omitempty"`
}

type SaleItemRequest struct {
	ProductID   uuid.UUID       `json:"product_id"`
	Description string          `json:"description"`
	Quantity    decimal.Decimal `json:"quantity"`
	UnitPrice   decimal.Decimal `json:"unit_price"`
}

type CustomerRequest struct {
	DocTypeCode            string `json:"doc_type_code"` // 1=DNI, 6=RUC, 0=Sin Doc
	DocNumber              string `json:"doc_number"`
	FullNameOrBusinessName string `json:"full_name_or_business_name"`
	FiscalAddress          string `json:"fiscal_address,omitempty"`
	PhoneWhatsApp          string `json:"phone_whatsapp,omitempty"`
	Email                  string `json:"email,omitempty"`
}

type VehicleRequest struct {
	LicensePlate string `json:"license_plate"`
	Brand        string `json:"brand"`
	Model        string `json:"model"`
	UsageProfile string `json:"usage_profile"` // PARTICULAR, TAXI_COLECTIVO, FLOTA_COMERCIAL
	CurrentKM    int32  `json:"current_km"`
}

type ServiceLogRequest struct {
	OilLifespanKM      int32  `json:"oil_lifespan_km"` // Ej: 5000, 7500, 10000
	OilAppliedName     string `json:"oil_applied_name"`
	OilViscosity       string `json:"oil_viscosity"`
	ChangedOilFilter   bool   `json:"changed_oil_filter"`
	ChangedAirFilter   bool   `json:"changed_air_filter"`
	ChangedCabinFilter bool   `json:"changed_cabin_filter"`
}

type CreateSaleRequest struct {
	DocTypeCode      string              `json:"doc_type_code"` // '01', '03', '80'
	Series           string              `json:"series"`        // 'F001', 'B001', 'NV01'
	PaymentMethod    string              `json:"payment_method"`
	PaymentCondition string              `json:"payment_condition"`
	Customer         CustomerRequest     `json:"customer"`
	Vehicle          *VehicleRequest     `json:"vehicle,omitempty"`
	ServiceLog       *ServiceLogRequest  `json:"service_log,omitempty"`
	Items            []SaleItemRequest   `json:"items"`
}

type CreateSaleResponse struct {
	SaleID            uuid.UUID       `json:"sale_id"`
	FullNumber        string          `json:"full_number"`
	IssueDate         time.Time       `json:"issue_date"`
	TotalAmount       decimal.Decimal `json:"total_amount"`
	TotalIGV          decimal.Decimal `json:"total_igv"`
	AmountInWords     string          `json:"amount_in_words"`
	QRString          string          `json:"qr_string"`
	NextServiceDate   *time.Time      `json:"next_service_date,omitempty"`
	NextServiceKM     *int32          `json:"next_service_km,omitempty"`
	CustomerName      string          `json:"customer_name"`
	CustomerDoc       string          `json:"customer_doc"`
}

type NextServiceQueryResponse struct {
	Found             bool       `json:"found"`
	LicensePlate      string     `json:"license_plate"`
	VehicleBrand      string     `json:"vehicle_brand"`
	VehicleModel      string     `json:"vehicle_model"`
	LastServiceDate   *time.Time `json:"last_service_date,omitempty"`
	LastMileage       int32      `json:"last_mileage,omitempty"`
	EstimatedNextDate *time.Time `json:"estimated_next_date,omitempty"`
	NextMileage       int32      `json:"next_mileage,omitempty"`
	OilApplied        string     `json:"oil_applied,omitempty"`
	OilViscosity      string     `json:"oil_viscosity,omitempty"`
	LifecycleStatus   string     `json:"lifecycle_status,omitempty"`
	CustomerName      string     `json:"customer_name,omitempty"`
}

type CreateProductRequest struct {
	SKU            string          `json:"sku"`
	Barcode        string          `json:"barcode"`
	Name           string          `json:"name"`
	Description    string          `json:"description"`
	CategoryID     uuid.UUID       `json:"category_id"`
	BrandID        uuid.UUID       `json:"brand_id"`
	Presentation   string          `json:"presentation"`
	TechnicalSpecs map[string]any  `json:"technical_specs"`
	PurchasePrice  decimal.Decimal `json:"purchase_price"`
	SalePrice      decimal.Decimal `json:"sale_price"`
	StockCurrent   decimal.Decimal `json:"stock_current"`
	StockMin       decimal.Decimal `json:"stock_min"`
	ImageURL       string          `json:"image_url"`
}

type UpdateProductRequest struct {
	SKU            string          `json:"sku"`
	Barcode        string          `json:"barcode"`
	Name           string          `json:"name"`
	Description    string          `json:"description"`
	CategoryID     uuid.UUID       `json:"category_id"`
	BrandID        uuid.UUID       `json:"brand_id"`
	Presentation   string          `json:"presentation"`
	TechnicalSpecs map[string]any  `json:"technical_specs"`
	PurchasePrice  decimal.Decimal `json:"purchase_price"`
	SalePrice      decimal.Decimal `json:"sale_price"`
	StockCurrent   decimal.Decimal `json:"stock_current"`
	StockMin       decimal.Decimal `json:"stock_min"`
	ImageURL       string          `json:"image_url"`
}

type Category struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	IsActive     bool      `json:"is_active"`
	ProductCount int64     `json:"product_count"`
}

type Brand struct {
	ID      uuid.UUID `json:"id"`
	Name    string    `json:"name"`
	LogoURL string    `json:"logo_url"`
}

type PortalLoginRequest struct {
	LicensePlate string `json:"license_plate"`
	Password     string `json:"password"`
}

type PortalRegisterRequest struct {
	LicensePlate  string `json:"license_plate"`
	FullName      string `json:"full_name"`
	PhoneWhatsApp string `json:"phone_whatsapp"`
	Brand         string `json:"brand"`
	Model         string `json:"model"`
	Year          int16  `json:"year"`
	EngineFuel    string `json:"engine_fuel"`
	CurrentKM     int32  `json:"current_km"`
	Password      string `json:"password"`
}

type PortalAuthResponse struct {
	Token    string            `json:"token"`
	Vehicle  PortalVehicleDTO  `json:"vehicle"`
	Customer PortalCustomerDTO `json:"customer"`
}

type PortalVehicleDTO struct {
	ID              uuid.UUID `json:"id"`
	LicensePlate    string    `json:"license_plate"`
	Brand           string    `json:"brand"`
	Model           string    `json:"model"`
	Year            int16     `json:"year"`
	EngineFuel      string    `json:"engine_fuel"`
	UsageProfile    string    `json:"usage_profile"`
	DailyAvgKM      int32     `json:"daily_avg_km"`
	CurrentOdometer int32     `json:"current_odometer"`
}

type PortalCustomerDTO struct {
	ID            uuid.UUID `json:"id"`
	DocNumber     string    `json:"doc_number"`
	FullName      string    `json:"full_name"`
	PhoneWhatsApp string    `json:"phone_whatsapp"`
	Email         string    `json:"email"`
}

type MaintenanceHistoryItem struct {
	ID                 uuid.UUID       `json:"id"`
	ServiceDate        time.Time       `json:"service_date"`
	MileageAtService   int32           `json:"mileage_at_service"`
	NextServiceMileage int32           `json:"next_service_mileage"`
	OilAppliedName     string          `json:"oil_applied_name"`
	OilViscosity       string          `json:"oil_viscosity"`
	ChangedOilFilter   bool            `json:"changed_oil_filter"`
	ChangedAirFilter   bool            `json:"changed_air_filter"`
	ChangedCabinFilter bool            `json:"changed_cabin_filter"`
	EstimatedNextDate  time.Time       `json:"estimated_next_date"`
	LifecycleStatus    string          `json:"lifecycle_status"`
	FullNumber         string          `json:"full_number"`
	TotalAmount        decimal.Decimal `json:"total_amount"`
}

type MaintenancePendingItem struct {
	ID            uuid.UUID       `json:"id"`
	VehicleID     uuid.UUID       `json:"vehicle_id"`
	ItemType      string          `json:"item_type"`
	Title         string          `json:"title"`
	Urgency       string          `json:"urgency"` // LOW, MEDIUM, HIGH, CRITICAL
	RecommendedKM int32           `json:"recommended_km"`
	EstimatedCost decimal.Decimal `json:"estimated_cost"`
	Status        string          `json:"status"`
	Notes         string          `json:"notes"`
	CreatedAt     time.Time       `json:"created_at"`
}

type PreventiveStatusResponse struct {
	VehicleID          uuid.UUID                `json:"vehicle_id"`
	LicensePlate       string                   `json:"license_plate"`
	CurrentOdometer    int32                    `json:"current_odometer"`
	LastServiceMileage int32                    `json:"last_service_mileage"`
	NextServiceMileage int32                    `json:"next_service_mileage"`
	RemainingKM        int32                    `json:"remaining_km"`
	PercentageUsed     float64                  `json:"percentage_used"`
	StatusSeverity     string                   `json:"status_severity"` // OPTIMAL, DUE_SOON, OVERDUE
	LastServiceDate    time.Time                `json:"last_service_date"`
	EstimatedNextDate  time.Time                `json:"estimated_next_date"`
	OilAppliedName     string                   `json:"oil_applied_name"`
	OilViscosity       string                   `json:"oil_viscosity"`
	PendingItems       []MaintenancePendingItem `json:"pending_items"`
}

// ----------------------------------------------------
// MODELOS ADMINISTRATIVOS & ERP ESTRADA
// ----------------------------------------------------

type AdminLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AdminUserDTO struct {
	ID          uuid.UUID `json:"id"`
	Email       string    `json:"email"`
	FullName    string    `json:"full_name"`
	Role        string    `json:"role"`
	CompanyName string    `json:"company_name"`
	CompanyRUC  string    `json:"company_ruc"`
}

type AdminAuthResponse struct {
	Token string       `json:"token"`
	User  AdminUserDTO `json:"user"`
}

type CreateCategoryRequest struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type UpdateCategoryRequest struct {
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	IsActive bool   `json:"is_active"`
}

type SaleListItem struct {
	ID             uuid.UUID       `json:"id"`
	DocTypeCode    string          `json:"doc_type_code"`
	Series         string          `json:"series"`
	Correlative    int64           `json:"correlative"`
	FullNumber     string          `json:"full_number"`
	IssueDate      time.Time       `json:"issue_date"`
	TotalAmount    decimal.Decimal `json:"total_amount"`
	TotalIGV       decimal.Decimal `json:"total_igv"`
	PaymentMethod  string          `json:"payment_method"`
	CustomerName   string          `json:"customer_name"`
	CustomerDoc    string          `json:"customer_doc"`
	LicensePlate   string          `json:"license_plate,omitempty"`
	SunatStatus    string          `json:"sunat_status"`
	PDFTicketURL   string          `json:"pdf_ticket_url,omitempty"`
}

type InventoryMovementItem struct {
	ID           uuid.UUID       `json:"id"`
	ProductID    uuid.UUID       `json:"product_id"`
	ProductName  string          `json:"product_name"`
	ProductSKU   string          `json:"product_sku"`
	MovementType string          `json:"movement_type"`
	Quantity     decimal.Decimal `json:"quantity"`
	StockBefore  decimal.Decimal `json:"stock_before"`
	StockAfter   decimal.Decimal `json:"stock_after"`
	UnitCost     decimal.Decimal `json:"unit_cost"`
	ReferenceDoc string          `json:"reference_doc"`
	CreatedAt    time.Time       `json:"created_at"`
}

type DashboardMetricsResponse struct {
	TotalMonthSales   decimal.Decimal `json:"total_month_sales"`
	TotalMonthCount   int64           `json:"total_month_count"`
	AcceptedSunatCount int64          `json:"accepted_sunat_count"`
	PendingSunatCount  int64          `json:"pending_sunat_count"`
	LowStockCount     int64           `json:"low_stock_count"`
	TotalCustomers    int64           `json:"total_customers"`
	DailySalesChart   []DailySaleData `json:"daily_sales_chart"`
	RecentSales       []SaleListItem  `json:"recent_sales"`
}

type DailySaleData struct {
	Date   string          `json:"date"`
	Amount decimal.Decimal `json:"amount"`
	Count  int64           `json:"count"`
}

// ----------------------------------------------------
// MODELOS APP MÓVIL FLUTTER (ESCÁNER INVENTARIO & POS)
// ----------------------------------------------------

type ScanInventorySyncRequest struct {
	ProductID    uuid.UUID       `json:"product_id"`
	MovementType string          `json:"movement_type"` // IN_PURCHASE, ADJUSTMENT_POS, ADJUSTMENT_NEG, SET_STOCK
	Quantity     decimal.Decimal `json:"quantity"`
	UnitCost     decimal.Decimal `json:"unit_cost"`
	Notes        string          `json:"notes"`
}

type PosScanRequest struct {
	Barcode   string          `json:"barcode"`
	Quantity  decimal.Decimal `json:"quantity"`
	SessionID string          `json:"session_id"`
}

type PosScanEventItem struct {
	ScanID    uuid.UUID       `json:"scan_id"`
	Quantity  decimal.Decimal `json:"quantity"`
	ScannedAt time.Time       `json:"scanned_at"`
	Product   Product         `json:"product"`
}

type MediaUploadBase64Request struct {
	Filename   string `json:"filename"`
	MimeType   string `json:"mime_type"`
	Base64Data string `json:"base64_data"`
}


