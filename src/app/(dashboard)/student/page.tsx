'use client';
import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getCareerReadinessScore } from '@/lib/utils';
import { Sparkles, ArrowRight, Briefcase, Calendar, Users, BookOpen, Target, Award, TrendingUp, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const activities = [
  { user: 'Neha Gupta', action: 'posted a new job at Google', time: '2h ago', color: 'bg-[#E8DEF8] text-[#4A4459]' },
  { user: 'Rahul Sharma', action: 'is now mentoring 3 students', time: '5h ago', color: 'bg-[#FFD8E4] text-[#633B48]' },
  { user: 'Vikram Singh', action: 'shared an interview tip', time: '1d ago', color: 'bg-[#D0E8FF] text-[#2C4A6B]' },
  { user: 'Ananya Iyer', action: 'hosting Tech Talk on Feb 20', time: '1d ago', color: 'bg-[#FFEFD3] text-[#624B2C]' },
];

export default function StudentDashboard() {
  const [profile, setProfile] = React.useState<any | null>(null);
  const [userMeta, setUserMeta] = React.useState<{ first_name: string; last_name: string } | null>(null);
  const [events, setEvents] = React.useState<any[]>([]);
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const meta = user.user_metadata as any;
        const fullName = meta?.full_name || user.email?.split('@')[0] || 'Student';
        const parts = fullName.trim().split(' ');
        setUserMeta({ first_name: parts[0], last_name: parts.slice(1).join(' ') });
        let profileData: any = null;
        try {
          const res = await supabase.from('student_profiles').select('*').eq('user_id', user.id).single();
          profileData = res.data;
        } catch {}
        if (profileData) setProfile(profileData);
        else setProfile({ skills: [], projects: [], certifications: [], resume_url: null, college: '', department: '' });
        try {
          const { data: eventsData } = await supabase.from('events').select('*').order('event_date', { ascending: true }).limit(2);
          setEvents(eventsData || []);
        } catch { setEvents([]); }
        try {
          const { data: jobsData } = await supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(2);
          setJobs(jobsData || []);
        } catch { setJobs([]); }
      } catch (e) {
        console.error(e);
        if (!profile) setProfile({ skills: [], projects: [], certifications: [], resume_url: null });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-[28px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-[28px]" />
          <Skeleton className="h-64 rounded-[28px]" />
          <Skeleton className="h-64 rounded-[28px]" />
        </div>
      </div>
    );
  }

  if (!profile || !userMeta) {
    return (
      <div className="rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-8 text-center">
        <p className="font-medium">Welcome!</p>
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">Your profile is being set up.</p>
        <Link href="/student/profile" className="inline-flex mt-4 rounded-full bg-[var(--md-sys-color-primary)] text-white px-6 py-2 text-sm">Go to Profile</Link>
      </div>
    );
  }

  const score = getCareerReadinessScore({
    skills: (profile.skills as string[]) || [],
    projects: [] as any,
    certifications: [] as any,
    resume_url: profile.resume_url as string,
  });

  return (
    <div className="space-y-6">
      {/* Card 1: Welcome + Guidance - colorful primary-container */}
      <Card variant="filled" className="rounded-[28px] bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)]/20 overflow-hidden">
        <CardContent className="p-6 lg:p-7">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] px-3 py-1.5 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--md-sys-color-primary)]" /> Welcome back
              </div>
              <h1 className="mt-3 text-[28px] font-normal leading-9 text-[var(--md-sys-color-on-primary-container)]">
                Hey {userMeta.first_name}! <span className="font-medium">Let's move forward.</span>
              </h1>
              <p className="mt-2 text-sm leading-5 text-[var(--md-sys-color-on-primary-container)]/80 max-w-[60ch]">
                Your network is active. 2 mentors suggested, 1 event this week. Start with your profile to get better matches.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/student/profile"><Button size="sm" className="rounded-full">Complete profile <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
                <Link href="/student/alumni"><Button variant="tonal" size="sm"><Users className="mr-1 h-4 w-4" /> Find alumni</Button></Link>
              </div>
            </div>
            <div className="lg:w-[320px] rounded-[20px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-4">
              <p className="text-xs font-medium tracking-widest uppercase text-[var(--md-sys-color-on-surface-variant)]">Live activity</p>
              <div className="mt-3 space-y-2.5">
                {activities.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <span className={`h-8 w-8 rounded-full grid place-items-center text-xs font-medium shrink-0 ${a.color}`}>{a.user.split(' ').map(n=>n[0]).join('')}</span>
                    <div className="min-w-0">
                      <p className="text-sm leading-4 text-[var(--md-sys-color-on-surface)]"><span className="font-medium">{a.user}</span> {a.action}</p>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/student/posts" className="mt-3 inline-flex text-xs font-medium text-[var(--md-sys-color-primary)] hover:underline">View community →</Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2,3,4: 3-column grid - max 4 cards total, colorful but guided */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Readiness - colorful progress */}
        <Card variant="elevated" className="rounded-[28px] border-[var(--md-sys-color-tertiary)]/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[16px]"><TrendingUp className="h-5 w-5 text-[var(--md-sys-color-tertiary)]" /> Career readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-[40px] font-normal leading-none text-[var(--md-sys-color-primary)]">{score.overall}</span>
              <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">/ 100</span>
              <Badge className="ml-auto rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] border-0">{score.overall >= 70 ? 'On track' : 'Getting started'}</Badge>
            </div>
            <div className="h-2 rounded-full bg-[var(--md-sys-color-surface-container-high)] overflow-hidden">
              <div className="h-full bg-[var(--md-sys-color-primary)] rounded-full transition-all" style={{ width: `${score.overall}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-[12px] bg-[var(--md-sys-color-surface-container)] p-2.5 border border-[var(--md-sys-color-outline-variant)]">
                <p className="font-medium text-[var(--md-sys-color-on-surface)]">Skills {Math.round(score.skills)}%</p>
                <p className="text-[var(--md-sys-color-on-surface-variant)]">Add 2 more skills</p>
              </div>
              <div className="rounded-[12px] bg-[var(--md-sys-color-surface-container)] p-2.5 border border-[var(--md-sys-color-outline-variant)]">
                <p className="font-medium">Projects {Math.round(score.projects)}%</p>
                <p className="text-[var(--md-sys-color-on-surface-variant)]">1 project needed</p>
              </div>
            </div>
            <Link href="/student/ai/career-readiness"><Button variant="tonal" size="sm" className="w-full rounded-full"><Target className="mr-2 h-4 w-4" /> Improve score</Button></Link>
          </CardContent>
        </Card>

        {/* Opportunities - jobs + events combined, secondary color */}
        <Card variant="elevated" className="rounded-[28px]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[16px]"><Briefcase className="h-5 w-5 text-[var(--md-sys-color-secondary)]" /> Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.length === 0 ? (
              <div className="rounded-[16px] bg-[var(--md-sys-color-surface-container)] p-4 text-center">
                <Briefcase className="h-8 w-8 mx-auto text-[var(--md-sys-color-on-surface-variant)]" />
                <p className="text-sm mt-2 text-[var(--md-sys-color-on-surface-variant)]">No jobs yet</p>
              </div>
            ) : jobs.slice(0, 2).map((job: any) => (
              <div key={job.id} className="rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-3">
                <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">{job.title}</p>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{job.company} • {job.location}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(Array.isArray(job.skills) ? job.skills : []).slice(0, 2).map((s: string) => (
                    <Badge key={s} className="rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-0 text-[10px]">{s}</Badge>
                  ))}
                </div>
              </div>
            ))}
            {events.slice(0, 1).map((ev: any) => (
              <div key={ev.id} className="rounded-[16px] bg-[var(--md-sys-color-tertiary-container)]/50 border border-[var(--md-sys-color-outline-variant)] p-3 flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-[var(--md-sys-color-tertiary-container)] grid place-items-center"><Calendar className="h-4 w-4 text-[var(--md-sys-color-on-tertiary-container)]" /></span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{ev.title}</p>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{ev.event_date ? formatDate(ev.event_date) : 'TBD'} • {ev.venue}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Link href="/student/jobs" className="flex-1"><Button variant="outlined" size="sm" className="w-full rounded-full">Jobs</Button></Link>
              <Link href="/student/events" className="flex-1"><Button variant="outlined" size="sm" className="w-full rounded-full">Events</Button></Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick start - guide new user, most colorful */}
        <Card variant="elevated" className="rounded-[28px] bg-[var(--md-sys-color-surface-container-low)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[16px]"><Award className="h-5 w-5 text-[#7A4E9E]" /> Quick start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link href="/student/alumni" className="flex items-center gap-3 rounded-[16px] bg-[#E8DEF8] border border-[var(--md-sys-color-outline-variant)] p-3 hover:bg-[#E0D4F5]">
              <span className="h-9 w-9 rounded-full bg-[var(--md-sys-color-primary)] grid place-items-center"><Users className="h-4 w-4 text-white" /></span>
              <div><p className="text-sm font-medium">Find a mentor</p><p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">3 suggested for you</p></div>
              <ArrowRight className="h-4 w-4 ml-auto text-[var(--md-sys-color-on-surface-variant)]" />
            </Link>
            <Link href="/student/ai/career-assistant" className="flex items-center gap-3 rounded-[16px] bg-[#FFD8E4] border border-[var(--md-sys-color-outline-variant)] p-3 hover:bg-[#FFC8D8]">
              <span className="h-9 w-9 rounded-full bg-[#8B3A5C] grid place-items-center"><MessageCircle className="h-4 w-4 text-white" /></span>
              <div><p className="text-sm font-medium">Ask AI</p><p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Career roadmap in 30s</p></div>
              <ArrowRight className="h-4 w-4 ml-auto text-[var(--md-sys-color-on-surface-variant)]" />
            </Link>
            <Link href="/student/profile" className="flex items-center gap-3 rounded-[16px] bg-[#D0E8FF] border border-[var(--md-sys-color-outline-variant)] p-3 hover:bg-[#B8D8FF]">
              <span className="h-9 w-9 rounded-full bg-[#2C4A6B] grid place-items-center"><BookOpen className="h-4 w-4 text-white" /></span>
              <div><p className="text-sm font-medium">Build resume</p><p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">AI review + score</p></div>
              <ArrowRight className="h-4 w-4 ml-auto text-[var(--md-sys-color-on-surface-variant)]" />
            </Link>
            <p className="text-xs text-center text-[var(--md-sys-color-on-surface-variant)] pt-1">Pick one to start — we’ll guide you.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
