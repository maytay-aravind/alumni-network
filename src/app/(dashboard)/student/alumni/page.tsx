'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlumniCard } from '@/components/alumni/AlumniCard';
import { EmptyState } from '@/components/ui/empty-state';
import { DEPARTMENTS, SKILLS, INDUSTRIES, GRADUATION_YEARS, INDIAN_CITIES } from '@/lib/constants';
import { toast } from 'sonner';
import { Search, Filter, X, ChevronDown, Users } from 'lucide-react';

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState({
    department: '',
    industry: '',
    location: '',
    graduation_year: '',
    skills: '',
  });
  const [sortBy, setSortBy] = React.useState('name');
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    fetchAlumni();
  }, [filters, sortBy, page]);

  const fetchAlumni = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('alumni_profiles')
      .select('*')
      .limit(12)
      .range((page - 1) * 12, page * 12 - 1);

    if (searchQuery) {
      query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,current_company.ilike.%${searchQuery}%`);
    }
    if (filters.department) query = query.eq('department', filters.department);
    if (filters.industry) query = query.eq('industry', filters.industry);
    if (filters.location) query = query.eq('location', filters.location);
    if (filters.graduation_year) query = query.eq('graduation_year', parseInt(filters.graduation_year));
    if (filters.skills) {
      query = query.contains('skills', [filters.skills]);
    }

    if (sortBy === 'name') query = query.order('first_name', { ascending: true });
    if (sortBy === 'company') query = query.order('current_company', { ascending: true });
    if (sortBy === 'experience') query = query.order('years_of_experience', { ascending: false });
    if (sortBy === 'graduation_year') query = query.order('graduation_year', { ascending: false });

    const { data, error } = await query;

    if (!error && data) {
      setAlumni(data);
      setHasMore(data.length === 12);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    fetchAlumni();
  };

  const handleConnect = async (alumniId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('connections').insert({
      requester_id: user.id,
      receiver_id: alumniId,
      status: 'pending',
    });

    if (error) {
      toast.error('Failed to send connection request');
    } else {
      toast.success('Connection request sent!');
    }
  };

  const clearFilters = () => {
    setFilters({ department: '', industry: '', location: '', graduation_year: '', skills: '' });
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Alumni Directory</h1>
          <p className="text-muted-foreground">Connect with alumni from your institution</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search alumni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="animate-fade-in-down">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Industry</label>
                <select
                  value={filters.industry}
                  onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">All Industries</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">All Locations</option>
                  {INDIAN_CITIES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Graduation Year</label>
                <select
                  value={filters.graduation_year}
                  onChange={(e) => setFilters({ ...filters, graduation_year: e.target.value })}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">All Years</option>
                  {GRADUATION_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
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
            <div className="flex items-center justify-between mt-4">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex h-8 rounded-md border bg-transparent px-2 text-sm"
                >
                  <option value="name">Name</option>
                  <option value="company">Company</option>
                  <option value="experience">Experience</option>
                  <option value="graduation_year">Graduation Year</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-1 mt-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : alumni.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No alumni found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alumni.map((a: Record<string, unknown>) => (
              <AlumniCard
                key={a.id as string}
                alumni={{
                  id: a.id as string,
                  first_name: a.first_name as string,
                  last_name: a.last_name as string,
                  avatar_url: a.avatar_url as string | null,
                  current_company: a.current_company as string | null,
                  current_position: a.current_position as string | null,
                  department: a.department as string,
                  graduation_year: a.graduation_year as number,
                  skills: (a.skills as string[]) || [],
                  location: a.location as string | null,
                  is_verified: (a as Record<string, unknown>).is_verified as boolean,
                }}
                onConnect={() => handleConnect(a.id as string)}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
