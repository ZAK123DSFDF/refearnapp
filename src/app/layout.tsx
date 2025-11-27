import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import QueryProvider from "@/provider/Query"
import { Toaster } from "@/components/ui/toaster"
import React from "react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
const unifiedDescription =
  "RefearnApp gives SaaS founders a simple, powerful way to run affiliate programs. Track referrals, understand performance, and grow revenue—without the technical overhead."

export const metadata: Metadata = {
  title: "RefearnApp – Launch Your Affiliate Program in Minutes",
  description: unifiedDescription,
  icons: {
    icon: {
      url: "/refearnapp.svg",
      type: "image/svg+xml",
    },
  },
  openGraph: {
    title: "RefearnApp | Launch Your Affiliate Program in Minutes",
    description: unifiedDescription,
    url: "https://refearnapp.com",
    siteName: "RefearnApp",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: "RefearnApp | Affiliate Program Platform for SaaS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RefearnApp | Launch Your Affiliate Program in Minutes",
    description: unifiedDescription,
    images: [
      {
        url: "/opengraph.png",
        secureUrl: "/opengraph.png",
        alt: "RefearnApp | Affiliate Program Platform for SaaS",
        type: "image/png",
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  )
}
