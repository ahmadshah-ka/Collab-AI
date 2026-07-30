import { auth, currentUser } from "@clerk/nextjs/server"

import type { Project } from "@/app/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export interface CurrentIdentity {
  userId: string | null
  email: string | null
}

export async function getCurrentIdentity(): Promise<CurrentIdentity> {
  const { userId } = await auth()
  const user = await currentUser()

  return { userId, email: user?.primaryEmailAddress?.emailAddress ?? null }
}

export async function getAccessibleProject(
  projectId: string,
  identity: CurrentIdentity
): Promise<Project | null> {
  const normalizedEmail = identity.email?.trim().toLowerCase() || null

  if (!normalizedEmail) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project || project.ownerId !== identity.userId) {
      return null
    }

    return project
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: { where: { email: normalizedEmail }, take: 1 },
    },
  })

  if (!project) {
    return null
  }

  const isOwner = project.ownerId === identity.userId
  const isCollaborator = project.collaborators.length > 0

  if (!isOwner && !isCollaborator) {
    return null
  }

  return project
}
