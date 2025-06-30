"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Terminal,
  History,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Server,
  ChevronDown,
  Database,
  Brain,
  Bot,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  { name: "Services", href: "/", icon: Server },
  { name: "Console", href: "/console", icon: Terminal },
  { name: "History", href: "/history", icon: History },
  {
    name: "Components",
    href: "#",
    icon: Brain,
    children: [
      { name: "Neo4j", href: "/services/neo4j", icon: Database },
      { name: "Graphiti", href: "/services/graphiti", icon: Brain },
      { name: "Agent", href: "/services/agent", icon: Bot },
    ],
  },
  { name: "Settings", href: "/settings", icon: Settings },
];

function NavItem({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  useEffect(() => {
    const storedExpanded = localStorage.getItem(
      `navItem_${item.name}_expanded`
    );
    if (storedExpanded !== null) {
      setExpanded(JSON.parse(storedExpanded));
    }
  }, [item.name]);

  const toggleExpanded = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    localStorage.setItem(
      `navItem_${item.name}_expanded`,
      JSON.stringify(newExpanded)
    );
  };

  if (item.children) {
    return (
      <div>
        <button
          onClick={toggleExpanded}
          className={cn(
            "flex items-center w-full px-4 py-2 text-sm font-medium",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon
            className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")}
          />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.name}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expanded ? "transform rotate-180" : ""
                )}
              />
            </>
          )}
        </button>
        {expanded && !collapsed && (
          <div className="ml-4">
            {item.children.map((child) => (
              <NavItem
                key={child.name}
                item={child}
                collapsed={collapsed}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center px-4 py-2 text-sm font-medium",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
      {!collapsed && item.name}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const storedCollapsed = localStorage.getItem("sidebar_collapsed");
    if (storedCollapsed !== null) {
      setCollapsed(JSON.parse(storedCollapsed));
    }
  }, []);

  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem("sidebar_collapsed", JSON.stringify(newCollapsed));
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-card text-card-foreground border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex justify-between items-center">
        {!collapsed && (
          <div className="flex flex-col justify-end">
            <h1 className="text-2xl font-bold">AUTO TRADER</h1>
            <h2 className="text-xs font-bold text-uppercase">MoonPup Labs</h2>
          </div>
        )}
        <div className="ml-auto">
          <Button variant="ghost" size="icon" onClick={toggleCollapsed}>
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavItem item={item} collapsed={collapsed} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Theme toggle */}
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "w-full justify-center",
            collapsed ? "" : "justify-start"
          )}
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-5 w-5" />
              {!collapsed && <span className="ml-2">Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="h-5 w-5" />
              {!collapsed && <span className="ml-2">Dark Mode</span>}
            </>
          )}
        </Button>
      </div>

      {/* User account card */}
      <Link
        href="/profile"
        className={cn(
          "border-t p-4 flex items-center space-x-3",
          collapsed ? "justify-center" : ""
        )}
      >
        {collapsed ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        ) : (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">My Account</p>
              <p className="text-xs text-muted-foreground truncate">John Doe</p>
            </div>
          </>
        )}
      </Link>
    </div>
  );
}
