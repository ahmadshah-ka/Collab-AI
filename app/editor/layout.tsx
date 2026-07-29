import { auth, currentUser } from "@clerk/nextjs/server"

import { EditorShell } from "@/components/editor/editor-shell"
import { getOwnedProjects, getSharedProjects } from "@/lib/projects"

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress

  const [ownedProjects, sharedProjects] = await Promise.all([
    userId ? getOwnedProjects(userId) : Promise.resolve([]),
    email ? getSharedProjects(email) : Promise.resolve([]),
  ])

  return (
    <EditorShell ownedProjects={ownedProjects} sharedProjects={sharedProjects}>
      {children}
    </EditorShell>
  )
}
