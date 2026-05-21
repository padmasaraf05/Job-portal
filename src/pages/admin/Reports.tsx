import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Download, Calendar, TrendingUp, Users,
  Briefcase, CheckCircle2, Loader2,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS  = ["hsl(217,91%,50%)","hsl(174,72%,40%)","hsl(142,76%,36%)","hsl(38,92%,50%)"];

// ── Group records by month of created_at ─────────────────────
function groupByMonth(rows: any[], monthCount: number) {
  const now   = new Date();
  const result: Record<string, number> = {};

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result[`${d.getFullYear()}-${d.getMonth()}`] = 0;
  }

  (rows || []).forEach(r => {
    const d   = new Date(r.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key in result) result[key] = (result[key] || 0) + 1;
  });

  return Object.entries(result).map(([key, count]) => {
    const [y, m] = key.split("-").map(Number);
    return { month: MONTHS[m], year: y, count };
  });
}

// ── Build CSV and trigger download ────────────────────────────
function downloadCSV(rows: any[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]).join(",");
  const body    = rows.map(r => Object.values(r).join(",")).join("\n");
  const blob    = new Blob([`${headers}\n${body}`], { type: "text/csv" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const Reports = () => {
  const [period, setPeriod]         = useState("year");
  const [loading, setLoading]       = useState(true);
  const [monthlyData, setMonthly]   = useState<any[]>([]);
  const [topEmployers, setTopEmp]   = useState<any[]>([]);
  const [roleData, setRoleData]     = useState<any[]>([]);
  const [jobTypeData, setJobType]   = useState<any[]>([]);
  const [kpis, setKpis]             = useState({
    totalUsers: 0, totalJobs: 0, totalApps: 0, hireRate: 0,
  });

  const monthCount = period === "week" ? 1 : period === "month" ? 1 : period === "quarter" ? 3 : 12;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      const since = new Date();
      since.setMonth(since.getMonth() - monthCount);
      const sinceISO = since.toISOString();

      // Parallel fetches
      const [profilesRes, jobsRes, appsRes, acceptedRes] = await Promise.all([
        supabase.from("profiles").select("id, role, created_at").gte("created_at", sinceISO),
        supabase.from("jobs").select("id, type, employer_id, company, created_at, application_count").gte("created_at", sinceISO),
        supabase.from("applications").select("id, created_at, status").gte("created_at", sinceISO),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "accepted"),
      ]);

      const profiles  = profilesRes.data  || [];
      const jobs      = jobsRes.data       || [];
      const apps      = appsRes.data       || [];
      const accepted  = acceptedRes.count  || 0;
      const totalApps = apps.length;

      // KPIs
      setKpis({
        totalUsers: profiles.length,
        totalJobs:  jobs.length,
        totalApps,
        hireRate:   totalApps > 0 ? Math.round((accepted / totalApps) * 100) : 0,
      });

      // Monthly chart — merge users, jobs, applications by month label
      const usersByMonth = groupByMonth(profiles, monthCount);
      const jobsByMonth  = groupByMonth(jobs,     monthCount);
      const appsByMonth  = groupByMonth(apps,     monthCount);

      const merged = usersByMonth.map((row, i) => ({
        month:        row.month,
        users:        row.count,
        jobs:         jobsByMonth[i]?.count  ?? 0,
        applications: appsByMonth[i]?.count  ?? 0,
      }));
      setMonthly(merged);

      // Role distribution pie
      const roleCounts: Record<string, number> = {};
      profiles.forEach(p => { roleCounts[p.role] = (roleCounts[p.role] || 0) + 1; });
      setRoleData(Object.entries(roleCounts).map(([name, value]) => ({ name, value })));

      // Job type bar
      const typeCounts: Record<string, number> = {};
      jobs.forEach(j => { const t = j.type || "Other"; typeCounts[t] = (typeCounts[t] || 0) + 1; });
      setJobType(Object.entries(typeCounts).map(([name, count]) => ({ name, count })));

      // Top employers — group jobs by company
      const empMap: Record<string, { company: string; jobs: number; applications: number }> = {};
      jobs.forEach(j => {
        const co = j.company || "Unknown";
        if (!empMap[co]) empMap[co] = { company: co, jobs: 0, applications: 0 };
        empMap[co].jobs++;
        empMap[co].applications += j.application_count || 0;
      });
      const sorted = Object.values(empMap).sort((a, b) => b.applications - a.applications).slice(0, 5);
      setTopEmp(sorted);

      setLoading(false);
    };

    fetchAll();
  }, [period]);

  // ── Export CSV ────────────────────────────────────────────
  const handleExport = () => {
    const rows = monthlyData.map(r => ({
      Month:        r.month,
      "New Users":  r.users,
      "Jobs Posted": r.jobs,
      Applications: r.applications,
    }));
    downloadCSV(rows, `careerlaunch-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const statCards = [
    { title: "Total Users",        value: kpis.totalUsers, icon: Users,        color: "text-primary",  bg: "bg-primary/10" },
    { title: "Jobs Posted",        value: kpis.totalJobs,  icon: Briefcase,    color: "text-success",  bg: "bg-success/10" },
    { title: "Applications",       value: kpis.totalApps,  icon: TrendingUp,   color: "text-accent",   bg: "bg-accent/10" },
    { title: "Hire Rate",          value: `${kpis.hireRate}%`, icon: CheckCircle2, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <AdminLayout title="Reports" subtitle="Analytics and insights">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleExport} disabled={loading || monthlyData.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {statCards.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{s.title}</p>
                        <p className="text-3xl font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {period === "year" ? "Past 12 months" : period === "quarter" ? "Past 3 months" : "Past 30 days"}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${s.bg}`}>
                        <s.icon className={`h-6 w-6 ${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Platform Activity (Users / Jobs / Applications) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="users"        name="New Users"    stroke={COLORS[0]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="jobs"         name="Jobs Posted"  stroke={COLORS[1]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="applications" name="Applications" stroke={COLORS[2]} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Row 2: Role Pie + Job Type Bar */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader><CardTitle>User Role Distribution</CardTitle></CardHeader>
                <CardContent>
                  {roleData.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10">No data</p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                            {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-4 mt-3">
                        {roleData.map((item, i) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-sm text-muted-foreground capitalize">{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader><CardTitle>Jobs by Type</CardTitle></CardHeader>
                <CardContent>
                  {jobTypeData.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10">No jobs in this period</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={jobTypeData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Bar dataKey="count" name="Jobs" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Top Employers */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" /> Top Employers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topEmployers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">No employer data in this period</p>
                ) : (
                  <div className="space-y-4">
                    {topEmployers.map((co, i) => {
                      const maxApps = topEmployers[0]?.applications || 1;
                      return (
                        <div key={co.company} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-sm text-primary shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{co.company}</p>
                            <p className="text-xs text-muted-foreground">{co.jobs} jobs · {co.applications} applications</p>
                          </div>
                          <div className="w-28">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${(co.applications / maxApps) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AdminLayout>
  );
};

export default Reports;