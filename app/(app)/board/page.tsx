import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getBoardTasks } from "@/lib/queries/board"
import { BoardClient } from "@/components/board/board-client"

export default async function BoardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const [tasks, projects] = await Promise.all([
    getBoardTasks(),
    prisma.project.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ])
  const projectNames = [...new Set(projects.map((p) => p.name).filter(Boolean))] as string[]

  return <BoardClient initialTasks={tasks} projectNames={projectNames} />
}
