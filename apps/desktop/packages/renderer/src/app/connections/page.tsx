"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { useDevMode } from "@/contexts/dev-mode-context";
import { BellIcon as BrandTelegram, Plus, Trash2, Check } from "lucide-react";
import clsx from "clsx";

// Types for our connections
type ConnectionStatus = "connected" | "disconnected" | "pending";

type Connection = {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  status: ConnectionStatus;
  connectedAt?: Date;
  description: string;
};

// Mock data for available marketplace integrations
const marketplaceIntegrations = [
  {
    id: "telegram",
    name: "Telegram",
    type: "messaging",
    icon: <BrandTelegram className="h-6 w-6 text-blue-500" />,
    description:
      "Connect your Telegram account to receive signals and alerts directly in your chats.",
  },
  {
    id: "discord",
    name: "Discord",
    type: "messaging",
    comingSoon: true,
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
          fill="#5865F2"
        />
      </svg>
    ),
    description:
      "Connect your Discord account to receive signals and alerts in your server.",
  },
  {
    id: "twitter",
    name: "Twitter",
    type: "social",
    comingSoon: true,
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 5.89c-.75.33-1.5.56-2.34.66.84-.5 1.5-1.32 1.8-2.27-.79.47-1.66.8-2.6 1a4.1 4.1 0 0 0-7 3.73c-3.4-.17-6.38-1.8-8.4-4.28a4.1 4.1 0 0 0 1.27 5.47c-.67-.02-1.3-.2-1.86-.5v.05a4.1 4.1 0 0 0 3.3 4.03 4.1 4.1 0 0 1-1.86.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.43a11.67 11.67 0 0 0 6.29 1.84c7.55 0 11.67-6.25 11.67-11.67 0-.18 0-.36-.02-.53.8-.58 1.5-1.3 2.05-2.12z"
          fill="#1DA1F2"
        />
      </svg>
    ),
    description:
      "Connect your Twitter account to share your trading activities and follow market trends.",
  },
];
type Integration = {
  id: string;
  name: string;
  type: string;
  icon: React.JSX.Element;
  description: string;
};

export default function ConnectionsPage() {
  const { devMode, showDevModeNotifications } = useDevMode();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentIntegration, setCurrentIntegration] =
    useState<Integration | null>(null);
  const [telegramCredentials, setTelegramCredentials] = useState({
    phone: "",
    code: "",
  });
  const [loginStep, setLoginStep] = useState<"login" | "phone" | "code">(
    "login"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Function to add a new connection
  const addConnection = (integration: Integration) => {
    setCurrentIntegration(integration);
    setLoginStep("login");
    setTelegramCredentials({ phone: "", code: "" });
    setIsLoginModalOpen(true);
  };

  // Function to remove a connection
  const removeConnection = (connectionId: string) => {
    setConnections(connections.filter((conn) => conn.id !== connectionId));
    toast.success("Connection removed successfully");
  };

  // Handle Telegram login
  const handleTelegramLogin = () => {
    if (loginStep === "phone") {
      // In a real app, this would send the phone number to the Telegram API
      setIsLoading(true);
      setTimeout(() => {
        setLoginStep("code");
        setIsLoading(false);
        toast.success("Verification code sent to your phone");
      }, 1500);
    } else {
      // In a real app, this would verify the code with the Telegram API
      setIsLoading(true);
      setTimeout(() => {
        if (!currentIntegration) return;

        // Add the new connection
        const newConnection: Connection = {
          id: currentIntegration.id,
          name: currentIntegration.name,
          type: currentIntegration.type,
          icon: currentIntegration.icon,
          status: "connected",
          connectedAt: new Date(),
          description: currentIntegration.description,
        };

        setConnections((prev) => [...prev, newConnection]);
        setIsLoginModalOpen(false);
        setIsLoading(false);
        toast.success(`Successfully connected to ${currentIntegration.name}`);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Connections</h1>
      </div>

      {devMode && showDevModeNotifications && (
        <div className="rounded-md bg-amber-100 dark:bg-amber-900 p-3 text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Development mode is enabled. Connection data is stored in memory
            only.
          </p>
        </div>
      )}

      {connections.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {connection.icon}
                    <div>
                      <CardTitle>{connection.name}</CardTitle>
                      <CardDescription>{connection.type}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={
                      connection.status === "connected" ? "default" : "outline"
                    }
                  >
                    {connection.status === "connected" && (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    {connection.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {connection.description}
                </p>
                {connection.connectedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Connected on {connection.connectedAt.toLocaleDateString()}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => removeConnection(connection.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Connections</CardTitle>
            <CardDescription>
              You don&apos;t have any active connections. Add one below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            {/* <Button
              onClick={() =>
                document.getElementById("marketplace-tab")?.click()
              }
            >
              Browse Marketplace
            </Button> */}
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {marketplaceIntegrations.map((integration) => {
          const isConnected = connections.some(
            (conn) => conn.id === integration.id
          );

          return (
            <Card
              key={integration.id}
              className={clsx(
                integration.comingSoon && "relative overflow-hidden opacity-25"
              )}
            >
              {integration.comingSoon && (
                <div className="absolute inset-0 bg-black opacity-80 flex items-center justify-center">
                  <p className="text-lg font-semibold">Coming Soon</p>
                </div>
              )}

              <CardHeader
                className={clsx("pb-2", integration.comingSoon && "opacity-25")}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {integration.icon}
                    <div>
                      <CardTitle>{integration.name}</CardTitle>
                      <CardDescription>{integration.type}</CardDescription>
                    </div>
                  </div>
                  {isConnected && (
                    <Badge>
                      <Check className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant={isConnected ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    isConnected
                      ? removeConnection(integration.id)
                      : addConnection(integration)
                  }
                >
                  {isConnected ? (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Connect
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Telegram Login Modal */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BrandTelegram className="h-5 w-5 text-blue-500 mr-2" />
              Connect to Telegram
            </DialogTitle>
            <DialogDescription>
              {loginStep === "phone"
                ? "Enter your phone number to receive a verification code"
                : "Enter the verification code sent to your phone"}
            </DialogDescription>
          </DialogHeader>

          {loginStep === "login" && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                </form>
              </div>
            </div>
          )}

          {loginStep === "phone" && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <form className="space-y-4">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={telegramCredentials.phone}
                    onChange={(e) =>
                      setTelegramCredentials({
                        ...telegramCredentials,
                        phone: e.target.value,
                      })
                    }
                  />
                </form>
              </div>
            </div>
          )}

          {loginStep === "code" && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="123456"
                  value={telegramCredentials.code}
                  onChange={(e) =>
                    setTelegramCredentials({
                      ...telegramCredentials,
                      code: e.target.value,
                    })
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                We sent a verification code to {telegramCredentials.phone}
              </p>
            </div>
          )}

          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setIsLoginModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleTelegramLogin} disabled={isLoading}>
              {isLoading && "Processing..."}
              {!isLoading && loginStep === "login" && "Login"}
              {!isLoading && loginStep === "phone" && "Send Code"}
              {!isLoading && loginStep === "code" && "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
