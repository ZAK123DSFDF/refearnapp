// lib/util/check-updates.ts
import { APP_VERSION } from "@/lib/constants/version"
import { handleAction } from "@/lib/handleAction"
import { AppError } from "@/lib/exceptions"
import { ActionResult } from "@/lib/types/organization/response"

export type UpdateInfo = {
  isNewer: boolean
  latestVersion: string
  url: string
  changelog: string
}

export async function checkVersion(): Promise<ActionResult<UpdateInfo>> {
  return handleAction("Check GitHub Version", async () => {
    const REPO = "ZAK123DSFDF/refearnapp"

    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      {
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      // If GitHub is down or repo is private, we throw a handled error
      throw new AppError({
        status: res.status,
        toast: "Could not fetch latest version from GitHub",
      })
    }

    const data = await res.json()

    if (!data.tag_name) {
      throw new AppError({
        status: 500,
        toast: "Invalid response from GitHub API",
      })
    }

    const latestVersion = data.tag_name.replace("v", "")
    const isNewer = latestVersion !== APP_VERSION

    return {
      ok: true,
      data: {
        isNewer,
        latestVersion,
        url: data.html_url,
        changelog: data.body,
      },
    }
  })
}
