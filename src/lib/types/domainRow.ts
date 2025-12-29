export type DomainRow = {
  id: string
  domainName: string
  isActive: boolean
  isRedirect: boolean
  isVerified: boolean
  isPrimary: boolean
  dnsStatus: "Pending" | "Verified" | "Failed"
}
