"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Loader2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { supabase } from "@/lib/supabase/client";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { Event } from "@/types";

interface EventFormData {
  title: string;
  description: string;
  event_type: string;
  date: string;
  end_date: string;
  venue: string;
  meeting_url: string;
  speaker: string;
  max_participants: string;
}

const defaultFormData: EventFormData = {
  title: "",
  description: "",
  event_type: "workshop",
  date: "",
  end_date: "",
  venue: "",
  meeting_url: "",
  speaker: "",
  max_participants: "",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        date: new Date(formData.date).toISOString(),
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : null,
        venue: formData.venue || null,
        meeting_url: formData.meeting_url || null,
        speaker: formData.speaker || null,
        max_participants: formData.max_participants
          ? parseInt(formData.max_participants)
          : null,
        created_by: "admin",
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("Event updated successfully");
      } else {
        const { error } = await supabase.from("events").insert(eventData);
        if (error) throw error;
        toast.success("Event created successfully");
      }

      setShowCreateModal(false);
      setEditingEvent(null);
      setFormData(defaultFormData);
      fetchEvents();
    } catch (error) {
      toast.error(editingEvent ? "Failed to update event" : "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;

    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      setEvents(events.filter((e) => e.id !== id));
      toast.success("Event deleted");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      date: event.date.slice(0, 16),
      end_date: event.end_date?.slice(0, 16) || "",
      venue: event.venue || "",
      meeting_url: event.meeting_url || "",
      speaker: event.speaker || "",
      max_participants: event.max_participants?.toString() || "",
    });
    setShowCreateModal(true);
  };

  const viewRegistrations = async (event: Event) => {
    setSelectedEvent(event);
    const { data } = await supabase
      .from("event_registrations")
      .select("*, student_profiles(first_name, last_name, email)")
      .eq("event_id", event.id);

    setRegistrations(data || []);
  };

  const columns: Column<Event>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (event) => (
        <div>
          <p className="font-medium text-sm">{event.title}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {event.event_type}
          </p>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (event) => (
        <span className="text-sm">{formatDate(event.date)}</span>
      ),
    },
    {
      key: "venue",
      label: "Venue",
      render: (event) => (
        <div className="flex items-center gap-1 text-sm">
          {event.venue ? (
            <>
              <MapPin className="h-3 w-3" />
              {event.venue}
            </>
          ) : (
            <span className="text-muted-foreground">Online</span>
          )}
        </div>
      ),
    },
    {
      key: "registration_count",
      label: "Registrations",
      sortable: true,
      render: (event) => (
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-3 w-3" />
          {event.registration_count}
          {event.max_participants && ` / ${event.max_participants}`}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (event) => {
        const isPast = new Date(event.date) < new Date();
        return (
          <Badge variant={isPast ? "secondary" : "success"}>
            {isPast ? "Past" : "Upcoming"}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage network events
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingEvent(null);
            setFormData(defaultFormData);
            setShowCreateModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={events}
              searchPlaceholder="Search events..."
              pageSize={10}
              emptyMessage="No events found"
              actions={(event) => (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => viewRegistrations(event)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Create Event"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Event title"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Event description"
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.event_type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData({ ...formData, event_type: e.target.value })
                  }
                >
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="networking">Networking</option>
                  <option value="webinar">Webinar</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_participants: e.target.value,
                    })
                  }
                  placeholder="Unlimited"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                placeholder="Physical venue"
              />
            </div>
            <div>
              <Label>Meeting URL</Label>
              <Input
                value={formData.meeting_url}
                onChange={(e) =>
                  setFormData({ ...formData, meeting_url: e.target.value })
                }
                placeholder="Online meeting link"
              />
            </div>
            <div>
              <Label>Speaker</Label>
              <Input
                value={formData.speaker}
                onChange={(e) =>
                  setFormData({ ...formData, speaker: e.target.value })
                }
                placeholder="Speaker name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => {
          setSelectedEvent(null);
          setRegistrations([]);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Event Registrations</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedEvent.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedEvent.date)}
                </p>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {registrations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No registrations yet
                  </p>
                ) : (
                  registrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {reg.student_profiles?.first_name}{" "}
                          {reg.student_profiles?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reg.student_profiles?.email}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(reg.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
