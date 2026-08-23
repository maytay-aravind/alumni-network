"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import {
  DEPARTMENTS,
  DEGREES,
  GRADUATION_YEARS,
  SKILLS_LIST,
} from "@/lib/constants";

const step1Schema = z.object({
  account_type: z.enum(["student", "alumni"]),
});

const step2Schema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

const step3Schema = z.object({
  college: z.string().min(2, "College name is required"),
  department: z.string().min(1, "Department is required"),
  degree: z.string().min(1, "Degree is required"),
  graduation_year: z.string().min(1, "Graduation year is required"),
});

const step4Schema = z.object({
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  about: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;

const steps = [
  { id: 1, title: "Account Type" },
  { id: 2, title: "Basic Info" },
  { id: 3, title: "Academic Info" },
  { id: 4, title: "Additional Info" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { account_type: "student" },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      college: "",
      department: "",
      degree: "",
      graduation_year: "",
    },
  });

  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      skills: [],
      location: "",
      about: "",
    },
  });

  const accountType = step1Form.watch("account_type");

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const watchedPassword = step2Form.watch("password") || "";
  const passwordStrength = getPasswordStrength(watchedPassword);

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await step1Form.trigger();
        break;
      case 2:
        isValid = await step2Form.trigger();
        break;
      case 3:
        isValid = await step3Form.trigger();
        break;
      case 4:
        isValid = await step4Form.trigger();
        break;
    }

    if (isValid) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const step2Data = step2Form.getValues();
      const step3Data = step3Form.getValues();
      const step4Data = step4Form.getValues();

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: step2Data.email,
          password: step2Data.password,
          first_name: step2Data.first_name,
          last_name: step2Data.last_name,
          role: accountType,
          college: step3Data.college,
          department: step3Data.department,
          degree: step3Data.degree,
          graduation_year: step3Data.graduation_year,
          skills: selectedSkills,
          location: step4Data.location || "",
          about: step4Data.about || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create account");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: step2Data.email,
        password: step2Data.password,
      });
      if (signInError) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
        return;
      }
      toast.success("Account created successfully!");
      router.push(accountType === "alumni" ? "/alumni" : "/student");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    "flex h-14 w-full rounded-[16px] border bg-[var(--md-sys-color-surface-container-low)] px-4 text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/60 focus:outline-none focus:ring-2 transition-colors";
  const inputDefault = "border-[var(--md-sys-color-outline-variant)] focus:border-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)]/20";
  const inputError = "border-[var(--md-sys-color-error)] focus:border-[var(--md-sys-color-error)] focus:ring-[var(--md-sys-color-error)]/20";
  const labelCls = "text-xs font-medium tracking-[0.1px] text-[var(--md-sys-color-on-surface-variant)]";
  const errorCls = "text-xs leading-4 text-[var(--md-sys-color-error)]";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] leading-7 font-medium tracking-tight text-[var(--md-sys-color-on-surface)]">
          Create your account
        </h2>
        <p className="mt-1.5 text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)]">
          Join our alumni network community.
        </p>
      </div>

      {/* Steps — M3 style */}
      <div className="flex items-center justify-between gap-1">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    isCompleted
                      ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                      : isActive
                      ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                      : "bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium tracking-[0.2px] whitespace-nowrap",
                    isActive
                      ? "text-[var(--md-sys-color-on-surface)]"
                      : isCompleted
                      ? "text-[var(--md-sys-color-on-surface-variant)]"
                      : "text-[var(--md-sys-color-outline)]"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-1 sm:mx-2 rounded-full transition-colors",
                    currentStep > step.id
                      ? "bg-[var(--md-sys-color-secondary-container)]"
                      : "bg-[var(--md-sys-color-outline-variant)]"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step 1: Account Type — outlined cards, selected is primary-container + primary border */}
      {currentStep === 1 && (
        <div className="space-y-3">
          <p className={labelCls}>I am a...</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => step1Form.setValue("account_type", "student")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-[20px] border p-6 text-center transition-colors",
                accountType === "student"
                  ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]"
                  : "border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container)]"
              )}
            >
              <span
                className={cn(
                  "h-12 w-12 rounded-[16px] grid place-items-center border shrink-0",
                  accountType === "student"
                    ? "bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                    : "bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]"
                )}
              >
                <GraduationCap className="h-6 w-6" />
              </span>
              <div className="space-y-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    accountType === "student"
                      ? "text-[var(--md-sys-color-on-primary-container)]"
                      : "text-[var(--md-sys-color-on-surface)]"
                  )}
                >
                  Student
                </p>
                <p
                  className={cn(
                    "text-xs leading-4",
                    accountType === "student"
                      ? "text-[var(--md-sys-color-on-primary-container)]/80"
                      : "text-[var(--md-sys-color-on-surface-variant)]"
                  )}
                >
                  Connect with alumni and find opportunities
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => step1Form.setValue("account_type", "alumni")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-[20px] border p-6 text-center transition-colors",
                accountType === "alumni"
                  ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]"
                  : "border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container)]"
              )}
            >
              <span
                className={cn(
                  "h-12 w-12 rounded-[16px] grid place-items-center border shrink-0",
                  accountType === "alumni"
                    ? "bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                    : "bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]"
                )}
              >
                <Briefcase className="h-6 w-6" />
              </span>
              <div className="space-y-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    accountType === "alumni"
                      ? "text-[var(--md-sys-color-on-primary-container)]"
                      : "text-[var(--md-sys-color-on-surface)]"
                  )}
                >
                  Alumni
                </p>
                <p
                  className={cn(
                    "text-xs leading-4",
                    accountType === "alumni"
                      ? "text-[var(--md-sys-color-on-primary-container)]/80"
                      : "text-[var(--md-sys-color-on-surface-variant)]"
                  )}
                >
                  Mentor students and share opportunities
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Basic Info */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelCls}>First Name</label>
              <input
                {...step2Form.register("first_name")}
                placeholder="John"
                className={cn(inputBase, step2Form.formState.errors.first_name ? inputError : inputDefault)}
                aria-invalid={!!step2Form.formState.errors.first_name}
              />
              {step2Form.formState.errors.first_name && (
                <p className={errorCls}>{step2Form.formState.errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Last Name</label>
              <input
                {...step2Form.register("last_name")}
                placeholder="Doe"
                className={cn(inputBase, step2Form.formState.errors.last_name ? inputError : inputDefault)}
                aria-invalid={!!step2Form.formState.errors.last_name}
              />
              {step2Form.formState.errors.last_name && (
                <p className={errorCls}>{step2Form.formState.errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Email</label>
            <input
              {...step2Form.register("email")}
              type="email"
              placeholder="you@example.com"
              className={cn(inputBase, step2Form.formState.errors.email ? inputError : inputDefault)}
              aria-invalid={!!step2Form.formState.errors.email}
            />
            {step2Form.formState.errors.email && (
              <p className={errorCls}>{step2Form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Password</label>
            <div className="relative">
              <input
                {...step2Form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className={cn(inputBase, "pr-11", step2Form.formState.errors.password ? inputError : inputDefault)}
                aria-invalid={!!step2Form.formState.errors.password}
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
            {step2Form.formState.errors.password && (
              <p className={errorCls}>{step2Form.formState.errors.password.message}</p>
            )}

            {/* Password Strength — M3 linear progress */}
            {watchedPassword.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-colors",
                        i < passwordStrength
                          ? passwordStrength <= 2
                            ? "bg-[var(--md-sys-color-error)]"
                            : "bg-[var(--md-sys-color-primary)]"
                          : "bg-[var(--md-sys-color-outline-variant)]/40"
                      )}
                    />
                  ))}
                </div>
                <p
                  className={cn(
                    "text-xs font-medium",
                    passwordStrength <= 2 && passwordStrength > 0
                      ? "text-[var(--md-sys-color-error)]"
                      : "text-[var(--md-sys-color-on-surface-variant)]"
                  )}
                >
                  {passwordStrength > 0 ? strengthLabels[Math.min(passwordStrength - 1, 4)] : ""}
                  {passwordStrength > 0 ? ` • ${passwordStrength}/5` : ""}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Confirm Password</label>
            <input
              {...step2Form.register("confirm_password")}
              type="password"
              placeholder="Confirm your password"
              className={cn(inputBase, step2Form.formState.errors.confirm_password ? inputError : inputDefault)}
              aria-invalid={!!step2Form.formState.errors.confirm_password}
            />
            {step2Form.formState.errors.confirm_password && (
              <p className={errorCls}>{step2Form.formState.errors.confirm_password.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Academic Info */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelCls}>College / University</label>
            <input
              {...step3Form.register("college")}
              placeholder="e.g., National Institute of Technology"
              className={cn(inputBase, step3Form.formState.errors.college ? inputError : inputDefault)}
              aria-invalid={!!step3Form.formState.errors.college}
            />
            {step3Form.formState.errors.college && (
              <p className={errorCls}>{step3Form.formState.errors.college.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Department</label>
            <select
              {...step3Form.register("department")}
              className={cn(inputBase, step3Form.formState.errors.department ? inputError : inputDefault)}
              aria-invalid={!!step3Form.formState.errors.department}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {step3Form.formState.errors.department && (
              <p className={errorCls}>{step3Form.formState.errors.department.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelCls}>Degree</label>
              <select
                {...step3Form.register("degree")}
                className={cn(inputBase, step3Form.formState.errors.degree ? inputError : inputDefault)}
                aria-invalid={!!step3Form.formState.errors.degree}
              >
                <option value="">Select degree</option>
                {DEGREES.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </select>
              {step3Form.formState.errors.degree && (
                <p className={errorCls}>{step3Form.formState.errors.degree.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Graduation Year</label>
              <select
                {...step3Form.register("graduation_year")}
                className={cn(inputBase, step3Form.formState.errors.graduation_year ? inputError : inputDefault)}
                aria-invalid={!!step3Form.formState.errors.graduation_year}
              >
                <option value="">Select year</option>
                {GRADUATION_YEARS.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
              {step3Form.formState.errors.graduation_year && (
                <p className={errorCls}>{step3Form.formState.errors.graduation_year.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Additional Info — Filter Chips */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={labelCls}>Skills (select up to 5)</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_LIST.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      if (selectedSkills.length < 5 || isSelected) {
                        toggleSkill(skill);
                      }
                    }}
                    className={cn(
                      "inline-flex items-center h-8 rounded-full border px-4 text-xs font-medium transition-colors",
                      isSelected
                        ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-[var(--md-sys-color-secondary-container)]"
                        : "bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container)]"
                    )}
                  >
                    {isSelected && <Check className="mr-1 h-3 w-3" />}
                    {skill}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{selectedSkills.length}/5 selected</p>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Location</label>
            <input
              {...step4Form.register("location")}
              placeholder="e.g., Bangalore, India"
              className={cn(inputBase, inputDefault)}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>About You</label>
            <textarea
              {...step4Form.register("about")}
              rows={3}
              placeholder="Tell us a bit about yourself..."
              className={cn(
                "flex w-full rounded-[16px] border bg-[var(--md-sys-color-surface-container-low)] px-4 py-3 text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/60 focus:outline-none focus:ring-2 transition-colors resize-none",
                inputDefault
              )}
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons — Filled for Continue/Create, Outlined for Back */}
      <div className="flex items-center gap-3 pt-2">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-6 text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={isLoading}
          className="flex flex-1 h-10 items-center justify-center rounded-full bg-[var(--md-sys-color-primary)] px-6 text-sm font-medium text-[var(--md-sys-color-on-primary)] hover:bg-[#4539A0] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--md-sys-color-surface-container-low)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : currentStep === 4 ? (
            "Create Account"
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <p className="text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--md-sys-color-primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
