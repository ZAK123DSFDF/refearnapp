import {
  DeepPartial,
  OrganizationAuthCustomizationSeed,
  OrganizationDashboardCustomizationSeed,
} from "@/lib/types/customizationSeedTypes"
import { defaultAuthCustomization } from "@/customization/Auth/defaultAuthCustomization"
import { defaultDashboardCustomization } from "@/customization/Dashboard/defaultDashboardCustomization"
import merge from "lodash/merge"

export function buildAuthCustomizationSeed(
  seed: OrganizationAuthCustomizationSeed
) {
  return {
    id: seed.id,
    auth: buildCustomization(defaultAuthCustomization, seed.auth),
    createdAt: seed.createdAt ?? new Date(),
    updatedAt: seed.updatedAt ?? new Date(),
  }
}

export function buildDashboardCustomizationSeed(
  seed: OrganizationDashboardCustomizationSeed
) {
  return {
    id: seed.id,
    dashboard: buildCustomization(
      defaultDashboardCustomization,
      seed.dashboard
    ),
    createdAt: seed.createdAt ?? new Date(),
    updatedAt: seed.updatedAt ?? new Date(),
  }
}
function buildCustomization<T>(defaults: T, overrides?: DeepPartial<T>): T {
  return merge({}, defaults, overrides)
}
