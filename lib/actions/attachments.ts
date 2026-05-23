"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getStorageBucket } from "@/lib/firebase/admin"
import { getAttachmentPath, getPublicUrl } from "@/lib/firebase/storage"
import { requireSessionUser, taskAccessWhereForUser } from "@/lib/auth/permissions"

const ALLOWED_TYPES = [
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

const MAX_FILE_SIZE = 10 * 1024 * 1024

async function assertTaskAccess(taskId: string) {
  const user = await requireSessionUser()
  const task = await prisma.task.findFirst({
    where: { id: taskId, ...taskAccessWhereForUser(user) },
    include: {
      assignee: { select: { email: true, name: true } },
      createdBy: { select: { email: true, name: true } },
    },
  })
  if (!task) throw new Error("Task not found or access denied")
  return { user, task }
}

export type UploadFileRequest = {
  taskId: string
  filename: string
  contentType: string
  fileData: string // base64 encoded file
}

export async function uploadFileAction(request: UploadFileRequest) {
  const user = await requireSessionUser()
  await assertTaskAccess(request.taskId)

  if (!ALLOWED_TYPES.includes(request.contentType)) {
    throw new Error(`File type ${request.contentType} is not allowed`)
  }

  const fileSize = Buffer.from(request.fileData, "base64").length
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of 10MB`)
  }

  if (!request.filename || request.filename.length > 255) {
    throw new Error("Invalid filename")
  }

  const storagePath = getAttachmentPath(user.id, request.taskId, request.filename)
  const bucket = getStorageBucket()
  const file = bucket.file(storagePath)

  // Upload the file directly to Firebase
  await file.save(Buffer.from(request.fileData, "base64"), {
    metadata: {
      contentType: request.contentType,
    },
  })

  const publicUrl = getPublicUrl(storagePath)

  const attachment = await prisma.attachment.create({
    data: {
      taskId: request.taskId,
      filename: request.filename,
      fileType: request.contentType,
      fileSize: fileSize,
      url: publicUrl,
      uploadedById: user.id,
    },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  })

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      taskId: request.taskId,
      action: "ATTACHMENT_ADDED",
      details: JSON.stringify({ filename: request.filename }),
    },
  })

  revalidatePath("/board")
  revalidatePath("/tasks")

  return attachment
}

export async function deleteAttachmentAction(attachmentId: string) {
  const user = await requireSessionUser()

  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: { task: true },
  })

  if (!attachment) {
    throw new Error("Attachment not found")
  }

  await assertTaskAccess(attachment.taskId)

  const canDelete =
    attachment.uploadedById === user.id ||
    attachment.task.assigneeId === user.id ||
    attachment.task.createdById === user.id

  if (!canDelete) {
    throw new Error("Not authorized to delete this attachment")
  }

  try {
    const bucket = getStorageBucket()
    const filePath = attachment.url.split("firebasestorage.app/o/")[1]?.split("?alt=")[0]
    if (filePath) {
      await bucket.file(decodeURIComponent(filePath)).delete()
    }
  } catch (error) {
    console.error("Failed to delete file from Firebase:", error)
  }

  await prisma.attachment.delete({ where: { id: attachmentId } })

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      taskId: attachment.taskId,
      action: "ATTACHMENT_DELETED",
      details: JSON.stringify({ filename: attachment.filename }),
    },
  })

  revalidatePath("/board")
  revalidatePath("/tasks")
}

export async function getTaskAttachmentsAction(taskId: string) {
  const user = await requireSessionUser()
  await assertTaskAccess(taskId)

  const attachments = await prisma.attachment.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  })

  return attachments
}
