"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type DevModeContextType = {
  devMode: boolean
  toggleDevMode: () => void
  showDevModeNotifications: boolean
  toggleDevModeNotifications: () => void
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined)

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [devMode, setDevMode] = useState(true) // Default to true
  const [showDevModeNotifications, setShowDevModeNotifications] = useState(true) // Default to true

  // Load from localStorage on mount
  useEffect(() => {
    const storedDevMode = localStorage.getItem("devMode")
    const storedShowNotifications = localStorage.getItem("showDevModeNotifications")

    if (storedDevMode !== null) {
      setDevMode(JSON.parse(storedDevMode))
    }

    if (storedShowNotifications !== null) {
      setShowDevModeNotifications(JSON.parse(storedShowNotifications))
    }
  }, [])

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("devMode", JSON.stringify(devMode))
  }, [devMode])

  // Save notifications setting to localStorage when changed
  useEffect(() => {
    localStorage.setItem("showDevModeNotifications", JSON.stringify(showDevModeNotifications))
  }, [showDevModeNotifications])

  const toggleDevMode = () => {
    setDevMode((prev) => !prev)
  }

  const toggleDevModeNotifications = () => {
    setShowDevModeNotifications((prev) => !prev)
  }

  return (
    <DevModeContext.Provider
      value={{
        devMode,
        toggleDevMode,
        showDevModeNotifications,
        toggleDevModeNotifications,
      }}
    >
      {children}
    </DevModeContext.Provider>
  )
}

export function useDevMode() {
  const context = useContext(DevModeContext)
  if (context === undefined) {
    throw new Error("useDevMode must be used within a DevModeProvider")
  }
  return context
}

