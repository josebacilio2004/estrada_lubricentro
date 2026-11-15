import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ESTRADA | Ingeniería en Lubricación & Mantenimiento Automotriz",
  description: "Protege más allá de lo esperado. Lubricantes de alta pureza, diagnóstico predictivo y facturación electrónica SUNAT UBL 2.1.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ink-950 text-text-hi antialiased selection:bg-ember-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
