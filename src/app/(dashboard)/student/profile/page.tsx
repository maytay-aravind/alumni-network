'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileCompletionCard } from '@/components/student/ProfileCompletionCard';
import { SkillsSection } from '@/components/student/SkillsSection';
import { ProjectsSection } from '@/components/student/ProjectsSection';
import { getInitials, formatDate, getProfileCompletionPercentage } from '@/lib/utils';
import { DEPARTMENTS, SKILLS, INDUSTRIES, GRADUATION_YEARS, INDIAN_CITIES } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Edit,
  MapPin,
  GraduationCap,
  Building2,
  Link2,
  ExternalLink,
  Globe,
  Award,
  Briefcase,
  Plus,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface SkillItem {
  name: string;
  level: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_url: string | null;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = React.useState<any | null>(null);
  const [skills, setSkills] = React.useState<SkillItem[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);
  const [certifications, setCertifications] = React.useState<Certification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editSection, setEditSection] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, projectsRes, certsRes] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('projects').select('*').eq('student_id', user.id),
        supabase.from('certifications').select('*').eq('student_id', user.id),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setSkills((profileRes.data.skills as SkillItem[]) || []);
      }
      setProjects(projectsRes.data || []);
      setCertifications(certsRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleEditSection = (section: string) => {
    if (!profile) return;
    setEditSection(section);
    setEditForm({
      first_name: (profile.first_name as string) || '',
      last_name: (profile.last_name as string) || '',
      about: (profile.about as string) || '',
      location: (profile.location as string) || '',
      department: (profile.department as string) || '',
      graduation_year: String(profile.graduation_year || ''),
      linkedin_url: (profile.linkedin_url as string) || '',
      github_url: (profile.github_url as string) || '',
    });
  };

  const handleSaveSection = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updateData: Record<string, unknown> = {};

    if (editSection === 'basic') {
      updateData.first_name = editForm.first_name;
      updateData.last_name = editForm.last_name;
      updateData.about = editForm.about;
      updateData.location = editForm.location;
    } else if (editSection === 'education') {
      updateData.department = editForm.department;
      updateData.graduation_year = parseInt(editForm.graduation_year) || null;
    } else if (editSection === 'social') {
      updateData.linkedin_url = editForm.linkedin_url;
      updateData.github_url = editForm.github_url;
    }

    const { error } = await supabase
      .from('student_profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      setProfile((prev: any) => ({ ...prev, ...updateData }));
      toast.success('Profile updated successfully');
      setEditSection(null);
    }
  };

  const handleUpdateSkills = async (newSkills: SkillItem[]) => {
    setSkills(newSkills);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('student_profiles')
      .update({ skills: newSkills })
      .eq('user_id', user.id);
  };

  const handleUpdateProjects = async (newProjects: unknown[]) => {
    setProjects(newProjects as typeof projects);
  };

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  const firstName = profile.first_name as string;
  const lastName = profile.last_name as string;
  const completion = getProfileCompletionPercentage(profile);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <CardContent className="relative p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-background">
              <AvatarImage src={(profile.avatar_url as string) || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(firstName, lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {firstName} {lastName}
                  </h1>
                  <p className="text-muted-foreground">
                    {profile.department as string} • Class of {profile.graduation_year as number}
                  </p>
                  {profile.location && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {profile.location as string}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => handleEditSection('basic')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url as string} target="_blank" rel="noopener noreferrer">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      LinkedIn
                    </Badge>
                  </a>
                )}
                {profile.github_url && (
                  <a href={profile.github_url as string} target="_blank" rel="noopener noreferrer">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      GitHub
                    </Badge>
                  </a>
                )}
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url as string} target="_blank" rel="noopener noreferrer">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      <Globe className="h-3 w-3 mr-1" />
                      Portfolio
                    </Badge>
                  </a>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completion}%</div>
              <p className="text-sm text-muted-foreground">Profile Complete</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <ProfileCompletionCard profile={profile} />
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">About</h3>
                      <p className="text-sm text-muted-foreground">{profile.about as string}</p>
                    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Department</p>
                        <p className="text-xs text-muted-foreground">{profile.department as string}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Graduation Year</p>
                        <p className="text-xs text-muted-foreground">{profile.graduation_year as number}</p>
                      </div>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-xs text-muted-foreground">{profile.location as string}</p>
                        </div>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Link2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-xs text-muted-foreground">{profile.phone as string}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <SkillsSection skills={skills} onUpdate={handleUpdateSkills} />
            </TabsContent>

            <TabsContent value="projects">
              <ProjectsSection projects={projects} onUpdate={handleUpdateProjects} />
            </TabsContent>

            <TabsContent value="certifications">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Certifications</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Certification
                    </Button>
                  </div>
                  {certifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No certifications added yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {certifications.map((cert) => (
                        <div key={cert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                          <Award className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Issued {formatDate(cert.issue_date)}
                              {cert.expiry_date && ` • Expires ${formatDate(cert.expiry_date)}`}
                            </p>
                          </div>
                          {cert.credential_url && (
                            <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm">
                                <Link2 className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            </Tabs>
        </div>
      </div>

      <Dialog open={!!editSection} onOpenChange={() => setEditSection(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {editSection === 'basic' ? 'Basic Info' : editSection === 'education' ? 'Education' : 'Social Links'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editSection === 'basic' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  />
                  <Input
                    label="Last Name"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  />
                </div>
                <Input
                  label="About/Bio"
                  value={editForm.about}
                  onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Location</label>
                  <select
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Select location</option>
                    {INDIAN_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {editSection === 'education' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Department</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Graduation Year</label>
                  <select
                    value={editForm.graduation_year}
                    onChange={(e) => setEditForm({ ...editForm, graduation_year: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    {GRADUATION_YEARS.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {editSection === 'social' && (
              <>
                <Input
                  label="LinkedIn URL"
                  value={editForm.linkedin_url}
                  onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
                <Input
                  label="GitHub URL"
                  value={editForm.github_url}
                  onChange={(e) => setEditForm({ ...editForm, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSection(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSection}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
