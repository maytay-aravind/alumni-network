import Link from "next/link";
import { GraduationCap, Users, Target, Briefcase, CheckCircle2 } from "lucide-react";
import { COLLEGE_NAME } from "@/lib/constants";

const features = [
  {
    icon: Users,
    title: "10,000+ Alumni",
    description: "Connect with a vast network of professionals.",
  },
  {
    icon: Target,
    title: "Mentorship Programs",
    description: "Get guidance from experienced industry leaders.",
  },
  {
    icon: Briefcase,
    title: "Exclusive Opportunities",
    description: "Access jobs and internships posted by alumni.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden relative flex-1 lg:flex lg:w-1/2 xl:w-[45%]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-10 w-10 text-white" />
            <span className="text-2xl font-bold text-white">AlumniConnect</span>
          </Link>

          {/* Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight">
                Welcome to the
                <br />
                <span className="text-indigo-200">{COLLEGE_NAME}</span>
                <br />
                Alumni Network
              </h1>
              <p className="mt-4 text-lg text-indigo-100">
                Join thousands of alumni and students building meaningful professional connections.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-indigo-200">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-sm text-indigo-200">
            <CheckCircle2 className="h-4 w-4" />
            <span>Trusted by 10,000+ alumni worldwide</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8 xl:w-[55%]">
        {/* Mobile Logo */}
        <div className="mb-8 flex items-center justify-center lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              AlumniConnect
            </span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
