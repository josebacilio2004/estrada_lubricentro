"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/admin/ErpLayout";
import {
  Plus,
  CheckCircle2,
  ShoppingCart,
  Package,
  Smartphone,
  Barcode,
  Printer,
} from "lucide-react";
import { CustomerSection } from "@/components/pos/CustomerSection";
import { VehicleSection } from "@/components/pos/VehicleSection";
import { CartSection } from "@/components/pos/CartSection";
import { ThermalTicket } from "@/components/pos/ThermalTicket";
import { submitSale } from "@/lib/api";
import {
  CartItem,
  CustomerData,
  DocumentType,
  ProductItem,
  SaleResult,
  VehicleData,
} from "@/types";
import {
  TARJETA,
  CabeceraSeccion,
  SegmentadoControl,
  BuscadorKhipu,
  ChipCodigo,
  PillEstado,
  ACCION_PRINCIPAL,
  ACCION_SECUNDARIA,
  cn,
} from "@/components/khipu/khipu-ui";

interface PosProduct extends ProductItem {
  image_url: string;
  category: string;
  barcode?: string;
}

const POS_CATALOG: PosProduct[] = [
  {
    id: "06bd2789-6cb5-4100-9ea3-2a4187160462",
    sku: "CAS-EDGE-5W30-QT",
    barcode: "7501001234568",
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
    barcode: "7501001234561",
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
    barcode: "3374650238289",
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
    barcode: "5011987001234",
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
    barcode: "3374650248721",
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
    barcode: "7501001234572",
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
    barcode: "4047024712301",
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
    barcode: "4011558734206",
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
    barcode: "4100420037214",
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
    barcode: "4047025123458",
    name: "Líquido de Frenos Bosch DOT 4 HP 1L",
    presentation: "Botella 1 Litro",
    price: 42.0,
    stock: 30,
    brand: "Bosch",
    category: "Aditivos",
    image_url: "/media/line-synthetic.png",
  },
];

function playScannerBeep() {
  try {
    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1480, ctx.currentTime);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.11);
  } catch {
    // Ignore audio context restriction
  }
}

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

  const [catalogProducts, setCatalogProducts] =
    useState<PosProduct[]>(POS_CATALOG);
  const [lastScannedBanner, setLastScannedBanner] = useState<string | null>(
    null
  );
  const [mobileScannerCount, setMobileScannerCount] = useState<number>(0);

  const [searchProduct, setSearchProduct] = useState("");
  const [selectedCat, setSelectedCat] = useState("TODOS");

  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSaleResult, setLastSaleResult] = useState<SaleResult | null>(null);
  const [showThermalTicket, setShowThermalTicket] = useState(false);
  const [saleSuccessBanner, setSaleSuccessBanner] = useState<string | null>(
    null
  );

  const fetchPosCatalog = async () => {
    try {
      const res = await fetch(`/v1/products?t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const mapped: PosProduct[] = data.data.map((p: any) => {
          const catRaw = (p.category_name || "").toLowerCase();
          let catLabel = "Sintéticos";
          if (catRaw.includes("semi")) catLabel = "Semisintéticos";
          else if (catRaw.includes("mineral")) catLabel = "Minerales";
          else if (catRaw.includes("filtro")) catLabel = "Filtros";
          else if (
            catRaw.includes("aditivo") ||
            catRaw.includes("freno") ||
            catRaw.includes("refrig")
          )
            catLabel = "Aditivos";

          return {
            id: p.id,
            sku: p.sku,
            barcode: p.barcode || "",
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

  // Sincronización en Tiempo Real con Escáner de App Móvil Flutter (cache: no-store)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/v1/pos/scan-queue?session_id=MAIN&t=${Date.now()}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
            },
          }
        );
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          playScannerBeep();
          json.data.forEach((ev: any) => {
            const p = ev.product;
            if (!p || !p.id) return;
            const qty = Math.max(1, Number(ev.quantity) || 1);
            const posProd: PosProduct = {
              id: p.id,
              sku: p.sku || "SKU-GEN",
              barcode: p.barcode || "",
              name: p.name,
              presentation: p.presentation || "1 Unidad",
              price: Number(p.sale_price) || 0,
              stock: Number(p.stock_current) || 0,
              viscosity: p.technical_specs?.viscosity || "5W-30",
              brand: p.brand_name || "Estrada",
              category: "Sintéticos",
              image_url: p.image_url || "/media/line-synthetic.png",
            };

            setCart((prev) => {
              const exists = prev.find((i) => i.product.id === posProd.id);
              if (exists) {
                return prev.map((i) =>
                  i.product.id === posProd.id
                    ? { ...i, quantity: i.quantity + qty, product: posProd }
                    : i
                );
              }
              return [...prev, { product: posProd, quantity: qty }];
            });

            setMobileScannerCount((c) => c + qty);
            setLastScannedBanner(
              `📱 Escaneado desde App Móvil: ${posProd.name} (+${qty} unid.) — S/ ${posProd.price.toFixed(
                2
              )}`
            );
          });
          fetchPosCatalog();
        }
      } catch {
        // Ignore polling errors silently
      }
    }, 1000);

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
    playScannerBeep();
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
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: qty } : i
        )
      );
    }
  };

  const handleNewSale = () => {
    setCart([]);
    setCustomer({
      docType: "1",
      docNumber: "",
      name: "",
      phone: "",
      address: "",
    });
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
        full_name_or_business_name:
          customer.name ||
          (docType === "01" ? "EMPRESA S.A.C." : "CLIENTE GENERAL"),
        fiscal_address: customer.address || "HUANCAYO, JUNÍN",
        phone_whatsapp: customer.phone
          ? `+51${customer.phone.replace(/\D/g, "")}`
          : "",
      },
      vehicle: vehicle.plate
        ? {
            license_plate: vehicle.plate.toUpperCase(),
            brand: vehicle.brand,
            model: vehicle.model,
            usage_profile: vehicle.usageProfile,
            current_km: vehicle.currentKM,
          }
        : undefined,
      service_log: vehicle.plate
        ? {
            oil_lifespan_km: vehicle.oilLifespanKM,
            oil_applied_name: vehicle.oilApplied,
            oil_viscosity: "5W-30",
            changed_oil_filter: vehicle.filterOil,
            changed_air_filter: vehicle.filterAir,
            changed_cabin_filter: vehicle.filterCabin,
          }
        : undefined,
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
      setSaleSuccessBanner(
        `¡Venta registrada con éxito y stock descontado! Comprobante emitido: ${
          result.full_number
        } por S/ ${totalAmount.toFixed(2)}`
      );
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
        p.barcode?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <ErpLayout
      categoryTitle="Emisión y SUNAT"
      title="Terminal POS"
      actionButton={{
        label: "Nueva Venta (F2)",
        onClick: handleNewSale,
      }}
    >
      {/* Barra de estado Khipu del túnel con la App Móvil */}
      <div
        className={cn(
          TARJETA,
          "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
        )}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <PillEstado tono="ok" icon={Smartphone}>
             Pistola Móvil POS Conectada (Sesión MAIN)
          </PillEstado>
          <span className="text-etiqueta text-muted-foreground">
            Cada código de barras escaneado en el celular se agrega automáticamente a este carrito.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {mobileScannerCount > 0 ? (
            <ChipCodigo>{mobileScannerCount} escaneados hoy</ChipCodigo>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-etiqueta text-texto-terciario">
              <Barcode className="h-3.5 w-3.5" />
              <span>Esperando lectura EAN-13 / SKU…</span>
            </span>
          )}
        </div>
      </div>

      {/* Notificación en vivo cuando entra un producto desde el celular */}
      {lastScannedBanner ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-success-border bg-success px-4 py-2.5 text-success-foreground shadow-sm">
          <div className="flex items-center gap-2.5">
            <Smartphone className="h-4 w-4 shrink-0" />
            <span className="text-control font-semibold">
              {lastScannedBanner}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLastScannedBanner(null)}
            className="text-etiqueta font-medium underline opacity-80 hover:opacity-100"
          >
            Descartar aviso
          </button>
        </div>
      ) : null}

      {/* Alerta de comprobante emitido */}
      {saleSuccessBanner && lastSaleResult ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success-border bg-success px-4 py-3 text-success-foreground shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <div>
              <span className="block text-control font-semibold">
                {saleSuccessBanner}
              </span>
              <span className="text-etiqueta opacity-85">
                Sincronizado con SUNAT · Stock actualizado en PostgreSQL · Ticket térmico 80mm listo
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowThermalTicket(true)}
            className={ACCION_SECUNDARIA}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Ver / Imprimir Ticket</span>
          </button>
        </div>
      ) : null}

      <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Columna Izquierda: Cliente + Vehículo + Catálogo Khipu */}
        <div className="flex flex-col gap-3 lg:col-span-7">
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

          <VehicleSection vehicle={vehicle} setVehicle={setVehicle} />

          {/* 3. Catálogo de Productos con SegmentadoControl y BuscadorKhipu */}
          <div className={cn(TARJETA, "pb-4")}>
            <CabeceraSeccion
              icon={Package}
              titulo="3. Catálogo de productos y frecuentes"
              subtitulo={`${filteredProducts.length} productos disponibles en almacén`}
              derecha={
                <BuscadorKhipu
                  valor={searchProduct}
                  onChange={setSearchProduct}
                  placeholder="Buscar por nombre, SKU o EAN…"
                  className="w-full sm:w-64"
                />
              }
            />

            <div className="px-4 pt-1 space-y-3">
              <SegmentadoControl<string>
                valor={selectedCat}
                onChange={setSelectedCat}
                opciones={[
                  { valor: "TODOS", etiqueta: "Todos" },
                  { valor: "Sintéticos", etiqueta: "Sintéticos" },
                  { valor: "Semisintéticos", etiqueta: "Semisintéticos" },
                  { valor: "Minerales", etiqueta: "Minerales" },
                  { valor: "Filtros", etiqueta: "Filtros" },
                  { valor: "Aditivos", etiqueta: "Aditivos" },
                ]}
              />

              <div className="grid max-h-[380px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="group flex items-center justify-between gap-3 rounded-xl bg-secondary p-2.5 text-left transition-all hover:bg-secondary/75 hover:ring-1 hover:ring-acento-borde"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card p-1 border border-border/60">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="h-full w-full object-contain transition-transform group-hover:scale-105"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-etiqueta text-muted-foreground">
                            {prod.sku}
                          </span>
                        </div>
                        <div className="truncate text-control font-semibold text-foreground">
                          {prod.name}
                        </div>
                        <div className="text-etiqueta text-texto-terciario tabular-nums">
                          Stock: {prod.stock} u. · {prod.presentation}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-titulo font-semibold text-foreground tabular-nums">
                        S/ {prod.price.toFixed(2)}
                      </div>
                      <span className="mt-0.5 inline-flex items-center gap-0.5 rounded-full bg-acento-suave px-2 py-0.5 text-etiqueta font-medium text-acento-texto dark:text-acento">
                        <Plus className="h-3 w-3" /> Añadir
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Carrito y Liquidación */}
        <div
          id="pos-cart-section"
          className="flex flex-col gap-3 scroll-mt-20 lg:col-span-5"
        >
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

      {/* Barra Flotante Móvil */}
      {cart.length > 0 ? (
        <div className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-xl border border-border bg-popover/95 p-3 shadow-xl backdrop-blur lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-acento text-acento-texto">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-etiqueta text-muted-foreground tabular-nums">
                {cart.reduce((a, b) => a + b.quantity, 0)} unidades en carrito
              </span>
              <span className="text-titulo font-bold text-foreground tabular-nums">
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
            className={ACCION_PRINCIPAL}
          >
            Ver Carrito →
          </button>
        </div>
      ) : null}

      {showThermalTicket && lastSaleResult ? (
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
      ) : null}
    </ErpLayout>
  );
}
