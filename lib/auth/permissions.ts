import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { TeamSlug, BrowseScope } from "@/lib/constants/teams"
import { TEAMS, parseBrowseScope, parseTeamParam } from "@/lib/constants/teams"
import { parseProjectParam } from "@/lib/constants/browse"
import type { Prisma } from "@prisma/client"

export type SessionUser = {
  id: string
  email: string
  name: string | null
  role: string
  team: TeamSlug | null
  devTeamAccess: boolean
}

export type BrowseDeniedReason = "wrong_team" | "no_team_board_access"

export type BrowseContext = {
  scope: BrowseScope
  team: TeamSlug | null
  projectId: string | null
  activeProjectName: string | null
  accessDenied: boolean
  deniedReason?: BrowseDeniedReason
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, team: true, devTeamAccess: true },
  })
  if (!dbUser) return null

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    team: dbUser.team as TeamSlug | null,
    devTeamAccess: dbUser.devTeamAccess,
  }
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireSessionUser()
  if (user.role !== "ADMIN") throw new Error("Forbidden")
  return user
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === "ADMIN"
}

/** Members may only browse their assigned team; admins see all teams. */
export function getBrowsableTeams(user: SessionUser): TeamSlug[] {
  if (isAdmin(user)) return [...TEAMS]
  if (!user.team) return []
  return [user.team]
}

/** @deprecated Use getBrowsableTeams */
export function getAccessibleTeams(user: SessionUser): TeamSlug[] {
  return getBrowsableTeams(user)
}

export function canViewTeamBoard(user: SessionUser): boolean {
  if (isAdmin(user)) return true
  return user.devTeamAccess
}

export function canAccessTeam(user: SessionUser, team: TeamSlug): boolean {
  if (isAdmin(user)) return true
  return user.team === team
}

async function resolveProjectForBrowse(
  projectParam: string | null,
  effectiveTeam: TeamSlug | null
): Promise<{ projectId: string | null; activeProjectName: string | null }> {
  if (!projectParam || !effectiveTeam) {
    return { projectId: null, activeProjectName: null }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectParam },
    select: { id: true, name: true, team: true },
  })

  if (!project || project.team !== effectiveTeam) {
    return { projectId: null, activeProjectName: null }
  }

  return { projectId: project.id, activeProjectName: project.name }
}

export async function resolveBrowseContext(
  user: SessionUser,
  params: {
    team?: string | string[]
    scope?: string | string[]
    project?: string | string[]
  }
): Promise<BrowseContext> {
  const scopeParam = parseBrowseScope(params.scope)
  const teamParam = parseTeamParam(params.team)
  const projectParam = parseProjectParam(params.project)

  if (isAdmin(user)) {
    const raw = Array.isArray(params.team) ? params.team[0] : params.team
    const team =
      raw === "all" || !raw ? null : (parseTeamParam(params.team) ?? null)

    if (!team) {
      return {
        scope: "team",
        team: null,
        projectId: null,
        activeProjectName: null,
        accessDenied: false,
      }
    }

    const { projectId, activeProjectName } = await resolveProjectForBrowse(
      projectParam,
      team
    )

    return {
      scope: "team",
      team,
      projectId,
      activeProjectName,
      accessDenied: false,
    }
  }

  // Member: default to personal tasks
  if (scopeParam === "mine" || (!scopeParam && !teamParam)) {
    const { projectId, activeProjectName } = await resolveProjectForBrowse(
      projectParam,
      user.team
    )
    return {
      scope: "mine",
      team: user.team,
      projectId,
      activeProjectName,
      accessDenied: false,
    }
  }

  if (teamParam && teamParam !== user.team) {
    return {
      scope: "mine",
      team: user.team,
      projectId: null,
      activeProjectName: null,
      accessDenied: true,
      deniedReason: "wrong_team",
    }
  }

  if (scopeParam === "team" && user.team) {
    if (!canViewTeamBoard(user)) {
      return {
        scope: "mine",
        team: user.team,
        projectId: null,
        activeProjectName: null,
        accessDenied: true,
        deniedReason: "no_team_board_access",
      }
    }
    const { projectId, activeProjectName } = await resolveProjectForBrowse(
      projectParam,
      user.team
    )
    return {
      scope: "team",
      team: user.team,
      projectId,
      activeProjectName,
      accessDenied: false,
    }
  }

  const { projectId, activeProjectName } = await resolveProjectForBrowse(
    projectParam,
    user.team
  )
  return {
    scope: "mine",
    team: user.team,
    projectId,
    activeProjectName,
    accessDenied: false,
  }
}

const CLOSED_FILTER: Prisma.TaskWhereInput = { status: { not: "CLOSED" } }

function teamProjectFilter(team: TeamSlug): Prisma.TaskWhereInput {
  return {
    OR: [{ projectId: null }, { project: { team } }],
  }
}

/** Prisma filter for admin browsing a single team (no specific project). */
function adminBrowseTeamTaskWhere(team: TeamSlug): Prisma.TaskWhereInput {
  return {
    ...CLOSED_FILTER,
    OR: [
      { project: { team } },
      { projectId: null, assignee: { team } },
      { projectId: null, createdBy: { team } },
    ],
  }
}

/** Whether a board task belongs to the browsed team (project, people, or unscoped). */
export function taskBelongsToBrowseTeam(
  task: {
    projectTeam: TeamSlug | null
    assigneeTeam: TeamSlug | null
    createdByTeam: TeamSlug | null
  },
  team: TeamSlug
): boolean {
  if (task.projectTeam === team) return true
  if (task.assigneeTeam === team) return true
  if (task.createdByTeam === team) return true
  if (task.projectTeam === null) return true
  return false
}

function taskWhereForAdmin(ctx?: BrowseContext): Prisma.TaskWhereInput {
  if (!ctx?.team && !ctx?.projectId) {
    return CLOSED_FILTER
  }
  if (ctx.projectId) {
    return { ...CLOSED_FILTER, projectId: ctx.projectId }
  }
  if (ctx.team) {
    return adminBrowseTeamTaskWhere(ctx.team)
  }
  return CLOSED_FILTER
}

export function taskWhereForUser(
  user: SessionUser,
  ctx?: BrowseContext
): Prisma.TaskWhereInput {
  if (ctx?.accessDenied) {
    return { id: "never" }
  }

  if (isAdmin(user)) {
    return taskWhereForAdmin(ctx)
  }

  if (!ctx || ctx.scope === "mine") {
    const where: Prisma.TaskWhereInput = {
      ...CLOSED_FILTER,
      assigneeId: user.id,
    }
    if (ctx?.projectId) {
      where.projectId = ctx.projectId
    }
    return where
  }

  if (ctx.scope === "team" && user.team && canViewTeamBoard(user)) {
    const where: Prisma.TaskWhereInput = {
      ...CLOSED_FILTER,
      ...teamProjectFilter(user.team),
    }
    if (ctx.projectId) {
      where.projectId = ctx.projectId
    }
    return where
  }

  return { id: "never" }
}

/** Union of tasks a member may read/update (my assignments + team board when allowed). */
export function taskAccessWhereForUser(user: SessionUser): Prisma.TaskWhereInput {
  if (isAdmin(user)) {
    return CLOSED_FILTER
  }

  const or: Prisma.TaskWhereInput[] = [{ assigneeId: user.id }]
  if (user.team && canViewTeamBoard(user)) {
    or.push(teamProjectFilter(user.team))
  }

  return {
    ...CLOSED_FILTER,
    OR: or,
  }
}

export function projectWhereForUser(
  user: SessionUser,
  ctx?: BrowseContext
): Prisma.ProjectWhereInput {
  if (ctx?.accessDenied) {
    return { id: "never" }
  }

  if (isAdmin(user)) {
    if (ctx?.team) return { team: ctx.team }
    return {}
  }

  if (!user.team) {
    return { id: "never" }
  }

  return { team: user.team }
}

export function memberUserWhereForUser(
  user: SessionUser,
  ctx?: BrowseContext
): Prisma.UserWhereInput {
  if (isAdmin(user)) {
    if (ctx?.team) return { team: ctx.team }
    return {}
  }

  if (!user.team) return { id: user.id }
  if (ctx?.scope === "team" && canViewTeamBoard(user)) {
    return { team: user.team }
  }
  return { id: user.id }
}

export function canAssignToProject(user: SessionUser, projectTeam: TeamSlug): boolean {
  if (isAdmin(user)) return true
  return user.team === projectTeam
}
