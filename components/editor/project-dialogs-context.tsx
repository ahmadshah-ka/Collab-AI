"use client"

import { createContext, useContext } from "react"

import {
  useProjectActions,
  type UseProjectActionsReturn,
} from "@/hooks/use-project-actions"
import type { Project } from "@/types/project"

interface ProjectDialogsContextValue extends UseProjectActionsReturn {
  ownedProjects: Project[]
  sharedProjects: Project[]
}

const ProjectDialogsContext =
  createContext<ProjectDialogsContextValue | null>(null)

export function ProjectDialogsProvider({
  ownedProjects,
  sharedProjects,
  children,
}: {
  ownedProjects: Project[]
  sharedProjects: Project[]
  children: React.ReactNode
}) {
  const actions = useProjectActions()
  const value: ProjectDialogsContextValue = {
    ...actions,
    ownedProjects,
    sharedProjects,
  }

  return (
    <ProjectDialogsContext.Provider value={value}>
      {children}
    </ProjectDialogsContext.Provider>
  )
}

export function useProjectDialogsContext() {
  const context = useContext(ProjectDialogsContext)
  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used within a ProjectDialogsProvider"
    )
  }
  return context
}
