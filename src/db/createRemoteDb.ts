export async function createRemoteDb(
  sql: string,
  params: any[],
  method: "all" | "run" | "get" | "values"
) {
  const adminUrl =
    "https://affiliate-d1-admin.zekariyasberihun8.workers.dev/query"
  const secret = process.env.SEED_SECRET ?? ""
  const res = await fetch(adminUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-seed-secret": secret,
    },
    body: JSON.stringify({ sql, params, method }),
  })

  if (!res.ok) {
    throw new Error(`D1 Admin Proxy error: ${await res.text()}`)
  }

  const rows = await res.json()
  return { rows }
}
