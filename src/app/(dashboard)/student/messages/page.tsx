'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getInitials, formatRelativeTime } from '@/lib/utils';
import { Send, Search, MessageSquare } from 'lucide-react';

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message: string;
  last_message_at: string;
  other_user?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [currentUserId, setCurrentUserId] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMobileView, setIsMobileView] = React.useState<'list' | 'chat'>('list');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchConversations();
  }, []);

  React.useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation?.id]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (!error && data) {
      const convsWithUsers = await Promise.all(
        data.map(async (conv) => {
          const otherUserId =
            conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id;
          const { data: userData } = await supabase
            .from('user_profiles')
            .select('first_name, last_name, avatar_url')
            .eq('user_id', otherUserId)
            .single();
          return { ...conv, other_user: userData };
        })
      );
      setConversations(convsWithUsers);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error) setMessages(data || []);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    const supabase = createClient();

    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedConversation.id,
      sender_id: currentUserId,
      content: newMessage,
      is_read: false,
    });

    if (!error) {
      await supabase
        .from('conversations')
        .update({
          last_message: newMessage,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', selectedConversation.id);

      setNewMessage('');
      fetchMessages(selectedConversation.id);
      fetchConversations();
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user
      ? `${conv.other_user.first_name} ${conv.other_user.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] gap-4">
        <Skeleton className="w-80 rounded-xl" />
        <Skeleton className="flex-1 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex h-[calc(100vh-12rem)] rounded-xl border overflow-hidden">
        <div
          className={`w-80 border-r bg-background flex flex-col ${
            isMobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b">
            <h2 className="text-lg font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`w-full p-3 flex items-start gap-3 hover:bg-muted transition-colors text-left ${
                    selectedConversation?.id === conv.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setIsMobileView('chat');
                  }}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(
                        conv.other_user?.first_name || '',
                        conv.other_user?.last_name || ''
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {conv.other_user?.first_name} {conv.other_user?.last_name}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {conv.last_message_at && formatRelativeTime(conv.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                  </div>
                  {(conv.unread_count || 0) > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div
          className={`flex-1 flex flex-col bg-background ${
            isMobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {!selectedConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Choose a conversation from the left panel or start a new one by visiting an alumni's
                profile.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMobileView('list')}
                >
                  ←
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedConversation.other_user?.avatar_url || undefined} />
                  <AvatarFallback>
                    {getInitials(
                      selectedConversation.other_user?.first_name || '',
                      selectedConversation.other_user?.last_name || ''
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {selectedConversation.other_user?.first_name}{' '}
                    {selectedConversation.other_user?.last_name}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        msg.sender_id === currentUserId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          msg.sender_id === currentUserId
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatRelativeTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
