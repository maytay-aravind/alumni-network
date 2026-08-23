import Link from "next/link";
import { GraduationCap, Users, Target, Briefcase } from "lucide-react";
import { COLLEGE_NAME } from "@/lib/constants";

const features = [
  { icon: Users, title: "10,000+ Alumni", description: "Connect with professionals worldwide." },
  { icon: Target, title: "Mentorship Programs", description: "Guidance from industry leaders." },
  { icon: Briefcase, title: "Exclusive Opportunities", description: "Jobs & internships from alumni." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FEF7FF]">
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden m-4 rounded-[28px]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6750A4] via-[#7D5260] to-[#B69DF8]" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#EADDFF]/30 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">AlumniConnect</span>
          </Link>
          <div className="space-y-8">
            <div>
              <h1 className="text-[36px] font-bold text-white leading-tight">Welcome to<br /><span className="text-[#EADDFF]">{COLLEGE_NAME}</span><br />Alumni Network</h1>
              <p className="mt-3 text-[15px] text-white/80">Join thousands building meaningful professional connections.</p>
            </div>
            <div className="space-y-3">
              {features.map(f => (
                <div key={f.title} className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20"><f.icon className="h-5 w-5 text-white" /></div>
                  <div><h3 className="text-sm font-medium text-white">{f.title}</h3><p className="text-xs text-white/70">{f.description}</p></div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/60">© 2026 AlumniConnect • Trusted by 10,000+ alumni</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-10">
        <div className="lg:hidden mb-6 flex justify-center"><Link href="/" className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#6750A4]"><GraduationCap className="h-5 w-5 text-white" /></div><span className="text-lg font-bold text-[#1D1B20]">AlumniConnect</span></Link></div>
        <div className="mx-auto w-full max-w-md rounded-[28px] bg-white border border-[#E7E0EC] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">{children}</div>
      </div>
    </div>
  );
}
