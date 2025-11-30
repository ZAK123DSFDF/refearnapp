import React from "react"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { AuthCustomizationProvider } from "@/app/affiliate/[orgId]/(auth)/authCustomizationProvider"
interface authLayoutProps {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
}

export default async function AuthLayout({
  children,
  params,
}: authLayoutProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  return (
    <AuthCustomizationProvider affiliate orgId={orgId}>
      {children}
    </AuthCustomizationProvider>
  )
}
