import { clerkClient } from "@clerk/nextjs/server"

import type { Project, ProjectCollaborator } from "@/app/generated/prisma/client"

const CLERK_USER_EMAIL_BATCH_SIZE = 100

interface ClerkUserSummary {
  displayName: string | null
  avatarImageUrl: string | null
}

export interface EnrichedCollaborator {
  id: string
  email: string
  displayName: string | null
  avatarImageUrl: string | null
  createdAt: string
}

export interface EnrichedAccessPerson extends EnrichedCollaborator {
  role: "owner" | "collaborator"
}

function getDisplayName(user: {
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
  username?: string | null
}): string | null {
  const fullName = user.fullName?.trim()
  if (fullName) {
    return fullName
  }

  const name = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ")

  return name || user.username?.trim() || null
}

export async function enrichCollaborators(
  collaborators: ProjectCollaborator[]
): Promise<EnrichedCollaborator[]> {
  if (collaborators.length === 0) {
    return []
  }

  const emails = collaborators.map((collaborator) => collaborator.email)
  const client = await clerkClient()
  const usersByEmail = new Map<string, ClerkUserSummary>()

  for (
    let index = 0;
    index < emails.length;
    index += CLERK_USER_EMAIL_BATCH_SIZE
  ) {
    const batchEmails = emails.slice(
      index,
      index + CLERK_USER_EMAIL_BATCH_SIZE
    )
    const users = await client.users.getUserList({
      emailAddress: batchEmails,
      limit: batchEmails.length,
    })

    for (const user of users.data) {
      for (const emailAddress of user.emailAddresses) {
        usersByEmail.set(emailAddress.emailAddress.toLowerCase(), {
          displayName: getDisplayName(user),
          avatarImageUrl: user.imageUrl ?? null,
        })
      }
    }
  }

  return collaborators.map((collaborator) => {
    const user = usersByEmail.get(collaborator.email.toLowerCase())

    return {
      id: collaborator.id,
      email: collaborator.email,
      displayName: user?.displayName ?? null,
      avatarImageUrl: user?.avatarImageUrl ?? null,
      createdAt: collaborator.createdAt.toISOString(),
    }
  })
}

export async function enrichProjectOwner(
  project: Pick<Project, "ownerId" | "createdAt">
): Promise<EnrichedAccessPerson> {
  const fallbackOwner: EnrichedAccessPerson = {
    id: project.ownerId,
    email: "",
    displayName: null,
    avatarImageUrl: null,
    createdAt: project.createdAt.toISOString(),
    role: "owner",
  }

  const client = await clerkClient()
  const owner = await client.users.getUser(project.ownerId).catch(() => null)

  if (!owner) {
    return fallbackOwner
  }

  return {
    id: project.ownerId,
    email: owner.primaryEmailAddress?.emailAddress ?? "",
    displayName: getDisplayName(owner),
    avatarImageUrl: owner.imageUrl ?? null,
    createdAt: project.createdAt.toISOString(),
    role: "owner",
  }
}

export function toAccessPeople(
  owner: EnrichedAccessPerson,
  collaborators: EnrichedCollaborator[]
): EnrichedAccessPerson[] {
  return [
    owner,
    ...collaborators.map((collaborator) => ({
      ...collaborator,
      role: "collaborator" as const,
    })),
  ]
}
