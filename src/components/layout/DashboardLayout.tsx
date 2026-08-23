"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
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
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#FEF7FF]">
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={cn("flex flex-col transition-all duration-300", sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[268px]")}>
        <Navbar user={user} onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
