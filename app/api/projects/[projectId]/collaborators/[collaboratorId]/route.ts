import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

const EDITOR_LAYOUT_PATH = "/editor"

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ projectId: string; collaboratorId: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId, collaboratorId } = await params
  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { count } = await prisma.projectCollaborator.deleteMany({
    where: { id: collaboratorId, projectId },
  })

  if (count === 0) {
    return NextResponse.json(
      { error: "Collaborator not found" },
      { status: 404 }
    )
  }

  revalidatePath(EDITOR_LAYOUT_PATH, "layout")

  return new NextResponse(null, { status: 204 })
}
