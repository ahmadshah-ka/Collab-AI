import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

import { Prisma } from "@/app/generated/prisma/client"
import { getOwnedProjects } from "@/lib/projects"
import { prisma } from "@/lib/prisma"

const ROOM_ID_PATTERN = /^[a-z0-9-]+$/

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const projects = await getOwnedProjects(userId)

  return NextResponse.json({ projects })
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const rawName = typeof body?.name === "string" ? body.name.trim() : ""
  const name = rawName.length > 0 ? rawName : "Untitled Project"

  const rawId = typeof body?.id === "string" ? body.id.trim() : ""
  if (rawId && !ROOM_ID_PATTERN.test(rawId)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
  }

  try {
    const project = await prisma.project.create({
      data: { ownerId: userId, name, ...(rawId ? { id: rawId } : {}) },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Project id already exists" },
        { status: 409 }
      )
    }
    throw err
  }
}
