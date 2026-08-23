"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Check,
  X,
  MessageSquare,
  Loader2,
  Calendar,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage, getInitials } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface MentorshipRequest {
  id: string;
  student_id: string;
  alumni_id: string;
  career_goal: string;
  reason: string;
  topics: string[];
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: string;
  student?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    department: string;
    graduation_year: number;
  };
}

export default function MenteesPage() {
  const [activeMentees, setActiveMentees] = useState<MentorshipRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<MentorshipRequest[]>(
    []
  );
  const [pastMentors, setPastMentors] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<MentorshipRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchMentorships();
  }, []);

  async function fetchMentorships() {
    try {
      setLoading(true);

      const { data: active } = await supabase
        .from("mentorship_requests")
        .select("*, student_profiles(first_name, last_name, avatar_url, department, graduation_year)")
        .eq("status", "accepted")
        .order("created_at", { ascending: false });

      const { data: pending } = await supabase
        .from("mentorship_requests")
        .select("*, student_profiles(first_name, last_name, avatar_url, department, graduation_year)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      const { data: completed } = await supabase
        .from("mentorship_requests")
        .select("*, student_profiles(first_name, last_name, avatar_url, department, graduation_year)")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      setActiveMentees(active || []);
      setPendingRequests(pending || []);
      setPastMentors(completed || []);
    } catch (error) {
      toast.error("Failed to fetch mentorships");
    } finally {
      setLoading(false);
    }
  }

  const handleAccept = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from("mentorship_requests")
        .update({ status: "accepted" })
        .eq("id", id);

      if (error) throw error;
      setPendingRequests(pendingRequests.filter((r) => r.id !== id));
      toast.success("Mentorship request accepted");
      fetchMentorships();
    } catch {
      toast.error("Failed to accept request");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from("mentorship_requests")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;
      setPendingRequests(pendingRequests.filter((r) => r.id !== id));
      setSelectedRequest(null);
      toast.success("Mentorship request rejected");
    } catch {
      toast.error("Failed to reject request");
    } finally {
      setProcessing(null);
    }
  };

  const handleComplete = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from("mentorship_requests")
        .update({ status: "completed" })
        .eq("id", id);

      if (error) throw error;
      setActiveMentees(activeMentees.filter((r) => r.id !== id));
      toast.success("Mentorship marked as completed");
      fetchMentorships();
    } catch {
      toast.error("Failed to complete mentorship");
    } finally {
      setProcessing(null);
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Mentorship Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your mentorship relationships
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active Mentees ({activeMentees.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Mentees ({pastMentors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeMentees.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No active mentees yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeMentees.map((request) => (
                <Card key={request.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={request.student?.avatar_url || ""}
                          />
                          <AvatarFallback>
                            {request.student
                              ? getInitials(
                                  `${request.student.first_name} ${request.student.last_name}`
                                )
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {request.student?.first_name}{" "}
                            {request.student?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.student?.department} • Class of{" "}
                            {request.student?.graduation_year}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {request.topics?.map((topic) => (
                              <Badge
                                key={topic}
                                variant="secondary"
                                className="text-xs"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm mt-2">{request.career_goal}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Started{" "}
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleComplete(request.id)}
                          disabled={processing === request.id}
                        >
                          Complete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No pending requests
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={request.student?.avatar_url || ""}
                          />
                          <AvatarFallback>
                            {request.student
                              ? getInitials(
                                  `${request.student.first_name} ${request.student.last_name}`
                                )
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {request.student?.first_name}{" "}
                            {request.student?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.student?.department} • Class of{" "}
                            {request.student?.graduation_year}
                          </p>
                          <p className="text-sm mt-2">{request.message}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {request.topics?.map((topic) => (
                              <Badge
                                key={topic}
                                variant="secondary"
                                className="text-xs"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(request.id)}
                          disabled={processing === request.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {pastMentors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No past mentorships
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastMentors.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={request.student?.avatar_url || ""}
                        />
                        <AvatarFallback>
                          {request.student
                            ? getInitials(
                                `${request.student.first_name} ${request.student.last_name}`
                              )
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {request.student?.first_name}{" "}
                          {request.student?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.student?.department}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        Completed
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => {
          setSelectedRequest(null);
          setResponseMessage("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to reject the mentorship request from{" "}
              {selectedRequest?.student?.first_name}?
            </p>
            <Textarea
              placeholder="Optional message for the student..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  setResponseMessage("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  selectedRequest && handleReject(selectedRequest.id)
                }
                disabled={processing === selectedRequest?.id}
              >
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
