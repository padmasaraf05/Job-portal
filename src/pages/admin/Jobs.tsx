import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, Eye, CheckCircle, XCircle, Clock,
  MapPin, Building2, Calendar, MoreHorizontal, Loader2, RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatSalary } from "@/lib/salaryUtils";

const Jobs = () => {
  const { toast } = useToast();
  const navigate  = useNavigate();

  const [jobs, setJobs]               = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab]     = useState("all");
  const [updatingId, setUpdatingId]   = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0, active: 0, draft: 0, closed: 0,
  });

  const fetchJobs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select(`
        id, title, company, location, type, status,
        salary_min, salary_max, salary,
        application_count, created_at,
        profiles!jobs_employer_id_fkey(full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load jobs", variant: "destructive" });
    } else {
      setJobs(data || []);
      const all = data || [];
      setStats({
        total:  all.length,
        active: all.filter((j) => j.status === "active").length,
        draft:  all.filter((j) => j.status === "draft").length,
        closed: all.filter((j) => j.status === "closed" || j.status === "expired").length,
      });
    }

    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  // ── Update job status ─────────────────────────────────────
  const updateStatus = async (jobId: string, newStatus: string, jobTitle: string) => {
    setUpdatingId(jobId);

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId);

    if (error) {
      toast({ title: "Update failed", variant: "destructive" });
    } else {
      setJobs((prev) =>
        prev.map((j) => j.id === jobId ? { ...j, status: newStatus } : j)
      );
      setStats((prev) => ({ ...prev })); // trigger re-derive
      toast({ title: `"${jobTitle}" is now ${newStatus}` });
    }

    setUpdatingId(null);
  };

  // ── Delete ────────────────────────────────────────────────
  const deleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Delete "${jobTitle}"? This cannot be undone.`)) return;
    setUpdatingId(jobId);

    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    } else {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast({ title: `"${jobTitle}" deleted` });
    }

    setUpdatingId(null);
  };

  // ── Filter ─────────────────────────────────────────────────
  const filtered = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || job.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const statCards = [
    { title: "Total Jobs",  value: stats.total,  icon: Building2,   color: "text-primary" },
    { title: "Active",      value: stats.active, icon: CheckCircle, color: "text-success" },
    { title: "Drafts",      value: stats.draft,  icon: Clock,       color: "text-warning" },
    { title: "Closed",      value: stats.closed, icon: XCircle,     color: "text-destructive" },
  ];

  const statusBadgeClass = (status: string) => {
    if (status === "active")  return "bg-success/10 text-success border-success/20";
    if (status === "draft")   return "bg-info/10 text-info border-info/20";
    if (status === "closed")  return "bg-muted text-muted-foreground";
    if (status === "expired") return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-secondary text-muted-foreground";
  };

  return (
    <AdminLayout title="Jobs" subtitle="Moderate and manage all job postings">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-70`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Jobs List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Job Postings</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-56 pl-9"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={fetchJobs}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-border px-4">
                <TabsList className="h-12 bg-transparent p-0 gap-6">
                  {["all", "active", "draft", "closed"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 capitalize"
                    >
                      {tab === "all" ? `All (${jobs.length})` : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${jobs.filter(j => j.status === tab).length})`}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="m-0">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">No jobs found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filtered.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="p-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-foreground">{job.title}</h3>
                              <Badge className={statusBadgeClass(job.status)}>
                                {job.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" /> {job.company}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="secondary" className="text-xs">{job.type}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatSalary(job.salary_min, job.salary_max, job.salary)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {job.application_count ?? 0} applications
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {job.status === "active" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                disabled={updatingId === job.id}
                                onClick={() => updateStatus(job.id, "closed", job.title)}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Close
                              </Button>
                            ) : job.status !== "active" ? (
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90 text-success-foreground"
                                disabled={updatingId === job.id}
                                onClick={() => updateStatus(job.id, "active", job.title)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Activate
                              </Button>
                            ) : null}

                            {updatingId === job.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/jobseeker/job/${job.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Listing
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => deleteJob(job.id, job.title)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
};

export default Jobs;