"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clipboard, QrCode } from "lucide-react"
import QRCode from "react-qr-code"
import { toast } from "react-hot-toast"
import { useDevMode } from "@/contexts/dev-mode-context"

// Mock wallet data
const mockWalletData = {
  address: "5XnYWxKMYQSiNJA3UwuTMTRxTws9LRGCVUgGXgMdXMeP",
  balance: "1250.75",
}

export default function WalletPage() {
  const { devMode, showDevModeNotifications } = useDevMode()
  const [balance, setBalance] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWalletData = async () => {
      setIsLoading(true)
      try {
        if (devMode) {
          // Use mock data in dev mode
          setWalletAddress(mockWalletData.address)
          setBalance(mockWalletData.balance)
          setIsLoading(false)
          return
        }

        // In a real app, you would fetch wallet data from an API
        // For now, we'll just simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        setWalletAddress("0x1234...5678") // This would come from your API
        setBalance("1000.00") // This would come from your API
      } catch (error) {
        console.error("Error fetching wallet data:", error)
        toast.error("Failed to load wallet data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()
  }, [devMode])

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    toast.success("Wallet address copied to clipboard")
  }

  const handleWithdraw = () => {
    if (devMode) {
      // Simulate withdrawal in dev mode
      if (Number.parseFloat(withdrawAmount) > Number.parseFloat(balance)) {
        toast.error("Insufficient balance")
        return
      }

      const newBalance = (Number.parseFloat(balance) - Number.parseFloat(withdrawAmount)).toFixed(2)
      setBalance(newBalance)
      toast.success(`Withdrawal of ${withdrawAmount} SOL initiated`)
      setWithdrawAmount("")
      return
    }

    // In production, this would call your API
    toast.success(`Withdrawal of ${withdrawAmount} SOL initiated`)
    setWithdrawAmount("")
  }

  if (isLoading) {
    return <div>Loading wallet data...</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Wallet Management</h1>

      {devMode && showDevModeNotifications && (
        <div className="rounded-md bg-amber-100 dark:bg-amber-900 p-3 text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Development mode is enabled. Using mock wallet data.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Wallet Address:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm" onClick={handleCopyAddress} style={{ cursor: "pointer" }}>
                {walletAddress}
              </span>
              <Clipboard className="h-4 w-4 cursor-pointer" onClick={handleCopyAddress} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Balance:</span>
            <span className="text-sm">{balance} SOL</span>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setIsQRModalOpen(true)} className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>Receive</span>
            </Button>
            <Button variant="outline">Withdraw</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawAmount">Amount (SOL)</Label>
              <Input
                id="withdrawAmount"
                placeholder="Enter amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                type="number"
                min="0"
                step="0.01"
              />
            </div>
            <Button onClick={handleWithdraw} disabled={!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0}>
              Initiate Withdrawal
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Funds</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <QRCode value={walletAddress} size={256} />
            <p className="text-sm text-center">Scan this QR code to receive funds</p>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-mono">{walletAddress}</span>
              <Clipboard className="h-4 w-4 cursor-pointer" onClick={handleCopyAddress} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

