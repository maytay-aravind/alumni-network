'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { MapPin, Building2, GraduationCap, CheckCircle2 } from 'lucide-react';

interface AlumniCardProps {
  alumni: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    current_company: string | null;
    current_position: string | null;
    department: string;
    graduation_year: number;
    skills: string[];
    location: string | null;
    is_verified: boolean;
  };
  connectionStatus?: 'none' | 'pending' | 'connected';
  onConnect?: () => void;
}

export function AlumniCard({ alumni, connectionStatus = 'none', onConnect }: AlumniCardProps) {
  return (
    <Card className="card-hover group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={alumni.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {getInitials(alumni.first_name, alumni.last_name)}
              </AvatarFallback>
            </Avatar>
            {alumni.is_verified && (
              <div className="absolute -bottom-1 -right-1">
                <CheckCircle2 className="h-5 w-5 text-primary fill-primary/20" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">
                {alumni.first_name} {alumni.last_name}
              </h3>
              {alumni.is_verified && (
                <Badge variant="default" className="text-[10px]">Verified</Badge>
              )}
            </div>
            {alumni.current_position && alumni.current_company && (
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                <Building2 className="h-3 w-3 shrink-0" />
                {alumni.current_position} at {alumni.current_company}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {alumni.department} ' {String(alumni.graduation_year).slice(-2)}
              </span>
              {alumni.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {alumni.location}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {alumni.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-[10px]">
                  {skill}
                </Badge>
              ))}
              {alumni.skills.length > 4 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{alumni.skills.length - 4}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Link href={`/student/alumni/${alumni.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Profile
            </Button>
          </Link>
          {connectionStatus === 'none' && (
            <Button size="sm" className="flex-1" onClick={onConnect}>
              Connect
            </Button>
          )}
          {connectionStatus === 'pending' && (
            <Button size="sm" variant="secondary" className="flex-1" disabled>
              Pending
            </Button>
          )}
          {connectionStatus === 'connected' && (
            <Link href={`/student/messages?user=${alumni.id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                Message
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
