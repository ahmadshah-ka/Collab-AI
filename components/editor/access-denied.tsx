import { Lock } from "lucide-react"
import Link from "next/link"

export function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
      <Lock className="h-8 w-8 text-copy-faint" />
      <p className="text-sm text-copy-muted">
        You do not have access to this project.
      </p>
      <Link href="/editor" className="text-sm text-brand hover:underline">
        Back to editor
      </Link>
    </div>
  )
}
