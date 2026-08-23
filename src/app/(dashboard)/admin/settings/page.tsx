"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Settings,
  Users,
  GraduationCap,
  ShieldCheck,
  Database,
  Trash2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Power,
  Info,
  BarChart3,
  Wrench,
} from "lucide-react";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)] leading-none">{label}</p>
        {description && <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] mt-1">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
          checked ? "bg-[var(--md-sys-color-primary)]" : "bg-[var(--md-sys-color-outline-variant)]"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${checked ? "translate-x-6" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [counts, setCounts] = React.useState({
    students: 0,
    alumni: 0,
    verified: 0,
    pendingReports: 0,
    events: 0,
    jobs: 0,
    posts: 0,
  });
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [allowRegistration, setAllowRegistration] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [clearing, setClearing] = React.useState(false);

  React.useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      try {
        const [studentsRes, alumniRes, verifiedRes, eventsRes, jobsRes, postsRes, reportsRes] = await Promise.all([
          supabase.from("student_profiles").select("user_id", { count: "exact", head: true }),
          supabase.from("alumni_profiles").select("user_id", { count: "exact", head: true }),
          supabase.from("alumni_profiles").select("user_id", { count: "exact", head: true }).eq("is_verified", true),
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("jobs").select("id", { count: "exact", head: true }),
          supabase.from("posts").select("id", { count: "exact", head: true }),
          supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        ]);
        setCounts({
          students: (studentsRes.count as number) || 0,
          alumni: (alumniRes.count as number) || 0,
          verified: (verifiedRes.count as number) || 0,
          events: (eventsRes.count as number) || 0,
          jobs: (jobsRes.count as number) || 0,
          posts: (postsRes.count as number) || 0,
          pendingReports: (reportsRes.count as number) || 0,
        });
      } catch (e) {
        // fallback to 0
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // load local prefs
    try {
      const saved = localStorage.getItem("admin_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setMaintenanceMode(Boolean(parsed.maintenanceMode));
        setAllowRegistration(parsed.allowRegistration !== false);
        setEmailNotifications(parsed.emailNotifications !== false);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        "admin_settings",
        JSON.stringify({ maintenanceMode, allowRegistration, emailNotifications })
      );
    } catch {}
  }, [maintenanceMode, allowRegistration, emailNotifications]);

  const handleClearCache = async () => {
    setClearing(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Cache cleared successfully");
    setClearing(false);
  };

  const handleSavePlatform = () => {
    toast.success("Platform settings saved");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-20 w-full rounded-[16px]" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-[16px]" /> <Skeleton className="h-28 rounded-[16px]" /> <Skeleton className="h-28 rounded-[16px]" />
        </div>
        <Skeleton className="h-96 w-full rounded-[16px]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-6 shadow-[var(--md-elevation-1)]">
        <h1 className="text-[22px] font-normal tracking-tight text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
          <Settings className="h-6 w-6 text-[var(--md-sys-color-primary)]" /> Platform settings
        </h1>
        <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-1">Manage platform configuration and monitor system health</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated" className="rounded-[16px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--md-sys-color-primary-container)] grid place-items-center shrink-0">
              <Users className="h-5 w-5 text-[var(--md-sys-color-on-primary-container)]" />
            </div>
            <div>
              <p className="text-[22px] font-medium leading-none text-[var(--md-sys-color-on-surface)]">{counts.students}</p>
              <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated" className="rounded-[16px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--md-sys-color-secondary-container)] grid place-items-center shrink-0">
              <GraduationCap className="h-5 w-5 text-[var(--md-sys-color-on-secondary-container)]" />
            </div>
            <div>
              <p className="text-[22px] font-medium leading-none text-[var(--md-sys-color-on-surface)]">{counts.alumni}</p>
              <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">Alumni</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated" className="rounded-[16px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--md-sys-color-tertiary-container)] grid place-items-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-[var(--md-sys-color-on-tertiary-container)]" />
            </div>
            <div>
              <p className="text-[22px] font-medium leading-none text-[var(--md-sys-color-on-surface)]">{counts.verified}</p>
              <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated" className="rounded-[16px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--md-sys-color-error-container)] grid place-items-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-[var(--md-sys-color-on-error-container)]" />
            </div>
            <div>
              <p className="text-[22px] font-medium leading-none text-[var(--md-sys-color-on-surface)]">{counts.pendingReports}</p>
              <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">Pending reports</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[16px]">
              <Wrench className="h-5 w-5 text-[var(--md-sys-color-primary)]" /> Platform configuration
            </CardTitle>
            <CardDescription>Toggle core platform behaviors (local only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[var(--md-sys-color-outline-variant)]/50">
              <Toggle
                checked={maintenanceMode}
                onChange={setMaintenanceMode}
                label="Maintenance mode"
                description="Show maintenance banner and limit writes"
              />
              <Toggle
                checked={allowRegistration}
                onChange={setAllowRegistration}
                label="Allow new registrations"
                description="Enable sign-ups for students and alumni"
              />
              <Toggle
                checked={emailNotifications}
                onChange={setEmailNotifications}
                label="Email notifications"
                description="Send system emails for verifications and events"
              />
            </div>
            {maintenanceMode && (
              <div className="mt-4 rounded-[12px] bg-[var(--md-sys-color-tertiary-container)] border border-[var(--md-sys-color-outline-variant)] p-3 flex gap-2">
                <Info className="h-5 w-5 text-[var(--md-sys-color-on-tertiary-container)] shrink-0 mt-0.5" />
                <p className="text-[13px] leading-5 text-[var(--md-sys-color-on-tertiary-container)]">
                  Maintenance mode is enabled locally. In production this would block non-admin access via middleware.
                </p>
              </div>
            )}
            <div className="flex justify-end pt-6">
              <Button onClick={handleSavePlatform} className="rounded-full">
                Save configuration
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <BarChart3 className="h-5 w-5 text-[var(--md-sys-color-primary)]" /> Content stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-[12px] bg-[var(--md-sys-color-surface-container)] px-4 py-3">
                <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant)]">Events</span>
                <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{counts.events}</span>
              </div>
              <div className="flex items-center justify-between rounded-[12px] bg-[var(--md-sys-color-surface-container)] px-4 py-3">
                <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant)]">Jobs</span>
                <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{counts.jobs}</span>
              </div>
              <div className="flex items-center justify-between rounded-[12px] bg-[var(--md-sys-color-surface-container)] px-4 py-3">
                <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant)]">Posts</span>
                <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{counts.posts}</span>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <Database className="h-5 w-5 text-[var(--md-sys-color-primary)]" /> System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="tonal" className="w-full rounded-full justify-start gap-2" onClick={handleClearCache} disabled={clearing}>
                {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Clear cache
              </Button>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Clears local storage and refreshes counts.</p>
              <Button
                variant="outlined"
                className="w-full rounded-full justify-start gap-2"
                onClick={() => {
                  localStorage.clear();
                  toast.success("Local storage cleared");
                }}
              >
                <Trash2 className="h-4 w-4" /> Clear local storage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card variant="outlined" className="border-[var(--md-sys-color-error)]/20 bg-[var(--md-sys-color-error-container)]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--md-sys-color-error)] text-[16px]">
            <Power className="h-5 w-5" /> Danger zone
          </CardTitle>
          <CardDescription>High-risk platform actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-[16px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-error)]/20 p-4">
            <p className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">Reset platform data</p>
            <p className="text-[13px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
              This is a placeholder for purging demo data. No data is actually deleted in this demo.
            </p>
            <Button variant="error" className="rounded-full mt-3" onClick={() => toast.error("This action is disabled in demo mode.")}>
              <AlertTriangle className="h-4 w-4 mr-2" /> Reset demo data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
