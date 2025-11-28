import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getUploadFile } from "@/lib/server/getUploadFile"

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: Request) {
  try {
    const result = await getUploadFile(request)
    if (result instanceof NextResponse) return result
    const { buffer, type, uploadPath } = result

    // upload directly to R2
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
      message: "Image uploaded successfully",
      url: fileUrl,
    })
  } catch (err) {
    console.error("Image upload failed:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
