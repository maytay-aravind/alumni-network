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
    title: "Alumni Network",
    description:
      "Connect with thousands of alumni from your college. Build meaningful professional relationships.",
  },
  {
    icon: Target,
    title: "Mentorship",
    description:
      "Get guidance from experienced professionals. Find mentors in your field of interest.",
  },
  {
    icon: Sparkles,
    title: "AI Career Assistant",
    description:
      "Get personalized career advice powered by AI. Optimize your resume and career path.",
  },
  {
    icon: Briefcase,
    title: "Jobs & Internships",
    description:
      "Access exclusive job opportunities posted by alumni. Find internships and full-time positions.",
  },
];

const stats = [
  { value: "10,000+", label: "Alumni Members" },
  { value: "500+", label: "Mentors Available" },
  { value: "2,000+", label: "Jobs Posted" },
  { value: "95%", label: "Satisfaction Rate" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              AlumniConnect
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#stats"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Community
            </Link>
            <Link
              href="#cta"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              Register
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/20" />
            <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-900/20" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                <Sparkles className="mr-2 h-4 w-4" />
                Powered by AI Technology
              </div>

              <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
                Your Gateway to a{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Thriving Alumni
                </span>{" "}
                Community
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                Connect with distinguished alumni, find mentors in your field, discover exclusive
                career opportunities, and build lasting professional relationships through{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {COLLEGE_NAME}
                </span>
                .
              </p>

              <div className="mt-10 flex items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 dark:shadow-indigo-900/50 transition-all hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                Everything You Need to Succeed
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                Our platform provides all the tools you need to connect, learn, and grow
                professionally.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-indigo-100 p-3 dark:bg-indigo-950">
                    <feature.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="py-24 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-16 text-center sm:px-16">
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
              </div>

              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to Join Our Community?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
                  Start connecting with alumni, finding mentors, and advancing your career today.
                  It&apos;s completely free for students.
                </p>

                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-base font-semibold text-indigo-600 shadow-lg hover:bg-indigo-50 transition-colors"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-lg border border-white/30 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Sign In to Account
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-indigo-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Free for students
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    AI-powered career guidance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  AlumniConnect
                </span>
              </Link>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Connecting alumni, students, and professionals for a brighter future.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {COLLEGE_NAME}
              </h3>
              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>alumni@nit.edu</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Quick Links
              </h3>
              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <Link href="/login" className="block hover:text-indigo-600 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="block hover:text-indigo-600 transition-colors">
                  Register
                </Link>
                <Link href="/forgot-password" className="block hover:text-indigo-600 transition-colors">
                  Reset Password
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500 dark:text-gray-400 dark:border-gray-800">
            &copy; {new Date().getFullYear()} AlumniConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
