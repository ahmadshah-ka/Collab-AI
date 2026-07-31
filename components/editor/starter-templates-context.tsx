"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"

import type { CanvasTemplate } from "@/components/editor/starter-templates"

type ImportTemplateHandler = (template: CanvasTemplate) => void

interface StarterTemplatesContextValue {
  isTemplatesModalOpen: boolean
  openTemplatesModal: () => void
  closeTemplatesModal: () => void
  registerImportHandler: (handler: ImportTemplateHandler | null) => void
  importTemplate: (template: CanvasTemplate) => void
}

const StarterTemplatesContext = createContext<StarterTemplatesContextValue | null>(null)

export function StarterTemplatesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false)
  const importHandlerRef = useRef<ImportTemplateHandler | null>(null)

  const openTemplatesModal = useCallback(() => setIsTemplatesModalOpen(true), [])
  const closeTemplatesModal = useCallback(() => setIsTemplatesModalOpen(false), [])

  const registerImportHandler = useCallback((handler: ImportTemplateHandler | null) => {
    importHandlerRef.current = handler
  }, [])

  const importTemplate = useCallback((template: CanvasTemplate) => {
    importHandlerRef.current?.(template)
    setIsTemplatesModalOpen(false)
  }, [])

  return (
    <StarterTemplatesContext.Provider
      value={{
        isTemplatesModalOpen,
        openTemplatesModal,
        closeTemplatesModal,
        registerImportHandler,
        importTemplate,
      }}
    >
      {children}
    </StarterTemplatesContext.Provider>
  )
}

export function useStarterTemplatesContext() {
  const context = useContext(StarterTemplatesContext)
  if (!context) {
    throw new Error(
      "useStarterTemplatesContext must be used within a StarterTemplatesProvider"
    )
  }
  return context
}
