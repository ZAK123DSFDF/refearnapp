import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import QueryProvider from "@/provider/Query"
import { Toaster } from "@/components/ui/toaster"
import React from "react"
import { buildMetadata } from "@/util/BuildMetadata"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Launch Your Affiliate Program in Minutes",
  description:
    "RefearnApp gives SaaS founders a simple, powerful way to run affiliate programs. Track referrals, understand performance, and grow revenue—without the technical overhead.",
  image: "https://refearnapp.com/opengraph.png",
  url: "https://refearnapp.com",
  icon: "https://refearnapp.com/refearnapp.svg",
  siteName: "RefearnApp",
  indexable: true,
})

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
