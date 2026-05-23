"use client"

import { useTransition } from "react"
import { Download, Trash2, FileIcon, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteAttachmentAction } from "@/lib/actions/attachments"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export type AttachmentData = {
  id: string
  filename: string
  fileType: string
  fileSize: number
  url: string
  createdAt: Date | string
  uploadedBy: {
    id: string
    name: string | null
    email: string
  }
}

type Props = {
  attachments: AttachmentData[]
  currentUserId: string
  onDelete?: () => void
}

export function AttachmentList({ attachments, currentUserId, onDelete }: Props) {
  const [pending, startTransition] = useTransition()

  function handleDelete(attachmentId: string) {
    if (!confirm("Delete this attachment?")) return

    startTransition(async () => {
      await deleteAttachmentAction(attachmentId)
      onDelete?.()
    })
  }

  if (attachments.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        No attachments yet.
      </p>
    )
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="group flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-white p-3 transition-colors hover:bg-[var(--background)] sm:flex-row sm:items-center"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--background)]">
            {attachment.fileType.startsWith("image/") ? (
              <ImageIcon className="h-5 w-5 text-[var(--primary)]" />
            ) : (
              <FileIcon className="h-5 w-5 text-[var(--text-muted)]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-medium text-[var(--primary)] hover:underline"
            >
              {attachment.filename}
            </a>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)]">
              <span>{formatBytes(attachment.fileSize)}</span>
              <span>·</span>
              <span>{format(new Date(attachment.createdAt), "MMM d, yyyy")}</span>
              <span>·</span>
              <span>{attachment.uploadedBy.name ?? attachment.uploadedBy.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            <Button
              size="sm"
              variant="ghost"
              asChild
            >
              <a href={attachment.url} download={attachment.filename} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>

            {(attachment.uploadedBy.id === currentUserId) && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-600"
                disabled={pending}
                onClick={() => handleDelete(attachment.id)}
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      ))}
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
