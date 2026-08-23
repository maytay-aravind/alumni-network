"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
  currentUserId?: string;
  onRegister?: (eventId: string) => void;
  onCancel?: (eventId: string) => void;
}

const eventTypeColors: Record<string, string> = {
  workshop: "bg-blue-100 text-blue-600",
  seminar: "bg-purple-100 text-purple-600",
  networking: "bg-green-100 text-green-600",
  webinar: "bg-cyan-100 text-cyan-600",
  other: "bg-gray-100 text-gray-600",
};

export function EventCard({
  event,
  currentUserId,
  onRegister,
  onCancel,
}: EventCardProps) {
  const [registered, setRegistered] = useState(event.is_registered || false);
  const [registrationCount, setRegistrationCount] = useState(
    event.registration_count
  );
  const [loading, setLoading] = useState(false);

  const isFull =
    event.max_participants !== null &&
    registrationCount >= event.max_participants;
  const isPast = new Date(event.date) < new Date();

  const handleRegister = async () => {
    setLoading(true);
    try {
      if (!currentUserId) throw new Error("Not authenticated");

      const { error } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        student_id: currentUserId,
      });

      if (error) throw error;
      setRegistered(true);
      setRegistrationCount(registrationCount + 1);
      onRegister?.(event.id);
      toast.success("Registered for event");
    } catch (err) {
      toast.error("Failed to register for event");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", event.id)
        .eq("student_id", currentUserId);

      if (error) throw error;
      setRegistered(false);
      setRegistrationCount(registrationCount - 1);
      onCancel?.(event.id);
      toast.success("Registration cancelled");
    } catch (err) {
      toast.error("Failed to cancel registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Badge
            variant="secondary"
            className={cn(
              "capitalize",
              eventTypeColors[event.event_type] || eventTypeColors.other
            )}
          >
            {event.event_type}
          </Badge>
          {isPast && (
            <Badge variant="outline" className="text-muted-foreground">
              Past Event
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {event.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.venue}</span>
            </div>
          )}
          {event.meeting_url && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Video className="h-4 w-4" />
              <span>Online Meeting</span>
            </div>
          )}
          {event.speaker && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Speaker: {event.speaker}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {registrationCount}
              {event.max_participants && ` / ${event.max_participants}`} registered
            </span>
          </div>
        </div>

        {!isPast && (
          <div className="mt-4 pt-4 border-t">
            {registered ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Cancel Registration"
                )}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleRegister}
                disabled={loading || isFull}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFull ? (
                  "Event Full"
                ) : (
                  "Register Now"
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
