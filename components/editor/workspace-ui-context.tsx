"use client"

import { createContext, useCallback, useContext, useState } from "react"

interface WorkspaceUiContextValue {
  isAiSidebarOpen: boolean
  toggleAiSidebar: () => void
}

const WorkspaceUiContext = createContext<WorkspaceUiContextValue | null>(null)

export function WorkspaceUiProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true)
  const toggleAiSidebar = useCallback(
    () => setIsAiSidebarOpen((open) => !open),
    []
  )

  return (
    <WorkspaceUiContext.Provider value={{ isAiSidebarOpen, toggleAiSidebar }}>
      {children}
    </WorkspaceUiContext.Provider>
  )
}

export function useWorkspaceUiContext() {
  const context = useContext(WorkspaceUiContext)
  if (!context) {
    throw new Error(
      "useWorkspaceUiContext must be used within a WorkspaceUiProvider"
    )
  }
  return context
}
