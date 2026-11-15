export type DocumentType = "01" | "03" | "80"; // 01=Factura, 03=Boleta, 80=Nota de Venta

export interface ProductItem {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  presentation?: string;
  price: number;
  stock: number;
  viscosity?: string;
  brand?: string;
  tag?: string;
}

export interface CustomerData {
  docType: "1" | "6" | "0"; // 1=DNI, 6=RUC
  docNumber: string;
  name: string;
  phone: string;
  address: string;
}

export interface VehicleData {
  plate: string;
  brand: string;
  model: string;
  currentKM: number;
  oilLifespanKM: number;
  oilApplied: string;
  usageProfile: "PARTICULAR" | "TAXI_COLECTIVO" | "FLOTA_COMERCIAL";
  filterOil: boolean;
  filterAir: boolean;
  filterCabin: boolean;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface NextServiceData {
  found: boolean;
  license_plate: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  last_service_date?: string;
  last_mileage?: number;
  estimated_next_date?: string;
  next_mileage?: number;
  oil_applied?: string;
  oil_viscosity?: string;
  lifecycle_status?: string;
  customer_name?: string;
}

export interface SaleResult {
  sale_id: string;
  full_number: string;
  issue_date: string;
  total_amount: number;
  total_igv: number;
  amount_in_words: string;
  qr_string: string;
  customer_name: string;
  customer_doc: string;
  next_service_km?: number;
  next_service_date?: string;
}
