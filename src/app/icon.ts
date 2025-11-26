import {
  LogoIconResponse,
  contentType,
} from "@/components/ui-custom/LogoIconResponse"

export const size = { width: 45, height: 45 }
export { contentType }

export default function Icon() {
  return LogoIconResponse({
    size,
    iconSize: { width: 35, height: 35 },
  })
}
