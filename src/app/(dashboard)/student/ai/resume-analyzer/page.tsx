"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  Loader2,
  Clipboard,
  TrendingUp,
} from "lucide-react";

interface ResumeAnalysis {
  overall_score: number;
  breakdown: Record<string, number>;
  strengths: string[];
  missing_skills: string[];
  suggestions: string[];
  skill_match: {
    technical: string[];
    soft: string[];
    missing_critical: string[];
  };
  summary: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  content: "Content Quality",
  formatting: "Formatting",
  keywords: "Keywords",
  impact: "Impact",
  completeness: "Completeness",
};

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setResumeText(text);
    } catch {
      // Clipboard access denied
    }
  };

  const analyze = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resume Analyzer</h1>
        <p className="text-muted-foreground">
          Get AI-powered feedback on your resume
        </p>
      </div>

      {!analysis ? (
        <Card>
          <CardContent className="p-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file && file.type === "text/plain") {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setResumeText(ev.target?.result as string);
                  };
                  reader.readAsText(file);
                }
              }}
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                dragOver
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-muted-foreground/25"
              }`}
            >
              <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="mb-2 font-medium">
                Paste your resume text below or drag a .txt file
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                For best results, paste the full text content of your resume
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePaste}>
                  <Clipboard className="mr-1 h-4 w-4" />
                  Paste from clipboard
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium">Resume Text</label>
              <Textarea
                placeholder="Paste your resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={12}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={analyze}
                disabled={!resumeText.trim() || loading}
                loading={loading}
                className="btn-primary"
              >
                <FileText className="mr-2 h-4 w-4" />
                Analyze Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] p-6">
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
                        (analysis.overall_score / 100) * 2 * Math.PI * 45
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {analysis.overall_score}
                    </span>
                    <span className="text-xs text-white/80">/ 100</span>
                  </div>
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">Overall Score</h2>
                  <p className="mt-1 text-sm text-white/80">
                    {analysis.summary}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(analysis.breakdown).map(([key, value]) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {CATEGORY_LABELS[key] || key}
                    </span>
                    <span className={`text-lg font-bold ${getScoreColor(value)}`}>
                      {value}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${value}%`,
                        backgroundColor:
                          value >= 80 ? "#10B981" : value >= 60 ? "#F59E0B" : "#EF4444",
                      }}
                    />
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
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
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
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Missing Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.missing_skills.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
                Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Skill Match</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Technical Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skill_match.technical.map((s, i) => (
                      <Badge key={i} variant="default">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Soft Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skill_match.soft.map((s, i) => (
                      <Badge key={i} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                {analysis.skill_match.missing_critical.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Missing Critical Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skill_match.missing_critical.map((s, i) => (
                        <Badge key={i} variant="destructive">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setAnalysis(null);
                setResumeText("");
              }}
            >
              Analyze Another Resume
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
                <p className="font-medium">Analyzing your resume...</p>
                <p className="text-sm text-muted-foreground">
                  This may take a few seconds
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
