"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, FileIcon, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadFileAction } from "@/lib/actions/attachments"

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.doc,.docx,.xls,.xlsx"

const MAX_SIZE = 10 * 1024 * 1024

type UploadState = {
  file: File
  progress: number
  status: "pending" | "uploading" | "complete" | "error"
  error?: string
}

type Props = {
  taskId: string
  onUploadComplete?: () => void
  onUploadingChange?: (uploading: boolean) => void
  compact?: boolean
}

export function AttachmentUpload({ taskId, onUploadComplete, onUploadingChange, compact = false }: Props) {
  const router = useRouter()
  const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map())
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const uploading = Array.from(uploads.values()).some(
      (u) => u.status === "pending" || u.status === "uploading"
    )
    onUploadingChange?.(uploading)
  }, [uploads, onUploadingChange])

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `File type "${file.type || "unknown"}" is not allowed`
    }
    if (file.size > MAX_SIZE) {
      return `File size exceeds maximum of 10MB`
    }
    return null
  }

  const uploadFile = useCallback(async (file: File) => {
    const uploadId = `${file.name}-${Date.now()}`
    const error = validateFile(file)

    if (error) {
      setUploads((prev) => new Map(prev).set(uploadId, { file, progress: 0, status: "error", error }))
      return
    }

    setUploads((prev) => new Map(prev).set(uploadId, { file, progress: 0, status: "pending" }))

    try {
      setUploads((prev) => new Map(prev).set(uploadId, { file, progress: 10, status: "uploading" }))

      // Read file as base64
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")

      setUploads((prev) => new Map(prev).set(uploadId, { file, progress: 50, status: "uploading" }))

      // Upload through server action (bypasses CORS)
      await uploadFileAction({
        taskId,
        filename: file.name,
        contentType: file.type,
        fileData: base64,
      })

      setUploads((prev) => new Map(prev).set(uploadId, { file, progress: 100, status: "complete" }))

      setTimeout(() => {
        setUploads((prev) => {
          const next = new Map(prev)
          next.delete(uploadId)
          return next
        })
        onUploadComplete?.()
        router.refresh()
      }, 1500)

    } catch (err) {
      setUploads((prev) => new Map(prev).set(uploadId, {
        file,
        progress: 0,
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed",
      }))
    }
  }, [taskId, onUploadComplete, router])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    files.forEach(uploadFile)
  }, [uploadFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(uploadFile)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }, [uploadFile])

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative cursor-pointer rounded-lg border-2 border-dashed p-4 transition-colors",
          isDragging
            ? "border-[var(--primary)] bg-[var(--primary)]/5"
            : "border-[var(--border)] hover:border-[var(--primary)]",
          compact ? "p-3" : "p-6"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className={cn("h-8 w-8 text-[var(--text-muted)]", compact && "h-6 w-6")} />
          <div className={compact ? "text-sm" : ""}>
            <p className="font-medium text-[var(--text)]">
              {compact ? "Add files" : "Drop files here or click to upload"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Images, PDFs, documents up to 10MB
            </p>
          </div>
        </div>
      </div>

      {uploads.size > 0 && (
        <div className="space-y-2">
          {Array.from(uploads.entries()).map(([id, upload]) => (
            <div
              key={id}
              className="flex flex-col items-stretch gap-2 rounded-lg border border-[var(--border)] bg-white p-3 sm:flex-row sm:items-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background)]">
                {upload.status === "complete" ? (
                  <FileIcon className="h-5 w-5 text-green-600" />
                ) : upload.status === "error" ? (
                  <X className="h-5 w-5 text-red-500" />
                ) : upload.file.type.startsWith("image/") ? (
                  <ImageIcon className="h-5 w-5 text-[var(--text-muted)]" />
                ) : (
                  <FileIcon className="h-5 w-5 text-[var(--text-muted)]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{upload.file.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {upload.status === "error"
                    ? upload.error
                    : upload.status === "complete"
                      ? "Complete"
                      : formatBytes(upload.file.size)}
                </p>
              </div>

              {upload.status === "uploading" && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
                  <span className="text-xs text-[var(--text-muted)]">
                    {Math.round(upload.progress)}%
                  </span>
                </div>
              )}

              {upload.status === "complete" && (
                <span className="text-xs text-green-600">Done</span>
              )}

              {upload.status === "error" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const next = new Map(uploads)
                    next.delete(id)
                    setUploads(next)
                  }}
                >
                  Dismiss
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}
