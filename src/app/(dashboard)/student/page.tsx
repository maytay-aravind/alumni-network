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
      {/* Card 1: Welcome - vibrant primary, not muted */}
      <div className="rounded-[28px] bg-[var(--md-sys-color-primary)] border border-[var(--md-sys-color-primary)] overflow-hidden shadow-[var(--md-elevation-2)]">
        <div className="p-6 lg:p-7">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-medium text-white">
                <Sparkles className="h-3.5 w-3.5" /> Welcome back
              </div>
              <h1 className="mt-3 text-[28px] font-medium leading-9 text-white">
                Hey {userMeta.first_name}! Let's move forward.
              </h1>
              <p className="mt-2 text-sm leading-5 text-white/80 max-w-[60ch]">
                Your network is active. 2 mentors suggested, 1 event this week. Start with your profile to get better matches.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/student/profile"><span className="inline-flex h-9 px-5 items-center justify-center rounded-full bg-white text-[var(--md-sys-color-primary)] text-sm font-medium hover:bg-white/90">Complete profile <ArrowRight className="ml-1 h-4 w-4" /></span></Link>
                <Link href="/student/alumni"><span className="inline-flex h-9 px-5 items-center justify-center rounded-full bg-white/15 text-white border border-white/20 text-sm font-medium hover:bg-white/20"><Users className="mr-1 h-4 w-4" /> Find alumni</span></Link>
              </div>
            </div>
            <div className="lg:w-[320px] rounded-[20px] bg-white border border-white/20 p-4 shadow-[var(--md-elevation-1)]">
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
        </div>
      </div>

      {/* 3 cards: Career (tertiary), Opportunities (secondary), Quick start (vibrant) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="rounded-[28px] border-2 border-[#FFD9E3] bg-[#FFF8F8]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[16px]"><TrendingUp className="h-5 w-5 text-[#8B4A61]" /> Career readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-[44px] font-medium leading-none text-[#8B4A61]">{score.overall}</span>
              <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">/ 100</span>
              <Badge className="ml-auto rounded-full bg-[#FFD9E3] text-[#3A071E] border-0">{score.overall >= 70 ? 'On track' : 'Getting started'}</Badge>
            </div>
            <div className="h-2.5 rounded-full bg-[#FFD9E3] overflow-hidden">
              <div className="h-full bg-[#8B4A61] rounded-full" style={{ width: `${score.overall}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-[12px] bg-white border border-[#FFD9E3] p-2.5">
                <p className="font-medium text-[#8B4A61]">Skills {Math.round(score.skills)}%</p>
                <p className="text-[var(--md-sys-color-on-surface-variant)]">Add 2 more</p>
              </div>
              <div className="rounded-[12px] bg-white border border-[#FFD9E3] p-2.5">
                <p className="font-medium text-[#8B4A61]">Projects {Math.round(score.projects)}%</p>
                <p className="text-[var(--md-sys-color-on-surface-variant)]">1 needed</p>
              </div>
            </div>
            <Link href="/student/ai/career-readiness"><Button size="sm" className="w-full rounded-full bg-[#8B4A61] hover:bg-[#6B2F45]">Improve score <Target className="ml-2 h-4 w-4" /></Button></Link>
          </CardContent>
        </Card>

        <Card variant="elevated" className="rounded-[28px] border-2 border-[#9EF1E6]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[16px]"><Briefcase className="h-5 w-5 text-[#006A60]" /> Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.length === 0 ? (
              <div className="rounded-[16px] bg-[#E6FFF9] border border-[#9EF1E6] p-4 text-center">
                <Briefcase className="h-8 w-8 mx-auto text-[#006A60]" />
                <p className="text-sm mt-2 text-[#006A60]">No jobs yet</p>
              </div>
            ) : jobs.slice(0, 2).map((job: any) => (
              <div key={job.id} className="rounded-[16px] bg-white border border-[#9EF1E6] p-3">
                <p className="text-sm font-medium text-[#00201C] truncate">{job.title}</p>
                <p className="text-xs text-[#006A60]">{job.company} • {job.location}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(Array.isArray(job.skills) ? job.skills : []).slice(0, 2).map((s: string) => (
                    <Badge key={s} className="rounded-full bg-[#9EF1E6] text-[#00201C] border-0 text-[10px]">{s}</Badge>
                  ))}
                </div>
              </div>
            ))}
            {events.slice(0, 1).map((ev: any) => (
              <div key={ev.id} className="rounded-[16px] bg-[#006A60] border border-[#006A60] p-3 flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-white grid place-items-center"><Calendar className="h-4 w-4 text-[#006A60]" /></span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{ev.title}</p>
                  <p className="text-xs text-white/80">{ev.event_date ? formatDate(ev.event_date) : 'TBD'} • {ev.venue}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Link href="/student/jobs" className="flex-1"><span className="flex h-9 w-full items-center justify-center rounded-full bg-[#006A60] text-white text-sm font-medium">Jobs</span></Link>
              <Link href="/student/events" className="flex-1"><span className="flex h-9 w-full items-center justify-center rounded-full border border-[#006A60] text-[#006A60] text-sm font-medium bg-white">Events</span></Link>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="rounded-[28px] border-2 border-[#E6DDFF] bg-[#F6F0FF]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[16px]"><Award className="h-5 w-5 text-[#5B4DBC]" /> Quick start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link href="/student/alumni" className="flex items-center gap-3 rounded-[16px] bg-[#5B4DBC] border border-[#5B4DBC] p-3 hover:bg-[#4A3AA8] text-white">
              <span className="h-9 w-9 rounded-full bg-white grid place-items-center"><Users className="h-4 w-4 text-[#5B4DBC]" /></span>
              <div><p className="text-sm font-medium text-white">Find a mentor</p><p className="text-xs text-white/80">3 suggested for you</p></div>
              <ArrowRight className="h-4 w-4 ml-auto text-white" />
            </Link>
            <Link href="/student/ai/career-assistant" className="flex items-center gap-3 rounded-[16px] bg-white border-2 border-[#FFD9E3] p-3 hover:bg-[#FFF0F3]">
              <span className="h-9 w-9 rounded-full bg-[#8B4A61] grid place-items-center"><MessageCircle className="h-4 w-4 text-white" /></span>
              <div><p className="text-sm font-medium text-[#3A071E]">Ask AI</p><p className="text-xs text-[#8B4A61]">Career roadmap in 30s</p></div>
              <ArrowRight className="h-4 w-4 ml-auto text-[#8B4A61]" />
            </Link>
            <Link href="/student/profile" className="flex items-center gap-3 rounded-[16px] bg-white border-2 border-[#9EF1E6] p-3 hover:bg-[#E6FFF9]">
              <span className="h-9 w-9 rounded-full bg-[#006A60] grid place-items-center"><BookOpen className="h-4 w-4 text-white" /></span>
              <div><p className="text-sm font-medium text-[#00201C]">Build resume</p><p className="text-xs text-[#006A60]">AI review + score</p></div>
              <ArrowRight className="h-4 w-4 ml-auto text-[#006A60]" />
            </Link>
            <p className="text-xs text-center text-[var(--md-sys-color-on-surface-variant)] pt-1">Pick one — we’ll guide you.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
