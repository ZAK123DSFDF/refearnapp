import { AuthCustomization } from "@/customization/Auth/defaultAuthCustomization"
import { DashboardCustomization } from "@/customization/Dashboard/defaultDashboardCustomization"

export type OrganizationAuthCustomizationSeed = {
  id: string
  auth?: DeepPartial<AuthCustomization>
  createdAt?: Date
  updatedAt?: Date
}

export type OrganizationDashboardCustomizationSeed = {
  id: string
  dashboard?: DeepPartial<DashboardCustomization>
  createdAt?: Date
  updatedAt?: Date
}
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}
