"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  LogOut,
  Settings,
  User,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import type { UserRole } from "@/types";
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui/avatar";

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    profile?: {
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
  } | null;
  onMenuToggle?: () => void;
}

export default function Navbar({ user, onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = user?.profile
    ? `${user.profile.first_name} ${user.profile.last_name}`
    : user?.email || "Admin";

  const unreadCount = 3;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30">
      {/* Orange accent bar */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />

      {/* Main navbar */}
      <div className="flex h-14 items-center justify-between bg-white border-b border-slate-200 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-base font-semibold text-slate-800 hidden sm:block">
            {user?.role === "admin" && "Admin Dashboard"}
            {user?.role === "student" && "Student Portal"}
            {user?.role === "alumni" && "Alumni Portal"}
          </h2>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors"
            >
              <Avatar className="h-8 w-8">
                {user?.profile?.avatar_url && (
                  <AvatarImage src={user.profile.avatar_url} alt={displayName} />
                )}
                <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-sm font-medium text-slate-700">{displayName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg animate-in fade-in-0 zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-800">{displayName}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push(`/${user?.role || "admin"}/profile`);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push(`/${user?.role || "admin"}/settings`);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
