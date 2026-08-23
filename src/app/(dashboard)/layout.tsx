'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<{ id: string; email: string; role: string } | null>(null);
  const [profile, setProfile] = React.useState<{ first_name: string; last_name: string; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();

      if (error || !authUser) {
        router.push('/login');
        return;
      }

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        role: authUser.user_metadata?.role || 'student',
      });

      const { data: profileData } = await supabase
        .from('student_profiles')
        .select('first_name, last_name, avatar_url')
        .eq('user_id', authUser.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };

    getUser();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen bg-background">
        <aside className="hidden lg:flex w-64 border-r bg-sidebar flex-col">
          <div className="flex items-center gap-2 border-b px-6 py-4">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="p-3 space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center justify-between px-4 lg:px-6">
            <Skeleton className="h-9 w-64 hidden md:block" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile}>
      {children}
    </DashboardLayout>
  );
}
