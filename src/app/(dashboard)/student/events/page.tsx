'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, getEventTypeBadgeVariant } from '@/lib/utils';
import { EVENT_TYPES } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Clock,
  Video,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = React.useState<any[]>([]);
  const [pastEvents, setPastEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('upcoming');
  const [selectedEvent, setSelectedEvent] = React.useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [upcomingRes, pastRes, registrationsRes] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true }),
      supabase
        .from('events')
        .select('*')
        .lt('date', new Date().toISOString())
        .order('date', { ascending: false })
        .limit(10),
      user
        ? supabase
            .from('event_registrations')
            .select('*, event:events(*)')
            .eq('student_id', user.id)
        : { data: [] },
    ]);

    setEvents(upcomingRes.data || []);
    setPastEvents(pastRes.data || []);
    setMyRegistrations(registrationsRes.data || []);
    setLoading(false);
  };

  const handleRegister = async (eventId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('event_registrations').insert({
      event_id: eventId,
      student_id: user.id,
    });

    if (error) {
      toast.error('Failed to register');
    } else {
      toast.success('Registered for event!');
      fetchEvents();
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('student_id', user.id);

    if (error) {
      toast.error('Failed to cancel');
    } else {
      toast.success('Registration cancelled');
      fetchEvents();
    }
  };

  const isRegistered = (eventId: string) => {
    return myRegistrations.some((r: any) => r.event_id === eventId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Workshops, seminars, and networking events</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="registered" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            My Registrations
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <Clock className="h-4 w-4" />
            Past Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-8 w-8" />}
              title="No upcoming events"
              description="Check back later for new events"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events
                .filter((e: any) =>
                  (e.title || '').toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((event: any) => (
                  <Card key={event.id as string} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getEventTypeBadgeVariant(event.event_type as string)}>
                          {event.event_type as string}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{event.title as string}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {event.description as string}
                      </p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.date as string)}
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {String(event.venue)}
                          </div>
                        )}
                        {event.speaker && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Speaker: {String(event.speaker)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowDetailModal(true);
                          }}
                        >
                          Details
                        </Button>
                        {isRegistered(event.id as string) ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleCancelRegistration(event.id as string)}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleRegister(event.id as string)}
                          >
                            Register
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="registered">
          {myRegistrations.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-8 w-8" />}
              title="No registrations"
              description="Register for events to see them here"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRegistrations.map((reg: any) => {
                const event = reg.event as any;
                return (
                  <Card key={reg.id as string}>
                    <CardContent className="p-4">
                      <Badge variant={getEventTypeBadgeVariant(event?.event_type as string)} className="mb-2">
                        {event?.event_type as string}
                      </Badge>
                      <h3 className="font-semibold mb-1">{event?.title as string}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event?.date as string)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => handleCancelRegistration(event?.id as string)}
                      >
                        Cancel Registration
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastEvents.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-8 w-8" />}
              title="No past events"
              description="Past events will appear here"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
              {pastEvents.map((event: any) => (
                <Card key={event.id as string}>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2">Past Event</Badge>
                    <h3 className="font-semibold mb-1">{event.title as string}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.date as string)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title as string}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Badge variant={getEventTypeBadgeVariant(selectedEvent?.event_type as string)}>
              {selectedEvent?.event_type as string}
            </Badge>
            <p className="text-muted-foreground">{selectedEvent?.description as string}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {formatDate(selectedEvent?.date as string)}
              </div>
              {selectedEvent?.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {selectedEvent.venue as string}
                </div>
              )}
              {selectedEvent?.meeting_url && (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  <a
                    href={selectedEvent.meeting_url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
              {selectedEvent?.speaker && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Speaker: {selectedEvent.speaker as string}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {selectedEvent?.registration_count as number} registered
                {selectedEvent?.max_participants && ` / ${selectedEvent.max_participants}`}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
            {isRegistered(selectedEvent?.id as string) ? (
              <Button
                variant="destructive"
                onClick={() => {
                  handleCancelRegistration(selectedEvent?.id as string);
                  setShowDetailModal(false);
                }}
              >
                Cancel Registration
              </Button>
            ) : (
              <Button
                onClick={() => {
                  handleRegister(selectedEvent?.id as string);
                  setShowDetailModal(false);
                }}
              >
                Register Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
