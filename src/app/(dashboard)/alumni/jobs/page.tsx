"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Briefcase,
  Loader2,
  Edit,
  Trash2,
  Eye,
  Users,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { supabase } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { SKILLS_LIST } from "@/lib/constants";
import { toast } from "sonner";
import type { Job } from "@/types";

interface JobFormData {
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  requirements: string;
  skills_required: string;
  salary_range: string;
  application_deadline: string;
  application_url: string;
}

const defaultFormData: JobFormData = {
  title: "",
  company: "",
  location: "",
  job_type: "full-time",
  description: "",
  requirements: "",
  skills_required: "",
  salary_range: "",
  application_deadline: "",
  application_url: "",
};

export default function AlumniJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<JobFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        job_type: formData.job_type,
        description: formData.description,
        requirements: formData.requirements
          .split("\n")
          .filter((r) => r.trim()),
        skills_required: formData.skills_required
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        salary_range: formData.salary_range || null,
        application_deadline: formData.application_deadline
          ? new Date(formData.application_deadline).toISOString()
          : new Date().toISOString(),
        application_url: formData.application_url || null,
        is_active: true,
        applications_count: 0,
      };

      if (editingJob) {
        const { error } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", editingJob.id);

        if (error) throw error;
        toast.success("Job updated successfully");
      } else {
        const { error } = await supabase.from("jobs").insert(jobData);
        if (error) throw error;
        toast.success("Job posted successfully");
      }

      setShowCreateModal(false);
      setEditingJob(null);
      setFormData(defaultFormData);
      fetchJobs();
    } catch (error) {
      toast.error(editingJob ? "Failed to update job" : "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job posting?")) return;
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
      setJobs(jobs.filter((j) => j.id !== id));
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ is_active: !current })
        .eq("id", id);

      if (error) throw error;
      setJobs(jobs.map((j) => (j.id === id ? { ...j, is_active: !current } : j)));
      toast.success(current ? "Job deactivated" : "Job activated");
    } catch {
      toast.error("Failed to update job status");
    }
  };

  const viewApplications = async (job: Job) => {
    setSelectedJob(job);
    const { data } = await supabase
      .from("job_applications")
      .select("*, student_profiles(first_name, last_name, email)")
      .eq("job_id", job.id);

    setApplications(data || []);
  };

  const columns: Column<Job>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (job) => (
        <div>
          <p className="font-medium text-sm">{job.title}</p>
          <p className="text-xs text-muted-foreground">{job.company}</p>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
      render: (job) => <span className="text-sm">{job.location}</span>,
    },
    {
      key: "job_type",
      label: "Type",
      render: (job) => (
        <Badge variant="secondary" className="capitalize">
          {job.job_type.replace("-", " ")}
        </Badge>
      ),
    },
    {
      key: "applications_count",
      label: "Applications",
      sortable: true,
      render: (job) => (
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-3 w-3" />
          {job.applications_count}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (job) => (
        <Badge variant={job.is_active ? "success" : "secondary"}>
          {job.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Job & Referral Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Post jobs and manage referrals
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingJob(null);
            setFormData(defaultFormData);
            setShowCreateModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Post Job
        </Button>
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
              data={jobs}
              searchPlaceholder="Search jobs..."
              pageSize={10}
              emptyMessage="No job postings found"
              onRowClick={(job) => viewApplications(job)}
              actions={(job) => (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => viewApplications(job)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingJob(job);
                      setFormData({
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        job_type: job.job_type,
                        description: job.description,
                        requirements: job.requirements?.join("\n") || "",
                        skills_required: job.skills_required?.join(", ") || "",
                        salary_range: job.salary_range || "",
                        application_deadline: job.application_deadline
                          ? job.application_deadline.slice(0, 10)
                          : "",
                        application_url: job.application_url || "",
                      });
                      setShowCreateModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(job.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? "Edit Job" : "Post a Job"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Job Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.job_type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData({ ...formData, job_type: e.target.value })
                  }
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                required
              />
            </div>
            <div>
              <Label>Requirements (one per line)</Label>
              <Textarea
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label>Required Skills (comma-separated)</Label>
              <Input
                value={formData.skills_required}
                onChange={(e) =>
                  setFormData({ ...formData, skills_required: e.target.value })
                }
                placeholder="React, Node.js, TypeScript"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Salary Range</Label>
                <Input
                  value={formData.salary_range}
                  onChange={(e) =>
                    setFormData({ ...formData, salary_range: e.target.value })
                  }
                  placeholder="₹5-10 LPA"
                />
              </div>
              <div>
                <Label>Application Deadline</Label>
                <Input
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      application_deadline: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Application URL</Label>
              <Input
                value={formData.application_url}
                onChange={(e) =>
                  setFormData({ ...formData, application_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingJob(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingJob ? "Update Job" : "Post Job"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedJob}
        onOpenChange={() => {
          setSelectedJob(null);
          setApplications([]);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Applications</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedJob.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedJob.company}
                </p>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {applications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No applications yet
                  </p>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {app.student_profiles?.first_name}{" "}
                          {app.student_profiles?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.student_profiles?.email}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {app.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
