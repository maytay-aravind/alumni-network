'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getInitials, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  Building2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Link2,
  ExternalLink,
  Globe,
  MessageSquare,
  Handshake,
  Award,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function AlumniDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [alumni, setAlumni] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [connectionStatus, setConnectionStatus] = React.useState<'none' | 'pending' | 'connected'>('none');

  React.useEffect(() => {
    const fetchAlumni = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('alumni_profiles')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!error && data) {
        setAlumni(data);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: conn } = await supabase
            .from('connections')
            .select('status')
            .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .or(`requester_id.eq.${data.user_id},receiver_id.eq.${data.user_id}`)
            .single();

          if (conn) {
            setConnectionStatus(conn.status as 'pending' | 'connected');
          }
        }
      }
      setLoading(false);
    };

    fetchAlumni();
  }, [params.id]);

  const handleConnect = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !alumni) return;

    const { error } = await supabase.from('connections').insert({
      requester_id: user.id,
      receiver_id: alumni.user_id,
      status: 'pending',
    });

    if (error) {
      toast.error('Failed to send connection request');
    } else {
      setConnectionStatus('pending');
      toast.success('Connection request sent!');
    }
  };

  if (loading || !alumni) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  const firstName = alumni.first_name as string;
  const lastName = alumni.last_name as string;
  const careerJourney = (alumni.career_journey as any[]) || [];
  const achievements = (alumni.achievements as any[]) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => router.back()} className="w-fit">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Directory
      </Button>

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <CardContent className="relative p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-background">
                <AvatarImage src={(alumni.avatar_url as string) || undefined} />
                <AvatarFallback className="text-2xl">
                  {getInitials(firstName, lastName)}
                </AvatarFallback>
              </Avatar>
              {(alumni.is_verified as boolean) && (
                <div className="absolute -bottom-1 -right-1">
                  <CheckCircle2 className="h-6 w-6 text-primary fill-primary/20" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">
                      {firstName} {lastName}
                    </h1>
                    {(alumni.is_verified as boolean) && (
                      <Badge variant="default">Verified</Badge>
                    )}
                    {(alumni.is_mentor as boolean) && (
                      <Badge variant="success">Mentor</Badge>
                    )}
                  </div>
                  {alumni.current_position && alumni.current_company && (
                    <p className="text-lg text-muted-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {String(alumni.current_position)} at {String(alumni.current_company)}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {String(alumni.department)} • Class of {Number(alumni.graduation_year)}
                    </span>
                    {alumni.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {String(alumni.location)}
                      </span>
                    )}
                    {alumni.years_of_experience && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {Number(alumni.years_of_experience)} years experience
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {alumni.linkedin_url && (
                  <a href={alumni.linkedin_url as string} target="_blank" rel="noopener noreferrer">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      LinkedIn
                    </Badge>
                  </a>
                )}
                {alumni.github_url && (
                  <a href={alumni.github_url as string} target="_blank" rel="noopener noreferrer">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      GitHub
                    </Badge>
                  </a>
                )}
                {alumni.portfolio_url && (
                  <a href={alumni.portfolio_url as string} target="_blank" rel="noopener noreferrer">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      <Globe className="h-3 w-3 mr-1" />
                      Portfolio
                    </Badge>
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {connectionStatus === 'none' && (
                <Button onClick={handleConnect}>
                  <Handshake className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              )}
              {connectionStatus === 'pending' && (
                <Button variant="secondary" disabled>
                  Request Pending
                </Button>
              )}
              {connectionStatus === 'connected' && (
                <Link href={`/student/messages?user=${alumni.user_id}`}>
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {alumni.bio && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{String(alumni.about || '')}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(alumni.skills as string[] || []).map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {alumni.mentorship_availability && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Mentorship</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant={alumni.mentorship_availability === 'available' ? 'success' : alumni.mentorship_availability === 'limited' ? 'warning' : 'secondary'}>
                  {alumni.mentorship_availability as string}
                </Badge>
                {(alumni.mentorship_topics as string[])?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {(alumni.mentorship_topics as string[] || []).map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">{topic}</Badge>
                ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {careerJourney.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Career Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  {careerJourney.map((entry: any, index: number) => (
                    <div key={entry.id || index} className="relative pl-10">
                      <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                      <div className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{String(entry.role || '')}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.start_date)} - {entry.end_date ? formatDate(entry.end_date) : 'Present'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{String(entry.company || '')}</p>
                        {entry.description && (
                          <p className="text-sm mt-2">{String(entry.description)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {achievements.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={achievement.id as string || index} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Award className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{String(achievement.title || '')}</p>
                        <p className="text-sm text-muted-foreground">{String(achievement.description || '')}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(achievement.date as string)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
