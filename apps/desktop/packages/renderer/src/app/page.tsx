"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";

type Trade = {
  id: number;
  name: string;
  entryMcap: number;
  currentMcap: number;
  pl: number;
  takeProfit: number;
  stopLoss: number;
};

const mockTrades: Trade[] = [
  {
    id: 1,
    name: "$MPUP",
    entryMcap: 25000000,
    currentMcap: 28500000,
    pl: 14,
    takeProfit: 20,
    stopLoss: -10,
  },
  {
    id: 2,
    name: "$GOAT",
    entryMcap: 42000000,
    currentMcap: 39900000,
    pl: -5,
    takeProfit: 15,
    stopLoss: -8,
  },
  {
    id: 3,
    name: "$TURBO",
    entryMcap: 18000000,
    currentMcap: 21600000,
    pl: 20,
    takeProfit: 25,
    stopLoss: -12,
  },
];

export default function ActiveTrades() {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatMcap = (mcap: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(mcap);
  };

  const openTradeDetails = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Active Trades</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Entry MCap</TableHead>
                <TableHead>Current MCap</TableHead>
                <TableHead>P/L</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>{trade.name}</TableCell>
                  <TableCell>{formatMcap(trade.entryMcap)}</TableCell>
                  <TableCell>{formatMcap(trade.currentMcap)}</TableCell>
                  <TableCell
                    className={
                      trade.pl >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {trade.pl.toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openTradeDetails(trade)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trade Details: {selectedTrade?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              <strong>Entry Market Cap:</strong>{" "}
              {selectedTrade && formatMcap(selectedTrade.entryMcap)}
            </p>
            <p>
              <strong>Current Market Cap:</strong>{" "}
              {selectedTrade && formatMcap(selectedTrade.currentMcap)}
            </p>
            <p>
              <strong>P/L:</strong>{" "}
              <span
                className={
                  selectedTrade && selectedTrade.pl >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {selectedTrade?.pl.toFixed(2)}%
              </span>
            </p>
            <p>
              <strong>Take Profit:</strong> {selectedTrade?.takeProfit}%
            </p>
            <p>
              <strong>Stop Loss:</strong> {selectedTrade?.stopLoss}%
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
