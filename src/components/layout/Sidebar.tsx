"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  MessageSquare,
  Briefcase,
  Calendar,
  FileText,
  ShieldCheck,
  ClipboardList,
  Award,
  BarChart3,
  Target,
  Settings,
  User,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui/avatar";

interface SidebarProps {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    profile?: { first_name: string; last_name: string; avatar_url: string | null };
  } | null;
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS: Record<string, { label: string; href: string; icon: any; group?: string }[]> = {
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard, group: "Overview" },
    { label: "Alumni Directory", href: "/student/alumni", icon: Users, group: "Overview" },
    { label: "Connections", href: "/student/connections", icon: Target, group: "Overview" },
    { label: "Messages", href: "/student/messages", icon: MessageSquare, group: "Overview" },
    { label: "My Mentors", href: "/student/mentorship", icon: Award, group: "Overview" },
    { label: "Job Board", href: "/student/jobs", icon: Briefcase, group: "Overview" },
    { label: "Events", href: "/student/events", icon: Calendar, group: "Overview" },
    { label: "Community", href: "/student/posts", icon: FileText, group: "Overview" },
    { label: "AI Assistant", href: "/student/ai/career-assistant", icon: MessageSquare, group: "AI Tools" },
    { label: "Resume Analyzer", href: "/student/ai/resume-analyzer", icon: ClipboardList, group: "AI Tools" },
    { label: "Skill Gap", href: "/student/ai/skill-gap", icon: TrendingUp, group: "AI Tools" },
    { label: "Mentor Match", href: "/student/ai/mentor-match", icon: Target, group: "AI Tools" },
    { label: "Career Readiness", href: "/student/ai/career-readiness", icon: BarChart3, group: "AI Tools" },
    { label: "Profile", href: "/student/profile", icon: User, group: "Account" },
    { label: "Settings", href: "/student/settings", icon: Settings, group: "Account" },
  ],
  alumni: [
    { label: "Dashboard", href: "/alumni", icon: LayoutDashboard, group: "Overview" },
    { label: "My Mentees", href: "/alumni/mentees", icon: Users, group: "Overview" },
    { label: "Messages", href: "/alumni/messages", icon: MessageSquare, group: "Overview" },
    { label: "Job Postings", href: "/alumni/jobs", icon: Briefcase, group: "Overview" },
    { label: "Events", href: "/alumni/events", icon: Calendar, group: "Overview" },
    { label: "Community", href: "/alumni/posts", icon: FileText, group: "Overview" },
    { label: "Analytics", href: "/alumni/analytics", icon: BarChart3, group: "Overview" },
    { label: "Profile", href: "/alumni/profile", icon: User, group: "Account" },
    { label: "Settings", href: "/alumni/settings", icon: Settings, group: "Account" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, group: "Overview" },
    { label: "Alumni List", href: "/admin/alumni", icon: GraduationCap, group: "Overview" },
    { label: "Students", href: "/admin/students", icon: Users, group: "Overview" },
    { label: "Verify Alumni", href: "/admin/verify", icon: ShieldCheck, group: "Overview" },
    { label: "Job Posts", href: "/admin/jobs", icon: Briefcase, group: "Overview" },
    { label: "Events", href: "/admin/events", icon: Calendar, group: "Overview" },
    { label: "Posts", href: "/admin/posts", icon: FileText, group: "Overview" },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, group: "Overview" },
    { label: "Settings", href: "/admin/settings", icon: Settings, group: "Account" },
  ],
};

export default function Sidebar({ user, collapsed = false, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = user ? NAV_ITEMS[user.role] || [] : [];
  const displayName = user?.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user?.email || "Guest";
  const grouped = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    const g = item.group || "Overview";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  const content = (
    <>
      <div className="flex flex-col items-center px-4 pt-6 pb-5">
        <Avatar className="h-20 w-20 ring-4 ring-white shadow-md">
          {user?.profile?.avatar_url && <AvatarImage src={user.profile.avatar_url} alt={displayName} />}
          <AvatarFallback className="bg-[#EADDFF] text-[#21005D] text-xl font-semibold">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <h3 className="mt-3 text-sm font-semibold text-[#1D1B20] truncate max-w-[170px]">{displayName}</h3>
        <p className="text-xs text-[#49454F] truncate max-w-[170px]">{user?.email || "guest@example.com"}</p>
        <span className="mt-2.5 inline-flex items-center rounded-full bg-[#EADDFF] px-3 py-1 text-[11px] font-medium text-[#21005D] tracking-wide">
          {user?.role || "guest"}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-3">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="mb-5">
            {!collapsed && (
              <p className="px-4 mb-2 text-[11px] font-medium tracking-wider text-[#49454F] uppercase">{group}</p>
            )}
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/student" && item.href !== "/alumni" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-[#EADDFF] text-[#21005D] shadow-sm"
                          : "text-[#49454F] hover:bg-[#E8DEF8]/60 hover:text-[#1D1B20]",
                        collapsed && "justify-center px-2 rounded-2xl"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className={cn("h-[20px] w-[20px] shrink-0", isActive ? "text-[#21005D]" : "text-[#49454F]")} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex flex-col bg-[#F3EDF7] border-r border-[#E7E0EC] transition-all duration-300", collapsed ? "w-[72px]" : "w-[268px]", "hidden lg:flex")}>
        <div className={cn("flex h-[64px] items-center bg-[#F3EDF7] px-4 gap-3", collapsed && "justify-center px-2")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6750A4] shadow-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-[#1D1B20] leading-none">College Alumni</h1>
              <p className="text-[11px] text-[#49454F] tracking-wide">SYSTEM</p>
            </div>
          )}
        </div>
        {content}
        <button type="button" onClick={onToggle} className="flex items-center justify-center h-12 text-[#49454F] hover:bg-[#E8DEF8]/60 transition-colors">
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#F3EDF7] lg:hidden animate-in">
            <div className="flex h-[64px] items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6750A4]">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-[#1D1B20]">College Alumni</h1>
                  <p className="text-[11px] text-[#49454F]">SYSTEM</p>
                </div>
              </div>
              <button onClick={onMobileClose} className="h-10 w-10 grid place-items-center rounded-full hover:bg-black/5 text-[#49454F]">✕</button>
            </div>
            {content}
          </aside>
        </>
      )}
    </>
  );
}
