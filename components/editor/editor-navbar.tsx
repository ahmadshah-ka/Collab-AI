"use client"

import { UserButton } from "@clerk/nextjs"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Button } from "@/components/ui/button"

export const SIDEBAR_TOGGLE_ID = "editor-sidebar-toggle"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
}: EditorNavbarProps) {
  return (
    <nav className="grid h-14 shrink-0 grid-cols-3 items-center border-b border-surface-border bg-surface px-4">
      <div className="flex items-center gap-2 justify-self-start">
        <Button
          id={SIDEBAR_TOGGLE_ID}
          variant="ghost"
          size="icon-sm"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          onClick={onToggleSidebar}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex items-center justify-self-center" />
      <div className="flex items-center justify-self-end">
        <UserButton />
      </div>
    </nav>
  )
}
