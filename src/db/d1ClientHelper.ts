import { Database as D1HttpClient, DatabaseBinding } from "@cloudflare/d1"
export type RawD1Client = D1HttpClient
export function createRemoteD1Client(): RawD1Client {
  if (
    !process.env.CLOUDFLARE_ACCOUNT_ID ||
    !process.env.CLOUDFLARE_DATABASE_ID ||
    !process.env.CLOUDFLARE_D1_TOKEN
  ) {
    throw new Error(
      "D1 connection failed. CLOUDFLARE_ACCOUNT_ID, DATABASE_ID, or TOKEN are missing."
    )
  }

  console.log("Connecting to remote D1 via HTTP driver for local tasks...")

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID!
  const token = process.env.CLOUDFLARE_D1_TOKEN!
  const binding: DatabaseBinding = {
    fetch: (resource, init) => {
      const resourceString = String(resource)
      const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}`
      const url = new URL(resourceString, baseUrl).toString()
      const headers = new Headers(init?.headers)
      headers.set("Authorization", `Bearer ${token}`)
      headers.set("Content-Type", "application/json")
      return fetch(url, {
        ...init,
        headers,
      })
    },
  }
  return new D1HttpClient(binding)
}
