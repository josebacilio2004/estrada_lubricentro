"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/premium/Navbar";
import { Hero } from "@/components/premium/Hero";
import { SpecBar } from "@/components/premium/SpecBar";
import BrandTicker from "@/components/premium/BrandTicker";
import { ProductLines } from "@/components/premium/ProductLines";
import { CustomerCatalog } from "@/components/premium/CustomerCatalog";
import { Technology } from "@/components/premium/Technology";
import { StorySplit } from "@/components/premium/StorySplit";
import { MapboxLocation } from "@/components/premium/MapboxLocation";
import { BookingBanner } from "@/components/premium/BookingBanner";
import { Footer } from "@/components/premium/Footer";
import { FilmModal } from "@/components/premium/FilmModal";

export default function LandingPage() {
  const [filmModalOpen, setFilmModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink-950 text-text-hi flex flex-col font-body selection:bg-ember-500 selection:text-white">
      {/* 1. Header Navigation (Seamless Floating Overlay) */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Section: Cinematic Video Emphasis + HyperFrames Telemetry (Right Image Removed) */}
        <Hero onOpenFilm={() => setFilmModalOpen(true)} />

        {/* 3. Horizontal Specification Bar (5 Engineering Specs) */}
        <SpecBar />

        {/* 4. Infinite Car Brand Sliding Marquee (assets/marcas with Logo Top / Name Below & 3D Relief) */}
        <BrandTicker />

        {/* 5. Cream Section: Pure Form. Real Freedom. (4 Cars from Assets + Clickable Detail Modal) */}
        <ProductLines />

        {/* 5.1 Catálogo Público de Productos para Clientes */}
        <CustomerCatalog />

        {/* 6. Technology Section: Exploded Engine with motor1.mp4 in Frame + Interactive Modal */}
        <Technology />

        {/* 7. Dual Split Cards: Our Story (Sunset) + Interior (Cockpit) */}
        <StorySplit />

        {/* 8. Mapbox Interactive Location (Av. Mariátegui, Huancayo WQQ9+7JR) */}
        <MapboxLocation />

        {/* 9. Booking & Sunset Banner: Your Next Chapter Starts Here + Plate Checker */}
        <BookingBanner />
      </main>

      {/* 10. Full DOSLA Style Footer */}
      <Footer />

      {/* Cinematic Film Modal with Motion Graphics Telemetry */}
      <FilmModal
        isOpen={filmModalOpen}
        onClose={() => setFilmModalOpen(false)}
      />
    </div>
  );
}
