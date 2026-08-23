"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Loader2,
  Star,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface MentorMatch {
  alumni_id: string;
  alumni_name: string;
  match_score: number;
  match_reasons: string[];
  expertise_alignment: string;
  mentorship_style: string;
}

export default function MentorMatchPage() {
  const [formData, setFormData] = useState({
    name: "",
    careerGoal: "",
    skills: "",
    industryInterest: "",
    learningGoals: "",
  });
  const [matches, setMatches] = useState<MentorMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.careerGoal || !formData.skills) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/mentor-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          careerGoal: formData.careerGoal,
          skills: formData.skills.split(",").map((s) => s.trim()),
          industryInterest: formData.industryInterest,
          learningGoals: formData.learningGoals
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
      }
    } catch {
      // Error handled by UI state
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Mentor Matching</h1>
        <p className="text-muted-foreground">
          Find the perfect alumni mentor for your career goals
        </p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
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
                <label className="mb-1.5 block text-sm font-medium">Industry Interest</label>
                <Input
                  placeholder="e.g., Software, Finance, Healthcare"
                  value={formData.industryInterest}
                  onChange={(e) =>
                    setFormData({ ...formData, industryInterest: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Career Goal *</label>
              <Input
                placeholder="e.g., Become a senior full-stack developer at a FAANG company"
                value={formData.careerGoal}
                onChange={(e) =>
                  setFormData({ ...formData, careerGoal: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Your Skills *</label>
              <Input
                placeholder="e.g., JavaScript, React, Python (comma separated)"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Learning Goals</label>
              <Textarea
                placeholder="What do you want to learn from a mentor? (comma separated)"
                value={formData.learningGoals}
                onChange={(e) =>
                  setFormData({ ...formData, learningGoals: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={
                  !formData.name ||
                  !formData.careerGoal ||
                  !formData.skills ||
                  loading
                }
                loading={loading}
                className="btn-primary px-8"
              >
                <Users className="mr-2 h-4 w-4" />
                Find Mentors
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {matches.length} matching mentors
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMatches([]);
                setFormData({
                  name: "",
                  careerGoal: "",
                  skills: "",
                  industryInterest: "",
                  learningGoals: "",
                });
              }}
            >
              Start Over
            </Button>
          </div>

          {matches.map((match, index) => (
            <Card
              key={match.alumni_id}
              className="overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <h3 className="text-lg font-semibold">
                      {match.alumni_name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <div
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-white ${getScoreColor(match.match_score)}`}
                      >
                        <Star className="h-3 w-3" />
                        {match.match_score}%
                      </div>
                    </div>
                  </div>

                  <p className="mb-3 text-sm text-muted-foreground">
                    {match.expertise_alignment}
                  </p>

                  <div className="mb-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Why this match:
                    </p>
                    <ul className="space-y-1">
                      {match.match_reasons.slice(0, 3).map((reason, ri) => (
                        <li
                          key={ri}
                          className="flex items-start gap-1 text-sm"
                        >
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--color-primary)]" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[var(--color-accent)]" />
                    <span className="text-sm text-[var(--color-accent)]">
                      {match.mentorship_style}
                    </span>
                  </div>
                </div>

                <div className="flex items-center border-t bg-muted/50 p-4 sm:border-t-0 sm:border-l sm:w-48">
                  <Button className="w-full btn-primary" size="sm">
                    Request
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-80">
            <CardContent className="flex flex-col items-center gap-4 p-8">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
              <div className="text-center">
                <p className="font-medium">Finding the best mentors...</p>
                <p className="text-sm text-muted-foreground">
                  Analyzing compatibility with available alumni
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
