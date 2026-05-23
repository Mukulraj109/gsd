export const STORAGE_PATH_PREFIX = "gsd"

export function getAttachmentPath(userId: string, taskId: string, filename: string): string {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
  return `${STORAGE_PATH_PREFIX}/${userId}/${taskId}/${Date.now()}_${sanitizedFilename}`
}

export function getPublicUrl(storagePath: string): string {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET || ""
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`
}
