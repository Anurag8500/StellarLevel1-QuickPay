import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FreighterProvider } from "@/context/FreighterProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickPay | Stellar Micro-Payment dApp",
  description: "A clean, modern micro-payment dApp built on Stellar. Send XLM payments instantly using your Freighter wallet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <FreighterProvider>
          {children}
        </FreighterProvider>
      </body>
    </html>
  );
}
