"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut, Settings, User, ChevronDown } from "lucide-react";
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
  const displayName = user?.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user?.email || "Guest";
  return (
    <header className="sticky top-0 z-30">
      <div className="flex h-[64px] items-center justify-between bg-[#FFFBFE]/80 backdrop-blur-xl border-b border-[#E7E0EC] px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuToggle} className="grid h-10 w-10 place-items-center rounded-full text-[#49454F] hover:bg-[#F3EDF7] lg:hidden transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="hidden sm:block text-[15px] font-medium text-[#1D1B20]">
            {user?.role === "admin" && "Admin Dashboard"}
            {user?.role === "student" && "Student Portal"}
            {user?.role === "alumni" && "Alumni Portal"}
            {!user && "Alumni Network"}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="relative grid h-10 w-10 place-items-center rounded-full text-[#49454F] hover:bg-[#F3EDF7] transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 min-h-[18px] min-w-[18px] px-1 grid place-items-center rounded-full bg-[#BA1A1A] text-[11px] font-medium text-white">3</span>
          </button>
          <div className="relative ml-1">
            <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full bg-[#F3EDF7] pl-1 pr-3 py-1 hover:bg-[#E8DEF8] transition-colors">
              <Avatar className="h-8 w-8">
                {user?.profile?.avatar_url && <AvatarImage src={user.profile.avatar_url} alt={displayName} />}
                <AvatarFallback className="bg-[#6750A4] text-white text-xs">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-[#1D1B20] max-w-[120px] truncate">{displayName}</span>
              <ChevronDown className="h-4 w-4 text-[#49454F] hidden sm:block" />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-3xl bg-white shadow-xl border border-[#E7E0EC] py-2 overflow-hidden animate-in">
                  <div className="px-4 py-3 bg-[#F3EDF7] mx-2 rounded-2xl mb-2">
                    <p className="text-sm font-medium text-[#1D1B20]">{displayName}</p>
                    <p className="text-xs text-[#49454F] truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { setOpen(false); router.push(`/${user?.role || "student"}/profile`); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#1D1B20] hover:bg-[#F3EDF7]"><User className="h-4 w-4" /> My Profile</button>
                  <button onClick={() => { setOpen(false); router.push(`/${user?.role || "student"}/settings`); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#1D1B20] hover:bg-[#F3EDF7]"><Settings className="h-4 w-4" /> Settings</button>
                  <div className="my-2 border-t border-[#E7E0EC]" />
                  <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); router.refresh(); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#BA1A1A] hover:bg-[#FFDAD6]"><LogOut className="h-4 w-4" /> Logout</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
