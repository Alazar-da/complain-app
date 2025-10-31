'use client';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../i18n"; // 🔥 import it once here
import { useTranslation } from "react-i18next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* export const metadata: Metadata = {
  title: "የአቃቂ ቃሊቲ ክፍለ ከተማ  ትምህርት  ትምህርት ጽ/ቤት",
  description: "Complian app",
}; */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  return (
    <html lang={i18n.language}>
      <body>{children}</body>
    </html>
  );
}
