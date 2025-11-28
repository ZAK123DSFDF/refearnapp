interface ValidateAndUploadParams {
  file: File
  type: "csv" | "image"
  maxSizeMB: number
  uploadId: string
  path?: string
  endpoint?: string
  field?: "logoUrl" | "openGraphUrl"
  sharp?: boolean
  addFile: (
    uploadId: string,
    file: File,
    path?: string,
    endpoint?: string,
    sharp?: boolean
  ) => Promise<{ id: string; url: string }>
  triggerError: (msg: string) => void
  handleSuccess: (
    file: File,
    fileId: string,
    uploadId: string,
    url: string
  ) => void
  handleFailure: (file: File, err: any, uploadId: string) => void
}

export async function validateAndUploadFile({
  file,
  type,
  maxSizeMB,
  uploadId,
  path,
  endpoint,
  sharp,
  field,
  addFile,
  triggerError,
  handleSuccess,
  handleFailure,
}: ValidateAndUploadParams) {
  const MAX_SIZE = maxSizeMB * 1024 * 1024

  if (file.size > MAX_SIZE) {
    return triggerError(`"${file.name}" is too large (max ${maxSizeMB}MB).`)
  }
  if (type === "csv" && !file.name.toLowerCase().endsWith(".csv")) {
    return triggerError(`"${file.name}" is not a CSV file.`)
  }
  if (type === "image") {
    const mime = file.type

    if (field === "logoUrl") {
      // ONLY SVG allowed
      if (mime !== "image/svg+xml") {
        return triggerError(
          `"${file.name}" is not valid. Logo must be an SVG file.`
        )
      }
    }
    if (field === "openGraphUrl") {
      // SVG NOT allowed
      const allowedMime = ["image/png", "image/jpeg", "image/jpg", "image/webp"]

      if (!allowedMime.includes(mime)) {
        return triggerError(
          `"${file.name}" is not supported. OpenGraph Image must be PNG, JPG, or WebP.`
        )
      }
    }
  }

  try {
    const { id, url } = await addFile(
      uploadId,
      file,
      path,
      endpoint || `/api/upload/${type}`,
      sharp
    )
    handleSuccess(file, id, uploadId, url)
  } catch (err) {
    handleFailure(file, err, uploadId)
  }
}
