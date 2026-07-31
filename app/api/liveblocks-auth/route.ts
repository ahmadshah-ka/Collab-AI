import { auth, currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

import { getDisplayName } from "@/lib/collaborators"
import { getCursorColorForUser, liveblocks } from "@/lib/liveblocks"
import { getAccessibleProject } from "@/lib/project-access"

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const roomId = typeof body?.room === "string" ? body.room : ""

  if (!roomId) {
    return NextResponse.json({ error: "A room is required" }, { status: 400 })
  }

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? null
  const project = await getAccessibleProject(roomId, { userId, email })

  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await liveblocks.getOrCreateRoom(roomId, {
    defaultAccesses: ["room:write"],
  })

  const { status, body: responseBody } = await liveblocks.identifyUser(
    userId,
    {
      userInfo: {
        name: (user && getDisplayName(user)) || "Anonymous",
        avatar: user?.imageUrl ?? "",
        color: getCursorColorForUser(userId),
      },
    }
  )

  return new NextResponse(responseBody, { status })
}
