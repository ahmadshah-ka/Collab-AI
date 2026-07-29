import { auth, currentUser } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const { userId } = await auth()
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: { where: { email: email ?? "" }, take: 1 },
    },
  })

  const isOwner = project?.ownerId === userId
  const isCollaborator = !!project?.collaborators.length

  if (!project || (!isOwner && !isCollaborator)) {
    notFound()
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="font-heading text-xl font-medium text-copy-primary">
        {project.name}
      </h1>
      <p className="max-w-sm text-sm text-copy-muted">
        The canvas workspace is coming soon.
      </p>
    </div>
  )
}
