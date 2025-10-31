'use client';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../i18n"; // 🔥 import it once here
import { useTranslation } from "react-i18next";
import Meta from "@/components/Meta";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  return (
    <html lang={i18n.language}>
      <Meta/>
      <body>{children}</body>
    </html>
  );
}
