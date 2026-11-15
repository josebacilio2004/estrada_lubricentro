"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ErpLayout } from "@/components/admin/ErpLayout";
import { ArrowLeft, Plus, Search, CheckCircle2, AlertCircle, ShoppingCart, Sparkles, Filter, Package } from "lucide-react";
import { CustomerSection } from "@/components/pos/CustomerSection";
import { VehicleSection } from "@/components/pos/VehicleSection";
import { CartSection } from "@/components/pos/CartSection";
import { ThermalTicket } from "@/components/pos/ThermalTicket";
import { submitSale } from "@/lib/api";
import { CartItem, CustomerData, DocumentType, ProductItem, SaleResult, VehicleData } from "@/types";

interface PosProduct extends ProductItem {
  image_url: string;
  category: string;
}

const POS_CATALOG: PosProduct[] = [
  {
    id: "06bd2789-6cb5-4100-9ea3-2a4187160462",
    sku: "CAS-EDGE-5W30-QT",
    name: "Castrol EDGE Titanium FST 5W-30 (1 Cuarto)",
    presentation: "1 Cuarto (946ml)",
    price: 48.0,
    stock: 70,
    viscosity: "5W-30",
    brand: "Castrol",
    category: "Sintéticos",
    image_url: "/media/line-synthetic.png",
  },
  {
    id: "d497ff24-cbc5-404d-95b0-18e483f1447d",
    sku: "MOB-5W30-GLN",
    name: "Mobil 1 Advanced Full Synthetic 5W-30 (1 Galón)",
    presentation: "1 Galón (3.78L)",
    price: 185.0,
    stock: 34,
    viscosity: "5W-30",
    brand: "Mobil 1",
    category: "Sintéticos",
    image_url: "/media/line-synthetic.png",
  },
  {
    id: "2dc922f7-4a63-4b62-aad3-016c8d315da9",
    sku: "MOT-8100-5W40-5L",
    name: "Motul 8100 X-cess Gen2 5W-40 (5L)",
    presentation: "Bidón 5 Litros",
    price: 235.0,
    stock: 20,
    viscosity: "5W-40",
    brand: "Motul",
    category: "Sintéticos",
    image_url: "/media/line-synthetic.png",
  },
  {
    id: "bfb957ba-71a3-4f0b-8d31-b4e7d1545b5f",
    sku: "SHL-ULTRA-0W20",
    name: "Shell Helix Ultra 0W-20 PurePlus (4L)",
    presentation: "Bidón 4 Litros",
    price: 195.0,
    stock: 18,
    viscosity: "0W-20",
    brand: "Shell Helix",
    category: "Sintéticos",
    image_url: "/media/line-synthetic.png",
  },
  {
    id: "31c3c9ac-57d2-416d-a297-89c1a083f796",
    sku: "MOT-6100-10W40-4L",
    name: "Motul 6100 Synergie+ 10W-40 (4L)",
    presentation: "Galón (4 Litros)",
    price: 155.0,
    stock: 25,
    viscosity: "10W-40",
    brand: "Motul",
    category: "Semisintéticos",
    image_url: "/media/line-semi.png",
  },
  {
    id: "2ccaaafd-1671-4cb6-bd1d-1a07faddb5ba",
    sku: "CAS-GTX-20W50-GLN",
    name: "Castrol GTX 20W-50 Alto Kilometraje (1 Galón)",
    presentation: "1 Galón (3.78L)",
    price: 110.0,
    stock: 40,
    viscosity: "20W-50",
    brand: "Castrol",
    category: "Minerales",
    image_url: "/media/line-mineral.png",
  },
  {
    id: "c10d06c5-35b7-4c98-b181-ffd0906f9c1b",
    sku: "FLT-BOSCH-P3300",
    name: "Filtro de Aceite Bosch Premium P3300",
    presentation: "Caja Unidad",
    price: 28.0,
    stock: 45,
    brand: "Bosch",
    category: "Filtros",
    image_url: "/media/tech-engine.png",
  },
  {
    id: "1d5f9166-179a-4413-b9ac-411378c13be7",
    sku: "FLT-MANN-W683",
    name: "Filtro de Aceite Mann Filter W 68/3",
    presentation: "Caja Unidad",
    price: 32.0,
    stock: 49,
    brand: "Mann Filter",
    category: "Filtros",
    image_url: "/media/tech-engine.png",
  },
  {
    id: "2eb5dff5-b8c6-428f-9f05-221f74fa974d",
    sku: "LIQ-CERATEC-300",
    name: "Liqui Moly Cera Tec Antifricción 300ml",
    presentation: "Lata 300ml",
    price: 85.0,
    stock: 24,
    brand: "Liqui Moly",
    category: "Aditivos",
    image_url: "/media/line-synthetic.png",
  },
  {
    id: "60c9ca9a-ce48-483b-9cf6-1488e8c0dde5",
    sku: "BOSCH-DOT4-1L",
    name: "Líquido de Frenos Bosch DOT 4 HP 1L",
    presentation: "Botella 1 Litro",
    price: 42.0,
    stock: 30,
    brand: "Bosch",
    category: "Aditivos",
    image_url: "/media/line-synthetic.png",
  },
];

export default function POSPage() {
  const [docType, setDocType] = useState<DocumentType>("03");
  const [series, setSeries] = useState("B001");

  const [customer, setCustomer] = useState<CustomerData>({
    docType: "1",
    docNumber: "",
    name: "",
    phone: "",
    address: "",
  });

  const [vehicle, setVehicle] = useState<VehicleData>({
    plate: "",
    brand: "Toyota",
    model: "Yaris",
    currentKM: 45000,
    oilLifespanKM: 7500,
    oilApplied: "Mobil 1 5W-30",
    usageProfile: "PARTICULAR",
    filterOil: true,
    filterAir: false,
    filterCabin: false,
  });

  const [cart, setCart] = useState<CartItem[]>([
    { product: POS_CATALOG[1], quantity: 1 },
    { product: POS_CATALOG[6], quantity: 1 },
  ]);

  const [catalogProducts, setCatalogProducts] = useState<PosProduct[]>(POS_CATALOG);
  const [lastScannedBanner, setLastScannedBanner] = useState<string | null>(null);

  const [searchProduct, setSearchProduct] = useState("");
  const [selectedCat, setSelectedCat] = useState("TODOS");

  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSaleResult, setLastSaleResult] = useState<SaleResult | null>(null);
  const [showThermalTicket, setShowThermalTicket] = useState(false);
  const [saleSuccessBanner, setSaleSuccessBanner] = useState<string | null>(null);

  const fetchPosCatalog = async () => {
    try {
      const res = await fetch("/v1/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const mapped: PosProduct[] = data.data.map((p: any) => {
          const catRaw = (p.category_name || "").toLowerCase();
          let catLabel = "Sintéticos";
          if (catRaw.includes("semi")) catLabel = "Semisintéticos";
          else if (catRaw.includes("mineral")) catLabel = "Minerales";
          else if (catRaw.includes("filtro")) catLabel = "Filtros";
          else if (catRaw.includes("aditivo") || catRaw.includes("freno") || catRaw.includes("refrig")) catLabel = "Aditivos";

          return {
            id: p.id,
            sku: p.sku,
            name: p.name,
            presentation: p.presentation || "1 Unidad",
            price: Number(p.sale_price),
            stock: Number(p.stock_current),
            viscosity: p.technical_specs?.viscosity || "5W-30",
            brand: p.brand_name || "Estrada",
            category: catLabel,
            image_url: p.image_url || "/media/line-synthetic.png",
          };
        });
        setCatalogProducts(mapped);
      }
    } catch {
      // Fallback to POS_CATALOG
    }
  };

  useEffect(() => {
    fetchPosCatalog();
  }, []);

  // Sincronización en Tiempo Real con Escáner de App Móvil Flutter
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/v1/pos/scan-queue?session_id=MAIN");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          json.data.forEach((ev: any) => {
            const p = ev.product;
            if (!p || !p.id) return;
            const qty = Math.max(1, Number(ev.quantity) || 1);
            const posProd: PosProduct = {
              id: p.id,
              sku: p.sku,
              name: p.name,
              presentation: p.presentation || "1 Unidad",
              price: Number(p.sale_price),
              stock: Number(p.stock_current),
              viscosity: p.technical_specs?.viscosity || "5W-30",
              brand: p.brand_name || "Estrada",
              category: "Sintéticos",
              image_url: p.image_url || "/media/line-synthetic.png",
            };

            setCart((prev) => {
              const exists = prev.find((i) => i.product.id === posProd.id);
              if (exists) {
                return prev.map((i) =>
                  i.product.id === posProd.id ? { ...i, quantity: i.quantity + qty } : i
                );
              }
              return [...prev, { product: posProd, quantity: qty }];
            });

            setLastScannedBanner(`📱 Escaneado desde App Móvil: ${posProd.name} (+${qty} unid.) — S/ ${posProd.price.toFixed(2)}`);
          });
          fetchPosCatalog();
        }
      } catch {
        // Ignore polling errors silently
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (docType === "01") setSeries("F001");
    if (docType === "03") setSeries("B001");
    if (docType === "80") setSeries("NV01");
  }, [docType]);

  const subtotalGravado = cart.reduce(
    (acc, item) => acc + (item.product.price * item.quantity) / 1.18,
    0
  );
  const totalAmount = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const totalIGV = totalAmount - subtotalGravado;

  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const handleNewSale = () => {
    setCart([]);
    setCustomer({ docType: "1", docNumber: "", name: "", phone: "", address: "" });
    setVehicle((prev) => ({ ...prev, plate: "" }));
    setLastSaleResult(null);
    setShowThermalTicket(false);
    setSaleSuccessBanner(null);
  };

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      alert("Agregue al menos un producto al carrito");
      return;
    }
    if (!customer.docNumber.trim()) {
      alert("Ingrese el número de DNI / RUC del cliente");
      return;
    }

    setIsProcessing(true);
    setSaleSuccessBanner(null);

    const payload = {
      doc_type_code: docType,
      series: series,
      payment_method: paymentMethod,
      payment_condition: "CONTADO",
      customer: {
        doc_type_code: docType === "01" ? "6" : "1",
        doc_number: customer.docNumber,
        full_name_or_business_name: customer.name || (docType === "01" ? "EMPRESA S.A.C." : "CLIENTE GENERAL"),
        fiscal_address: customer.address || "HUANCAYO, JUNÍN",
        phone_whatsapp: customer.phone ? `+51${customer.phone.replace(/\D/g, "")}` : "",
      },
      vehicle: vehicle.plate ? {
        license_plate: vehicle.plate.toUpperCase(),
        brand: vehicle.brand,
        model: vehicle.model,
        usage_profile: vehicle.usageProfile,
        current_km: vehicle.currentKM,
      } : undefined,
      service_log: vehicle.plate ? {
        oil_lifespan_km: vehicle.oilLifespanKM,
        oil_applied_name: vehicle.oilApplied,
        oil_viscosity: "5W-30",
        changed_oil_filter: vehicle.filterOil,
        changed_air_filter: vehicle.filterAir,
        changed_cabin_filter: vehicle.filterCabin,
      } : undefined,
      items: cart.map((item) => ({
        product_id: item.product.id,
        description: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
      })),
    };

    try {
      const result = await submitSale(payload);
      setLastSaleResult(result);
      setShowThermalTicket(true);
      setSaleSuccessBanner(`¡Venta registrada con éxito y stock descontado! Comprobante emitido: ${result.full_number} por S/ ${totalAmount.toFixed(2)}`);
      fetchPosCatalog();
    } catch {
      alert("Error procesando la venta");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = catalogProducts.filter((p) => {
    if (selectedCat !== "TODOS" && p.category !== selectedCat) return false;
    if (searchProduct) {
      const q = searchProduct.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <ErpLayout
      categoryTitle="Emisión & SUNAT"
      title="Terminal POS"
      actionButton={{
        label: "Nueva Venta (F2)",
        onClick: handleNewSale,
      }}
    >
      <div className="space-y-6">

        {/* Live Mobile Scanner Sync Banner */}
        {lastScannedBanner && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="font-mono text-xs font-bold">{lastScannedBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setLastScannedBanner(null)}
              className="text-[11px] font-mono text-amber-300 hover:text-white underline"
            >
              Ocultar
            </button>
          </div>
        )}

        {/* Success Alert Banner when Sale is Registered */}
        {saleSuccessBanner && lastSaleResult && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm block">{saleSuccessBanner}</span>
                <span className="text-xs text-gray-400 font-mono">
                  Sincronizado con SUNAT • Token de validación generado • Ticket térmico listo
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowThermalTicket(true)}
              className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors font-mono"
            >
              Imprimir Ticket
            </button>
          </div>
        )}

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Customer + Vehicle + Catalog with Search & Filters */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* 1. Customer Section with CRM Selection */}
            <CustomerSection
              docType={docType}
              setDocType={setDocType}
              series={series}
              customer={customer}
              setCustomer={setCustomer}
              onSelectVehicle={(vehData) => {
                setVehicle((prev) => ({
                  ...prev,
                  plate: vehData.plate || prev.plate,
                  brand: vehData.brand || prev.brand,
                  model: vehData.model || prev.model,
                  currentKM: vehData.currentKM || prev.currentKM,
                }));
              }}
            />

            {/* 2. Vehicle Section */}
            <VehicleSection
              vehicle={vehicle}
              setVehicle={setVehicle}
            />

            {/* 3. Products Catalog with Images, Real-Time Search & Category Pills */}
            <div className="p-5 rounded-2xl bg-[#141720]/90 backdrop-blur-md border border-white/[0.08] shadow-lg space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <span className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>3. Catálogo de Productos & Frecuentes</span>
                </span>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Buscar aceite, SKU o filtro..."
                    className="w-full bg-[#101217] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
                {["TODOS", "Sintéticos", "Semisintéticos", "Minerales", "Filtros", "Aditivos"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCat(cat)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                      selectedCat === cat
                        ? "bg-white text-black font-bold shadow-md"
                        : "bg-white/[0.04] text-gray-400 hover:text-white border border-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Product Cards with Images & Instant 1-Click Add */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="text-left p-3 rounded-xl bg-[#101217]/80 hover:bg-[#181c26] border border-white/[0.06] hover:border-amber-500/50 transition-all flex items-center justify-between gap-3 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Product Thumbnail */}
                      <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="truncate">
                        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                          {prod.sku}
                        </div>
                        <div className="text-xs font-bold text-white truncate font-sans">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          Stock: {prod.stock} unid. • {prod.presentation}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-mono font-black text-sm text-amber-400">
                        S/ {prod.price.toFixed(2)}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-400 group-hover:text-white mt-1">
                        <Plus className="w-3 h-3 text-emerald-400" /> Agregar
                      </span>
                    </div>
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* Right Column: POS Cart & Checkout */}
          <div id="pos-cart-section" className="lg:col-span-5 flex flex-col gap-4 scroll-mt-20">
            <CartSection
              series={series}
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              subtotalGravado={subtotalGravado}
              totalIGV={totalIGV}
              totalAmount={totalAmount}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              onProcessSale={handleProcessSale}
              isProcessing={isProcessing}
            />
          </div>

        </div>

        {/* Mobile Sticky Cart Total Indicator (Visible on phones when items exist in cart) */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 p-3.5 rounded-2xl bg-[#141720]/95 backdrop-blur-xl border border-amber-500/50 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono block">
                  {cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? "ítem" : "ítems"}
                </span>
                <span className="text-sm font-black text-white font-mono">
                  S/ {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("pos-cart-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono shadow-md active:scale-95 transition-all"
            >
              Ver Carrito →
            </button>
          </div>
        )}

      </div>

      {/* Ticket Modal */}
      {showThermalTicket && lastSaleResult && (
        <ThermalTicket
          docType={docType}
          saleResult={lastSaleResult}
          cart={cart}
          subtotalGravado={subtotalGravado}
          totalIGV={totalIGV}
          totalAmount={totalAmount}
          plate={vehicle.plate}
          currentKM={vehicle.currentKM}
          onClose={() => setShowThermalTicket(false)}
        />
      )}
    </ErpLayout>
  );
}