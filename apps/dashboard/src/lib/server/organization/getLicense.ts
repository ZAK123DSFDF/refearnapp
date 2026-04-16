export async function getLicense(orgId: string) {
  if (process.env.NEXT_PUBLIC_SELF_HOSTED !== "true") return null

  // Return a static Ultimate license for self-hosted installations
  return {
    ok: true,
    data: {
      id: "self-hosted-license",
      userId: "all-users",
      key: "ULTIMATE-FREE-LICENSE",
      status: "active",
      tier: "ULTIMATE" as const,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastValidatedAt: new Date(),
      isCommunity: false,
      isActive: true,
      isPro: false,
      isUltimate: true,
      activationId: "self-hosted-activation",
    },
  }
}

type GetLicenseReturn = Awaited<ReturnType<typeof getLicense>>
export type UserLicense =
  NonNullable<GetLicenseReturn> extends { data: infer T } ? T : null
