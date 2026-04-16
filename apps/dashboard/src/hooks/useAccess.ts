// hooks/useAccess.ts
import { UserLicense } from "@/lib/server/organization/getLicense"

export function useAccess(license: UserLicense | null) {
  const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"
  if (!isSelfHosted) {
    return {
      canAccessPro: true,
      canAccessUltimate: true,
      isExpired: false,
      isActivated: true,
    }
  }
  if (!license || license.isCommunity) {
    return {
      canAccessPro: false,
      canAccessUltimate: false,
      isExpired: false,
      isActivated: false,
    }
  }
  const isLicensedAndActive = license.isActive && !!license.activationId

  return {
    canAccessPro: isLicensedAndActive && (license.isPro || license.isUltimate),
    canAccessUltimate: isLicensedAndActive && license.isUltimate,
    isExpired: !license.isActive,
    isActivated: !!license.activationId,
  }
}
