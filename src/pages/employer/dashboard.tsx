import { motion } from "framer-motion";
import {
  Briefcase, Users, TrendingUp, Clock,
  ArrowUpRight, MapPin, Loader2, Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { EmployerLayout } from "@/components/layout/EmployerLayout";

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    applied:     "bg-secondary text-muted-foreground",
    reviewed:    "bg-warning/15 text-warning",
    shortlisted: "bg-primary/15 text-primary",
    interview:   "bg-info/15 text-info",
    accepted:    "bg-success/15 text-success",
    rejected:    "bg-destructive/15 text-destructive",
  };
  return map[status] || map.applied;
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const EmployerDashboard = () => {
  const navigate = useNavigate();

  const [companyName, setCompanyName]         = useState("Your Company");
  const [loading, setLoading]                 = useState(true);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [totalApps, setTotalApps]             = useState(0);
  const [hireRate, setHireRate]               = useState(0);
  const [recentJobs, setRecentJobs]           = useState<any[]>([]);
  const [recentApps, setRecentApps]           = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // 1. Employer profile / company name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, company_name")
        .eq("id", user.id)
        .single();

      setCompanyName(profile?.company_name || profile?.full_name || "Your Company");

      // 2. All employer's jobs
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, title, location, status, created_at, application_count, view_count")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });

      const allJobs = jobs || [];
      const activeJobs = allJobs.filter(j => j.status === "active");
      setActiveJobsCount(activeJobs.length);
      setRecentJobs(allJobs.slice(0, 4));

      if (allJobs.length === 0) { setLoading(false); return; }

      const jobIds = allJobs.map(j => j.id);

      // 3. All applications for employer's jobs
      const { count: appCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds);
      setTotalApps(appCount || 0);

      // 4. Hire rate = accepted / total
      const { count: acceptedCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds)
        .eq("status", "accepted");

      if (appCount && appCount > 0) {
        setHireRate(Math.round(((acceptedCount || 0) / appCount) * 100));
      }

      // 5. Recent 4 applications with candidate name
      const { data: apps } = await supabase
        .from("applications")
        .select(`
          id, status, created_at, job_id,
          jobs ( title ),
          profiles!applications_jobseeker_id_fkey ( full_name )
        `)
        .in("job_id", jobIds)
        .order("created_at", { ascending: false })
        .limit(4);

      setRecentApps((apps || []).map((a: any) => ({
        id:         a.id,
        name:       a.profiles?.full_name || "Candidate",
        role:       a.jobs?.title         || "Job",
        status:     a.status              || "applied",
        avatar:     (a.profiles?.full_name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
        appliedAgo: timeSince(new Date(a.created_at)),
        jobId:      a.job_id,
      })));

      setLoading(false);
    };

    fetchData();
  }, []);

  const timeSince = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 3600)  return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const stats = [
    { label: "Active Jobs",         value: activeJobsCount, icon: Briefcase,   change: "Your live listings" },
    { label: "Total Applications",  value: totalApps,       icon: Users,        change: "Across all jobs" },
    { label: "Hire Rate",           value: `${hireRate}%`,  icon: TrendingUp,   change: "Accepted candidates" },
    { label: "New This Week",       value: recentApps.filter(a => a.appliedAgo.includes("hour") || a.appliedAgo.includes("min")).length,
      icon: Clock, change: "Recent applications" },
  ];

  return (
    <EmployerLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-gradient-hero text-primary-foreground">
          <div className="container py-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold mb-1">Welcome back, {companyName}</h1>
              <p className="text-primary-foreground/80">Here's what's happening with your hiring pipeline today.</p>
            </motion.div>
          </div>
        </header>

        <main className="container py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={staggerContainer} initial="hidden" animate="show"
              >
                {stats.map(stat => (
                  <motion.div key={stat.label} variants={fadeUpItem}>
                    <Card className="stat-card group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <stat.icon className="w-6 h-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Job Performance */}
                <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Job Performance</CardTitle>
                      <Link to="/employer/manage-jobs">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      {recentJobs.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground text-sm mb-4">No jobs posted yet</p>
                          <Button onClick={() => navigate("/employer/post-job")} className="bg-gradient-primary text-primary-foreground">
                            <Plus className="w-4 h-4 mr-2" /> Post Your First Job
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentJobs.map((job, index) => {
                            const apps  = job.application_count || 0;
                            const views = job.view_count        || 1;
                            const conv  = Math.min(100, Math.round((apps / views) * 100));
                            const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000);
                            return (
                              <motion.div
                                key={job.id}
                                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                onClick={() => navigate(`/employer/applications?job=${job.id}`)}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
                                    <Badge className={job.status === "active" ? "bg-success/15 text-success text-xs" : "bg-muted text-muted-foreground text-xs"}>
                                      {job.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> {job.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {daysAgo}d ago
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm shrink-0">
                                  <div className="text-center">
                                    <p className="font-semibold text-foreground">{apps}</p>
                                    <p className="text-muted-foreground text-xs">Applications</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold text-foreground">{views}</p>
                                    <p className="text-muted-foreground text-xs">Views</p>
                                  </div>
                                  <div className="w-20">
                                    <Progress value={conv} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1 text-center">{conv}% conv.</p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recent Applications */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Recent Applications</CardTitle>
                      <Link to="/employer/applications">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      {recentApps.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-8">No applications yet</p>
                      ) : (
                        <div className="space-y-4">
                          {recentApps.map((app, index) => (
                            <motion.div
                              key={app.id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              onClick={() => navigate(`/employer/applications?job=${app.jobId}`)}
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                                {app.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{app.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{app.role}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(app.status)}`}>
                                  {app.status}
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">{app.appliedAgo}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Post Job CTA */}
              <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="bg-gradient-hero text-primary-foreground border-0">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">Ready to find your next great hire?</h3>
                        <p className="text-primary-foreground/80">Post a new job and reach qualified candidates.</p>
                      </div>
                      <Link to="/employer/post-job">
                        <Button variant="secondary" size="lg" className="whitespace-nowrap">
                          Post a New Job <ArrowUpRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </main>
      </div>
    </EmployerLayout>
  );
};

export default EmployerDashboard;