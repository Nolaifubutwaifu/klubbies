import type { Metadata, Viewport } from "next";
import { Archivo, DM_Sans, Nunito } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/* Used by the soft theme prototype (.theme-soft) only. */
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Klubbies", template: "%s · Klubbies" },
  description: "Your club's photos, for your club only.",
  applicationName: "Klubbies",
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f3f2f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${nunito.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
