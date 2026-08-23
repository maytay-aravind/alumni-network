"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, GraduationCap, Briefcase, Shield } from "lucide-react";
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
        // Provide helpful message for demo accounts
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid credentials. If using demo, the account may not exist yet — try registering first or contact admin.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Fetch real role from public.users
      const { data: userRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const realRole = (userRow?.role as string) || authData.user.user_metadata?.role || data.role;

      // If user selected a role that doesn't match their actual role, warn but still allow
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Welcome back! Please enter your credentials.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select your role
        </label>
        <div className="grid grid-cols-3 gap-2">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setValue("role", role.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all",
                selectedRole === role.value
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              <role.icon
                className={cn(
                  "h-6 w-6",
                  selectedRole === role.value
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400 dark:text-gray-500"
                )}
              />
              <span className="text-sm font-medium">{role.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700"
            )}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              className={cn(
                "flex h-10 w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700"
              )}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("remember_me")}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
            or try demo credentials
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {demoCredentials.map((cred) => (
          <button
            key={cred.role}
            type="button"
            onClick={() => fillDemoCredentials(cred.email, cred.password)}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">{cred.role}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{cred.email}</span>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Register here
        </Link>
      </p>
    </div>
  );
}
