"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getNotificationsByUserId } from "@/lib/mock-data";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Clock,
  BarChart3,
  FileEdit,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "儀表板", href: "/dashboard", icon: LayoutDashboard },
  { label: "專案列表", href: "/projects", icon: FolderKanban },
  { label: "我的任務", href: "/my-tasks", icon: CheckSquare },
  { label: "延期審核", href: "/delay-requests", icon: Clock, roles: ["PM", "Executive"] },
  { label: "報告", href: "/reports", icon: BarChart3 },
  { label: "草稿", href: "/drafts", icon: FileEdit, roles: ["PM"] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const notifications = getNotificationsByUserId(user.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNav = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const initials = user.name.slice(0, 1);

  return (
    <div className="flex h-screen overflow-hidden bg-ds-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-ds-sidebar-bg transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ds-primary">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white font-heading">ProjectHub</span>
          <button
            className="ml-auto text-ds-sidebar-text lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="flex flex-col gap-1">
            {filteredNav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-ds-sidebar-active text-white"
                      : "text-ds-sidebar-text hover:bg-ds-sidebar-hover hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar footer - user info */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-ds-primary text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-ds-sidebar-text truncate">{user.department}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-ds-border bg-ds-surface px-4 lg:px-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb area (left side of header) */}
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-ds-text font-heading">
              {filteredNav.find((item) => isActive(item.href))?.label || ""}
            </h2>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push("/dashboard")}
            >
              <Bell className="h-5 w-5 text-ds-text-muted" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ds-error p-0 text-[10px] text-white border-0">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-ds-primary text-white text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-ds-text md:block">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-ds-text-muted" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  個人資料
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  設定
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-ds-error">
                  <LogOut className="mr-2 h-4 w-4" />
                  登出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
