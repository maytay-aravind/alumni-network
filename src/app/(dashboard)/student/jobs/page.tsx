'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getJobTypeBadgeVariant, formatDate } from '@/lib/utils';
import { JOB_TYPES, SKILLS } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Filter,
  X,
  Send,
} from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [savedJobs, setSavedJobs] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState({
    job_type: '',
    location: '',
    skills: '',
  });
  const [selectedJob, setSelectedJob] = React.useState<any | null>(null);
  const [showApplyModal, setShowApplyModal] = React.useState(false);
  const [coverLetter, setCoverLetter] = React.useState('');

  React.useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);
    }
    if (filters.job_type) query = query.eq('job_type', filters.job_type);
    if (filters.location) query = query.ilike('location', `%${filters.location}%`);
    if (filters.skills) query = query.contains('skills_required', [filters.skills]);

    const { data, error } = await query;
    if (!error) setJobs(data || []);
    setLoading(false);
  };

  const handleSaveJob = async (jobId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (savedJobs.includes(jobId)) {
      await supabase.from('saved_jobs').delete().eq('job_id', jobId).eq('student_id', user.id);
      setSavedJobs(savedJobs.filter((id) => id !== jobId));
      toast.success('Job removed from saved');
    } else {
      await supabase.from('saved_jobs').insert({ job_id: jobId, student_id: user.id });
      setSavedJobs([...savedJobs, jobId]);
      toast.success('Job saved!');
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('job_applications').insert({
      job_id: selectedJob.id,
      student_id: user.id,
      cover_letter: coverLetter,
      status: 'applied',
    });

    if (error) {
      toast.error('Failed to apply');
    } else {
      toast.success('Application submitted!');
      setShowApplyModal(false);
      setCoverLetter('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Job Board</h1>
          <p className="text-muted-foreground">Find opportunities from top companies</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="animate-fade-in-down">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Job Type</label>
                <select
                  value={filters.job_type}
                  onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">All Types</option>
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="Filter by location"
              />
              <div>
                <label className="mb-1 block text-sm font-medium">Skills</label>
                <select
                  value={filters.skills}
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">All Skills</option>
                  {SKILLS.slice(0, 20).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setFilters({ job_type: '', location: '', skills: '' })}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Briefcase className="h-4 w-4" />
            All Jobs
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-8 w-8" />}
              title="No jobs found"
              description="Try adjusting your search or filters"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job: Record<string, unknown>) => (
                <Card key={job.id as string} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{job.title as string}</h3>
                          <Badge variant={getJobTypeBadgeVariant(job.job_type as string)}>
                            {job.job_type as string}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.company as string}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location as string}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Deadline: {formatDate(job.application_deadline as string)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(job.skills_required as string[])?.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSaveJob(job.id as string)}
                      >
                        {savedJobs.includes(job.id as string) ? (
                          <BookmarkCheck className="h-4 w-4 mr-1" />
                        ) : (
                          <Bookmark className="h-4 w-4 mr-1" />
                        )}
                        {savedJobs.includes(job.id as string) ? 'Saved' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedJob(job);
                          setShowApplyModal(true);
                        }}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
          <EmptyState
            icon={<Bookmark className="h-8 w-8" />}
            title="No saved jobs"
            description="Save jobs to review them later"
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply to {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="font-medium">{selectedJob?.company as string}</p>
              <p className="text-sm text-muted-foreground">{selectedJob?.location as string}</p>
            </div>
            <Textarea
              label="Cover Letter (optional)"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write a brief cover letter..."
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
