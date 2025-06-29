"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import type { channels, watchlistItems } from "@/db/schema";

type Channel = typeof channels.$inferSelect;
type WatchlistItem = typeof watchlistItems.$inferSelect;

export default function Channels() {
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [settings, setSettings] = useState<Partial<WatchlistItem>>({
    takeProfit: "",
    stopLoss: "",
    buyAmount: "",
  });

  useEffect(() => {
    const fetchChannels = async () => {
      const result = await fetch("/api/channels").then((res) => res.json());
      setAllChannels(result);
    };

    const fetchWatchlist = async () => {
      const result = await fetch("/api/watchlist").then((res) => res.json());
      setWatchlist(result);
    };

    fetchChannels();
    fetchWatchlist();
  }, []);

  const filteredChannels = allChannels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openSettings = (
    channelId: number,
    existingSettings?: Partial<WatchlistItem>
  ) => {
    setSelectedChannel(channelId);
    setSettings(
      existingSettings || { takeProfit: "", stopLoss: "", buyAmount: "" }
    );
    setIsSettingsOpen(true);
  };

  const saveSettings = async () => {
    if (selectedChannel) {
      const existingItem = watchlist.find(
        (item) => item.channelId === selectedChannel
      );
      if (existingItem) {
        // Update existing watchlist item
        const response = await fetch(`/api/watchlist/${existingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...settings, channelId: selectedChannel }),
        });
        if (!response.ok) {
          console.error("Failed to update watchlist item");
          return;
        }
      } else {
        // Add new watchlist item
        const response = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...settings, channelId: selectedChannel }),
        });
        if (!response.ok) {
          console.error("Failed to add watchlist item");
          return;
        }
      }
      const updatedWatchlist = await fetch("/api/watchlist").then((res) =>
        res.json()
      );
      setWatchlist(updatedWatchlist);
      setIsSettingsOpen(false);
    }
  };

  const deleteFromWatchlist = async (itemId: number) => {
    const response = await fetch(`/api/watchlist/${itemId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setWatchlist(watchlist.filter((item) => item.id !== itemId));
    } else {
      console.error("Failed to delete watchlist item");
    }
  };

  type ChannelItemProps = {
    channel: Channel;
    showAddButton?: boolean;
    watchlistItem?: WatchlistItem;
  };

  const ChannelItem = ({
    channel,
    showAddButton = false,
    watchlistItem,
  }: ChannelItemProps) => (
    <div className="flex items-center justify-between p-2 bg-accent rounded-md">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage
            src={`/placeholder.svg?height=40&width=40&text=${channel.name.slice(
              0,
              2
            )}`}
            alt={channel.name}
          />
          <AvatarFallback>
            {channel.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{channel.name}</h3>
          <p className="text-sm text-muted-foreground">{channel.description}</p>
        </div>
      </div>
      {showAddButton ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openSettings(channel.id)}
          disabled={watchlist.some((item) => item.channelId === channel.id)}
        >
          <PlusCircle className="w-5 h-5 mr-1" />
          {watchlist.some((item) => item.channelId === channel.id)
            ? "Added"
            : "Add to Watchlist"}
        </Button>
      ) : (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openSettings(channel.id, watchlistItem)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteFromWatchlist(watchlistItem!.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Channels</h1>
      <Card>
        <CardHeader>
          <CardTitle>Search Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2">
            {filteredChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                showAddButton={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {watchlist.map((item) => {
              const channel = allChannels.find((c) => c.id === item.channelId);
              return channel ? (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  watchlistItem={item}
                />
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Channel Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="takeProfit" className="text-right">
                Take Profit %
              </Label>
              <Input
                id="takeProfit"
                value={settings.takeProfit || ""}
                onChange={(e) =>
                  setSettings({ ...settings, takeProfit: e.target.value })
                }
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
                onChange={(e) =>
                  setSettings({ ...settings, stopLoss: e.target.value })
                }
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
                onChange={(e) =>
                  setSettings({ ...settings, buyAmount: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
