import Link from "next/link";
import { GraduationCap, Users, Target, Briefcase } from "lucide-react";
import { COLLEGE_NAME } from "@/lib/constants";

const features = [
  { icon: Users, title: "10,000+ alumni", description: "A trusted network across industries." },
  { icon: Target, title: "1:1 mentorship", description: "Guidance from verified alumni." },
  { icon: Briefcase, title: "Real opportunities", description: "Jobs and referrals, not just listings." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] flex">
      <div className="hidden lg:flex w-[440px] shrink-0 p-4">
        <div className="flex flex-1 flex-col rounded-[28px] bg-[var(--md-sys-color-primary-container)] border border-[var(--md-sys-color-outline-variant)] overflow-hidden">
          <div className="p-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="h-10 w-10 rounded-[12px] bg-[var(--md-sys-color-primary)] grid place-items-center">
                <GraduationCap className="h-5 w-5 text-[var(--md-sys-color-on-primary)]" />
              </span>
              <span className="text-[16px] font-semibold tracking-tight text-[var(--md-sys-color-on-primary-container)]">AlumniNet</span>
            </Link>
          </div>

          <div className="px-8 pb-8">
            <h1 className="text-[32px] leading-9 font-normal tracking-tight text-[var(--md-sys-color-on-primary-container)]">
              A network<br />built for<br /><span className="font-medium">what's next.</span>
            </h1>
            <p className="mt-3 text-sm leading-5 text-[var(--md-sys-color-on-primary-container)]/80">
              {COLLEGE_NAME} — students and alumni moving forward together.
            </p>

            <div className="mt-8 grid gap-3">
              {features.map((f) => (
                <div key={f.title} className="flex gap-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-3">
                  <span className="h-10 w-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] grid place-items-center shrink-0">
                    <f.icon className="h-5 w-5 text-[var(--md-sys-color-primary)]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">{f.title}</p>
                    <p className="text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)]">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-4">
              <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface)]">“The mentorship here helped me land my first role. Simple, human, useful.”</p>
              <p className="mt-2 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">— Alumni, Class of 2022</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 grid place-items-center p-4 lg:p-8">
          <div className="w-full max-w-[440px]">
            <div className="lg:hidden flex justify-center mb-6">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="h-9 w-9 rounded-[12px] bg-[var(--md-sys-color-primary)] grid place-items-center"><GraduationCap className="h-5 w-5 text-[var(--md-sys-color-on-primary)]" /></span>
                <span className="text-base font-semibold">AlumniNet</span>
              </Link>
            </div>
            <div className="rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] shadow-[var(--md-elevation-1)] p-6 lg:p-8">
              {children}
            </div>
            <p className="mt-4 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">By continuing you agree to our Terms and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
