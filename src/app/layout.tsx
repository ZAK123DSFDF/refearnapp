import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import QueryProvider from "@/provider/Query"
import { Toaster } from "@/components/ui/toaster"
import React from "react"
import { getOrgLogoOG } from "@/hooks/useOrgLogoOG"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
export const metadata: Metadata = {
  title: "RefearnApp-Launch your affiliate program in minutes",
  description: "Launch your affiliate program in minutes",
  openGraph: {
    title: "RefearnApp-Launch your affiliate program in minutes",
    description: "Launch your affiliate program in minutes",
    url: "https://refearnapp.com",
    siteName: "Refearn App",
    images: [
      {
        url: getOrgLogoOG(),
        width: 35,
        height: 35,
        alt: "Refearn App Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refearn App",
    description: "Launch your affiliate program in minutes",
    images: [getOrgLogoOG()],
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
