"use client";

import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import type { Job } from "@/types";

interface JobCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  saved?: boolean;
}

const jobTypeColors: Record<string, string> = {
  "full-time": "bg-emerald-100 text-emerald-600",
  "part-time": "bg-blue-100 text-blue-600",
  internship: "bg-purple-100 text-purple-600",
  contract: "bg-amber-100 text-amber-600",
};

export function JobCard({ job, onSave, onApply, saved = false }: JobCardProps) {
  const typeColor = jobTypeColors[job.job_type] || "bg-gray-100 text-gray-600";
  const isExpired =
    job.application_deadline && new Date(job.application_deadline) < new Date();

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", saved && "text-primary")}
            onClick={() => onSave?.(job.id)}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="secondary" className={cn("capitalize", typeColor)}>
            {job.job_type.replace("-", " ")}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </div>
          {job.salary_range && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              {job.salary_range}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {job.description}
        </p>

        {job.skills_required && job.skills_required.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills_required.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills_required.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{job.skills_required.length - 5}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            {job.application_deadline
              ? `Deadline: ${formatDate(job.application_deadline)}`
              : "Open"}
            {isExpired && (
              <span className="text-red-500 ml-2">Expired</span>
            )}
          </div>
          <div className="flex gap-2">
            {job.application_url && (
              <Button variant="outline" size="sm">
                <a
                  href={job.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Apply
                </a>
              </Button>
            )}
            {!job.application_url && !isExpired && (
              <Button size="sm" onClick={() => onApply?.(job.id)}>
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
