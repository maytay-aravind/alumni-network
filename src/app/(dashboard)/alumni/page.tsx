"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Target,
  FileText,
  Briefcase,
  Calendar,
  MessageSquare,
  Loader2,
  Plus,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage, getInitials } from "@/components/ui/avatar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { supabase } from "@/lib/supabase/client";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function AlumniDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    connections: 0,
    mentees: 0,
    posts: 0,
    referrals: 0,
  });
  const [pendingMentorships, setPendingMentorships] = useState(0);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [myMentees, setMyMentees] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      const { count: connections } = await supabase
        .from("connections")
        .select("id", { count: "exact" })
        .eq("status", "accepted");

      const { count: posts } = await supabase
        .from("posts")
        .select("id", { count: "exact" })
        .eq("author_role", "alumni");

      const { count: pending } = await supabase
        .from("mentorship_requests")
        .select("id", { count: "exact" })
        .eq("status", "pending");

      const { data: menteesData } = await supabase
        .from("mentorship_requests")
        .select("*, student_profiles(first_name, last_name, avatar_url)")
        .eq("status", "accepted")
        .limit(5);

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(3);

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        connections: connections || 0,
        mentees: menteesData?.length || 0,
        posts: posts || 0,
        referrals: 0,
      });
      setPendingMentorships(pending || 0);
      setMyMentees(menteesData || []);
      setUpcomingEvents(eventsData || []);
      setRecentMessages(messagesData || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handlePost = async () => {
    if (!postContent.trim()) return;
    setPosting(true);
    try {
      const { error } = await supabase.from("posts").insert({
        content: postContent,
        post_type: "general",
        author_role: "alumni",
      });
      if (error) throw error;
      setPostContent("");
      toast.success("Post created");
      fetchDashboardData();
    } catch {
      toast.error("Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Alumni Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s your network overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Connections"
          value={stats.connections}
          icon={Users}
          trend="up"
          trendValue="+5 this week"
        />
        <StatsCard
          title="My Mentees"
          value={stats.mentees}
          icon={Target}
          trend="neutral"
        />
        <StatsCard
          title="Posts"
          value={stats.posts}
          icon={FileText}
          trend="up"
          trendValue="+2"
        />
        <StatsCard
          title="Referrals"
          value={stats.referrals}
          icon={Briefcase}
          trend="neutral"
        />
      </div>

      {pendingMentorships > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-sm">
                    {pendingMentorships} pending mentorship request
                    {pendingMentorships > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Students are waiting for your response
                  </p>
                </div>
              </div>
              <Link href="/alumni/mentees">
                <Button size="sm">View Requests</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Quick Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                placeholder="Share an update, advice, or opportunity..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handlePost}
                  disabled={posting || !postContent.trim()}
                >
                  {posting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              My Mentees
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myMentees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active mentees yet
              </p>
            ) : (
              <div className="space-y-3">
                {myMentees.map((mentee) => (
                  <div key={mentee.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mentee.student_profiles?.avatar_url} />
                       <AvatarFallback className="text-xs">
                        {mentee.student_profiles
                          ? getInitials(
                              `${mentee.student_profiles.first_name} ${mentee.student_profiles.last_name}`
                            )
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {mentee.student_profiles?.first_name}{" "}
                        {mentee.student_profiles?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {mentee.career_goal}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Upcoming Events
              </CardTitle>
              <Link href="/alumni/events">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming events
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.date)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {event.event_type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Recent Messages
              </CardTitle>
              <Link href="/alumni/messages">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent messages
              </p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(msg.sender_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {msg.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
