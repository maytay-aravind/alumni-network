"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  TrendingUp,
  Loader2,
  CheckCircle,
  Target,
  Lightbulb,
} from "lucide-react";

interface CareerReadinessResult {
  overall_score: number;
  categories: Record<
    string,
    {
      score: number;
      breakdown: Record<string, number>;
      feedback: string;
    }
  >;
  improvement_areas: {
    area: string;
    priority: string;
    action_items: string[];
  }[];
  strengths: string[];
  summary: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  technical_skills: "Technical Skills",
  experience: "Experience",
  soft_skills: "Soft Skills",
  portfolio: "Portfolio",
  networking: "Networking",
};

const CATEGORY_ICONS: Record<string, string> = {
  technical_skills: "\uD83D\uDCBB",
  experience: "\uD83D\uDCBC",
  soft_skills: "\uD83E\uDD1D",
  portfolio: "\uD83D\uDCC1",
  networking: "\uD83C\uDF10",
};

export default function CareerReadinessPage() {
  const [formData, setFormData] = useState({
    name: "",
    education: "",
    skills: "",
    experience: "",
    projects: "",
    certifications: "",
  });
  const [result, setResult] = useState<CareerReadinessResult | null>(null);
  const [loading, setLoading] = useState(false);

  const assess = async () => {
    if (!formData.name || !formData.education || !formData.skills) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/career-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(",").map((s) => s.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Show error and don't set invalid result
        console.error("Assess failed", data);
        alert(data.error || "Failed to assess. Please try again.");
        return;
      }
      // Validate shape
      if (!data || typeof data.overall_score !== 'number' || !data.categories || typeof data.categories !== 'object') {
        console.error("Invalid result shape", data);
        alert("Invalid response from AI. Please try again.");
        return;
      }
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Work";
    return "Critical";
  };

  const getRadarData = () => {
    if (!result?.categories || typeof result.categories !== 'object') return [];
    return Object.entries(result.categories).map(([key, val]: any) => ({
      category: CATEGORY_LABELS[key] || key,
      score: val?.score ?? 0,
      fullMark: 100,
    }));
  };

  const getBarData = () => {
    if (!result?.categories || typeof result.categories !== 'object') return [];
    return Object.entries(result.categories).map(([key, val]: any) => ({
      name: CATEGORY_LABELS[key] || key,
      score: val?.score ?? 0,
      fill: getScoreColor(val?.score ?? 0),
    }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Career Readiness Assessment</h1>
        <p className="text-muted-foreground">
          Evaluate how prepared you are for your career
        </p>
      </div>

      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Your Name *</label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Education *</label>
                <Input
                  placeholder="e.g., B.Tech Computer Science, XYZ University"
                  value={formData.education}
                  onChange={(e) =>
                    setFormData({ ...formData, education: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Skills *</label>
              <Input
                placeholder="e.g., JavaScript, React, Python, Node.js (comma separated)"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Experience</label>
              <Textarea
                placeholder="Describe your internships, part-time work, or any professional experience..."
                value={formData.experience}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Projects</label>
              <Textarea
                placeholder="List your key projects with brief descriptions..."
                value={formData.projects}
                onChange={(e) =>
                  setFormData({ ...formData, projects: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Certifications</label>
              <Input
                placeholder="e.g., AWS Certified, Google Analytics, etc."
                value={formData.certifications}
                onChange={(e) =>
                  setFormData({ ...formData, certifications: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={assess}
                disabled={
                  !formData.name || !formData.education || !formData.skills || loading
                }
                loading={loading}
                className="btn-primary px-8"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Assess Readiness
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !result?.categories || typeof result.categories !== 'object' ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-medium">Could not load assessment.</p>
            <p className="text-sm text-muted-foreground mt-1">The AI response was invalid. Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={() => setResult(null)}>Try Again</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)] p-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="relative">
                  <svg className="h-36 w-36 -rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="white"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={
                        2 * Math.PI * 54 -
                        ((result.overall_score ?? 0) / 100) * 2 * Math.PI * 54
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {result.overall_score ?? 0}
                    </span>
                    <span className="text-sm text-white/80">/ 100</span>
                  </div>
                </div>
                <div className="text-center text-white sm:text-left">
                  <h2 className="text-2xl font-bold">Career Readiness Score</h2>
                  <p className="mt-1 text-lg">
                    {getScoreLabel(result.overall_score ?? 0)}
                  </p>
                  <p className="mt-2 max-w-md text-sm text-white/80">
                    {result.summary || 'Assessment complete.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" fontSize={12} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#6366F1"
                      fill="#6366F1"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Scores Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getBarData()} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      fontSize={12}
                    />
                    <Tooltip />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {getBarData().map((entry, i) => (
                        <rect key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(result.categories || {}).map(([key, val]: any) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium">
                      <span>{CATEGORY_ICONS[key]}</span>
                      {CATEGORY_LABELS[key] || key}
                    </span>
                    <span
                      className="text-lg font-bold"
                      style={{ color: getScoreColor(val?.score ?? 0) }}
                    >
                      {val?.score ?? 0}
                    </span>
                  </div>
                  <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${val?.score ?? 0}%`,
                        backgroundColor: getScoreColor(val?.score ?? 0),
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{val?.feedback || ''}</p>
                  <div className="mt-2 space-y-1">
                    {Object.entries(val?.breakdown || {}).map(([bk, bv]: any) => (
                      <div key={bk} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {bk.replace(/_/g, " ")}
                        </span>
                        <span className="font-medium">{bv}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(result.strengths || []).map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Improvement Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(result.improvement_areas || []).map((area: any, i: number) => (
                    <div key={i}>
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="text-sm font-medium">{area.area}</h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            area.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : area.priority === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {area.priority}
                        </span>
                      </div>
                      <ul className="ml-4 space-y-1">
                        {(area.action_items || []).map((item: string, ai: number) => (
                          <li
                            key={ai}
                            className="flex items-start gap-1 text-xs text-muted-foreground"
                          >
                            <span className="mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setFormData({
                  name: "",
                  education: "",
                  skills: "",
                  experience: "",
                  projects: "",
                  certifications: "",
                });
              }}
            >
              Take Assessment Again
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
                <p className="font-medium">Assessing career readiness...</p>
                <p className="text-sm text-muted-foreground">
                  Analyzing your profile against industry standards
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
