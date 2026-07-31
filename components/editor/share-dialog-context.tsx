"use client"

import { createContext, useCallback, useContext, useState } from "react"

interface ShareDialogState {
  projectId: string
  canManage: boolean
}

interface ShareDialogContextValue {
  shareDialog: ShareDialogState | null
  openShareDialog: (projectId: string, canManage: boolean) => void
  closeShareDialog: () => void
}

const ShareDialogContext = createContext<ShareDialogContextValue | null>(null)

export function ShareDialogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [shareDialog, setShareDialog] = useState<ShareDialogState | null>(null)

  const openShareDialog = useCallback(
    (projectId: string, canManage: boolean) => {
      setShareDialog({ projectId, canManage })
    },
    []
  )

  const closeShareDialog = useCallback(() => {
    setShareDialog(null)
  }, [])

  return (
    <ShareDialogContext.Provider
      value={{ shareDialog, openShareDialog, closeShareDialog }}
    >
      {children}
    </ShareDialogContext.Provider>
  )
}

export function useShareDialogContext() {
  const context = useContext(ShareDialogContext)
  if (!context) {
    throw new Error(
      "useShareDialogContext must be used within a ShareDialogProvider"
    )
  }
  return context
}
