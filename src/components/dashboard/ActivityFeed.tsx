"use client";

import {
  UserPlus,
  Briefcase,
  Calendar,
  MessageSquare,
  Award,
  FileText,
  Bell,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  type: "connection" | "job" | "event" | "message" | "achievement" | "post" | "mentorship" | "verification";
  user: {
    name: string;
    avatar?: string;
  };
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const activityIcons: Record<string, LucideIcon> = {
  connection: UserPlus,
  job: Briefcase,
  event: Calendar,
  message: MessageSquare,
  achievement: Award,
  post: FileText,
  mentorship: Users,
  verification: Bell,
};

const activityColors: Record<string, string> = {
  connection: "bg-blue-100 text-blue-600",
  job: "bg-green-100 text-green-600",
  event: "bg-purple-100 text-purple-600",
  message: "bg-cyan-100 text-cyan-600",
  achievement: "bg-amber-100 text-amber-600",
  post: "bg-pink-100 text-pink-600",
  mentorship: "bg-indigo-100 text-indigo-600",
  verification: "bg-emerald-100 text-emerald-600",
};

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type] || Bell;
        const colorClass = activityColors[activity.type] || "bg-gray-100 text-gray-600";

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
          >
            <div className={cn("rounded-lg p-2", colorClass)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback className="text-xs">
                    {activity.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">
                  {activity.user.name}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {activity.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelativeTime(activity.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
