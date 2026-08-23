"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  ShieldCheck,
  ShieldOff,
  GraduationCap,
  Loader2,
  Mail,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { AlumniProfile } from "@/types";

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(
    null
  );

  useEffect(() => {
    fetchAlumni();
  }, []);

  async function fetchAlumni() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("alumni_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlumni(data || []);
    } catch (error) {
      toast.error("Failed to fetch alumni");
    } finally {
      setLoading(false);
    }
  }

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("alumni_profiles")
        .update({ is_verified: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setAlumni(
        alumni.map((a) =>
          a.id === id ? { ...a, is_verified: !currentStatus } : a
        )
      );
      toast.success(
        currentStatus ? "Alumni unverified" : "Alumni verified"
      );
    } catch (error) {
      toast.error("Failed to update verification status");
    }
  };

  const toggleMentor = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("alumni_profiles")
        .update({ is_mentor: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setAlumni(
        alumni.map((a) =>
          a.id === id ? { ...a, is_mentor: !currentStatus } : a
        )
      );
      toast.success(
        currentStatus ? "Removed as mentor" : "Added as mentor"
      );
    } catch (error) {
      toast.error("Failed to update mentor status");
    }
  };

  const columns: Column<AlumniProfile>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (alum) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={alum.avatar_url || ""} />
            <AvatarFallback className="text-xs">
              {alum.first_name[0]}
              {alum.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {alum.first_name} {alum.last_name}
            </p>
            <p className="text-xs text-muted-foreground">{alum.user_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "current_company",
      label: "Company",
      sortable: true,
      render: (alum) => (
        <span className="text-sm">{alum.current_company || "N/A"}</span>
      ),
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (alum) => <span className="text-sm">{alum.department}</span>,
    },
    {
      key: "is_verified",
      label: "Verified",
      sortable: true,
      render: (alum) => (
        <Badge variant={alum.is_verified ? "success" : "secondary"}>
          {alum.is_verified ? "Verified" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "is_mentor",
      label: "Mentor",
      sortable: true,
      render: (alum) => (
        <Badge variant={alum.is_mentor ? "default" : "outline"}>
          {alum.is_mentor ? "Mentor" : "No"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alumni Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage and verify alumni profiles
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={alumni}
              searchPlaceholder="Search alumni..."
              pageSize={10}
              emptyMessage="No alumni found"
              onRowClick={(alum) => setSelectedAlumni(alum)}
              actions={(alum) => (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedAlumni(alum)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      toggleVerification(alum.id, alum.is_verified)
                    }
                  >
                    {alum.is_verified ? (
                      <ShieldOff className="h-4 w-4 text-amber-500" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    )}
                  </Button>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedAlumni}
        onOpenChange={() => setSelectedAlumni(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Alumni Profile</DialogTitle>
          </DialogHeader>
          {selectedAlumni && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedAlumni.avatar_url || ""} />
                  <AvatarFallback className="text-lg">
                    {selectedAlumni.first_name[0]}
                    {selectedAlumni.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedAlumni.first_name} {selectedAlumni.last_name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedAlumni.current_company}
                    {selectedAlumni.current_position &&
                      ` • ${selectedAlumni.current_position}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Department
                  </p>
                  <p className="text-sm">{selectedAlumni.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Graduation Year
                  </p>
                  <p className="text-sm">{selectedAlumni.graduation_year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Industry
                  </p>
                  <p className="text-sm">
                    {selectedAlumni.industry || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Location
                  </p>
                  <p className="text-sm">
                    {selectedAlumni.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verification
                  </p>
                  <Badge
                    variant={selectedAlumni.is_verified ? "success" : "secondary"}
                  >
                    {selectedAlumni.is_verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Mentor Status
                  </p>
                  <Badge
                    variant={selectedAlumni.is_mentor ? "default" : "outline"}
                  >
                    {selectedAlumni.is_mentor ? "Mentor" : "Not a Mentor"}
                  </Badge>
                </div>
              </div>

              {selectedAlumni.about && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    About
                  </p>
                  <p className="text-sm">{selectedAlumni.about}</p>
                </div>
              )}

              {selectedAlumni.skills && selectedAlumni.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlumni.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant={selectedAlumni.is_verified ? "outline" : "default"}
                  size="sm"
                  onClick={() =>
                    toggleVerification(
                      selectedAlumni.id,
                      selectedAlumni.is_verified
                    )
                  }
                >
                  {selectedAlumni.is_verified ? (
                    <>
                      <ShieldOff className="h-4 w-4 mr-2" />
                      Unverify
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Verify
                    </>
                  )}
                </Button>
                <Button
                  variant={selectedAlumni.is_mentor ? "outline" : "default"}
                  size="sm"
                  onClick={() =>
                    toggleMentor(selectedAlumni.id, selectedAlumni.is_mentor)
                  }
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {selectedAlumni.is_mentor ? "Remove Mentor" : "Make Mentor"}
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
