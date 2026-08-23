"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, GraduationCap, Briefcase, Shield, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "alumni", "admin"]),
  remember_me: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const roles = [
  {
    value: "student" as const,
    label: "Student",
    icon: GraduationCap,
  },
  {
    value: "alumni" as const,
    label: "Alumni",
    icon: Briefcase,
  },
  {
    value: "admin" as const,
    label: "Admin",
    icon: Shield,
  },
];

const demoCredentials = [
  { role: "Student", email: "student@demo.com", password: "demo1234" },
  { role: "Alumni", email: "alumni@demo.com", password: "demo1234" },
  { role: "Admin", email: "admin@demo.com", password: "demo1234" },
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "student",
      remember_me: false,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid credentials. If using demo, the account may not exist yet — try registering first or contact admin.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const realRole = (userRow?.role as string) || authData.user.user_metadata?.role || data.role;

      if (data.role !== realRole) {
        toast(`You are registered as ${realRole}, redirecting there.`, { duration: 3000 } as any);
      }

      toast.success("Welcome back!");
      if (realRole === "admin") router.push("/admin");
      else if (realRole === "alumni") router.push("/alumni");
      else router.push("/student");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[22px] leading-7 font-medium tracking-tight text-[var(--md-sys-color-on-surface)]">
          Sign in to your account
        </h2>
        <p className="mt-1.5 text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)]">
          Welcome back! Please enter your credentials.
        </p>
      </div>

      {/* Role selector — M3 Segmented Button */}
      <div className="space-y-2">
        <label className="text-xs font-medium tracking-[0.1px] text-[var(--md-sys-color-on-surface-variant)]">
          Select your role
        </label>
        <div className="flex rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-1 gap-1">
          {roles.map((role) => {
            const isSelected = selectedRole === role.value;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setValue("role", role.value)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full h-9 px-3 text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] shadow-sm"
                    : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]"
                )}
                aria-pressed={isSelected}
              >
                {isSelected ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <role.icon className="h-4 w-4 shrink-0" />
                )}
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium tracking-[0.1px] text-[var(--md-sys-color-on-surface-variant)]"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            placeholder="you@example.com"
            className={cn(
              "flex h-14 w-full rounded-[16px] border bg-[var(--md-sys-color-surface-container-low)] px-4 text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/60 focus:outline-none focus:ring-2 transition-colors",
              errors.email
                ? "border-[var(--md-sys-color-error)] focus:border-[var(--md-sys-color-error)] focus:ring-[var(--md-sys-color-error)]/20"
                : "border-[var(--md-sys-color-outline-variant)] focus:border-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)]/20"
            )}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs leading-4 text-[var(--md-sys-color-error)]">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium tracking-[0.1px] text-[var(--md-sys-color-on-surface-variant)]"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              placeholder="Enter your password"
              className={cn(
                "flex h-14 w-full rounded-[16px] border bg-[var(--md-sys-color-surface-container-low)] px-4 pr-11 text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/60 focus:outline-none focus:ring-2 transition-colors",
                errors.password
                  ? "border-[var(--md-sys-color-error)] focus:border-[var(--md-sys-color-error)] focus:ring-[var(--md-sys-color-error)]/20"
                  : "border-[var(--md-sys-color-outline-variant)] focus:border-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)]/20"
              )}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] hover:text-[var(--md-sys-color-on-surface)] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs leading-4 text-[var(--md-sys-color-error)]">{errors.password.message}</p>
          )}
        </div>

        {/* Remember + Forgot — M3 checkbox + text button */}
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("remember_me")}
              className="h-[18px] w-[18px] rounded-[4px] border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-primary)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/20 focus:ring-offset-0"
            />
            <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="inline-flex h-8 items-center justify-center rounded-full px-3 text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/8 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign in — M3 Filled button */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full h-10 items-center justify-center rounded-full bg-[var(--md-sys-color-primary)] px-6 text-sm font-medium text-[var(--md-sys-color-on-primary)] hover:bg-[#4539A0] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--md-sys-color-surface-container-low)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--md-sys-color-outline-variant)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--md-sys-color-surface-container-low)] px-3 text-[11px] font-medium tracking-[0.5px] uppercase text-[var(--md-sys-color-on-surface-variant)]">
            or try demo credentials
          </span>
        </div>
      </div>

      {/* Demo credentials — M3 tonal cards */}
      <div className="grid gap-2">
        {demoCredentials.map((cred) => (
          <button
            key={cred.role}
            type="button"
            onClick={() => fillDemoCredentials(cred.email, cred.password)}
            className="flex items-center justify-between rounded-[16px] border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] px-4 py-3 text-left hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
          >
            <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">{cred.role}</span>
            <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">{cred.email}</span>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-[var(--md-sys-color-primary)] hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
