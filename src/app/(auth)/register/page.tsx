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

  const passwordStrength = getPasswordStrength(step2Form.watch("password"));

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

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

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: step2Data.email,
        password: step2Data.password,
        options: {
          data: {
            first_name: step2Data.first_name,
            last_name: step2Data.last_name,
            role: accountType,
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create account");
        return;
      }

      // Wait a moment for trigger to create public.users row
      await new Promise((r) => setTimeout(r, 800));

      // Ensure public.users row exists (trigger should have created it, but fallback if not)
      const { error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("id", authData.user.id)
        .single();

      if (userCheckError) {
        // Fallback: try to create users row directly
        await supabase.from("users").insert({
          id: authData.user.id,
          email: step2Data.email,
          role: accountType as any,
          full_name: `${step2Data.first_name} ${step2Data.last_name}`,
        });
      }

      if (accountType === "student") {
        const { error: profileError } = await supabase.from("student_profiles").insert({
          user_id: authData.user.id,
          college: step3Data.college,
          department: step3Data.department,
          degree: step3Data.degree,
          graduation_year: parseInt(step3Data.graduation_year),
          skills: selectedSkills,
          location: step4Data.location || "",
          about: step4Data.about || "",
        });
        if (profileError) {
          console.error("student_profiles insert error:", profileError);
          toast.error(`Failed to create profile: ${profileError.message}`);
          return;
        }
      } else {
        const { error: profileError } = await supabase.from("alumni_profiles").insert({
          user_id: authData.user.id,
          degree: step3Data.degree,
          department: step3Data.department,
          graduation_year: parseInt(step3Data.graduation_year),
          skills: selectedSkills,
          location: step4Data.location || "",
          about: step4Data.about || "",
          current_company: "",
          current_designation: "",
        });
        if (profileError) {
          console.error("alumni_profiles insert error:", profileError);
          toast.error(`Failed to create profile: ${profileError.message}`);
          return;
        }
      }

      // If session exists, go to dashboard, else to login
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        toast.success("Account created successfully!");
        router.push(accountType === "alumni" ? "/alumni" : "/student");
      } else {
        toast.success("Account created! Please check your email to verify, then sign in.");
        router.push("/login");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Join our alumni network community.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  currentStep > step.id
                    ? "bg-green-500 text-white"
                    : currentStep === step.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block">
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2",
                  currentStep > step.id ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Account Type */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => step1Form.setValue("account_type", "student")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all",
                accountType === "student"
                  ? "border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              )}
            >
              <GraduationCap
                className={cn(
                  "h-10 w-10",
                  accountType === "student"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400"
                )}
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Student</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Connect with alumni and find opportunities
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => step1Form.setValue("account_type", "alumni")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all",
                accountType === "alumni"
                  ? "border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              )}
            >
              <Briefcase
                className={cn(
                  "h-10 w-10",
                  accountType === "alumni"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400"
                )}
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Alumni</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <input
                {...step2Form.register("first_name")}
                className={cn(
                  "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
                  step2Form.formState.errors.first_name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700"
                )}
                placeholder="John"
              />
              {step2Form.formState.errors.first_name && (
                <p className="text-xs text-red-500">
                  {step2Form.formState.errors.first_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <input
                {...step2Form.register("last_name")}
                className={cn(
                  "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
                  step2Form.formState.errors.last_name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700"
                )}
                placeholder="Doe"
              />
              {step2Form.formState.errors.last_name && (
                <p className="text-xs text-red-500">
                  {step2Form.formState.errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              {...step2Form.register("email")}
              type="email"
              className={cn(
                "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
                step2Form.formState.errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700"
              )}
              placeholder="you@example.com"
            />
            {step2Form.formState.errors.email && (
              <p className="text-xs text-red-500">
                {step2Form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                {...step2Form.register("password")}
                type={showPassword ? "text" : "password"}
                className={cn(
                  "flex h-10 w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
                  step2Form.formState.errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700"
                )}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {step2Form.formState.errors.password && (
              <p className="text-xs text-red-500">
                {step2Form.formState.errors.password.message}
              </p>
            )}

            {/* Password Strength */}
            {step2Form.watch("password") && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-colors",
                        i < passwordStrength
                          ? strengthColors[passwordStrength - 1]
                          : "bg-gray-200 dark:bg-gray-700"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {passwordStrength > 0 && strengthLabels[passwordStrength - 1]}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              {...step2Form.register("confirm_password")}
              type="password"
              className={cn(
                "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
                step2Form.formState.errors.confirm_password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700"
              )}
              placeholder="Confirm your password"
            />
            {step2Form.formState.errors.confirm_password && (
              <p className="text-xs text-red-500">
                {step2Form.formState.errors.confirm_password.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Academic Info */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              College / University
            </label>
            <input
              {...step3Form.register("college")}
              className={cn(
                "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
                step3Form.formState.errors.college
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700"
              )}
              placeholder="e.g., National Institute of Technology"
            />
            {step3Form.formState.errors.college && (
              <p className="text-xs text-red-500">
                {step3Form.formState.errors.college.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Department
            </label>
            <select
              {...step3Form.register("department")}
              className={cn(
                "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white",
                step3Form.formState.errors.department
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700"
              )}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {step3Form.formState.errors.department && (
              <p className="text-xs text-red-500">
                {step3Form.formState.errors.department.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Degree
              </label>
              <select
                {...step3Form.register("degree")}
                className={cn(
                  "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white",
                  step3Form.formState.errors.degree
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700"
                )}
              >
                <option value="">Select degree</option>
                {DEGREES.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </select>
              {step3Form.formState.errors.degree && (
                <p className="text-xs text-red-500">
                  {step3Form.formState.errors.degree.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Graduation Year
              </label>
              <select
                {...step3Form.register("graduation_year")}
                className={cn(
                  "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white",
                  step3Form.formState.errors.graduation_year
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700"
                )}
              >
                <option value="">Select year</option>
                {GRADUATION_YEARS.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
              {step3Form.formState.errors.graduation_year && (
                <p className="text-xs text-red-500">
                  {step3Form.formState.errors.graduation_year.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Additional Info */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Skills (select up to 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_LIST.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    if (selectedSkills.length < 5 || selectedSkills.includes(skill)) {
                      toggleSkill(skill);
                    }
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    selectedSkills.includes(skill)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">{selectedSkills.length}/5 selected</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <input
              {...step4Form.register("location")}
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              placeholder="e.g., Bangalore, India"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              About You
            </label>
            <textarea
              {...step4Form.register("about")}
              rows={3}
              className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              placeholder="Tell us a bit about yourself..."
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 pt-4">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={isLoading}
          className="flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
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

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
