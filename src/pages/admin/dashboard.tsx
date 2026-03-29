import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Briefcase, TrendingUp, ArrowUpRight,
  Clock, CheckCircle2, Loader2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

// Static chart data — replace with real time-series in Phase 7
const areaData = [
  { name: "Jan", users: 12, applications: 24 },
  { name: "Feb", users: 18, applications: 31 },
  { name: "Mar", users: 27, applications: 52 },
  { name: "Apr", users: 35, applications: 68 },
  { name: "May", users: 42, applications: 89 },
  { name: "Jun", users: 58, applications: 110 },
  { name: "Jul", users: 71, applications: 134 },
];

const pieColors = [
  "hsl(38, 92%, 50%)",
  "hsl(142, 76%, 36%)",
  "hsl(0, 84%, 60%)",
];

const Dashboard = () => {
  const [loading, setLoading]       = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalJobs, setTotalJobs]   = useState(0);
  const [totalApps, setTotalApps]   = useState(0);
  const [jobsByStatus, setJobsByStatus] = useState<{ name: string; value: number }[]>([]);
  const [recentUsers, setRecentUsers]   = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // 1. Total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // 2. Total active jobs
      const { count: jobCount } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // 3. Total applications
      const { count: appCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true });

      // 4. Jobs by status for pie chart
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("status");

      if (jobsData) {
        const counts: Record<string, number> = {};
        jobsData.forEach((j) => {
          counts[j.status] = (counts[j.status] || 0) + 1;
        });
        setJobsByStatus([
          { name: "Active",  value: counts["active"]  || 0 },
          { name: "Draft",   value: counts["draft"]   || 0 },
          { name: "Closed",  value: counts["closed"]  || 0 },
          { name: "Expired", value: counts["expired"] || 0 },
        ].filter((s) => s.value > 0));
      }

      // 5. Recent 5 users
      const { data: recent } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentUsers(recent || []);
      setTotalUsers(userCount || 0);
      setTotalJobs(jobCount || 0);
      setTotalApps(appCount || 0);
      setLoading(false);
    };

    fetchStats();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: loading ? "—" : totalUsers.toLocaleString(),
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Active Jobs",
      value: loading ? "—" : totalJobs.toLocaleString(),
      icon: Briefcase,
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Applications",
      value: loading ? "—" : totalApps.toLocaleString(),
      icon: TrendingUp,
      color: "bg-success/10 text-success",
    },
    {
      title: "Employers",
      value: loading ? "—" : "—",
      icon: CheckCircle2,
      color: "bg-warning/10 text-warning",
    },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Platform overview">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value}
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

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Growth Overview</CardTitle>
            </CardHeader>
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
                  <Area type="monotone" dataKey="users" stroke="hsl(217, 91%, 50%)" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" name="Users" />
                  <Area type="monotone" dataKey="applications" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" name="Applications" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Job Status</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsByStatus.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={jobsByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                        {jobsByStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
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
                  <p className="text-sm text-muted-foreground">No job data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {user.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.full_name || "Unnamed user"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.role} · {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "admin" ? "bg-primary/10 text-primary" :
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