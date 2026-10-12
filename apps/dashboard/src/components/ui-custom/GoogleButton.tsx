"use client"

import { Button } from "@/components/ui/button"
import { googleButtonCustomizationAtom } from "@/store/AuthCustomizationAtom"
import { useAtomValue } from "jotai"
import { useEffect, useState } from "react"

type GoogleButtonProps = {
  affiliate: boolean
  orgId: string
  rememberMe?: boolean
  isPreview?: boolean
  page?: "login" | "signup"
  isTeam?: boolean
  disabled?: boolean
  appsumoKey?: string
}

export function GoogleButton({
  affiliate,
  orgId,
  rememberMe = false,
  isPreview,
  page,
  isTeam = false,
  disabled,
  appsumoKey,
}: GoogleButtonProps) {
  const {
    googleButtonTextColor,
    googleButtonBackgroundColor,
    googleIconColor,
  } = useAtomValue(googleButtonCustomizationAtom)
  const [txnId, setTxnId] = useState<string | null>(null)
  const [polarCheckoutId, setPolarCheckoutId] = useState<string | null>(null)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setTxnId(urlParams.get("txn"))
    setPolarCheckoutId(urlParams.get("checkout_id"))
  }, [])
  const type = isTeam ? "team" : affiliate ? "affiliate" : "organization"
  const handleClick = () => {
    if (disabled) return
    if (isPreview) {
      window.open("https://www.google.com", "_blank")
    } else {
      window.location.href = `/api/auth/google?type=${type}&orgId=${orgId}&rememberMe=${rememberMe}&page=${page}&txn=${txnId || ""}&checkoutId=${encodeURIComponent(polarCheckoutId || "")}&appsumoKey=${appsumoKey || ""}`
    }
  }
  const buttonStyles = affiliate
    ? {
        backgroundColor: googleButtonBackgroundColor || undefined,
        color: googleButtonTextColor || undefined,
      }
    : {}
  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      className="w-full flex items-center gap-2"
      disabled={disabled}
      style={disabled ? {} : buttonStyles}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-5 h-5"
      >
        <path
          d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.3 2.9l6.3-6.3C35.5 4.9 30 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.9 0 20-7.9 20-21 0-1.3-.1-2.2-.5-4z"
          fill={affiliate ? googleIconColor || "#4285F4" : "#4285F4"}
        />
      </svg>
      Continue with Google
    </Button>
  )
}
