import "dotenv/config"
import { payoutReference, payoutReferencePeriods } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

const refId = process.argv[2]

if (!refId) {
  console.error("❌ Please provide a payout reference ID")
  process.exit(1)
}

async function main() {
  const db = await getDB()
  const rows = await db
    .select()
    .from(payoutReference)
    .leftJoin(
      payoutReferencePeriods,
      eq(payoutReference.refId, payoutReferencePeriods.refId)
    )
    .where(eq(payoutReference.refId, refId))

  if (rows.length === 0) {
    console.log(`⚠️ No payout reference found for refId=${refId}`)
  } else {
    const ref = {
      ...rows[0].payout_reference,
      periods: rows
        .filter((r) => r.payout_reference_periods !== null)
        .map((r) => r.payout_reference_periods),
    }

    console.log("✅ Result:")
    console.dir(ref, { depth: null })
  }

  process.exit(0)
}

main().catch((err) => {
  console.error("❌ Error running query:", err)
  process.exit(1)
})
