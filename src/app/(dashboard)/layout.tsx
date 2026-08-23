'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
      const role = (authUser.user_metadata?.role as string) || 'student';
      const fullName = (authUser.user_metadata?.full_name as string) || authUser.email?.split('@')[0] || 'User';
      const parts = fullName.trim().split(' ');
      setUser({ id: authUser.id, email: authUser.email || '', role });
      // Try to fetch profile from correct table based on role, fallback to metadata
      try {
        const table = role === 'alumni' ? 'alumni_profiles' : role === 'admin' ? null : 'student_profiles';
        if (table) {
          const { data } = await supabase.from(table as any).select('*').eq('user_id', authUser.id).single();
          if (data) {
            let userRow: any = null;
            try {
              const res = await supabase.from('users').select('full_name, avatar_url').eq('id', authUser.id).single();
              userRow = res.data;
            } catch {}
            const name = userRow?.full_name || fullName;
            const nameParts = name.trim().split(' ');
            setProfile({ first_name: nameParts[0] || parts[0], last_name: nameParts.slice(1).join(' ') || parts.slice(1).join(' '), avatar_url: userRow?.avatar_url || null });
          } else {
            setProfile({ first_name: parts[0], last_name: parts.slice(1).join(' '), avatar_url: null });
          }
        } else {
          setProfile({ first_name: parts[0], last_name: parts.slice(1).join(' '), avatar_url: null });
        }
      } catch {
        setProfile({ first_name: parts[0], last_name: parts.slice(1).join(' '), avatar_url: null });
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen bg-[#FEF7FF]">
        <aside className="hidden lg:flex w-[268px] border-r border-[#E7E0EC] bg-[#F3EDF7] flex-col">
          <div className="flex items-center gap-3 border-b border-[#E7E0EC] px-6 py-4">
            <Skeleton className="h-6 w-6 rounded-2xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="p-3 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-full" />
            ))}
          </div>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-[64px] border-b border-[#E7E0EC] bg-white flex items-center justify-between px-4 lg:px-6">
            <Skeleton className="h-6 w-32 rounded-full hidden md:block" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6 bg-[#FEF7FF]">
            <Skeleton className="h-32 w-full rounded-[28px]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Skeleton className="h-64 rounded-[28px]" />
              <Skeleton className="h-64 rounded-[28px]" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={{ ...user, profile } as any}>
      {children}
    </DashboardLayout>
  );
}
