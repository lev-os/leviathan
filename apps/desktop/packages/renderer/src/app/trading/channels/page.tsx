"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Edit, Trash2, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDevMode } from "@/contexts/dev-mode-context";
import {
  type StrategySettings,
  StrategySettingsModal,
} from "@/components/strategy-settings-modal";
import type { channels, watchlistItems } from "@/db/schema";

type Channel = typeof channels.$inferSelect;
type WatchlistItem = typeof watchlistItems.$inferSelect;

// Mock data based on the database seed
const mockChannels: Channel[] = [
  {
    id: 1,
    name: "Alpha Gems",
    description: "Premium alpha calls for serious traders",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "MoonPup Calls",
    description: "Early calls on moonshot opportunities",
    createdAt: new Date(),
  },
  {
    id: 3,
    name: "Turtle Calls",
    description: "Slow and steady gains, low-risk signals",
    createdAt: new Date(),
  },
  {
    id: 4,
    name: "MadApes Gables",
    description: "High-risk high-reward degen plays",
    createdAt: new Date(),
  },
  {
    id: 5,
    name: "Market News",
    description: "Latest updates on financial markets",
    createdAt: new Date(),
  },
  {
    id: 6,
    name: "Solana Gems",
    description: "Early Solana token opportunities",
    createdAt: new Date(),
  },
  {
    id: 7,
    name: "Technical Analysis",
    description: "Chart patterns and indicators",
    createdAt: new Date(),
  },
  {
    id: 8,
    name: "DeFi Updates",
    description: "Latest in decentralized finance",
    createdAt: new Date(),
  },
];

const mockWatchlistItems: WatchlistItem[] = [
  {
    id: 1,
    userId: 1,
    channelId: 1,
    takeProfit: "20",
    stopLoss: "10",
    buyAmount: "2.5",
    createdAt: new Date(),
  },
  {
    id: 2,
    userId: 1,
    channelId: 3,
    takeProfit: "15",
    stopLoss: "7",
    buyAmount: "1.0",
    createdAt: new Date(),
  },
];

// Top public channels to feature
const topPublicChannelIds = [1, 2, 3, 4]; // Alpha Gems, MoonPup Calls, Turtle Calls, MadApes Gables

export default function Channels() {
  const { devMode, showDevModeNotifications } = useDevMode();
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [settings, setSettings] = useState<StrategySettings>({
    takeProfit: "",
    stopLoss: "",
    buyAmount: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (devMode) {
          // Use mock data in dev mode
          setAllChannels(mockChannels);
          setWatchlist(mockWatchlistItems);
          setIsLoading(false);
          return;
        }

        // Fetch real data in production mode
        const channelsResponse = await fetch("/api/trading/channels");
        if (!channelsResponse.ok) {
          throw new Error(`HTTP error! status: ${channelsResponse.status}`);
        }
        const channelsResult = await channelsResponse.json();
        setAllChannels(channelsResult);

        const watchlistResponse = await fetch("/api/trading/watchlist");
        if (!watchlistResponse.ok) {
          throw new Error(`HTTP error! status: ${watchlistResponse.status}`);
        }
        const watchlistResult = await watchlistResponse.json();
        setWatchlist(watchlistResult);
      } catch (e) {
        console.error("Error fetching data:", e);
        setError("Failed to load data. Please try again later.");
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [devMode]);

  const filteredChannels = allChannels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get top public channels
  const topPublicChannels = allChannels
    .filter((channel) => topPublicChannelIds.includes(channel.id))
    .sort(
      (a, b) =>
        topPublicChannelIds.indexOf(a.id) - topPublicChannelIds.indexOf(b.id)
    );

  const openSettings = (
    channelId: number,
    existingSettings?: Partial<WatchlistItem>
  ) => {
    setSelectedChannel(channelId);
    setSettings({
      takeProfit: existingSettings?.takeProfit || "",
      stopLoss: existingSettings?.stopLoss || "",
      buyAmount: existingSettings?.buyAmount || "",
    });
    setIsSettingsOpen(true);
  };

  const saveSettings = async () => {
    if (selectedChannel) {
      try {
        const existingItem = watchlist.find(
          (item) => item.channelId === selectedChannel
        );

        if (devMode) {
          // Handle in-memory updates for dev mode
          if (existingItem) {
            // Update existing item
            setWatchlist((prev) =>
              prev.map((item) =>
                item.id === existingItem.id
                  ? {
                      ...item,
                      takeProfit: settings.takeProfit,
                      stopLoss: settings.stopLoss,
                      buyAmount: settings.buyAmount,
                    }
                  : item
              )
            );
          } else {
            // Add new item
            const newItem: WatchlistItem = {
              id: Math.max(0, ...watchlist.map((item) => item.id)) + 1,
              userId: 1,
              channelId: selectedChannel,
              takeProfit: settings.takeProfit,
              stopLoss: settings.stopLoss,
              buyAmount: settings.buyAmount,
              createdAt: new Date(),
            };
            setWatchlist((prev) => [...prev, newItem]);
          }
          setIsSettingsOpen(false);
          toast.success("Watchlist updated successfully");
          return;
        }

        // Handle real API calls for production mode
        if (existingItem) {
          // Update existing watchlist item
          const response = await fetch(
            `/api/trading/watchlist/${existingItem.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                takeProfit: settings.takeProfit,
                stopLoss: settings.stopLoss,
                buyAmount: settings.buyAmount,
                channelId: selectedChannel,
              }),
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          // Add new watchlist item
          const response = await fetch("/api/trading/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              takeProfit: settings.takeProfit,
              stopLoss: settings.stopLoss,
              buyAmount: settings.buyAmount,
              channelId: selectedChannel,
            }),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        const updatedWatchlist = await fetch("/api/trading/watchlist").then(
          (res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          }
        );
        setWatchlist(updatedWatchlist);
        setIsSettingsOpen(false);
        toast.success("Watchlist updated successfully");
      } catch (e) {
        console.error("Error updating watchlist:", e);
        toast.error("Failed to update watchlist");
      }
    }
  };

  const deleteFromWatchlist = async (itemId: number) => {
    try {
      if (devMode) {
        // Handle in-memory deletion for dev mode
        setWatchlist((prev) => prev.filter((item) => item.id !== itemId));
        toast.success("Item removed from watchlist");
        return;
      }

      // Handle real API call for production mode
      const response = await fetch(`/api/trading/watchlist/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setWatchlist(watchlist.filter((item) => item.id !== itemId));
      toast.success("Item removed from watchlist");
    } catch (e) {
      console.error("Error deleting watchlist item:", e);
      toast.error("Failed to delete watchlist item");
    }
  };

  const ChannelItem = ({
    channel,
    showAddButton = false,
    watchlistItem,
    featured = false,
  }: ChannelItemProps) => (
    <div
      className={`flex items-center justify-between p-2 ${
        featured ? "bg-primary/10" : "bg-accent"
      } rounded-md`}
    >
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
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">{channel.name}</h3>
            {featured && <Star className="h-4 w-4 text-yellow-500" />}
          </div>
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Channels</h1>
      {devMode && showDevModeNotifications && (
        <div className="rounded-md bg-amber-100 dark:bg-amber-900 p-3 text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Development mode is enabled. Using mock channel data.
          </p>
        </div>
      )}

      {/* Search Section - Now First */}
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
            {searchTerm &&
              filteredChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  showAddButton={true}
                />
              ))}
            {searchTerm && filteredChannels.length === 0 && (
              <p className="text-center text-muted-foreground py-2">
                No channels found
              </p>
            )}
            {!searchTerm && (
              <p className="text-center text-muted-foreground py-2">
                Type to search channels
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Watchlist Section - Now Second */}
      <Card>
        <CardHeader>
          <CardTitle>Your Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {watchlist.length > 0 ? (
              watchlist.map((item) => {
                const channel = allChannels.find(
                  (c) => c.id === item.channelId
                );
                return channel ? (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    watchlistItem={item}
                  />
                ) : null;
              })
            ) : (
              <p className="text-center text-muted-foreground py-2">
                Your watchlist is empty. Add channels from the search or
                featured sections.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Public Channels Section - Now Third */}
      <Card>
        <CardHeader>
          <CardTitle>Top Public Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPublicChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                showAddButton={true}
                featured={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <StrategySettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSettingsChange={setSettings}
        onSave={saveSettings}
        title="Channel Settings"
      />
    </div>
  );
}

type ChannelItemProps = {
  channel: Channel;
  showAddButton?: boolean;
  watchlistItem?: WatchlistItem;
  featured?: boolean;
};
