"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sun, Moon, Code } from "lucide-react"
import { useDevMode } from "@/contexts/dev-mode-context"

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { devMode, toggleDevMode, showDevModeNotifications, toggleDevModeNotifications } = useDevMode()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="darkMode"
                checked={theme === "dark"}
                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
              <Label htmlFor="darkMode" className="flex items-center space-x-2">
                {theme === "dark" ? (
                  <>
                    <Moon className="h-5 w-5" />
                    <span>Dark mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-5 w-5" />
                    <span>Light mode</span>
                  </>
                )}
              </Label>
            </div>
            <Button>Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Developer Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="devMode" checked={devMode} onCheckedChange={toggleDevMode} />
              <Label htmlFor="devMode" className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Development Mode</span>
              </Label>
            </div>

            {devMode && (
              <>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showDevModeNotifications"
                    checked={showDevModeNotifications}
                    onCheckedChange={toggleDevModeNotifications}
                  />
                  <Label htmlFor="showDevModeNotifications" className="flex items-center space-x-2">
                    <span>Show Dev Mode Notifications</span>
                  </Label>
                </div>

                <div className="rounded-md bg-amber-100 dark:bg-amber-900 p-3 text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Development mode is enabled. The app is using dummy data instead of real API calls.
                    {!showDevModeNotifications && " (Notifications are currently hidden)"}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

