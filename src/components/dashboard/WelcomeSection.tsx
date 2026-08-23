'use client';

import Link from 'next/link';
import { cn, TIME_BASED_GREETING, formatDate, getProfileCompletionPercentage } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Users, Briefcase, Calendar, Sparkles } from 'lucide-react';

interface WelcomeSectionProps {
  firstName: string;
  lastName: string;
  profile: Record<string, unknown>;
}

export function WelcomeSection({ firstName, lastName, profile }: WelcomeSectionProps) {
  const completion = getProfileCompletionPercentage(profile);
  const greeting = TIME_BASED_GREETING;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const quickActions = [
    { label: 'Edit Profile', href: '/student/profile', icon: User },
    { label: 'Find Alumni', href: '/student/alumni', icon: Users },
    { label: 'Browse Jobs', href: '/student/jobs', icon: Briefcase },
    { label: 'Events', href: '/student/events', icon: Calendar },
  ];

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary-light to-accent text-white">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <CardContent className="relative p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <p className="text-sm text-white/80">{today}</p>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              {greeting}, {firstName}!
            </h1>
            <p className="text-white/80">
              Welcome back to your alumni network. Here's what's happening today.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {completion < 100 && (
          <div className="mt-6 p-4 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Profile Completion</p>
              <p className="text-sm font-bold">{completion}%</p>
            </div>
            <Progress value={completion} className="h-2 bg-white/20" />
            {completion < 100 && (
              <Link href="/student/profile">
                <Button variant="link" className="text-white p-0 h-auto mt-2 text-sm">
                  Complete your profile →
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
