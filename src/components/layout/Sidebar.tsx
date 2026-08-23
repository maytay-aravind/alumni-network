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
  BookOpen,
  Settings,
  User,
  BarChart3,
  Target,
  FileText,
  ShieldCheck,
  ClipboardList,
  Award,
  Search,
  Bell,
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
    profile?: {
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
  } | null;
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS: Record<string, { label: string; href: string; icon: any; group?: string }[]> = {
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard, group: "General" },
    { label: "Alumni Directory", href: "/student/alumni", icon: Users, group: "General" },
    { label: "Connections", href: "/student/connections", icon: Target, group: "General" },
    { label: "Messages", href: "/student/messages", icon: MessageSquare, group: "General" },
    { label: "My Mentors", href: "/student/mentorship", icon: Award, group: "General" },
    { label: "Job Board", href: "/student/jobs", icon: Briefcase, group: "General" },
    { label: "Events", href: "/student/events", icon: Calendar, group: "General" },
    { label: "Community", href: "/student/posts", icon: FileText, group: "General" },
    { label: "AI Assistant", href: "/student/ai/career-assistant", icon: MessageSquare, group: "AI Tools" },
    { label: "Resume Analyzer", href: "/student/ai/resume-analyzer", icon: ClipboardList, group: "AI Tools" },
    { label: "Skill Gap", href: "/student/ai/skill-gap", icon: TrendingUp, group: "AI Tools" },
    { label: "Mentor Match", href: "/student/ai/mentor-match", icon: Target, group: "AI Tools" },
    { label: "Career Readiness", href: "/student/ai/career-readiness", icon: BarChart3, group: "AI Tools" },
    { label: "Profile", href: "/student/profile", icon: User, group: "Account" },
    { label: "Settings", href: "/student/settings", icon: Settings, group: "Account" },
  ],
  alumni: [
    { label: "Dashboard", href: "/alumni", icon: LayoutDashboard, group: "General" },
    { label: "My Mentees", href: "/alumni/mentees", icon: Users, group: "General" },
    { label: "Messages", href: "/alumni/messages", icon: MessageSquare, group: "General" },
    { label: "Job Postings", href: "/alumni/jobs", icon: Briefcase, group: "General" },
    { label: "Events", href: "/alumni/events", icon: Calendar, group: "General" },
    { label: "Community", href: "/alumni/posts", icon: FileText, group: "General" },
    { label: "Analytics", href: "/alumni/analytics", icon: BarChart3, group: "General" },
    { label: "Profile", href: "/alumni/profile", icon: User, group: "Account" },
    { label: "Settings", href: "/alumni/settings", icon: Settings, group: "Account" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, group: "General" },
    { label: "Alumni List", href: "/admin/alumni", icon: GraduationCap, group: "General" },
    { label: "Students", href: "/admin/students", icon: Users, group: "General" },
    { label: "Verify Alumni", href: "/admin/verify", icon: ShieldCheck, group: "General" },
    { label: "Job Posts", href: "/admin/jobs", icon: Briefcase, group: "General" },
    { label: "Events", href: "/admin/events", icon: Calendar, group: "General" },
    { label: "Posts", href: "/admin/posts", icon: FileText, group: "General" },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, group: "General" },
    { label: "Settings", href: "/admin/settings", icon: Settings, group: "Account" },
  ],
};

export default function Sidebar({ user, collapsed = false, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = user ? NAV_ITEMS[user.role] || [] : [];
  const displayName = user?.profile
    ? `${user.profile.first_name} ${user.profile.last_name}`
    : user?.email || "Admin";

  const grouped = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    const group = item.group || "General";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  const sidebarContent = (
    <>
      {/* User Profile Header */}
      <div className="flex flex-col items-center px-4 pt-6 pb-4 border-b border-slate-700/50">
        <div className="relative mb-3">
          <Avatar className="h-16 w-16 ring-2 ring-slate-600">
            {user?.profile?.avatar_url && (
              <AvatarImage src={user.profile.avatar_url} alt={displayName} />
            )}
            <AvatarFallback className="bg-slate-700 text-slate-200 text-lg font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-slate-800" />
        </div>
        <h3 className="text-sm font-semibold text-white truncate max-w-[160px]">{displayName}</h3>
        <p className="text-xs text-slate-400 truncate max-w-[160px]">{user?.email || "admin@gmail.com"}</p>
        <span className="mt-2 inline-flex items-center rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-medium text-blue-400 uppercase tracking-wider">
          {user?.role || "admin"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="mb-4">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {group}
              </p>
            )}
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && item.href !== "/student" && item.href !== "/alumni" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-blue-500/15 text-blue-400 shadow-sm"
                          : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          isActive ? "text-blue-400" : "text-slate-500"
                        )}
                      />
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
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-[#1e293b] transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[260px]",
          "hidden lg:flex"
        )}
      >
        {/* Logo Header */}
        <div className={cn(
          "flex h-14 items-center border-b border-slate-700/50 bg-[#1e293b]",
          collapsed ? "justify-center px-2" : "px-4 gap-3"
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-white truncate">COLLEGE ALUMNI</h1>
              <p className="text-[10px] text-slate-400">SYSTEM</p>
            </div>
          )}
        </div>

        {sidebarContent}

        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-center h-10 border-t border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#1e293b] lg:hidden animate-in slide-in-from-left">
            <div className="flex h-14 items-center justify-between border-b border-slate-700/50 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white">COLLEGE ALUMNI</h1>
                  <p className="text-[10px] text-slate-400">SYSTEM</p>
                </div>
              </div>
              <button onClick={onMobileClose} className="text-slate-400 hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
