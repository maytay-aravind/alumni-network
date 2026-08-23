'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn, getProfileCompletionPercentage } from '@/lib/utils';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProfileCompletionCardProps {
  profile: Record<string, unknown>;
}

const profileSections = [
  { key: 'avatar_url', label: 'Profile Photo', href: '/student/profile' },
  { key: 'about', label: 'About/Bio', href: '/student/profile' },
  { key: 'location', label: 'Location', href: '/student/profile' },
  { key: 'location', label: 'Location', href: '/student/profile' },
  { key: 'linkedin_url', label: 'LinkedIn Profile', href: '/student/profile' },
  { key: 'linkedin_url', label: 'LinkedIn Profile', href: '/student/profile' },
  { key: 'github_url', label: 'GitHub Profile', href: '/student/profile' },
  { key: 'portfolio_url', label: 'Portfolio', href: '/student/profile' },
];

export function ProfileCompletionCard({ profile }: { profile: any }) {
  const completion = getProfileCompletionPercentage(profile);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Profile Completion</CardTitle>
          <span className={cn(
            'text-2xl font-bold',
            completion >= 80 ? 'text-emerald-500' : completion >= 60 ? 'text-amber-500' : 'text-red-500'
          )}>
            {completion}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={completion} className="h-2" />
        <div className="space-y-2">
          {profileSections.map((section) => {
            const isCompleted = profile[section.key] !== null && 
              profile[section.key] !== undefined && 
              profile[section.key] !== '' &&
              (!Array.isArray(profile[section.key]) || (profile[section.key] as unknown[]).length > 0);

            return (
              <div key={section.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={cn(
                    'text-sm',
                    isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}>
                    {section.label}
                  </span>
                </div>
                {!isCompleted && (
                  <Link href={section.href}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Add
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
