import { atom } from "jotai"

export type FileStatus = "pending" | "processing" | "success" | "error"

export interface UploadedFile {
  id: string
  name: string
  file: File
  progress: number
  status: FileStatus
}

interface UploadNamespace {
  files: UploadedFile[]
  errorMessage: string | null
}

// global record of all uploads
export const uploadsAtom = atom<Record<string, UploadNamespace>>({})

// shared updater helper
function updateUploads(
  get: (atom: typeof uploadsAtom) => Record<string, UploadNamespace>,
  set: (
    atom: typeof uploadsAtom,
    update: Record<string, UploadNamespace>
  ) => void,
  fn: (
    uploads: Record<string, UploadNamespace>
  ) => Record<string, UploadNamespace>
) {
  const uploads = get(uploadsAtom)
  set(uploadsAtom, fn(uploads))
}

// set error message
export const setErrorMessageAtom = atom(
  null,
  (get, set, uploadId: string, msg: string | null) => {
    updateUploads(get, set, (uploads) => {
      const current = uploads[uploadId] || { files: [], errorMessage: null }
      return {
        ...uploads,
        [uploadId]: { ...current, errorMessage: msg },
      }
    })
  }
)

// remove file
export const removeFileAtom = atom(
  null,
  (get, set, uploadId: string, id: string) => {
    updateUploads(get, set, (uploads) => {
      const current = uploads[uploadId]
      if (!current) return uploads
      return {
        ...uploads,
        [uploadId]: {
          ...current,
          files: current.files.filter((f) => f.id !== id),
        },
      }
    })
  }
)

// add & upload file (async)
export const addFileAtom = atom(
  null,
  async (
    get,
    set,
    uploadId: string,
    file: File,
    path?: string,
    endpoint: string = "/api/upload",
    sharp?: boolean
  ) => {
    const newFile: UploadedFile = {
      id: crypto.randomUUID(),
      name: file.name,
      file,
      progress: 0,
      status: "pending",
    }

    // immediately insert
    updateUploads(get, set, (uploads) => {
      const current = uploads[uploadId] || { files: [], errorMessage: null }
      return {
        ...uploads,
        [uploadId]: { ...current, files: [...current.files, newFile] },
      }
    })

    try {
      const formData = new FormData()
      if (path) formData.append("path", path)
      formData.append("file", file)
      if (sharp !== undefined) {
        formData.append("sharp", sharp ? "true" : "false")
      }
      const res = await fetch(endpoint, { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()
      // success
      updateUploads(get, set, (uploads) => {
        const latest = uploads[uploadId]
        if (!latest) return uploads
        return {
          ...uploads,
          [uploadId]: {
            ...latest,
            files: latest.files.map((f) =>
              f.id === newFile.id
                ? { ...f, status: "success", progress: 100 }
                : f
            ),
          },
        }
      })

      return { id: newFile.id, url }
    } catch (err) {
      console.error("Upload Error:", err)
      updateUploads(get, set, (uploads) => {
        const latest = uploads[uploadId]
        if (!latest) return uploads
        return {
          ...uploads,
          [uploadId]: {
            ...latest,
            files: latest.files.map((f) =>
              f.id === newFile.id ? { ...f, status: "error" } : f
            ),
          },
        }
      })
      throw err
    }
  }
)
