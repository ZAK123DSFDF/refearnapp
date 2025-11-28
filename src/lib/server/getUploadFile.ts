// lib/server/getUploadFile.ts
import { NextResponse } from "next/server"
import sharp from "sharp"

export interface UploadFileResult {
  file: File
  uploadPath: string
  type: string
  buffer: Buffer
}

export async function getUploadFile(
  request: Request
): Promise<UploadFileResult | NextResponse> {
  const formData = await request.formData()
  const file = formData.get("file") as File
  const sharpFlag = formData.get("sharp") === "true"
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }

  const path = formData.get("path") as string | undefined
  let uploadPath = path ? `${path}/${file.name}` : file.name
  let buffer = Buffer.from((await file.arrayBuffer()) as ArrayBufferLike)
  let mime = file.type
  // ❗ SVG should never be processed by Sharp
  const isSVG = file.type === "image/svg+xml"
  if (sharpFlag && !isSVG) {
    try {
      // convert to webp
      buffer = await sharp(buffer).webp({ quality: 40 }).toBuffer()
      mime = "image/webp"

      // update filename extension
      uploadPath = uploadPath.replace(/\.[^.]+$/, ".webp")
    } catch (error) {
      console.error("Sharp processing failed:", error)
    }
  }

  return {
    buffer,
    uploadPath,
    type: mime,
    file: file,
  }
}
