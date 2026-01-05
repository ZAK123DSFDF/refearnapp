import type { Metadata } from "next"

const unifiedDescription =
  "RefearnApp gives SaaS founders a simple, powerful way to run affiliate programs. Track referrals, understand performance, and grow revenue—without the technical overhead."

const defaultImage = "/opengraph-update.png"
const siteUrl = "https://refearnapp.com"
interface MetadataOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  indexable: boolean
  icon?: string
  siteName?: string
}
export function buildMetadata({
  title = "RefearnApp | Launch Your Affiliate Program in Minutes",
  description = unifiedDescription,
  image = defaultImage,
  url = siteUrl,
  indexable,
  icon = "/refearnapp.svg",
  siteName = "RefearnApp",
}: MetadataOptions): Metadata {
  return {
    title,
    description,
    icons: {
      icon: {
        url: icon,
        type: "image/svg+xml",
      },
    },
    metadataBase: new URL(siteUrl),
    alternates: { canonical: url },

    openGraph: {
      title,
      description,
      url,
      siteName,
      images: [
        {
          url: image,
          secureUrl: image,
          type: "image/png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: image,
          secureUrl: image,
          type: "image/png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    robots: {
      index: indexable,
      follow: indexable,
    },
  }
}
