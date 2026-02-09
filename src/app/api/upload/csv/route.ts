import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { parsePaypalCSV } from "@/lib/server/parsePaypalCSV"
import util from "util"
import {
  processTransactions,
  Transaction,
} from "@/lib/server/processTransactions"
import { getUploadFile } from "@/lib/server/getUploadFile"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const POST = handleRoute(
  "Upload and Process PayPal CSV",
  async (request) => {
    // 1. Get File from request
    const result = await getUploadFile(request)

    // If getUploadFile returns a response (like an error), return it directly
    if (result instanceof Response) return result

    const { file, uploadPath } = result
    const csvText = await file.text()

    // 2. Parse CSV
    const parsed = parsePaypalCSV(csvText)

    if (!parsed || !parsed.transactions) {
      throw new AppError({
        error: "INVALID_CSV",
        toast: "The PayPal CSV format is invalid or empty.",
        status: 400,
      })
    }

    // 3. Map to Transaction type
    const transactions: Transaction[] = parsed.transactions.map((t: any) => ({
      Unique_Identifier: t.Unique_Identifier,
      Recipient: t.Recipient,
      Status: t.Status,
      Amount: t.Amount.amount,
    }))

    // 4. Database Processing
    await processTransactions(transactions)

    console.log(
      "✅ Parsed PayPal Data:",
      util.inspect(parsed, { depth: null, colors: true })
    )

    // 5. Upload to Cloud Storage (R2)
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uploadPath,
        Body: csvText,
        ContentType: "text/csv",
      })
    )

    return NextResponse.json({
      ok: true,
      toast: "File processed and uploaded successfully",
      parsedData: parsed,
    })
  }
)
