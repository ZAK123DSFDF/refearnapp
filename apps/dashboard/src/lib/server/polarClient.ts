import "server-only"
import { createPolar } from "@polar-sh/sdk/2026-04"
import { polarConfig } from "@/lib/polarConfig"

export const polar = createPolar({
  accessToken: polarConfig.accessToken,
  environment: polarConfig.server,
})
