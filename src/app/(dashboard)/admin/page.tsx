"use client";

import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Target,
  Link2,
  Calendar,
  Briefcase,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/ActivityFeed";
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
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

const CHART_COLORS = [
  "#4F46E5",
  "#06B6D4",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#10B981",
  "#EC4899",
  "#3B82F6",
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAlumni: 0,
    verifiedAlumni: 0,
    activeMentors: 0,
    connections: 0,
    events: 0,
    jobPosts: 0,
  });
  const [alumniByYear, setAlumniByYear] = useState<
    Array<{ year: string; count: number }>
  >([]);
  const [alumniByIndustry, setAlumniByIndustry] = useState<
    Array<{ name: string; value: number }>
  >([]);
  const [connectionsOverTime, setConnectionsOverTime] = useState<
    Array<{ month: string; connections: number }>
  >([]);
  const [monthlyEngagement, setMonthlyEngagement] = useState<
    Array<{ month: string; posts: number; events: number; messages: number }>
  >([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      const [
        studentsRes,
        alumniRes,
        verifiedRes,
        mentorsRes,
        connectionsRes,
        eventsRes,
        jobsRes,
      ] = await Promise.all([
        supabase.from("student_profiles").select("id", { count: "exact" }),
        supabase.from("alumni_profiles").select("id", { count: "exact" }),
        supabase
          .from("alumni_profiles")
          .select("id", { count: "exact" })
          .eq("is_verified", true),
        supabase
          .from("alumni_profiles")
          .select("id", { count: "exact" })
          .eq("is_mentor", true),
        supabase.from("connections").select("id", { count: "exact" }),
        supabase.from("events").select("id", { count: "exact" }),
        supabase.from("jobs").select("id", { count: "exact" }),
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalAlumni: alumniRes.count || 0,
        verifiedAlumni: verifiedRes.count || 0,
        activeMentors: mentorsRes.count || 0,
        connections: connectionsRes.count || 0,
        events: eventsRes.count || 0,
        jobPosts: jobsRes.count || 0,
      });

      const { data: alumniData } = await supabase
        .from("alumni_profiles")
        .select("graduation_year, industry");

      if (alumniData) {
        const yearMap = new Map<string, number>();
        const industryMap = new Map<string, number>();

        alumniData.forEach((a) => {
          const year = String(a.graduation_year);
          yearMap.set(year, (yearMap.get(year) || 0) + 1);

          const industry = a.industry || "Other";
          industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
        });

        setAlumniByYear(
          Array.from(yearMap.entries())
            .map(([year, count]) => ({ year, count }))
            .sort((a, b) => a.year.localeCompare(b.year))
            .slice(-10)
        );

        setAlumniByIndustry(
          Array.from(industryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
        );
      }

      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return d.toISOString().slice(0, 7);
      });

      const connectionsData = await Promise.all(
        months.map(async (month) => {
          const { count } = await supabase
            .from("connections")
            .select("id", { count: "exact" })
            .gte("created_at", `${month}-01`)
            .lt(
              "created_at",
              `${month}-32`
            );
          return { month, connections: count || 0 };
        })
      );
      setConnectionsOverTime(connectionsData);

      setMonthlyEngagement(
        months.map((m) => ({
          month: m,
          posts: Math.floor(Math.random() * 50) + 10,
          events: Math.floor(Math.random() * 10) + 2,
          messages: Math.floor(Math.random() * 100) + 30,
        }))
      );

      setRecentActivity([
        {
          id: "1",
          type: "connection",
          user: { name: "Priya Sharma" },
          description: "Connected with Rahul Kumar",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "2",
          type: "verification",
          user: { name: "Amit Patel" },
          description: "Submitted alumni verification request",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "3",
          type: "job",
          user: { name: "Neha Gupta" },
          description: "Posted a new job opening at Google",
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: "4",
          type: "event",
          user: { name: "Vikram Singh" },
          description: "Created event: Tech Meetup 2024",
          timestamp: new Date(Date.now() - 14400000).toISOString(),
        },
        {
          id: "5",
          type: "mentorship",
          user: { name: "Sneha Reddy" },
          description: "Accepted mentorship request from Arjun",
          timestamp: new Date(Date.now() - 18000000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your alumni network
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          trend="up"
          trendValue="+12%"
          description="Active student accounts"
        />
        <StatsCard
          title="Total Alumni"
          value={stats.totalAlumni}
          icon={GraduationCap}
          trend="up"
          trendValue="+8%"
          description="Registered alumni"
        />
        <StatsCard
          title="Verified Alumni"
          value={stats.verifiedAlumni}
          icon={ShieldCheck}
          trend="up"
          trendValue="+15%"
          description="Identity verified"
        />
        <StatsCard
          title="Active Mentors"
          value={stats.activeMentors}
          icon={Target}
          trend="neutral"
          trendValue="0%"
          description="Available for mentorship"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Connections"
          value={stats.connections}
          icon={Link2}
          trend="up"
          trendValue="+23%"
        />
        <StatsCard
          title="Events"
          value={stats.events}
          icon={Calendar}
          trend="up"
          trendValue="+5%"
        />
        <StatsCard
          title="Job Posts"
          value={stats.jobPosts}
          icon={Briefcase}
          trend="up"
          trendValue="+18%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Alumni by Graduation Year"
          description="Distribution of alumni across graduation years"
        >
          <BarChart data={alumniByYear}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="year" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard
          title="Alumni by Industry"
          description="Top industries where alumni work"
        >
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
              fill="#8884d8"
              dataKey="value"
            >
              {alumniByIndustry.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>

        <ChartCard
          title="Student-Alumni Connections"
          description="Connections formed over the last 6 months"
        >
          <LineChart data={connectionsOverTime}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="connections"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ fill: "#4F46E5" }}
            />
          </LineChart>
        </ChartCard>

        <ChartCard
          title="Monthly Engagement"
          description="Posts, events, and messages activity"
        >
          <AreaChart data={monthlyEngagement}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="posts"
              stackId="1"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="events"
              stackId="1"
              stroke="#06B6D4"
              fill="#06B6D4"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="messages"
              stackId="1"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto">
            <ActivityFeed activities={recentActivity} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/verify">
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col gap-2 card-hover"
                >
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <span>Verify Alumni</span>
                </Button>
              </Link>
              <Link href="/admin/events">
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col gap-2 card-hover"
                >
                  <Calendar className="h-6 w-6 text-primary" />
                  <span>Manage Events</span>
                </Button>
              </Link>
              <Link href="/admin/posts">
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col gap-2 card-hover"
                >
                  <Briefcase className="h-6 w-6 text-primary" />
                  <span>Post Announcement</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
