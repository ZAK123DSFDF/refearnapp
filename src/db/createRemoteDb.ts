export async function createRemoteDb() {
  console.log("Creating remote database connection...")
  const adminUrl =
    "https://affiliate-d1-admin.zekariyasberihun8.workers.dev/query"
  const secret = process.env.SEED_SECRET ?? ""

  return fetch(adminUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-seed-secret": secret,
    },
  })
}
