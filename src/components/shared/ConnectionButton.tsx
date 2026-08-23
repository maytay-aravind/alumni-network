"use client";

import { useState } from "react";
import { UserPlus, Check, X, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ConnectionButtonProps {
  currentUserId: string;
  targetUserId: string;
  initialStatus?: "none" | "pending" | "accepted" | "rejected";
  connectionId?: string;
  onStatusChange?: (status: string) => void;
}

export function ConnectionButton({
  currentUserId,
  targetUserId,
  initialStatus = "none",
  connectionId,
  onStatusChange,
}: ConnectionButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(connectionId);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("connections")
        .insert({
          requester_id: currentUserId,
          receiver_id: targetUserId,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      setStatus("pending");
      setId(data.id);
      onStatusChange?.("pending");
      toast.success("Connection request sent");
    } catch (err) {
      toast.error("Failed to send connection request");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", id);

      if (error) throw error;
      setStatus("accepted");
      onStatusChange?.("accepted");
      toast.success("Connection accepted");
    } catch (err) {
      toast.error("Failed to accept connection");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;
      setStatus("rejected");
      onStatusChange?.("rejected");
      toast.success("Connection rejected");
    } catch (err) {
      toast.error("Failed to reject connection");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setStatus("none");
      setId(undefined);
      onStatusChange?.("none");
      toast.success("Connection removed");
    } catch (err) {
      toast.error("Failed to remove connection");
    } finally {
      setLoading(false);
    }
  };

  if (status === "accepted") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleDisconnect}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Check className="h-4 w-4" />
            Connected
          </>
        )}
      </Button>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleAccept}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Check className="h-4 w-4" />
              Accept
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={loading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleConnect}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Connect
        </>
      )}
    </Button>
  );
}
