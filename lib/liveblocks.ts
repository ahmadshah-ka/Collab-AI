import { Liveblocks } from "@liveblocks/node"

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined
}

function createLiveblocksClient() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set")
  }

  return new Liveblocks({ secret })
}

export const liveblocks =
  globalForLiveblocks.liveblocks ?? createLiveblocksClient()

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocks = liveblocks
}

const CURSOR_COLORS = [
  "#F87171",
  "#FB923C",
  "#FACC15",
  "#4ADE80",
  "#22D3EE",
  "#60A5FA",
  "#A78BFA",
  "#F472B6",
]

export function getCursorColorForUser(userId: string): string {
  let hash = 0

  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i)
    hash |= 0
  }

  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
}
