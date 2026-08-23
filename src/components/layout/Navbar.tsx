"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut, Settings, User, Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { UserRole } from "@/types";
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui/avatar";

interface NavbarProps {
  user?: { id: string; email: string; role: UserRole; profile?: { first_name: string; last_name: string; avatar_url: string | null } } | null;
  onMenuToggle?: () => void;
}

export default function Navbar({ user, onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const displayName = user?.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user?.email?.split('@')[0] || "Guest";

  return (
    <header className="sticky top-0 z-30 bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)]">
      <div className="flex h-[64px] items-center justify-between px-4 lg:px-6 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuToggle} className="h-10 w-10 rounded-full grid place-items-center bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="hidden md:block text-[22px] font-normal leading-7 tracking-tight text-[var(--md-sys-color-on-surface)]">
            {user?.role === "admin" ? "Admin console" : user?.role === "alumni" ? "Alumni space" : "Student home"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] px-4">
            <Search className="h-4 w-4 text-[var(--md-sys-color-on-surface-variant)]" />
            <input placeholder="Search" className="bg-transparent outline-none text-sm placeholder:text-[var(--md-sys-color-on-surface-variant)] w-40" />
          </div>

          <button className="h-10 w-10 rounded-full grid place-items-center bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--md-sys-color-error)] ring-2 ring-[var(--md-sys-color-surface)]" />
          </button>

          <div className="relative">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-3 h-10 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] pl-1 pr-3 hover:bg-[var(--md-sys-color-surface-container-high)]">
              <Avatar className="h-8 w-8 rounded-full">
                {user?.profile?.avatar_url && <AvatarImage src={user.profile.avatar_url} alt={displayName} />}
                <AvatarFallback className="rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-medium">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-[var(--md-sys-color-on-surface)] max-w-[120px] truncate">{displayName}</span>
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] shadow-[var(--md-elevation-2)] overflow-hidden z-50 p-2">
                  <div className="rounded-[12px] bg-[var(--md-sys-color-surface-container)] p-3 mb-2">
                    <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">{displayName}</p>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">{user?.email}</p>
                    <span className="inline-flex mt-2 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] px-2.5 py-1 text-[11px] font-medium capitalize">{user?.role}</span>
                  </div>
                  <button onClick={() => { setOpen(false); router.push(`/${user?.role || 'student'}/profile`); }} className="w-full flex items-center gap-3 h-10 px-3 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-sm">
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button onClick={() => { setOpen(false); router.push(`/${user?.role || 'student'}/settings`); }} className="w-full flex items-center gap-3 h-10 px-3 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-sm">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <div className="my-2 border-t border-[var(--md-sys-color-outline-variant)]" />
                  <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="w-full flex items-center gap-3 h-10 px-3 rounded-full hover:bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)] text-sm">
                    <LogOut className="h-4 w-4" /> Sign out
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
