'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getInitials, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Search, Users, UserPlus, Clock, Check, X, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ConnectionsPage() {
  const [connections, setConnections] = React.useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = React.useState<any[]>([]);
  const [pendingSent, setPendingSent] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('connections');

  React.useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [acceptedRes, pendingReceivedRes, pendingSentRes] = await Promise.all([
      supabase
        .from('connections')
        .select('*, requester:user_profiles!connections_requester_id_fkey(*), receiver:user_profiles!connections_receiver_id_fkey(*)')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
      supabase
        .from('connections')
        .select('*, requester:user_profiles!connections_requester_id_fkey(*)')
        .eq('status', 'pending')
        .eq('receiver_id', user.id),
      supabase
        .from('connections')
        .select('*, receiver:user_profiles!connections_receiver_id_fkey(*)')
        .eq('status', 'pending')
        .eq('requester_id', user.id),
    ]);

    setConnections(acceptedRes.data || []);
    setPendingReceived(pendingReceivedRes.data || []);
    setPendingSent(pendingSentRes.data || []);
    setLoading(false);
  };

  const handleAccept = async (connectionId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId);

    if (error) {
      toast.error('Failed to accept connection');
    } else {
      toast.success('Connection accepted!');
      fetchConnections();
    }
  };

  const handleReject = async (connectionId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('connections')
      .update({ status: 'rejected' })
      .eq('id', connectionId);

    if (error) {
      toast.error('Failed to reject connection');
    } else {
      toast.success('Connection rejected');
      fetchConnections();
    }
  };

  const handleCancel = async (connectionId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);

    if (error) {
      toast.error('Failed to cancel request');
    } else {
      toast.success('Request cancelled');
      fetchConnections();
    }
  };

  const handleRemove = async (connectionId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);

    if (error) {
      toast.error('Failed to remove connection');
    } else {
      toast.success('Connection removed');
      fetchConnections();
    }
  };

  const getOtherUser = (connection: Record<string, unknown>, userId: string) => {
    const requester = connection.requester as Record<string, unknown>;
    const receiver = connection.receiver as Record<string, unknown>;
    return (requester?.user_id === userId ? receiver : requester) as Record<string, unknown> | undefined;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Connections</h1>
        <p className="text-muted-foreground">Manage your professional network</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="connections" className="gap-2">
            <Users className="h-4 w-4" />
            My Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="received" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Received ({pendingReceived.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Clock className="h-4 w-4" />
            Sent ({pendingSent.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search connections..." className="pl-10 max-w-md" />
          </div>
          {connections.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="No connections yet"
              description="Start connecting with alumni to build your network"
              action={{ label: 'Find Alumni', onClick: () => window.location.href = '/student/alumni' }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((conn: Record<string, unknown>) => {
                const user = getOtherUser(conn, '') || {};
                return (
                  <Card key={conn.id as string} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url as string} />
                          <AvatarFallback>
                            {getInitials(user.first_name as string, user.last_name as string)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {user.first_name as string} {user.last_name as string}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.current_position as string} at {user.current_company as string}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link href={`/student/alumni/${user.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View Profile
                          </Button>
                        </Link>
                        <Link href={`/student/messages?user=${user.user_id}`} className="flex-1">
                          <Button size="sm" className="w-full">
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

        <TabsContent value="received">
          {pendingReceived.length === 0 ? (
            <EmptyState
              icon={<UserPlus className="h-8 w-8" />}
              title="No pending requests"
              description="You have no incoming connection requests"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingReceived.map((conn: Record<string, unknown>) => {
                const requester = conn.requester as Record<string, unknown>;
                return (
                  <Card key={conn.id as string}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={requester?.avatar_url as string} />
                          <AvatarFallback>
                            {getInitials(requester?.first_name as string, requester?.last_name as string)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {requester?.first_name as string} {requester?.last_name as string}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {requester?.current_position as string} at {requester?.current_company as string}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(conn.created_at as string)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAccept(conn.id as string)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleReject(conn.id as string)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {pendingSent.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-8 w-8" />}
              title="No sent requests"
              description="You have no pending outgoing requests"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingSent.map((conn: Record<string, unknown>) => {
                const receiver = conn.receiver as Record<string, unknown>;
                return (
                  <Card key={conn.id as string}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={receiver?.avatar_url as string} />
                          <AvatarFallback>
                            {getInitials(receiver?.first_name as string, receiver?.last_name as string)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {receiver?.first_name as string} {receiver?.last_name as string}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {receiver?.current_position as string} at {receiver?.current_company as string}
                          </p>
                          <Badge variant="warning" className="mt-1">Pending</Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => handleCancel(conn.id as string)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancel Request
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
