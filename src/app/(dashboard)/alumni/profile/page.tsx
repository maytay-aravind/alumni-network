"use client";

import { useState, useEffect } from "react";
import {
  User,
  Save,
  Loader2,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Award,
  Link as LinkIcon,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import { DEPARTMENTS, SKILLS_LIST } from "@/lib/constants";
import { toast } from "sonner";
import type { AlumniProfile } from "@/types";

export default function AlumniProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<AlumniProfile>>({});
  const [newSkill, setNewSkill] = useState("");
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
    year: new Date().getFullYear(),
    type: "award" as const,
  });
  const [newExperience, setNewExperience] = useState({
    company: "",
    position: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("alumni_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) setProfile(data);
    } catch (error) {
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("alumni_profiles").upsert({
        user_id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Profile saved successfully");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setProfile({
      ...profile,
      skills: [...(profile.skills || []), newSkill.trim()],
    });
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: (profile.skills || []).filter((s) => s !== skill),
    });
  };

  const addAchievement = () => {
    if (!newAchievement.title) return;
    setProfile({
      ...profile,
      achievements: [
        ...(profile.achievements || []),
        { ...newAchievement, id: Date.now().toString() },
      ],
    });
    setNewAchievement({ title: "", description: "", year: new Date().getFullYear(), type: "award" });
  };

  const removeAchievement = (id: string) => {
    setProfile({
      ...profile,
      achievements: (profile.achievements || []).filter((a) => a.id !== id),
    });
  };

  const addExperience = () => {
    if (!newExperience.company || !newExperience.position) return;
    setProfile({
      ...profile,
      career_journey: [
        ...(profile.career_journey || []),
        { ...newExperience, id: Date.now().toString() },
      ],
    });
    setNewExperience({
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: "",
    });
  };

  const removeExperience = (id: string) => {
    setProfile({
      ...profile,
      career_journey: (profile.career_journey || []).filter(
        (e) => e.id !== id
      ),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your alumni profile information
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="links">Portfolio Links</TabsTrigger>
          <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={profile.first_name || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={profile.last_name || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, last_name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={profile.phone || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>About</Label>
                <Textarea
                  value={profile.bio || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={profile.department || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setProfile({ ...profile, department: e.target.value })
                    }
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Graduation Year</Label>
                  <Input
                    type="number"
                    value={profile.graduation_year || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        graduation_year: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Company</Label>
                  <Input
                    value={profile.current_company || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        current_company: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Current Role</Label>
                  <Input
                    value={profile.current_role || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, current_role: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Industry</Label>
                  <Input
                    value={profile.industry || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, industry: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={profile.location || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  value={profile.years_of_experience || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      years_of_experience: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                />
                <Button onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile.skills || []).map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Suggested Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {SKILLS_LIST.filter(
                    (s) => !(profile.skills || []).includes(s)
                  )
                    .slice(0, 10)
                    .map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => {
                          setProfile({
                            ...profile,
                            skills: [...(profile.skills || []), skill],
                          });
                        }}
                      >
                        + {skill}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company</Label>
                  <Input
                    value={newExperience.company}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        company: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input
                    value={newExperience.position}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        position: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newExperience.start_date}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        start_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={newExperience.end_date}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        end_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newExperience.description}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
              <Button onClick={addExperience}>
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>

              <div className="space-y-3 mt-4">
                {(profile.career_journey || []).map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-start justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-sm">{exp.position}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.company}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exp.start_date} - {exp.end_date || "Present"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeExperience(exp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newAchievement.title}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newAchievement.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setNewAchievement({
                        ...newAchievement,
                        type: e.target.value as any,
                      })
                    }
                  >
                    <option value="award">Award</option>
                    <option value="certification">Certification</option>
                    <option value="publication">Publication</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
              <Button onClick={addAchievement}>
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>

              <div className="space-y-3 mt-4">
                {(profile.achievements || []).map((ach) => (
                  <div
                    key={ach.id}
                    className="flex items-start justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{ach.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {ach.description}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1 capitalize">
                          {ach.type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeAchievement(ach.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>LinkedIn URL</Label>
                <Input
                  value={profile.linkedin_url || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, linkedin_url: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <Label>GitHub URL</Label>
                <Input
                  value={profile.github_url || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, github_url: e.target.value })
                  }
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <Label>Portfolio URL</Label>
                <Input
                  value={profile.portfolio_url || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, portfolio_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentorship" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mentorship Availability</p>
                  <p className="text-sm text-muted-foreground">
                    Allow students to request mentorship from you
                  </p>
                </div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={profile.mentorship_availability || "unavailable"}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setProfile({
                      ...profile,
                      mentorship_availability: e.target.value as any,
                    })
                  }
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <Label>Mentorship Topics</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(profile.mentorship_topics || []).map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
