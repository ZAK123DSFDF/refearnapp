import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getUploadFile } from "@/lib/server/getUploadFile"
import { handleRoute } from "@/lib/handleRoute"

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const POST = handleRoute("Image Upload", async (request) => {
  // 1. Extract file data
  const result = await getUploadFile(request)

  // If getUploadFile returns an early error response, we pass it through
  if (result instanceof Response) return result

  const { buffer, type, uploadPath } = result

  // 2. Upload to Cloudflare R2
  // If this fails (network/auth), handleRoute catches it
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uploadPath,
      Body: buffer,
      ContentType: type,
    })
  )

  const fileUrl = `${process.env.R2_ACCESS_URL}/${uploadPath}`

  return NextResponse.json({
    ok: true,
    toast: "Image uploaded successfully",
    url: fileUrl,
  })
})
