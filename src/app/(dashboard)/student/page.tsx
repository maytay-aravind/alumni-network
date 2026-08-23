'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { CareerReadinessCard } from '@/components/dashboard/CareerReadinessCard';
import { RecommendedMentorsCard } from '@/components/dashboard/RecommendedMentorsCard';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { RecentJobsCard } from '@/components/dashboard/RecentJobsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getCareerReadinessScore } from '@/lib/utils';
import { Link2, Bell, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const [profile, setProfile] = React.useState<any | null>(null);
  const [projects, setProjects] = React.useState<any[]>([]);
  const [certifications, setCertifications] = React.useState<any[]>([]);
  const [mentors, setMentors] = React.useState<any[]>([]);
  const [events, setEvents] = React.useState<any[]>([]);
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, projectsRes, certsRes, eventsRes, jobsRes, notifRes] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('projects').select('*').eq('student_id', user.id).limit(5),
        supabase.from('certifications').select('*').eq('student_id', user.id).limit(5),
        supabase.from('events').select('*').gte('date', new Date().toISOString()).order('date', { ascending: true }).limit(3),
        supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('notifications').select('*').eq('user_id', user.id).eq('is_read', false).order('created_at', { ascending: false }).limit(5),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setProjects(projectsRes.data || []);
        setCertifications(certsRes.data || []);
      }
      setEvents(eventsRes.data || []);
      setJobs(jobsRes.data || []);
      setNotifications(notifRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const score = getCareerReadinessScore({
    skills: profile.skills as string[] || [],
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
      <WelcomeSection
        firstName={profile.first_name as string}
        lastName={profile.last_name as string}
        profile={profile}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CareerReadinessCard score={score} />
        <RecommendedMentorsCard mentors={mentors} />
        <UpcomingEventsCard events={events} />
        <RecentJobsCard jobs={jobs} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <link.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No new notifications
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif: Record<string, unknown>) => (
                  <div
                    key={notif.id as string}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notif.title as string}</p>
                      <p className="text-xs text-muted-foreground">{notif.message as string}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(notif.created_at as string)}
                      </p>
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
