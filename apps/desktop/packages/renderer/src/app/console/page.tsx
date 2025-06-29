"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Console() {
  const [command, setCommand] = useState("")
  const consoleEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && command.trim()) {
      // In a real app, you would process the command here
      setCommand("")
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] space-y-4">
      <h1 className="text-2xl font-bold">Console</h1>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle>Trading Console</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col pb-4">
          <div className="bg-black text-green-400 p-4 rounded-md flex-1 overflow-y-auto font-mono text-sm">
            <pre>
              {`> system: initializing trading bot...
> system: connected to Solana network
> system: scanning channels for signals
> alert: discovered new token from channel #solana-gems
> token: $MPUP detected with initial mcap of $25M
> tracking: started monitoring $MPUP price
> buy $MPUP 10000
> executing order: Buy 10000 $MPUP tokens
> order filled at $0.0025
> tracking: $MPUP price increased by 5% in the last hour
> alert: discovered new token from channel #alpha-calls
> token: $GOAT detected with initial mcap of $42M
> tracking: started monitoring $GOAT price
> sell $GOAT 5000
> executing order: Sell 5000 $GOAT tokens
> order filled at $0.0084
> tracking: $GOAT price decreased by 2% in the last 30 minutes
> alert: discovered new token from channel #early-gems
> token: $TURBO detected with initial mcap of $18M
> tracking: started monitoring $TURBO price
> buy $TURBO 25000
> executing order: Buy 25000 $TURBO tokens
> order filled at $0.00072
> tracking: $TURBO price increased by 8% in the last 15 minutes
> alert: take profit target approaching for $TURBO (currently +18%)
> tracking: $MPUP volume increased by 150% in the last hour
> system: updating market data...
> tracking: $TURBO reached +20% profit
> alert: discovered new token from channel #solana-signals
> token: $DEGEN detected with initial mcap of $5M
> tracking: started monitoring $DEGEN price
> system: running technical analysis on active positions...
> analysis: $MPUP showing bullish divergence on 15m chart
> analysis: $TURBO RSI approaching overbought on 5m chart
> tracking: $GOAT liquidity increased by 30%
> alert: stop loss approaching for $GOAT (currently -4.5%)
>`}
            </pre>
            <div ref={consoleEndRef} />
          </div>
          <div className="mt-4">
            <Input
              placeholder="Enter command..."
              className="font-mono"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

