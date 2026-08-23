'use client';

import Link from 'next/link';
import { cn, getScoreColor, getScoreBgColor } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

interface CareerReadinessCardProps {
  score: {
    overall: number;
    skills: number;
    projects: number;
    resume: number;
    certifications: number;
    experience: number;
  };
}

const breakdownItems = [
  { key: 'skills' as const, label: 'Skills', description: 'Technical & soft skills' },
  { key: 'projects' as const, label: 'Projects', description: 'Portfolio projects' },
  { key: 'resume' as const, label: 'Resume', description: 'Resume uploaded' },
  { key: 'certifications' as const, label: 'Certifications', description: 'Professional certs' },
  { key: 'experience' as const, label: 'Experience', description: 'Work experience' },
];

export function CareerReadinessCard({ score }: CareerReadinessCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Career Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${score.overall * 2.64} 264`}
                className={cn('transition-all duration-1000', getScoreColor(score.overall))}
                stroke="currentColor"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-3xl font-bold', getScoreColor(score.overall))}>
                {score.overall}
              </span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {breakdownItems.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                <span className={cn('text-sm font-semibold', getScoreColor(score[item.key]))}>
                  {score[item.key]}%
                </span>
              </div>
              <Progress value={score[item.key]} className="h-1.5" />
            </div>
          ))}
        </div>

        <Link href="/student/profile">
          <Button variant="outline" className="w-full">
            Improve Score
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
