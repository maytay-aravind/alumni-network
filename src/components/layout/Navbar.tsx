"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  LogOut,
  Settings,
  User,
  Search,
  Check,
  ExternalLink,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  GraduationCap,
  FileText,
  Award,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    profile?: { first_name: string; last_name: string; avatar_url: string | null };
  } | null;
  onMenuToggle?: () => void;
}

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  message: string;
  title?: string | null;
  link: string | null;
  read?: boolean;
  is_read?: boolean;
  created_at: string;
};

function getNotificationIcon(type: string) {
  switch (type) {
    case "connection":
      return Users;
    case "mentorship":
      return Award;
    case "job":
      return Briefcase;
    case "event":
      return Calendar;
    case "post":
      return FileText;
    case "message":
      return MessageSquare;
    default:
      return Bell;
  }
}

export default function Navbar({ user, onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName = user?.profile
    ? `${user.profile.first_name} ${user.profile.last_name}`
    : user?.email?.split("@")[0] || "Guest";

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      setNotifLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      const list = (data as unknown as NotificationRow[]) || [];
      setNotifications(list);
      const unread = list.filter((n) => !(n.read ?? n.is_read ?? false)).length;
      setUnreadCount(unread);
    } catch (e) {
      // keep silent, but reset
      // console.error("fetch notifications", e);
    } finally {
      setNotifLoading(false);
    }
  }, [user?.id]);

  // initial fetch + poll for badge
  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

  // fetch on open
  useEffect(() => {
    if (notifOpen) fetchNotifications();
  }, [notifOpen, fetchNotifications]);

  // close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [notifOpen]);

  const markAsRead = async (id: string) => {
    try {
      const supabase = createClient();
      // schema uses `read` column; try both
      let { error } = await supabase.from("notifications").update({ read: true } as never).eq("id", id);
      if (error && error.message?.toLowerCase().includes("column")) {
        const res2 = await supabase.from("notifications").update({ is_read: true } as never).eq("id", id);
        if (res2.error) throw res2.error;
      } else if (error) {
        throw error;
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      const supabase = createClient();
      let { error } = await supabase
        .from("notifications")
        .update({ read: true } as never)
        .eq("user_id", user.id)
        .eq("read", false);
      if (error && error.message?.toLowerCase().includes("column")) {
        const res2 = await supabase
          .from("notifications")
          .update({ is_read: true } as never)
          .eq("user_id", user.id)
          .eq("is_read", false);
        if (res2.error) throw res2.error;
      } else if (error) {
        // if eq read fails because column missing, try broad
        if (error.message?.includes("read")) {
          await supabase.from("notifications").update({ read: true } as never).eq("user_id", user.id);
        } else throw error;
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)]">
      <div className="flex h-[64px] items-center justify-between px-4 lg:px-6 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="h-10 w-10 rounded-full grid place-items-center bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="hidden md:block text-[22px] font-normal leading-7 tracking-tight text-[var(--md-sys-color-on-surface)]">
            {user?.role === "admin" ? "Admin console" : user?.role === "alumni" ? "Alumni space" : "Student home"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] px-4">
            <Search className="h-4 w-4 text-[var(--md-sys-color-on-surface-variant)]" />
            <input
              placeholder="Search"
              className="bg-transparent outline-none text-sm placeholder:text-[var(--md-sys-color-on-surface-variant)] w-40"
            />
          </div>

          {/* Notification bell dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                if (profileOpen) setProfileOpen(false);
              }}
              aria-label="Notifications"
              className="h-10 w-10 rounded-full grid place-items-center bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-h-[20px] min-w-[20px] px-1 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-[11px] font-medium grid place-items-center ring-2 ring-[var(--md-sys-color-surface)] leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-[360px] max-w-[92vw] rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] shadow-[var(--md-elevation-2)] overflow-hidden z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
                  <h3 className="text-[16px] font-medium tracking-[0.15px] text-[var(--md-sys-color-on-surface)]">
                    Notifications
                  </h3>
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="text-[13px] font-medium text-[var(--md-sys-color-primary)] hover:underline disabled:opacity-40 disabled:no-underline px-2 py-1 rounded-full hover:bg-[var(--md-sys-color-surface-container)]"
                  >
                    Mark all as read
                  </button>
                </div>

                {/* List */}
                <div className="max-h-[420px] overflow-y-auto">
                  {notifLoading ? (
                    <div className="py-10 grid place-items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-[var(--md-sys-color-primary)]" />
                      <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-12 px-6 text-center">
                      <div className="h-14 w-14 rounded-full bg-[var(--md-sys-color-surface-container)] grid place-items-center mx-auto mb-3">
                        <Bell className="h-6 w-6 text-[var(--md-sys-color-on-surface-variant)]" />
                      </div>
                      <p className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">No notifications yet</p>
                      <p className="text-[13px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
                        When you get updates on connections, jobs or events they will appear here.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-[var(--md-sys-color-outline-variant)]/50">
                      {notifications.map((n) => {
                        const isRead = (n.read ?? (n as any).is_read) as boolean | undefined;
                        const read = Boolean(isRead);
                        const Icon = getNotificationIcon(n.type || "general");
                        const displayMessage = n.message || (n as any).title || "Notification";
                        const displayTitle = n.title || n.type || "Update";
                        return (
                          <li
                            key={n.id}
                            className={`p-3 flex gap-3 ${read ? "bg-transparent opacity-75" : "bg-[var(--md-sys-color-surface-container)]"}`}
                          >
                            <div
                              className={`h-9 w-9 shrink-0 rounded-full grid place-items-center mt-0.5 ${
                                read
                                  ? "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]"
                                  : "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-[13px] leading-4 ${read ? "font-normal text-[var(--md-sys-color-on-surface-variant)]" : "font-medium text-[var(--md-sys-color-on-surface)]"}`}>
                                  {displayMessage}
                                </p>
                                {!read && (
                                  <span className="h-2 w-2 rounded-full bg-[var(--md-sys-color-primary)] shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
                                {n.type ? (
                                  <span className="inline-flex items-center gap-1 capitalize">
                                    {n.type}
                                    <span className="opacity-40">•</span>
                                  </span>
                                ) : null}{" "}
                                {n.created_at ? formatDate(n.created_at) : ""}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {!read && (
                                  <button
                                    onClick={() => markAsRead(n.id)}
                                    className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-[12px] font-medium hover:bg-[var(--md-sys-color-secondary-container)]/80"
                                  >
                                    <Check className="h-3.5 w-3.5" /> Mark as read
                                  </button>
                                )}
                                {n.link && (
                                  <button
                                    onClick={() => {
                                      setNotifOpen(false);
                                      router.push(n.link!);
                                    }}
                                    className="inline-flex items-center gap-1 h-7 px-3 rounded-full border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-primary)] text-[12px] font-medium bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                                  >
                                    View <ExternalLink className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                if (notifOpen) setNotifOpen(false);
              }}
              className="flex items-center gap-3 h-10 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] pl-1 pr-3 hover:bg-[var(--md-sys-color-surface-container-high)]"
            >
              <Avatar className="h-8 w-8 rounded-full">
                {user?.profile?.avatar_url && <AvatarImage src={user.profile.avatar_url} alt={displayName} />}
                <AvatarFallback className="rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-medium">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-[var(--md-sys-color-on-surface)] max-w-[120px] truncate">
                {displayName}
              </span>
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] shadow-[var(--md-elevation-2)] overflow-hidden z-50 p-2">
                  <div className="rounded-[12px] bg-[var(--md-sys-color-surface-container)] p-3 mb-2">
                    <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">{displayName}</p>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">{user?.email}</p>
                    <span className="inline-flex mt-2 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] px-2.5 py-1 text-[11px] font-medium capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(`/${user?.role || "student"}/profile`);
                    }}
                    className="w-full flex items-center gap-3 h-10 px-3 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-sm"
                  >
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(`/${user?.role || "student"}/settings`);
                    }}
                    className="w-full flex items-center gap-3 h-10 px-3 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-sm"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <div className="my-2 border-t border-[var(--md-sys-color-outline-variant)]" />
                  <button
                    onClick={async () => {
                      const supabase = createClient();
                      await supabase.auth.signOut();
                      router.push("/login");
                    }}
                    className="w-full flex items-center gap-3 h-10 px-3 rounded-full hover:bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)] text-sm"
                  >
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
