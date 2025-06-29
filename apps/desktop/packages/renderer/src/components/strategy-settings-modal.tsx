"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type StrategySettings = {
  id?: number
  takeProfit: string
  stopLoss: string
  buyAmount: string
  name?: string
  description?: string
}

type StrategySettingsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: StrategySettings
  onSettingsChange: (settings: StrategySettings) => void
  onSave: () => void
  title?: string
  showNameField?: boolean
  showDescriptionField?: boolean
}

export function StrategySettingsModal({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  onSave,
  title = "Strategy Settings",
  showNameField = false,
  showDescriptionField = false,
}: StrategySettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {showNameField && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Strategy Name
              </Label>
              <Input
                id="name"
                value={settings.name || ""}
                onChange={(e) => onSettingsChange({ ...settings, name: e.target.value })}
                className="col-span-3"
              />
            </div>
          )}
          {showDescriptionField && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={settings.description || ""}
                onChange={(e) => onSettingsChange({ ...settings, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="takeProfit" className="text-right">
              Take Profit %
            </Label>
            <Input
              id="takeProfit"
              value={settings.takeProfit || ""}
              onChange={(e) => onSettingsChange({ ...settings, takeProfit: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stopLoss" className="text-right">
              Stop Loss %
            </Label>
            <Input
              id="stopLoss"
              value={settings.stopLoss || ""}
              onChange={(e) => onSettingsChange({ ...settings, stopLoss: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="buyAmount" className="text-right">
              Buy Amount (SOL)
            </Label>
            <Input
              id="buyAmount"
              value={settings.buyAmount || ""}
              onChange={(e) => onSettingsChange({ ...settings, buyAmount: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

