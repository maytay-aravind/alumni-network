'use client';
import Link from 'next/link';
import { TIME_BASED_GREETING, getProfileCompletionPercentage } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Users, Briefcase, Calendar } from 'lucide-react';

interface WelcomeSectionProps {
  firstName: string;
  lastName: string;
  profile: Record<string, unknown>;
}

export function WelcomeSection({ firstName, lastName, profile }: WelcomeSectionProps) {
  const completion = getProfileCompletionPercentage(profile);
  const greeting = TIME_BASED_GREETING;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const quickActions = [
    { label: 'Edit profile', href: '/student/profile', icon: User },
    { label: 'Find alumni', href: '/student/alumni', icon: Users },
    { label: 'Browse jobs', href: '/student/jobs', icon: Briefcase },
    { label: 'Events', href: '/student/events', icon: Calendar },
  ];

  return (
    <div className="space-y-4">
      <Card variant="filled" className="rounded-[28px] overflow-hidden">
        <CardContent className="p-6 lg:p-7">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-[12px] font-medium tracking-widest text-[var(--md-sys-color-on-surface-variant)] uppercase">{today}</p>
              <h1 className="mt-1 text-[28px] leading-9 font-normal tracking-tight text-[var(--md-sys-color-on-surface)]">
                {greeting}, <span className="font-medium text-[var(--md-sys-color-primary)]">{firstName}</span>
              </h1>
              <p className="mt-2 text-[14px] leading-5 text-[var(--md-sys-color-on-surface-variant)] max-w-[52ch]">
                Welcome back to your alumni network. Track your progress, connect with mentors, and explore new opportunities.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {quickActions.map((a) => (
                <Link key={a.href} href={a.href}>
                  <Button variant="tonal" size="sm"><a.icon className="h-4 w-4 mr-2" />{a.label}</Button>
                </Link>
              ))}
            </div>
          </div>

          {completion < 100 && (
            <div className="mt-6 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">Profile completion</p>
                <span className="text-sm font-medium tabular-nums text-[var(--md-sys-color-primary)]">{completion}%</span>
              </div>
              <Progress value={completion} className="h-2 mt-3 bg-[var(--md-sys-color-surface-container-high)]" />
              <p className="mt-2 text-xs text-[var(--md-sys-color-on-surface-variant)]">Complete your profile to get better mentor matches and career insights.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
