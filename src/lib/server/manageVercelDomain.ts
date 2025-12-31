"use server"
export async function addDomainToVercel(domain: string) {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw {
      status: res.status,
      toast: data.error?.message ?? "Failed to add domain to Vercel",
    }
  }

  return data
}
export async function verifyDomainOnVercel(domain: string) {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}/verify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      },
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw {
      status: res.status,
      toast: data.error?.message ?? "Failed to verify domain",
    }
  }

  return data
}
export async function deleteDomainFromVercel(domain: string) {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      },
    }
  )

  if (!res.ok) {
    const data = await res.json()
    throw {
      status: res.status,
      toast: data?.error?.message ?? "Failed to delete domain from Vercel",
    }
  }
}
