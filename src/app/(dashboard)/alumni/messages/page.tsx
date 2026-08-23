"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Search,
  MessageSquare,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage, getInitials } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message: string;
  last_message_at: string;
  otherUser?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
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

export default function AlumniMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `participant1_id.eq.${user.id},participant2_id.eq.${user.id}`
        )
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      const convsWithUsers = await Promise.all(
        (data || []).map(async (conv) => {
          const otherId =
            conv.participant1_id === user.id
              ? conv.participant2_id
              : conv.participant1_id;

          const { data: profile } = await supabase
            .from("alumni_profiles")
            .select("first_name, last_name, avatar_url")
            .eq("user_id", otherId)
            .single();

          return { ...conv, otherUser: profile };
        })
      );

      setConversations(convsWithUsers);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentUserId);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setSending(true);

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        sender_id: currentUserId,
        content: newMessage,
      });

      if (error) throw error;

      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          conversation_id: selectedConversation.id,
          sender_id: currentUserId,
          content: newMessage,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);

      await supabase
        .from("conversations")
        .update({
          last_message: newMessage,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", selectedConversation.id);

      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!search) return true;
    const name = conv.otherUser
      ? `${conv.otherUser.first_name} ${conv.otherUser.last_name}`
      : "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)]">
      <div className="flex h-full rounded-lg border overflow-hidden">
        <div
          className={`w-80 border-r bg-card flex flex-col ${
            selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No conversations yet
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`w-full p-4 text-left hover:bg-muted/50 border-b transition-colors ${
                    selectedConversation?.id === conv.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conv.otherUser?.avatar_url} />
                      <AvatarFallback>
                        {conv.otherUser
                          ? getInitials(
                              `${conv.otherUser.first_name} ${conv.otherUser.last_name}`
                            )
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {conv.otherUser
                            ? `${conv.otherUser.first_name} ${conv.otherUser.last_name}`
                            : "Unknown"}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(conv.last_message_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.last_message}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div
          className={`flex-1 flex flex-col bg-background ${
            !selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Select a conversation</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={selectedConversation.otherUser?.avatar_url} />
                  <AvatarFallback>
                    {selectedConversation.otherUser
                      ? getInitials(
                          `${selectedConversation.otherUser.first_name} ${selectedConversation.otherUser.last_name}`
                        )
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {selectedConversation.otherUser
                      ? `${selectedConversation.otherUser.first_name} ${selectedConversation.otherUser.last_name}`
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.sender_id === currentUserId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender_id === currentUserId
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatRelativeTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
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
