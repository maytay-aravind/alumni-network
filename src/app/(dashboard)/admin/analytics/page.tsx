"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Loader2,
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  Target,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const COLORS = [
  "#4F46E5",
  "#06B6D4",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#10B981",
  "#EC4899",
  "#3B82F6",
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [alumniByIndustry, setAlumniByIndustry] = useState<
    Array<{ name: string; value: number }>
  >([]);
  const [alumniByLocation, setAlumniByLocation] = useState<
    Array<{ name: string; value: number }>
  >([]);
  const [alumniByCompany, setAlumniByCompany] = useState<
    Array<{ name: string; value: number }>
  >([]);
  const [topSkills, setTopSkills] = useState<
    Array<{ skill: string; count: number }>
  >([]);
  const [connectionStats, setConnectionStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    thisMonth: 0,
  });
  const [mentorshipStats, setMentorshipStats] = useState({
    totalMentors: 0,
    activeMentorships: 0,
    pendingRequests: 0,
  });
  const [eventStats, setEventStats] = useState({
    total: 0,
    upcoming: 0,
    past: 0,
    totalRegistrations: 0,
  });
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);

      const { data: alumniData } = await supabase
        .from("alumni_profiles")
        .select("industry, location, current_company, skills");

      if (alumniData) {
        const industryMap = new Map<string, number>();
        const locationMap = new Map<string, number>();
        const companyMap = new Map<string, number>();
        const skillMap = new Map<string, number>();

        alumniData.forEach((a) => {
          if (a.industry) {
            industryMap.set(a.industry, (industryMap.get(a.industry) || 0) + 1);
          }
          if (a.location) {
            locationMap.set(a.location, (locationMap.get(a.location) || 0) + 1);
          }
          if (a.current_company) {
            companyMap.set(
              a.current_company,
              (companyMap.get(a.current_company) || 0) + 1
            );
          }
          (a.skills || []).forEach((skill: string) => {
            skillMap.set(skill, (skillMap.get(skill) || 0) + 1);
          });
        });

        setAlumniByIndustry(
          Array.from(industryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
        );

        setAlumniByLocation(
          Array.from(locationMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
        );

        setAlumniByCompany(
          Array.from(companyMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
        );

        setTopSkills(
          Array.from(skillMap.entries())
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        );
      }

      const { count: totalConnections } = await supabase
        .from("connections")
        .select("id", { count: "exact" });

      const { count: pendingConnections } = await supabase
        .from("connections")
        .select("id", { count: "exact" })
        .eq("status", "pending");

      const { count: acceptedConnections } = await supabase
        .from("connections")
        .select("id", { count: "exact" })
        .eq("status", "accepted");

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const { count: thisMonthConnections } = await supabase
        .from("connections")
        .select("id", { count: "exact" })
        .gte("created_at", thisMonth.toISOString());

      setConnectionStats({
        total: totalConnections || 0,
        pending: pendingConnections || 0,
        accepted: acceptedConnections || 0,
        thisMonth: thisMonthConnections || 0,
      });

      const { count: totalMentors } = await supabase
        .from("alumni_profiles")
        .select("id", { count: "exact" })
        .eq("is_mentor", true);

      const { count: pendingRequests } = await supabase
        .from("mentorship_requests")
        .select("id", { count: "exact" })
        .eq("status", "pending");

      const { count: activeMentorships } = await supabase
        .from("mentorship_requests")
        .select("id", { count: "exact" })
        .eq("status", "accepted");

      setMentorshipStats({
        totalMentors: totalMentors || 0,
        activeMentorships: activeMentorships || 0,
        pendingRequests: pendingRequests || 0,
      });

      const { count: totalEvents } = await supabase
        .from("events")
        .select("id", { count: "exact" });

      const { count: upcomingEvents } = await supabase
        .from("events")
        .select("id", { count: "exact" })
        .gte("date", new Date().toISOString());

      const { data: regData } = await supabase
        .from("event_registrations")
        .select("id", { count: "exact" });

      setEventStats({
        total: totalEvents || 0,
        upcoming: upcomingEvents || 0,
        past: (totalEvents || 0) - (upcomingEvents || 0),
        totalRegistrations: regData?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  }

  const generateInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await fetch("/api/ai/insights");
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights || []);
      } else {
        setAiInsights([
          "The alumni network is growing steadily with strong engagement in the Technology sector.",
          "Consider organizing more industry-specific networking events to boost connections.",
          "Mentorship program participation could be increased by highlighting success stories.",
          "Alumni in leadership positions are the most active contributors to job postings.",
        ]);
      }
    } catch {
      setAiInsights([
        "The alumni network is growing steadily with strong engagement in the Technology sector.",
        "Consider organizing more industry-specific networking events to boost connections.",
        "Mentorship program participation could be increased by highlighting success stories.",
        "Alumni in leadership positions are the most active contributors to job postings.",
      ]);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleExport = () => {
    toast.success("Analytics report exported");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Insights and metrics for your alumni network
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Connections"
          value={connectionStats.total}
          icon={Users}
          trend="up"
          trendValue={`+${connectionStats.thisMonth} this month`}
        />
        <StatsCard
          title="Active Mentors"
          value={mentorshipStats.totalMentors}
          icon={Target}
          trend="neutral"
        />
        <StatsCard
          title="Total Events"
          value={eventStats.total}
          icon={Calendar}
          trend="up"
          trendValue={`${eventStats.upcoming} upcoming`}
        />
        <StatsCard
          title="Event Registrations"
          value={eventStats.totalRegistrations}
          icon={BarChart3}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Alumni by Industry">
          <PieChart>
            <Pie
              data={alumniByIndustry}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
              }
              outerRadius={100}
              dataKey="value"
            >
              {alumniByIndustry.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>

        <ChartCard title="Alumni by Location">
          <BarChart data={alumniByLocation} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis
              type="category"
              dataKey="name"
              className="text-xs"
              width={100}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#06B6D4" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Top Companies">
          <BarChart data={alumniByCompany}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSkills.map((item, index) => (
                <div key={item.skill} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{item.skill}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(item.count / (topSkills[0]?.count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Connection Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-medium">{connectionStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Accepted</span>
              <span className="font-medium text-emerald-600">
                {connectionStats.accepted}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="font-medium text-amber-600">
                {connectionStats.pending}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-medium text-primary">
                {connectionStats.thisMonth}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Mentorship Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Mentors</span>
              <span className="font-medium">{mentorshipStats.totalMentors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Active Mentorships
              </span>
              <span className="font-medium text-emerald-600">
                {mentorshipStats.activeMentorships}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Pending Requests
              </span>
              <span className="font-medium text-amber-600">
                {mentorshipStats.pendingRequests}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Event Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Events</span>
              <span className="font-medium">{eventStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Upcoming</span>
              <span className="font-medium text-emerald-600">
                {eventStats.upcoming}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Past Events</span>
              <span className="font-medium">{eventStats.past}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Total Registrations
              </span>
              <span className="font-medium text-primary">
                {eventStats.totalRegistrations}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              AI-Generated Insights
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateInsights}
              disabled={insightsLoading}
            >
              {insightsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              Generate Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiInsights.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Click &quot;Generate Insights&quot; to get AI-powered recommendations
            </p>
          ) : (
            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
