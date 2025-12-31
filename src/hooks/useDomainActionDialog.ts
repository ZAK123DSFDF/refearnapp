"use client"

export type DomainActionType =
  | "activate"
  | "deactivate"
  | "make-primary"
  | "enable-redirect"
  | "disable-redirect"
  | "delete"
  | "verify-dns"

export interface DomainActionState {
  type: DomainActionType
  domainId: string
  domainName?: string
  domainType?: "CUSTOM_DOMAIN" | "CUSTOM_SUBDOMAIN" | "DEFAULT"
}

export function useDomainActionMeta(action: DomainActionState | null) {
  if (!action) return null

  const name = action.domainName ? ` "${action.domainName}"` : ""

  switch (action.type) {
    case "activate":
      return {
        title: "Activate Domain",
        description: `Activating the domain${name} will allow it to accept incoming traffic and serve requests. Are you sure you want to activate it?`,
        confirmText: "Activate",
        color: "#4ADE80",
      }

    case "deactivate":
      return {
        title: "Deactivate Domain",
        description: `Deactivating the domain${name} will prevent it from accepting any traffic. Are you sure you want to deactivate it?`,
        confirmText: "Deactivate",
        color: "#F87171",
      }

    case "make-primary":
      return {
        title: "Make Domain Primary",
        description: `Making the domain${name} the primary domain means it will be used as your main domain for serving traffic.`,
        confirmText: "Make Primary",
        color: "#60A5FA",
      }

    case "enable-redirect":
      return {
        title: "Enable Redirect",
        description: `Enabling redirect for the domain${name} will redirect all incoming traffic to the primary domain. Are you sure you want to enable redirect?`,
        confirmText: "Enable Redirect",
        color: "#60A5FA",
      }

    case "disable-redirect":
      return {
        title: "Disable Redirect",
        description: `Disabling redirect for the domain${name} will allow it to accept and handle traffic directly instead of redirecting to the primary domain. Are you sure you want to disable redirect?`,
        confirmText: "Disable Redirect",
        color: "#F87171",
      }

    case "delete":
      return {
        title: "Delete Domain",
        description: `Deleting the domain${name} will permanently remove it from your organization. This action cannot be undone.`,
        confirmText: "Delete Domain",
        color: "#F87171",
      }
    case "verify-dns":
      return {
        title: "Verify Domain DNS",
        description:
          action.domainType === "CUSTOM_DOMAIN"
            ? `Add the A record below for${name}, then click Verify.`
            : `Add the CNAME record below for${name}, then click Verify.`,
        confirmText: "Verify Domain",
        color: "#60A5FA",
      }
    default:
      return null
  }
}
