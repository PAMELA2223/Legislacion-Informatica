import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// display: "swap" evita texto invisible mientras carga la fuente (mejora CLS/LCP)
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Plataforma de Legislación Informática",
    template: "%s | Legislación Informática",
  },
  description:
    "Plataforma educativa sobre legislación informática del Ecuador: módulos, biblioteca jurídica, evaluaciones y casos prácticos.",
  keywords: [
    "legislación informática",
    "derecho informático Ecuador",
    "comercio electrónico",
    "protección de datos personales",
    "delitos informáticos",
    "plataforma educativa jurídica",
  ],
  authors: [{ name: "Plataforma de Legislación Informática" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "Legislación Informática",
    title: "Plataforma de Legislación Informática",
    description:
      "Conocimiento y normas para un mundo digital seguro: módulos, biblioteca jurídica, evaluaciones y casos prácticos.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Plataforma de Legislación Informática",
    description: "Conocimiento y normas para un mundo digital seguro.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#070B2A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        {/* Enlace de salto para accesibilidad por teclado: el destino
            (id="contenido-principal") se agrega en los layouts que envuelven
            el contenido navegable (dashboard, público). */}
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
