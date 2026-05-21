import { format } from "date-fns"
import { prisma } from "@/lib/prisma"
import { priorityLabel } from "@/lib/constants/tasks"
import { appBaseUrl } from "@/lib/email"
import { sendZeptoTemplate, isZeptoConfigured } from "@/lib/email/zepto"

async function isRuleEnabled(trigger: string): Promise<boolean> {
  const rule = await prisma.automationRule.findFirst({
    where: { trigger, action: "send_email", enabled: true },
  })
  return Boolean(rule)
}

function taskBoardUrl(): string {
  return `${appBaseUrl()}/board`
}

function newTaskMergeFields(params: {
  taskTitle: string
  displayId: number
  priority: string
  dueDate: Date | null
  description: string | null
  assignedBy: string
}): Record<string, string> {
  const descriptionText = params.description?.trim() || "No description provided"
  const priority = priorityLabel(params.priority)
  const dueDate = params.dueDate
    ? format(params.dueDate, "MMM d, yyyy")
    : "Not set"
  const assignedBy = params.assignedBy.trim() || "Admin"

  // Keys must match Zepto template merge tags exactly.
  return {
    task_name: params.taskTitle,
    task_description: descriptionText,
    task_url: taskBoardUrl(),
    due_date: dueDate,
    assigned_by: assignedBy,
    priority,
  }
}

export async function notifyTaskAssigned(params: {
  assigneeEmail: string
  assigneeName?: string | null
  taskTitle: string
  displayId: number
  priority: string
  dueDate: Date | null
  description: string | null
  assignedBy: string
}) {
  if (!isZeptoConfigured()) return
  if (!(await isRuleEnabled("task.assigned"))) return

  const templateKey = process.env.ZEPTO_TEMPLATE_NEW_TASK?.trim()
  if (!templateKey) {
    console.warn("[zepto] ZEPTO_TEMPLATE_NEW_TASK not set — skip assignment email")
    return
  }

  await sendZeptoTemplate({
    to: { email: params.assigneeEmail, name: params.assigneeName ?? undefined },
    templateKey,
    merge: newTaskMergeFields(params),
  })
}

export async function notifyTaskUpdated(params: {
  recipientEmail: string
  recipientName?: string | null
  taskTitle: string
  updatedColumns: string
  updatedBy: string
}) {
  if (!isZeptoConfigured()) return

  const statusRule = await isRuleEnabled("task.status_changed")
  const updatedRule = await isRuleEnabled("task.updated")
  if (!statusRule && !updatedRule) return

  const templateKey = process.env.ZEPTO_TEMPLATE_TASK_UPDATED?.trim()
  if (!templateKey) {
    console.warn("[zepto] ZEPTO_TEMPLATE_TASK_UPDATED not set")
    return
  }

  await sendZeptoTemplate({
    to: { email: params.recipientEmail, name: params.recipientName ?? undefined },
    templateKey,
    merge: {
      task_name: params.taskTitle,
      updated_at: format(new Date(), "MMM d, yyyy 'at' h:mm a"),
      updated_columns: params.updatedColumns,
      task_url: taskBoardUrl(),
      updated_by: params.updatedBy,
    },
  })
}
