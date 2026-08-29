'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, getEventTypeBadgeVariant } from '@/lib/utils';
import { Calendar, ArrowRight, Users } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date?: string;
  event_date?: string;
  event_time?: string;
  event_type: string;
  registration_count?: number;
  max_participants: number | null;
}

interface UpcomingEventsCardProps {
  events: Event[];
}

export function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>
        <Link href="/student/events">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No upcoming events. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const rawDate = (event as any).event_date || event.date;
              const d = rawDate ? new Date(rawDate) : null;
              const isValid = d && !isNaN(d.getTime());
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center min-w-[48px] h-14 rounded-lg bg-primary/10 text-primary">
                    <span className="text-xs font-medium">
                      {isValid ? d!.toLocaleDateString('en-US', { month: 'short' }) : '—'}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {isValid ? d!.getDate() : '—'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{event.title}</p>
                      <Badge variant={getEventTypeBadgeVariant(event.event_type)} className="text-[10px]">
                        {event.event_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatDate(rawDate)}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.registration_count ?? 0}
                        {event.max_participants ? `/${event.max_participants}` : ''}
                      </span>
                    </div>
                  </div>
                  <Link href={`/student/events?register=${event.id}`}>
                    <Button size="sm" variant="outline">
                      Register
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
