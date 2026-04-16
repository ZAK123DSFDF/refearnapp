// hooks/useAccess.ts

export function useAccess() {
  return {
    canAccessPro: true,
    canAccessUltimate: true,
    isExpired: false,
    isActivated: true,
  }
}
