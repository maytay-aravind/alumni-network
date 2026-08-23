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
  user?: { id: string; email: string; role: UserRole; profile?: { first_name: string; last_name: string; avatar_url: string | null } } | null;
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS: Record<string, { label: string; href: string; icon: any; group?: string }[]> = {
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard, group: "Home" },
    { label: "Directory", href: "/student/alumni", icon: Users, group: "Home" },
    { label: "Connections", href: "/student/connections", icon: Target, group: "Home" },
    { label: "Messages", href: "/student/messages", icon: MessageSquare, group: "Connect" },
    { label: "Mentors", href: "/student/mentorship", icon: Award, group: "Connect" },
    { label: "Jobs", href: "/student/jobs", icon: Briefcase, group: "Opportunities" },
    { label: "Events", href: "/student/events", icon: Calendar, group: "Opportunities" },
    { label: "Community", href: "/student/posts", icon: FileText, group: "Opportunities" },
    { label: "Assistant", href: "/student/ai/career-assistant", icon: MessageSquare, group: "AI Lab" },
    { label: "Resume", href: "/student/ai/resume-analyzer", icon: ClipboardList, group: "AI Lab" },
    { label: "Skill Gap", href: "/student/ai/skill-gap", icon: TrendingUp, group: "AI Lab" },
    { label: "Mentor Match", href: "/student/ai/mentor-match", icon: Target, group: "AI Lab" },
    { label: "Profile", href: "/student/profile", icon: User, group: "You" },
  ],
  alumni: [
    { label: "Dashboard", href: "/alumni", icon: LayoutDashboard, group: "Home" },
    { label: "Mentees", href: "/alumni/mentees", icon: Users, group: "Home" },
    { label: "Messages", href: "/alumni/messages", icon: MessageSquare, group: "Connect" },
    { label: "Jobs", href: "/alumni/jobs", icon: Briefcase, group: "Opportunities" },
    { label: "Events", href: "/alumni/events", icon: Calendar, group: "Opportunities" },
    { label: "Community", href: "/alumni/posts", icon: FileText, group: "Opportunities" },
    { label: "Analytics", href: "/alumni/analytics", icon: BarChart3, group: "You" },
    { label: "Profile", href: "/alumni/profile", icon: User, group: "You" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, group: "Overview" },
    { label: "Alumni", href: "/admin/alumni", icon: GraduationCap, group: "Manage" },
    { label: "Students", href: "/admin/students", icon: Users, group: "Manage" },
    { label: "Verify", href: "/admin/verify", icon: ShieldCheck, group: "Manage" },
    { label: "Jobs", href: "/admin/jobs", icon: Briefcase, group: "Manage" },
    { label: "Events", href: "/admin/events", icon: Calendar, group: "Manage" },
    { label: "Posts", href: "/admin/posts", icon: FileText, group: "Manage" },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, group: "Insights" },
  ],
};

export default function Sidebar({ user, collapsed = false, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = user ? NAV_ITEMS[user.role] || [] : [];
  const displayName = user?.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user?.email?.split('@')[0] || "Guest";
  const grouped = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    const g = item.group || "Home";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  const navContent = (
    <>
      <div className="px-3 pt-6 pb-4">
        <div className="flex items-center gap-3 px-3">
          <div className="h-10 w-10 rounded-[12px] bg-[var(--md-sys-color-primary)] grid place-items-center">
            <GraduationCap className="h-5 w-5 text-[var(--md-sys-color-on-primary)]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-none tracking-tight text-[var(--md-sys-color-on-surface)]">AlumniNet</p>
              <p className="text-[11px] font-medium tracking-widest text-[var(--md-sys-color-on-surface-variant)] uppercase">College System</p>
            </div>
          )}
        </div>
        {!collapsed && user && (
          <div className="mt-5 mx-2 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-3 flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-[12px]">
              {user.profile?.avatar_url && <AvatarImage src={user.profile.avatar_url} alt={displayName} />}
              <AvatarFallback className="rounded-[12px] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-sm font-medium">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium leading-none truncate text-[var(--md-sys-color-on-surface)]">{displayName}</p>
              <p className="text-[12px] truncate text-[var(--md-sys-color-on-surface-variant)]">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="mb-5">
            {!collapsed && (
              <p className="px-3 mb-2 text-[11px] font-medium tracking-widest text-[var(--md-sys-color-on-surface-variant)] uppercase">{group}</p>
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
                        "flex items-center gap-3 h-10 px-3 text-[14px] font-medium transition-colors",
                        isActive
                          ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] rounded-full"
                          : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] rounded-full",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className="h-[20px] w-[20px] shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-3">
          <Link href={`/${user?.role || 'student'}/settings`} className="flex items-center gap-3 h-10 px-3 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]">
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <>
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col bg-[var(--md-sys-color-surface-container-low)] border-r border-[var(--md-sys-color-outline-variant)]", collapsed ? "w-[80px]" : "w-[280px]")}>
        {navContent}
        <button onClick={onToggle} className="h-10 m-3 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] grid place-items-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]">
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-[var(--md-sys-color-scrim)]/30 lg:hidden" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 z-50 w-[300px] flex flex-col bg-[var(--md-sys-color-surface-container-low)] lg:hidden animate-in">
            <div className="flex items-center justify-between p-4 border-b border-[var(--md-sys-color-outline-variant)]">
              <span className="text-sm font-semibold">Menu</span>
              <button onClick={onMobileClose} className="h-8 w-8 rounded-full bg-[var(--md-sys-color-surface-container)] grid place-items-center">✕</button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">{navContent}</div>
          </aside>
        </>
      )}
    </>
  );
}
