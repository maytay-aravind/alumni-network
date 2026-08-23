'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { MENTORSHIP_TOPICS } from '@/lib/constants';
import { getInitials, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Search, GraduationCap, Clock, Users, Send, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function MentorshipPage() {
  const [mentors, setMentors] = React.useState<any[]>([]);
  const [myMentors, setMyMentors] = React.useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('mentors');
  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [selectedAlumni, setSelectedAlumni] = React.useState<any | null>(null);
  const [requestForm, setRequestForm] = React.useState({
    career_goal: '',
    reason: '',
    topics: [] as string[],
    message: '',
  });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [mentorsRes, myMentorsRes, pendingRes] = await Promise.all([
      supabase
        .from('alumni_profiles')
        .select('*')
        .eq('is_mentor', true)
        .eq('mentorship_availability', 'available'),
      supabase
        .from('mentorship_requests')
        .select('*, alumni:alumni_profiles(*)')
        .eq('student_id', user.id)
        .eq('status', 'accepted'),
      supabase
        .from('mentorship_requests')
        .select('*, alumni:alumni_profiles(*)')
        .eq('student_id', user.id)
        .eq('status', 'pending'),
    ]);

    setMentors(mentorsRes.data || []);
    setMyMentors(myMentorsRes.data || []);
    setPendingRequests(pendingRes.data || []);
    setLoading(false);
  };

  const handleRequestMentorship = async () => {
    if (!selectedAlumni) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('mentorship_requests').insert({
      student_id: user.id,
      alumni_id: selectedAlumni.user_id,
      career_goal: requestForm.career_goal,
      reason: requestForm.reason,
      topics: requestForm.topics,
      message: requestForm.message,
      status: 'pending',
    });

    if (error) {
      toast.error('Failed to send request');
    } else {
      toast.success('Mentorship request sent!');
      setShowRequestModal(false);
      setRequestForm({ career_goal: '', reason: '', topics: [], message: '' });
      fetchData();
    }
  };

  const toggleTopic = (topic: string) => {
    setRequestForm((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Mentorship</h1>
        <p className="text-muted-foreground">Connect with experienced alumni mentors</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="mentors" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Find Mentors
          </TabsTrigger>
          <TabsTrigger value="my-mentors" className="gap-2">
            <Users className="h-4 w-4" />
            My Mentors ({myMentors.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentors">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors
              .filter((m: Record<string, unknown>) =>
                `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((mentor: Record<string, unknown>) => (
                <Card key={mentor.id as string} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={mentor.avatar_url as string} />
                        <AvatarFallback>
                          {getInitials(mentor.first_name as string, mentor.last_name as string)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {mentor.first_name as string} {mentor.last_name as string}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {mentor.current_position as string} at {mentor.current_company as string}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(mentor.mentorship_topics as string[])?.slice(0, 3).map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-[10px]">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link href={`/student/alumni/${mentor.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedAlumni(mentor);
                          setShowRequestModal(true);
                        }}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="my-mentors">
          {myMentors.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="h-8 w-8" />}
              title="No active mentors"
              description="Request mentorship from alumni to get started"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myMentors.map((req: Record<string, unknown>) => {
                const alumni = req.alumni as Record<string, unknown>;
                return (
                  <Card key={req.id as string}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={alumni?.avatar_url as string} />
                          <AvatarFallback>
                            {getInitials(alumni?.first_name as string, alumni?.last_name as string)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {alumni?.first_name as string} {alumni?.last_name as string}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {alumni?.current_position as string}
                          </p>
                          <Badge variant="success" className="mt-1">Active Mentorship</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link href={`/student/messages?user=${alumni?.user_id}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingRequests.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-8 w-8" />}
              title="No pending requests"
              description="Your sent mentorship requests will appear here"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((req: Record<string, unknown>) => {
                const alumni = req.alumni as Record<string, unknown>;
                return (
                  <Card key={req.id as string}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={alumni?.avatar_url as string} />
                          <AvatarFallback>
                            {getInitials(alumni?.first_name as string, alumni?.last_name as string)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {alumni?.first_name as string} {alumni?.last_name as string}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {alumni?.current_position as string}
                          </p>
                          <Badge variant="warning" className="mt-1">Pending</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Career Goal"
              value={requestForm.career_goal}
              onChange={(e) => setRequestForm({ ...requestForm, career_goal: e.target.value })}
              placeholder="What's your primary career goal?"
            />
            <Textarea
              label="Why this mentor?"
              value={requestForm.reason}
              onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
              placeholder="Explain why you want this mentor..."
            />
            <div>
              <label className="mb-2 block text-sm font-medium">Topics</label>
              <div className="flex flex-wrap gap-2">
                {MENTORSHIP_TOPICS.map((topic) => (
                  <Badge
                    key={topic}
                    variant={requestForm.topics.includes(topic) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
            <Textarea
              label="Message"
              value={requestForm.message}
              onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
              placeholder="Write a message to your potential mentor..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestMentorship}
              disabled={!requestForm.career_goal || !requestForm.message}
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
