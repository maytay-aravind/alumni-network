'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Users, ArrowRight } from 'lucide-react';

interface RecommendedMentor {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  current_company: string | null;
    current_position: string | null;
  match_percentage: number;
  common_skills: string[];
}

interface RecommendedMentorsCardProps {
  mentors: RecommendedMentor[];
}

export function RecommendedMentorsCard({ mentors }: RecommendedMentorsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Recommended Mentors
        </CardTitle>
        <Link href="/student/alumni">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {mentors.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No mentors to recommend yet. Complete your profile to get personalized recommendations.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mentor.avatar_url || undefined} />
                  <AvatarFallback>
                    {getInitials(mentor.first_name, mentor.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {mentor.first_name} {mentor.last_name}
                    </p>
                    <Badge variant="success" className="text-[10px]">
                      {mentor.match_percentage}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {mentor.current_position} at {mentor.current_company}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mentor.common_skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-[10px]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link href={`/student/alumni/${mentor.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/student/mentorship?alumni=${mentor.id}`}>
                    <Button size="sm" className="text-xs">
                      Request
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
