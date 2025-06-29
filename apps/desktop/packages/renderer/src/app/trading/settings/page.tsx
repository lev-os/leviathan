"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, ArrowUpDown, Star, StarOff } from "lucide-react"
import { toast } from "react-hot-toast"
import { useDevMode } from "@/contexts/dev-mode-context"
import { type StrategySettings, StrategySettingsModal } from "@/components/strategy-settings-modal"

type Strategy = {
  id: number
  name: string
  description: string
  takeProfit: string
  stopLoss: string
  buyAmount: string
  isDefault: boolean
  createdAt: Date
}

// Mock data for strategies
const mockStrategies: Strategy[] = [
  {
    id: 1,
    name: "Conservative",
    description: "Low risk, steady gains",
    takeProfit: "10",
    stopLoss: "5",
    buyAmount: "0.5",
    isDefault: true,
    createdAt: new Date(2023, 5, 15),
  },
  {
    id: 2,
    name: "Aggressive",
    description: "High risk, high reward",
    takeProfit: "25",
    stopLoss: "15",
    buyAmount: "2.0",
    isDefault: false,
    createdAt: new Date(2023, 6, 20),
  },
  {
    id: 3,
    name: "Balanced",
    description: "Medium risk profile",
    takeProfit: "15",
    stopLoss: "8",
    buyAmount: "1.0",
    isDefault: false,
    createdAt: new Date(2023, 7, 5),
  },
  {
    id: 4,
    name: "Scalping",
    description: "Quick in-and-out trades",
    takeProfit: "5",
    stopLoss: "3",
    buyAmount: "0.75",
    isDefault: false,
    createdAt: new Date(2023, 8, 10),
  },
]

export default function TradingSettings() {
  const { devMode, showDevModeNotifications } = useDevMode()
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Strategy>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedStrategies, setSelectedStrategies] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStrategy, setCurrentStrategy] = useState<StrategySettings>({
    takeProfit: "",
    stopLoss: "",
    buyAmount: "",
    name: "",
    description: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchStrategies = async () => {
      setIsLoading(true)
      try {
        if (devMode) {
          // Use mock data in dev mode
          setStrategies(mockStrategies)
          setIsLoading(false)
          return
        }

        // In a real app, you would fetch from an API
        // For now, we'll just use mock data
        setStrategies(mockStrategies)
      } catch (e) {
        console.error("Error fetching strategies:", e)
        setError("Failed to load strategies. Please try again later.")
        toast.error("Failed to load strategies")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStrategies()
  }, [devMode])

  const filteredStrategies = strategies.filter(
    (strategy) =>
      strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      strategy.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedStrategies = [...filteredStrategies].sort((a, b) => {
    const fieldA = a[sortField]
    const fieldB = b[sortField]

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
    }

    if (fieldA instanceof Date && fieldB instanceof Date) {
      return sortDirection === "asc" ? fieldA.getTime() - fieldB.getTime() : fieldB.getTime() - fieldA.getTime()
    }

    return 0
  })

  const handleSort = (field: keyof Strategy) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const toggleSelectStrategy = (id: number) => {
    setSelectedStrategies((prev) =>
      prev.includes(id) ? prev.filter((strategyId) => strategyId !== id) : [...prev, id],
    )
  }

  const selectAllStrategies = () => {
    if (selectedStrategies.length === sortedStrategies.length) {
      setSelectedStrategies([])
    } else {
      setSelectedStrategies(sortedStrategies.map((strategy) => strategy.id))
    }
  }

  const setDefaultStrategy = (id: number) => {
    setStrategies((prev) =>
      prev.map((strategy) => ({
        ...strategy,
        isDefault: strategy.id === id,
      })),
    )
    toast.success("Default strategy updated")
  }

  const openAddStrategyModal = () => {
    setCurrentStrategy({
      takeProfit: "",
      stopLoss: "",
      buyAmount: "",
      name: "",
      description: "",
    })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const openEditStrategyModal = (strategy: Strategy) => {
    setCurrentStrategy({
      id: strategy.id,
      takeProfit: strategy.takeProfit,
      stopLoss: strategy.stopLoss,
      buyAmount: strategy.buyAmount,
      name: strategy.name,
      description: strategy.description,
    })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const saveStrategy = () => {
    if (!currentStrategy.name) {
      toast.error("Strategy name is required")
      return
    }

    if (isEditing) {
      // Update existing strategy
      setStrategies((prev) =>
        prev.map((strategy) =>
          strategy.id === currentStrategy.id
            ? {
                ...strategy,
                name: currentStrategy.name || "",
                description: currentStrategy.description || "",
                takeProfit: currentStrategy.takeProfit,
                stopLoss: currentStrategy.stopLoss,
                buyAmount: currentStrategy.buyAmount,
              }
            : strategy,
        ),
      )
      toast.success("Strategy updated successfully")
    } else {
      // Add new strategy
      const newStrategy: Strategy = {
        id: Math.max(0, ...strategies.map((s) => s.id)) + 1,
        name: currentStrategy.name || "New Strategy",
        description: currentStrategy.description || "",
        takeProfit: currentStrategy.takeProfit,
        stopLoss: currentStrategy.stopLoss,
        buyAmount: currentStrategy.buyAmount,
        isDefault: strategies.length === 0, // Make default if it's the first one
        createdAt: new Date(),
      }
      setStrategies((prev) => [...prev, newStrategy])
      toast.success("Strategy added successfully")
    }
    setIsModalOpen(false)
  }

  const deleteStrategy = (id: number) => {
    setStrategies((prev) => {
      const filtered = prev.filter((strategy) => strategy.id !== id)

      // If we deleted the default strategy, make the first remaining one default
      if (prev.find((s) => s.id === id)?.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true
      }

      return filtered
    })
    toast.success("Strategy deleted")
  }

  const deleteSelectedStrategies = () => {
    setStrategies((prev) => {
      const filtered = prev.filter((strategy) => !selectedStrategies.includes(strategy.id))

      // If we deleted the default strategy, make the first remaining one default
      if (prev.some((s) => s.isDefault && selectedStrategies.includes(s.id)) && filtered.length > 0) {
        filtered[0].isDefault = true
      }

      return filtered
    })
    setSelectedStrategies([])
    toast.success("Selected strategies deleted")
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trading Settings</h1>

      {devMode && showDevModeNotifications && (
        <div className="rounded-md bg-amber-100 dark:bg-amber-900 p-3 text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Development mode is enabled. Using mock strategy data.
          </p>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trading Strategies</CardTitle>
          <Button onClick={openAddStrategyModal} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Strategy</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search strategies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              {selectedStrategies.length > 0 && (
                <Button variant="destructive" onClick={deleteSelectedStrategies}>
                  Delete Selected
                </Button>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedStrategies.length === sortedStrategies.length && sortedStrategies.length > 0}
                        onCheckedChange={selectAllStrategies}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-12">Default</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("takeProfit")}>
                      <div className="flex items-center space-x-1">
                        <span>Take Profit</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("stopLoss")}>
                      <div className="flex items-center space-x-1">
                        <span>Stop Loss</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("buyAmount")}>
                      <div className="flex items-center space-x-1">
                        <span>Buy Amount</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStrategies.length > 0 ? (
                    sortedStrategies.map((strategy) => (
                      <TableRow key={strategy.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStrategies.includes(strategy.id)}
                            onCheckedChange={() => toggleSelectStrategy(strategy.id)}
                            aria-label={`Select ${strategy.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefaultStrategy(strategy.id)}
                            disabled={strategy.isDefault}
                          >
                            {strategy.isDefault ? (
                              <Star className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{strategy.name}</TableCell>
                        <TableCell>{strategy.description}</TableCell>
                        <TableCell>{strategy.takeProfit}%</TableCell>
                        <TableCell>{strategy.stopLoss}%</TableCell>
                        <TableCell>{strategy.buyAmount} SOL</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditStrategyModal(strategy)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteStrategy(strategy.id)}
                              disabled={strategies.length === 1} // Prevent deleting the last strategy
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        {searchTerm ? "No strategies found" : "No strategies added yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <StrategySettingsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        settings={currentStrategy}
        onSettingsChange={setCurrentStrategy}
        onSave={saveStrategy}
        title={isEditing ? "Edit Strategy" : "Add Strategy"}
        showNameField={true}
        showDescriptionField={true}
      />
    </div>
  )
}

