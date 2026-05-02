import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Briefcase, TrendingUp, Building2,
  Loader2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const pieColors = [
  "hsl(142, 76%, 36%)",
  "hsl(217, 91%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(38, 92%, 50%)",
];

const Dashboard = () => {
  const [loading, setLoading]             = useState(true);
  const [totalUsers, setTotalUsers]       = useState(0);
  const [totalJobs, setTotalJobs]         = useState(0);
  const [totalApps, setTotalApps]         = useState(0);
  const [totalEmployers, setTotalEmployers] = useState(0);
  const [jobsByStatus, setJobsByStatus]   = useState<{ name: string; value: number }[]>([]);
  const [recentUsers, setRecentUsers]     = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // Run all queries in parallel
      const [
        usersRes,
        jobsRes,
        appsRes,
        employersRes,
        allJobsRes,
        recentRes,
      ] = await Promise.all([
        // Total users
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        // Active jobs
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "active"),
        // All applications — no filter, admin sees everything
        supabase.from("applications").select("*", { count: "exact", head: true }),
        // Employer count
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "employer"),
        // All jobs for pie chart
        supabase.from("jobs").select("status"),
        // Recent 5 registrations
        supabase.from("profiles")
          .select("id, full_name, role, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setTotalUsers(usersRes.count || 0);
      setTotalJobs(jobsRes.count || 0);
      setTotalApps(appsRes.count || 0);
      setTotalEmployers(employersRes.count || 0);

      if (allJobsRes.data) {
        const counts: Record<string, number> = {};
        allJobsRes.data.forEach((j) => {
          counts[j.status] = (counts[j.status] || 0) + 1;
        });
        setJobsByStatus(
          Object.entries(counts)
            .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
            .filter((s) => s.value > 0)
        );
      }

      setRecentUsers(recentRes.data || []);
      setLoading(false);
    };

    fetchStats();
  }, []);

  const stats = [
    { title: "Total Users",  value: totalUsers,     icon: Users,     color: "bg-primary/10 text-primary" },
    { title: "Active Jobs",  value: totalJobs,      icon: Briefcase, color: "bg-accent/10 text-accent" },
    { title: "Applications", value: totalApps,      icon: TrendingUp,color: "bg-success/10 text-success" },
    { title: "Employers",    value: totalEmployers, icon: Building2, color: "bg-warning/10 text-warning" },
  ];

  // Simple growth chart — static shape, real totals as endpoints
  const areaData = [
    { name: "Jan", users: Math.max(1, Math.round(totalUsers * 0.1)),  applications: Math.max(1, Math.round(totalApps * 0.08)) },
    { name: "Feb", users: Math.round(totalUsers * 0.2),  applications: Math.round(totalApps * 0.15) },
    { name: "Mar", users: Math.round(totalUsers * 0.32), applications: Math.round(totalApps * 0.25) },
    { name: "Apr", users: Math.round(totalUsers * 0.45), applications: Math.round(totalApps * 0.38) },
    { name: "May", users: Math.round(totalUsers * 0.6),  applications: Math.round(totalApps * 0.52) },
    { name: "Jun", users: Math.round(totalUsers * 0.78), applications: Math.round(totalApps * 0.72) },
    { name: "Jul", users: totalUsers,                    applications: totalApps },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Platform overview">

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">
                      {loading
                        ? <Loader2 className="w-6 h-6 animate-spin" />
                        : stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Growth Overview</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="users" name="Users" stroke="hsl(217, 91%, 50%)" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="applications" name="Applications" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="h-full">
            <CardHeader><CardTitle>Job Status</CardTitle></CardHeader>
            <CardContent>
              {!loading && jobsByStatus.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={jobsByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                        {jobsByStatus.map((_, i) => (
                          <Cell key={i} fill={pieColors[i % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-3">
                    {jobsByStatus.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                        <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  {loading
                    ? <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    : <p className="text-sm text-muted-foreground">No job data yet</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Registrations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader><CardTitle>Recent Registrations</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {user.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.full_name || "Unnamed user"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.role} · {new Date(user.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "admin"    ? "bg-primary/10 text-primary" :
                      user.role === "employer" ? "bg-accent/10 text-accent" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {user.role}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

    </AdminLayout>
  );
};

export default Dashboard;