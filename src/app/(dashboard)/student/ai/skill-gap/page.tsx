"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  Target,
  Plus,
  X,
  Loader2,
  TrendingUp,
  BookOpen,
  ArrowRight,
} from "lucide-react";

interface SkillGapAnalysis {
  match_percentage: number;
  current_skills: { name: string; relevance: string; proficiency: string }[];
  required_skills: {
    name: string;
    importance: string;
    current_level: string;
  }[];
  missing_skills: {
    name: string;
    importance: string;
    difficulty_to_learn: string;
    estimated_time: string;
  }[];
  learning_path: {
    order: number;
    skill: string;
    why: string;
    how_to_learn: string;
    resources: { title: string; url: string; type: string }[];
  }[];
  recommendations: string[];
}

const POPULAR_CAREERS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Product Manager",
  "UX Designer",
  "Mobile Developer",
  "Cloud Architect",
];

const POPULAR_SKILLS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "React",
  "Node.js",
  "SQL",
  "Git",
  "Docker",
  "AWS",
  "Java",
  "C++",
  "HTML/CSS",
  "REST APIs",
  "GraphQL",
  "MongoDB",
  "PostgreSQL",
  "Linux",
  "Kubernetes",
  "Figma",
  "Agile",
];

export default function SkillGapPage() {
  const [targetCareer, setTargetCareer] = useState("");
  const [customCareer, setCustomCareer] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const analyze = async () => {
    const career = customCareer || targetCareer;
    if (!career || skills.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentSkills: skills, targetCareer: career }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch {
      // Error handled by UI state
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!analysis) return [];
    const allSkills = [
      ...analysis.current_skills.map((s) => s.name),
      ...analysis.missing_skills.map((s) => s.name),
    ];
    const uniqueSkills = [...new Set(allSkills)].slice(0, 10);
    return uniqueSkills.map((skill) => {
      const current = analysis.current_skills.find((s) => s.name === skill);
      const missing = analysis.missing_skills.find((s) => s.name === skill);
      return {
        name: skill,
        current: current ? (current.proficiency === "advanced" ? 100 : current.proficiency === "intermediate" ? 60 : 30) : 0,
        required: missing ? (missing.importance === "critical" ? 100 : missing.importance === "important" ? 70 : 40) : 100,
      };
    });
  };

  const getRadarData = () => {
    if (!analysis) return [];
    return analysis.required_skills.slice(0, 8).map((skill) => {
      const current = analysis.current_skills.find((s) => s.name === skill.name);
      const currentVal = current
        ? current.proficiency === "advanced"
          ? 100
          : current.proficiency === "intermediate"
            ? 60
            : 30
        : 0;
      return {
        skill: skill.name,
        current: currentVal,
        required: skill.importance === "critical" ? 100 : skill.importance === "important" ? 70 : 40,
      };
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Skill Gap Analyzer</h1>
        <p className="text-muted-foreground">
          Compare your skills against your target career
        </p>
      </div>

      {!analysis ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Target Career
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {POPULAR_CAREERS.map((career) => (
                  <button
                    key={career}
                    onClick={() => {
                      setTargetCareer(career);
                      setCustomCareer("");
                    }}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      targetCareer === career
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                        : "hover:border-muted-foreground/50"
                    }`}
                  >
                    {career}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <Input
                  placeholder="Or type a custom career..."
                  value={customCareer}
                  onChange={(e) => {
                    setCustomCareer(e.target.value);
                    setTargetCareer("");
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Current Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="default"
                    className="gap-1 pr-1"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 rounded-full p-0.5 hover:bg-white/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill and press Enter..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />
                <Button
                  variant="outline"
                  onClick={() => addSkill(skillInput)}
                  disabled={!skillInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  Popular skills:
                </p>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_SKILLS.filter((s) => !skills.includes(s))
                    .slice(0, 12)
                    .map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="rounded-md bg-muted px-2 py-1 text-xs transition-colors hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                      >
                        + {skill}
                      </button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={analyze}
              disabled={(!targetCareer && !customCareer) || skills.length === 0 || loading}
              loading={loading}
              className="btn-primary px-8"
            >
              <Target className="mr-2 h-4 w-4" />
              Analyze Skill Gap
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <svg className="h-28 w-28 -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={
                        2 * Math.PI * 45 -
                        (analysis.match_percentage / 100) * 2 * Math.PI * 45
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {analysis.match_percentage}%
                    </span>
                  </div>
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">Skill Match</h2>
                  <p className="mt-1 text-sm text-white/80">
                    {analysis.current_skills.length} skills match your target
                    career
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.current_skills.map((skill, i) => (
                    <Badge key={i} variant="default">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Missing Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_skills.map((skill, i) => (
                    <Badge key={i} variant="destructive">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Skill Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar
                    dataKey="current"
                    fill="#10B981"
                    name="Your Level"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="required"
                    fill="#6366F1"
                    name="Required"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {getRadarData().length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Skills Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" fontSize={12} />
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Required"
                      dataKey="required"
                      stroke="#6366F1"
                      fill="#6366F1"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {analysis.learning_path.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
                  Learning Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.learning_path.map((step) => (
                    <div
                      key={step.order}
                      className="rounded-lg border p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                          {step.order}
                        </span>
                        <h4 className="font-medium">{step.skill}</h4>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {step.why}
                      </p>
                      <p className="mb-2 text-sm">{step.how_to_learn}</p>
                      {step.resources.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {step.resources.map((r, ri) => (
                            <a
                              key={ri}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-[var(--color-primary)]/10 px-2 py-1 text-xs text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                            >
                              {r.title}
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-[var(--color-accent)]" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setAnalysis(null);
                setSkills([]);
                setTargetCareer("");
                setCustomCareer("");
              }}
            >
              Analyze Another Skill Gap
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-80">
            <CardContent className="flex flex-col items-center gap-4 p-8">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
              <div className="text-center">
                <p className="font-medium">Analyzing skill gap...</p>
                <p className="text-sm text-muted-foreground">
                  Comparing your skills with market demands
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
