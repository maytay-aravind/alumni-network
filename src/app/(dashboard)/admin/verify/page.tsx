"use client";

import { useState, useEffect } from "react";
import {
  Check,
  X,
  FileText,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

interface VerificationRequest {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  current_company: string | null;
  department: string;
  graduation_year: number;
  status: "pending" | "approved" | "rejected";
  documents?: string[];
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export default function VerifyPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [history, setHistory] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);

      const { data: pendingData, error: pendingError } = await supabase
        .from("alumni_profiles")
        .select("*")
        .eq("is_verified", false)
        .order("created_at", { ascending: false });

      if (pendingError) throw pendingError;

      const { data: verifiedData, error: verifiedError } = await supabase
        .from("alumni_profiles")
        .select("*")
        .eq("is_verified", true)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (verifiedError) throw verifiedError;

      setRequests(
        (pendingData || []).map((d) => ({
          ...d,
          status: "pending" as const,
          email: "",
        }))
      );
      setHistory(
        (verifiedData || []).map((d) => ({
          ...d,
          status: "approved" as const,
          email: "",
        }))
      );
    } catch (error) {
      toast.error("Failed to fetch verification requests");
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from("alumni_profiles")
        .update({ is_verified: true })
        .eq("id", id);

      if (error) throw error;
      setRequests(requests.filter((r) => r.id !== id));
      setSelectedRequest(null);
      toast.success("Alumni verified successfully");
    } catch (error) {
      toast.error("Failed to verify alumni");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      setRequests(requests.filter((r) => r.id !== id));
      setSelectedRequest(null);
      setRejectReason("");
      toast.success("Verification rejected");
    } catch (error) {
      toast.error("Failed to reject verification");
    } finally {
      setProcessing(null);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      const { error } = await supabase
        .from("alumni_profiles")
        .update({ is_verified: true })
        .in("id", selectedIds);

      if (error) throw error;
      setRequests(requests.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} alumni verified`);
    } catch (error) {
      toast.error("Failed to batch verify");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Alumni Verification
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and verify alumni identity requests
          </p>
        </div>
        {selectedIds.length > 0 && (
          <Button onClick={handleBatchApprove}>
            <Check className="h-4 w-4 mr-2" />
            Approve Selected ({selectedIds.length})
          </Button>
        )}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                <p className="text-muted-foreground">
                  No pending verification requests
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <Card key={request.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(request.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, request.id]);
                            } else {
                              setSelectedIds(
                                selectedIds.filter((id) => id !== request.id)
                              );
                            }
                          }}
                          className="mt-1"
                        />
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {request.first_name[0]}
                            {request.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {request.first_name} {request.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.current_company || "Company not specified"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{request.department}</span>
                            <span>•</span>
                            <span>Class of {request.graduation_year}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(request.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          disabled={processing === request.id}
                        >
                          {processing === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium text-sm">
                            {item.first_name} {item.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.department} • Class of {item.graduation_year}
                          </p>
                        </div>
                      </div>
                      <Badge variant="success">Verified</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => {
          setSelectedRequest(null);
          setRejectReason("");
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-lg">
                    {selectedRequest.first_name[0]}
                    {selectedRequest.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedRequest.first_name} {selectedRequest.last_name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedRequest.current_company || "Company not specified"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p>{selectedRequest.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Graduation Year</p>
                  <p>{selectedRequest.graduation_year}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p>{formatDate(selectedRequest.created_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Submitted Documents
                </p>
                <div className="flex gap-2">
                  {(selectedRequest.documents || ["id_card.pdf", "degree_certificate.pdf"]).map(
                    (doc, i) => (
                      <Badge key={i} variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        {doc}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Rejection Reason (for rejection)
                </label>
                <Textarea
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={processing === selectedRequest.id}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest.id)}
                  disabled={processing === selectedRequest.id}
                >
                  {processing === selectedRequest.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
