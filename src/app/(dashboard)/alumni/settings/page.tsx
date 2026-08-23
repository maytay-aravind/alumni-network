"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui/avatar";
import { INDIAN_CITIES } from "@/lib/constants";
import { toast } from "sonner";
import {
  User,
  Shield,
  Bell,
  Lock,
  Eye,
  Save,
  Trash2,
  Loader2,
  Mail,
  MapPin,
  Building2,
  Award,
  Info,
} from "lucide-react";

type TabKey = "profile" | "account" | "notifications" | "privacy";

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

export default function AlumniSettingsPage() {
  const [activeTab, setActiveTab] = React.useState<TabKey>("profile");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState("");
  const [userId, setUserId] = React.useState<string | null>(null);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [about, setAbout] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [designation, setDesignation] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [graduationYear, setGraduationYear] = React.useState<number | "">("");
  const [department, setDepartment] = React.useState("");
  const [yearsExp, setYearsExp] = React.useState<number | "">("");
  const [skills, setSkills] = React.useState<string[]>([]);
  const [linkedin, setLinkedin] = React.useState("");
  const [github, setGithub] = React.useState("");
  const [portfolio, setPortfolio] = React.useState("");
  const [mentorshipAvailable, setMentorshipAvailable] = React.useState(false);
  const [isMentor, setIsMentor] = React.useState(false);

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);

  const [notifPrefs, setNotifPrefs] = React.useState({
    email: true,
    push: true,
    mentorship: true,
    jobs: true,
    events: true,
  });

  const [privacy, setPrivacy] = React.useState({
    profileVisible: true,
    showEmail: false,
    allowMessages: true,
    dataSharing: false,
  });

  React.useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email || "");
      const meta = user.user_metadata as any;
      const fallbackName = meta?.full_name || user.email?.split("@")[0] || "";
      const parts = fallbackName.trim().split(" ");
      let dbFirst = parts[0] || "";
      let dbLast = parts.slice(1).join(" ") || "";
      let dbAvatar: string | null = null;
      try {
        const { data: userRow } = await supabase.from("users").select("full_name, avatar_url").eq("id", user.id).single();
        if (userRow) {
          const name = (userRow.full_name as string) || fallbackName;
          const p = name.trim().split(" ");
          dbFirst = p[0] || parts[0] || "";
          dbLast = p.slice(1).join(" ") || parts.slice(1).join(" ") || "";
          dbAvatar = userRow.avatar_url as string | null;
        }
      } catch {}
      setFirstName(dbFirst);
      setLastName(dbLast);
      setAvatarUrl(dbAvatar || "");

      try {
        const { data: profile } = await supabase.from("alumni_profiles").select("*").eq("user_id", user.id).single();
        if (profile) {
          const p: any = profile;
          setAbout((p.about as string) || (p.bio as string) || "");
          setLocation((p.location as string) || "");
          setCompany((p.current_company as string) || (p.currentCompany as string) || "");
          setDesignation((p.current_designation as string) || (p.current_position as string) || (p.current_role as string) || "");
          setIndustry((p.industry as string) || "");
          setDepartment((p.department as string) || "");
          setGraduationYear((p.graduation_year as number) || "");
          setYearsExp((p.years_of_experience as number) ?? (p.yearsOfExperience as number) ?? "");
          setLinkedin((p.linkedin as string) || (p.linkedin_url as string) || "");
          setGithub((p.github as string) || (p.github_url as string) || "");
          setPortfolio((p.portfolio as string) || (p.portfolio_url as string) || "");
          setMentorshipAvailable(Boolean(p.mentorship_available ?? p.available_for_mentorship));
          setIsMentor(Boolean(p.is_mentor));
          let s: string[] = [];
          const raw = p.skills;
          if (Array.isArray(raw)) {
            s = raw.map((x: any) => (typeof x === "string" ? x : x?.name || "")).filter(Boolean);
          } else if (typeof raw === "string") {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) s = parsed.map((x: any) => (typeof x === "string" ? x : x?.name || "")).filter(Boolean);
            } catch {}
          }
          setSkills(s);
        }
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, full_name: fullName, avatar_url: avatarUrl || null, about, location, linkedin, github }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Also update alumni-specific fields via direct supabase (alumni_profiles doesn't have recursion)
      const supabase = createClient();
      const { error: profErr } = await supabase.from("alumni_profiles").upsert({
        user_id: userId, current_company: company, current_designation: designation, industry, department,
        graduation_year: typeof graduationYear === "number" ? graduationYear : graduationYear ? parseInt(String(graduationYear)) : null,
        years_of_experience: typeof yearsExp === "number" ? yearsExp : yearsExp ? parseInt(String(yearsExp)) : 0,
        portfolio: portfolio || null, mentorship_available: mentorshipAvailable, is_mentor: isMentor,
      } as never, { onConflict: "user_id" });
      if (profErr) throw profErr;
      try { await supabase.auth.updateUser({ data: { full_name: fullName } }); } catch {}
      toast.success("Profile updated successfully");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-20 w-full rounded-[16px]" />
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-96 w-full rounded-[16px]" />
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "account", label: "Account", icon: Lock },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "privacy", label: "Privacy", icon: Eye },
  ];

  const displayName = `${firstName} ${lastName}`.trim() || userEmail.split("@")[0] || "Alumni";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-6 shadow-[var(--md-elevation-1)]">
        <h1 className="text-[22px] font-normal tracking-tight text-[var(--md-sys-color-on-surface)]">Settings</h1>
        <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-1">Manage your alumni profile and preferences</p>
      </div>

      <div className="flex items-center gap-2 p-1 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] w-fit max-w-full overflow-x-auto">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-2 h-9 px-5 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                  : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && (
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <User className="h-5 w-5 text-[var(--md-sys-color-primary)]" /> Personal & professional info
              </CardTitle>
              <CardDescription>Update your public alumni profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-[16px] bg-[var(--md-sys-color-surface-container)]">
                <Avatar className="h-16 w-16 rounded-[16px] shrink-0">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                  <AvatarFallback className="rounded-[16px] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-lg font-medium">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 w-full">
                  <Label className="text-[12px] tracking-wide text-[var(--md-sys-color-on-surface-variant)]">Profile photo</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <label className="inline-flex h-10 px-5 items-center justify-center rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-sm font-medium cursor-pointer">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {uploading ? "Uploading..." : "Upload photo"}
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !userId) return;
                        setUploading(true);
                        try {
                          const fd = new FormData();
                          fd.append("file", file);
                          fd.append("userId", userId);
                          const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error);
                          setAvatarUrl(data.url);
                          toast.success("Photo uploaded");
                        } catch (err: any) { toast.error(err.message); } finally { setUploading(false); }
                      }} />
                    </label>
                    {avatarUrl ? <Button variant="text" size="sm" onClick={() => setAvatarUrl("")}>Remove</Button> : null}
                  </div>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">JPG, PNG or WebP, max 5MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>First name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                  />
                </div>
                <div>
                  <Label>Last name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> Email (read-only)
                </Label>
                <Input
                  value={userEmail}
                  readOnly
                  disabled
                  className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]"
                />
              </div>

              <div>
                <Label>Bio / About</Label>
                <Textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  placeholder="Share your journey..."
                  className="mt-1 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" /> Current company
                  </Label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                  />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Engineer"
                    className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Industry</Label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Technology, Finance..."
                    className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                  />
                </div>
                <div>
                  <Label>Years of experience</Label>
                  <Input
                    type="number"
                    value={yearsExp}
                    onChange={(e) => setYearsExp(e.target.value ? parseInt(e.target.value) : "")}
                    placeholder="5"
                    className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-[12px] border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] px-3 py-2 text-sm"
                  >
                    <option value="">Select location</option>
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Graduation year</Label>
                  <Input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value ? parseInt(e.target.value) : "")}
                    className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                  />
                </div>
                <div>
                  <Label>Portfolio</Label>
                  <Input
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="LinkedIn URL"
                    className="rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                  />
                  <Label className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1 block">LinkedIn</Label>
                </div>
                <div>
                  <Input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="GitHub URL"
                    className="rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                  />
                  <Label className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1 block">GitHub</Label>
                </div>
              </div>

              <div className="rounded-[16px] bg-[var(--md-sys-color-surface-container)] p-4 space-y-3">
                <p className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                  <Award className="h-4 w-4 text-[var(--md-sys-color-primary)]" /> Mentorship
                </p>
                <Toggle
                  checked={mentorshipAvailable}
                  onChange={setMentorshipAvailable}
                  label="Available for mentorship"
                  description="Allow students to send you mentorship requests"
                />
                <Toggle
                  checked={isMentor}
                  onChange={setIsMentor}
                  label="Show as mentor"
                  description="Display mentor badge on your profile"
                />
              </div>

              <div>
                <Label>Skills</Label>
                <div className="mt-2 rounded-[16px] bg-[var(--md-sys-color-surface-container)] p-3 min-h-[56px] flex flex-wrap gap-2">
                  {skills.length === 0 ? (
                    <p className="text-[13px] text-[var(--md-sys-color-on-surface-variant)]">No skills added yet.</p>
                  ) : (
                    skills.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-transparent px-3 py-1 text-[12px] font-medium"
                      >
                        {s}
                      </Badge>
                    ))
                  )}
                </div>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1 flex items-center gap-1">
                  <Info className="h-3 w-3" /> Skills are edited from the Profile page.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving} className="rounded-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "account" && (
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[var(--md-sys-color-primary)]" /> Change password
              </CardTitle>
              <CardDescription>Use a strong password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>New password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                />
              </div>
              <div>
                <Label>Confirm new password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)]"
                />
              </div>
              <Button onClick={handleChangePassword} disabled={changingPassword} className="rounded-full">
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update password
              </Button>
            </CardContent>
          </Card>
          <Card variant="outlined" className="border-[var(--md-sys-color-error)]/20 bg-[var(--md-sys-color-error-container)]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--md-sys-color-error)]">
                <Trash2 className="h-5 w-5" /> Danger zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-[16px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-error)]/20 p-4">
                <p className="text-[14px] font-medium">Delete account</p>
                <p className="text-[13px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
                  Permanently delete your account and data. This cannot be undone.
                </p>
                <Button
                  variant="error"
                  className="rounded-full mt-3"
                  onClick={() => toast.error("Please contact support to delete your account.")}
                >
                  Delete account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "notifications" && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[var(--md-sys-color-primary)]" /> Notification preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[var(--md-sys-color-outline-variant)]/50">
              <Toggle
                checked={notifPrefs.email}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, email: v })}
                label="Email notifications"
                description="Receive updates via email"
              />
              <Toggle
                checked={notifPrefs.push}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, push: v })}
                label="Push notifications"
                description="In-app alerts"
              />
              <Toggle
                checked={notifPrefs.mentorship}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, mentorship: v })}
                label="Mentorship requests"
                description="Incoming mentorship inquiries"
              />
              <Toggle
                checked={notifPrefs.jobs}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, jobs: v })}
                label="Jobs & referrals"
                description="New jobs and referral updates"
              />
              <Toggle
                checked={notifPrefs.events}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, events: v })}
                label="Events"
                description="Event invites and changes"
              />
            </div>
            <div className="flex justify-end pt-6">
              <Button onClick={() => toast.success("Notification preferences saved")} className="rounded-full">
                <Save className="h-4 w-4 mr-2" /> Save preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "privacy" && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[var(--md-sys-color-primary)]" /> Privacy
            </CardTitle>
            <CardDescription>Control visibility of your alumni profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[var(--md-sys-color-outline-variant)]/50">
              <Toggle
                checked={privacy.profileVisible}
                onChange={(v) => setPrivacy({ ...privacy, profileVisible: v })}
                label="Public profile"
                description="Allow students to find you in directory"
              />
              <Toggle
                checked={privacy.showEmail}
                onChange={(v) => setPrivacy({ ...privacy, showEmail: v })}
                label="Show email"
                description="Visible to connections only"
              />
              <Toggle
                checked={privacy.allowMessages}
                onChange={(v) => setPrivacy({ ...privacy, allowMessages: v })}
                label="Allow messages"
                description="Students can message you directly"
              />
              <Toggle
                checked={privacy.dataSharing}
                onChange={(v) => setPrivacy({ ...privacy, dataSharing: v })}
                label="Share data for recommendations"
                description="Anonymized data to improve matching"
              />
            </div>
            <div className="rounded-[16px] bg-[var(--md-sys-color-surface-container)] p-4 mt-6 flex gap-3">
              <Info className="h-5 w-5 text-[var(--md-sys-color-primary)] shrink-0 mt-0.5" />
              <p className="text-[13px] leading-5 text-[var(--md-sys-color-on-surface-variant)]">
                Manage how your profile appears to students. You can change availability for mentorship at any time.
              </p>
            </div>
            <div className="flex justify-end pt-6">
              <Button onClick={() => toast.success("Privacy settings saved")} className="rounded-full">
                <Save className="h-4 w-4 mr-2" /> Save privacy settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
