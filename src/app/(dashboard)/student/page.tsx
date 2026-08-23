'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { CareerReadinessCard } from '@/components/dashboard/CareerReadinessCard';
import { RecommendedMentorsCard } from '@/components/dashboard/RecommendedMentorsCard';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { RecentJobsCard } from '@/components/dashboard/RecentJobsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getCareerReadinessScore } from '@/lib/utils';
import { Link2, Bell, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const [profile, setProfile] = React.useState<any | null>(null);
  const [userMeta, setUserMeta] = React.useState<{ first_name: string; last_name: string } | null>(null);
  const [projects, setProjects] = React.useState<any[]>([]);
  const [certifications, setCertifications] = React.useState<any[]>([]);
  const [mentors] = React.useState<any[]>([]);
  const [events, setEvents] = React.useState<any[]>([]);
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [notifications, setNotifications] = React.useState<any[]>([]);
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

        // Fetch profile
        let profileData: any = null;
        try {
          const res = await supabase.from('student_profiles').select('*').eq('user_id', user.id).single();
          profileData = res.data;
        } catch {}
        if (profileData) {
          setProfile(profileData);
          try { setProjects(Array.isArray(profileData.projects) ? profileData.projects : JSON.parse(profileData.projects || '[]')); } catch { setProjects(profileData.projects || []); }
          try { setCertifications(Array.isArray(profileData.certifications) ? profileData.certifications : JSON.parse(profileData.certifications || '[]')); } catch { setCertifications(profileData.certifications || []); }
        } else {
          setProfile({ skills: [], projects: [], certifications: [], resume_url: null, college: '', department: '' });
        }

        // Events - correct column is event_date
        try {
          const { data: eventsData } = await supabase.from('events').select('*').order('event_date', { ascending: true }).limit(3);
          setEvents(eventsData || []);
        } catch { setEvents([]); }

        // Jobs
        try {
          const { data: jobsData } = await supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3);
          setJobs(jobsData || []);
        } catch { setJobs([]); }

        // Notifications - column is 'read' not 'is_read'
        try {
          const { data: notifData } = await supabase.from('notifications').select('*').eq('user_id', user.id).eq('read', false).order('created_at', { ascending: false }).limit(5);
          setNotifications(notifData || []);
        } catch { setNotifications([]); }
      } catch (e) {
        console.error('Dashboard fetch error', e);
        // Ensure we don't stay in loading forever
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
        <Skeleton className="h-48 w-full rounded-[28px]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-[28px]" />
          <Skeleton className="h-80 rounded-[28px]" />
          <Skeleton className="h-80 rounded-[28px]" />
          <Skeleton className="h-80 rounded-[28px]" />
        </div>
      </div>
    );
  }

  if (!profile || !userMeta) {
    return (
      <div className="rounded-[28px] bg-white border border-[#E7E0EC] p-8 text-center">
        <p className="text-[#1D1B20] font-medium">Welcome!</p>
        <p className="text-sm text-[#49454F] mt-1">Your profile is being set up. Please refresh or complete your profile.</p>
        <Link href="/student/profile" className="inline-flex mt-4 rounded-full bg-[#6750A4] text-white px-6 py-2 text-sm font-medium">Go to Profile</Link>
      </div>
    );
  }

  const score = getCareerReadinessScore({
    skills: (profile.skills as string[]) || [],
    projects: projects,
    certifications: certifications,
    resume_url: profile.resume_url as string,
  });

  const quickLinks = [
    { label: 'AI Resume Builder', href: '/student/profile', icon: FileText },
    { label: 'Mock Interviews', href: '/student/mentorship', icon: BookOpen },
    { label: 'Career Resources', href: '/student/jobs', icon: Link2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <WelcomeSection firstName={userMeta.first_name} lastName={userMeta.last_name} profile={profile} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CareerReadinessCard score={score} />
        <RecommendedMentorsCard mentors={mentors} />
        <UpcomingEventsCard events={events} />
        <RecentJobsCard jobs={jobs} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-lg">Quick Links</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F3EDF7] transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EADDFF] text-[#21005D]"><link.icon className="h-4 w-4" /></div>
                <span className="text-sm font-medium text-[#1D1B20]">{link.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Bell className="h-5 w-5 text-[#6750A4]" />Recent Notifications</CardTitle></CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-[#49454F] text-center py-8">No new notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif: any) => (
                  <div key={notif.id} className="flex items-start gap-3 p-3 rounded-2xl border border-[#E7E0EC] bg-[#FFFBFE]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EADDFF] text-[#21005D] mt-0.5"><Bell className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1B20]">{notif.title || 'Notification'}</p>
                      <p className="text-xs text-[#49454F]">{notif.message}</p>
                      <p className="text-xs text-[#49454F] mt-1">{notif.created_at ? formatDate(notif.created_at) : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
