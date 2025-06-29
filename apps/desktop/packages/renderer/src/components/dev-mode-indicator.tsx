"use client"

import { useDevMode } from "@/contexts/dev-mode-context"
import { Code } from "lucide-react"

export function DevModeIndicator() {
  const { devMode, showDevModeNotifications } = useDevMode()

  if (!devMode || !showDevModeNotifications) return null

  return (
    <div className="fixed bottom-4 right-4 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 shadow-md z-50">
      <Code className="h-4 w-4" />
      <span>Dev Mode</span>
    </div>
  )
}

