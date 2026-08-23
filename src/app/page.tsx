import Link from "next/link";
import {
  GraduationCap,
  Users,
  Target,
  Sparkles,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
} from "lucide-react";
import { COLLEGE_NAME } from "@/lib/constants";

const features = [
  {
    icon: Users,
    title: "Alumni network",
    description: "Connect with thousands of verified alumni. Build real professional relationships.",
  },
  {
    icon: Target,
    title: "Mentorship",
    description: "Find mentors in your field. Get guidance that actually fits your goals.",
  },
  {
    icon: Sparkles,
    title: "AI career lab",
    description: "Resume review, skill gaps, and mentor matching — grounded in your profile.",
  },
  {
    icon: Briefcase,
    title: "Jobs & referrals",
    description: "Roles posted by alumni. Apply, request referrals, and track progress.",
  },
];

const stats = [
  { value: "10k+", label: "Alumni" },
  { value: "500+", label: "Mentors" },
  { value: "2k+", label: "Jobs" },
  { value: "4.9/5", label: "Rated" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--md-sys-color-background)]">
      <header className="sticky top-0 z-40 bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)]">
        <div className="mx-auto max-w-[1120px] h-[64px] flex items-center justify-between px-4 lg:px-6 gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-[12px] bg-[var(--md-sys-color-primary)] grid place-items-center">
              <GraduationCap className="h-5 w-5 text-[var(--md-sys-color-on-primary)]" />
            </span>
            <span className="text-[16px] font-semibold tracking-tight text-[var(--md-sys-color-on-surface)]">AlumniNet</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <a href="#features" className="h-10 px-4 grid place-items-center rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]">Features</a>
            <a href="#community" className="h-10 px-4 grid place-items-center rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]">Community</a>
            <a href="#about" className="h-10 px-4 grid place-items-center rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]">About</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex h-10 px-5 items-center justify-center rounded-full border border-[var(--md-sys-color-outline)] text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)]">
              Sign in
            </Link>
            <Link href="/register" className="inline-flex h-10 px-5 items-center justify-center rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-sm font-medium hover:bg-[#4539A0]">
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-[1120px] px-4 lg:px-6 pt-6">
          <div className="rounded-[28px] bg-[var(--md-sys-color-primary-container)] border border-[var(--md-sys-color-outline-variant)] overflow-hidden">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 p-6 lg:p-10">
              <div className="py-2">
                <span className="inline-flex items-center gap-2 h-7 rounded-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] px-3 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--md-sys-color-primary)]" /> Built for students and alumni
                </span>
                <h1 className="mt-4 text-[32px] lg:text-[40px] leading-[1.05] tracking-tight font-normal text-[var(--md-sys-color-on-primary-container)]">
                  A network that<br />
                  <span className="font-medium">moves you forward.</span>
                </h1>
                <p className="mt-4 max-w-[52ch] text-[15px] leading-6 text-[var(--md-sys-color-on-primary-container)]/80">
                  Connect with {COLLEGE_NAME} alumni, find mentors who fit your goals, and discover roles posted by people who were in your place.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/register" className="inline-flex h-10 px-6 items-center justify-center rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-sm font-medium">
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link href="/login" className="inline-flex h-10 px-6 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                    Sign in
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]"><CheckCircle2 className="h-3.5 w-3.5" /> Free for students</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]"><CheckCircle2 className="h-3.5 w-3.5" /> Verified alumni</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]"><CheckCircle2 className="h-3.5 w-3.5" /> AI lab included</span>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[20px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-4">
                  <p className="text-xs font-medium tracking-widest uppercase text-[var(--md-sys-color-on-surface-variant)]">Today at AlumniNet</p>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {stats.map((s) => (
                      <div key={s.label} className="rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-3 text-center">
                        <div className="text-[18px] font-medium text-[var(--md-sys-color-primary)]">{s.value}</div>
                        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-3 flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full bg-[var(--md-sys-color-secondary-container)] grid place-items-center text-[var(--md-sys-color-on-secondary-container)]"><Users className="h-4 w-4" /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">Mentor match is live</p>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Get 3 tailored alumni suggestions from your profile.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">How it works</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] font-medium">3 steps</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm">
                    <div className="flex gap-3 rounded-[12px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-3"><span className="h-6 w-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] grid place-items-center text-xs">1</span><span className="text-[var(--md-sys-color-on-surface)]">Create your profile</span></div>
                    <div className="flex gap-3 rounded-[12px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-3"><span className="h-6 w-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] grid place-items-center text-xs">2</span><span className="text-[var(--md-sys-color-on-surface)]">Connect and request mentorship</span></div>
                    <div className="flex gap-3 rounded-[12px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-3"><span className="h-6 w-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] grid place-items-center text-xs">3</span><span className="text-[var(--md-sys-color-on-surface)]">Learn, apply, and track progress</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-[1120px] px-4 lg:px-6 mt-6">
          <div className="rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
              <div>
                <h2 className="text-[22px] leading-7 font-normal text-[var(--md-sys-color-on-surface)]">Everything you need — without the noise.</h2>
                <p className="mt-1 text-sm text-[var(--md-sys-color-on-surface-variant)]">Solid tools, same Material system you see inside the app.</p>
              </div>
              <span className="inline-flex h-7 items-center rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] px-3 text-xs font-medium">4 core areas</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="rounded-[20px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-5">
                  <span className="h-10 w-10 rounded-[12px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] grid place-items-center">
                    <f.icon className="h-5 w-5 text-[var(--md-sys-color-primary)]" />
                  </span>
                  <h3 className="mt-3 text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{f.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)]">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="community" className="mx-auto max-w-[1120px] px-4 lg:px-6 mt-6">
          <div className="rounded-[28px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className="text-[22px] font-normal text-[var(--md-sys-color-on-surface)]">Ready to join?</h2>
                <p className="mt-1 text-sm text-[var(--md-sys-color-on-surface-variant)]">Create your free student account. No credit card, no spam.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/register" className="inline-flex h-10 px-6 items-center justify-center rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-sm font-medium">Create account</Link>
                  <Link href="/login" className="inline-flex h-10 px-6 items-center justify-center rounded-full border border-[var(--md-sys-color-outline)] text-sm font-medium text-[var(--md-sys-color-primary)]">Sign in</Link>
                </div>
              </div>
              <div className="rounded-[20px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-4 lg:w-[360px]">
                <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">What students say</p>
                <p className="mt-2 text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)]">“Found a mentor in 2 days. The AI suggestions actually matched my stack.”</p>
                <p className="mt-2 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">— B.Tech, 2025</p>
              </div>
            </div>
          </div>
        </section>

        <div className="h-6" />
      </main>

      <footer id="about" className="border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
        <div className="mx-auto max-w-[1120px] px-4 lg:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-[10px] bg-[var(--md-sys-color-primary)] grid place-items-center"><GraduationCap className="h-4 w-4 text-[var(--md-sys-color-on-primary)]" /></span>
              <span className="text-sm font-semibold">AlumniNet</span>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">{COLLEGE_NAME}</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-[var(--md-sys-color-on-surface-variant)]">
              <a href="mailto:alumni@nit.edu" className="inline-flex items-center gap-2 hover:text-[var(--md-sys-color-on-surface)]"><Mail className="h-4 w-4" /> alumni@nit.edu</a>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> India</span>
              <Link href="/login" className="hover:text-[var(--md-sys-color-on-surface)]">Sign in</Link>
              <Link href="/register" className="hover:text-[var(--md-sys-color-on-surface)]">Create account</Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-[var(--md-sys-color-on-surface-variant)]">© {new Date().getFullYear()} AlumniNet. Built with Material You.</p>
        </div>
      </footer>
    </div>
  );
}
