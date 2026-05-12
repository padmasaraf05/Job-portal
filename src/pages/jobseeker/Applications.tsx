import { motion } from "framer-motion";
import {
  Clock, CheckCircle, XCircle, Calendar, Building2,
  MapPin, ChevronRight, Eye, Video, Briefcase, Filter, X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  applied:     "bg-secondary text-muted-foreground",
  reviewed:    "bg-warning/10 text-warning",
  shortlisted: "bg-primary/10 text-primary",
  interview:   "bg-info/10 text-info",
  accepted:    "bg-success/10 text-success",
  rejected:    "bg-destructive/10 text-destructive",
  withdrawn:   "bg-secondary text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  applied:     "Applied",
  reviewed:    "In Review",
  shortlisted: "Shortlisted",
  interview:   "Interview Scheduled",
  accepted:    "Offer Received",
  rejected:    "Not Selected",
  withdrawn:   "Withdrawn",
};

const ALL_STATUSES = ["applied", "reviewed", "shortlisted", "interview", "accepted", "rejected", "withdrawn"];

const Applications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("all");
  // Filter state — which statuses to show (empty = show all)
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("applications")
        .select(`
          id, status, created_at, cover_letter, resume_url,
          jobs ( id, title, company, location, type )
        `)
        .eq("jobseeker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) { console.error(error); setLoading(false); return; }

      const formatted = (data || []).map((app: any) => {
        const status = app.status || "applied";
        const statusOrder = ["applied", "reviewed", "shortlisted", "interview", "accepted"];
        const currentStep = statusOrder.indexOf(status);

        return {
          id:          app.id,
          jobId:       app.jobs?.id,
          title:       app.jobs?.title   || "Job Title",
          company:     app.jobs?.company || "Company",
          location:    app.jobs?.location|| "Location",
          type:        app.jobs?.type    || "Full-time",
          appliedDate: new Date(app.created_at).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
          }),
          status,
          statusLabel: statusLabels[status] ?? "Applied",
          logo: app.jobs?.company?.charAt(0) || "J",
          timeline:
            status === "rejected"
              ? [
                  { step: "Applied",  completed: true,  rejected: false },
                  { step: "Reviewed", completed: true,  rejected: false },
                  { step: "Rejected", completed: false, rejected: true },
                ]
              : [
                  { step: "Applied",     completed: currentStep >= 0, rejected: false },
                  { step: "Reviewed",    completed: currentStep >= 1, rejected: false },
                  { step: "Shortlisted", completed: currentStep >= 2, rejected: false },
                  { step: "Interview",   completed: currentStep >= 3, rejected: false },
                  { step: "Offered",     completed: currentStep >= 4, rejected: false },
                ],
        };
      });

      setApplications(formatted);
      setLoading(false);
    };

    fetchApplications();
  }, []);

  // ── Derived stats (always from full list) ─────────────────
  const stats = {
    total:      applications.length,
    interviews: applications.filter(a => a.status === "interview").length,
    offers:     applications.filter(a => a.status === "accepted").length,
    pending:    applications.filter(a => a.status === "reviewed" || a.status === "shortlisted").length,
  };

  // ── Filtered list (tab + dropdown filter) ─────────────────
  const visibleApps = applications.filter(app => {
    const tabMatch =
      activeTab === "all"       ? true :
      activeTab === "interview" ? app.status === "interview" :
      activeTab === "offers"    ? app.status === "accepted" : true;

    const filterMatch =
      statusFilter.length === 0 || statusFilter.includes(app.status);

    return tabMatch && filterMatch;
  });

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading applications…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
              <p className="text-muted-foreground mt-1">Track your job applications and interview progress</p>
            </div>

            {/* Working filter dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                  {statusFilter.length > 0 && (
                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {statusFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {ALL_STATUSES.map(s => (
                  <DropdownMenuCheckboxItem
                    key={s}
                    checked={statusFilter.includes(s)}
                    onCheckedChange={() => toggleStatusFilter(s)}
                    className="capitalize"
                  >
                    {statusLabels[s]}
                  </DropdownMenuCheckboxItem>
                ))}
                {statusFilter.length > 0 && (
                  <button
                    onClick={() => setStatusFilter([])}
                    className="w-full text-xs text-destructive px-2 py-1.5 flex items-center gap-1 hover:bg-muted"
                  >
                    <X className="w-3 h-3" /> Clear filters
                  </button>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats — computed from real data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Applied", value: stats.total,      icon: Clock,        color: "text-primary" },
              { label: "Interviews",    value: stats.interviews,  icon: Video,        color: "text-info" },
              { label: "Offers",        value: stats.offers,      icon: CheckCircle,  color: "text-success" },
              { label: "In Review",     value: stats.pending,     icon: Eye,          color: "text-warning" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 border-0 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No applications yet</h2>
              <p className="text-muted-foreground mb-6">Start applying to jobs to track your progress here.</p>
              <Button className="bg-gradient-primary text-primary-foreground" onClick={() => navigate("/jobseeker/jobs")}>
                Find Jobs
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
                <TabsTrigger value="interview">Interviews ({stats.interviews})</TabsTrigger>
                <TabsTrigger value="offers">Offers ({stats.offers})</TabsTrigger>
              </TabsList>

              {/* Active filter chips */}
              {statusFilter.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {statusFilter.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                      {statusLabels[s]}
                      <button onClick={() => toggleStatusFilter(s)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <TabsContent value={activeTab} className="space-y-4">
                {visibleApps.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No applications match your filter.</p>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => setStatusFilter([])}>
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  visibleApps.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6 border-0 shadow-lg">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          {/* Job Info */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                              {app.logo}
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground text-lg">{app.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {app.company}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.location}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge className={statusColors[app.status] || "bg-secondary text-muted-foreground"}>
                                  {app.statusLabel}
                                </Badge>
                                <span className="text-xs text-muted-foreground">Applied {app.appliedDate}</span>
                              </div>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div className="flex-1 overflow-x-auto">
                            <div className="flex items-center gap-1 min-w-max">
                              {app.timeline.map((step: any, stepIndex: number) => (
                                <div key={step.step} className="flex items-center">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                                      step.rejected
                                        ? "bg-destructive text-destructive-foreground"
                                        : step.completed
                                        ? "bg-success text-success-foreground"
                                        : "bg-secondary text-muted-foreground"
                                    }`}>
                                      {step.rejected ? <XCircle className="w-3 h-3" /> :
                                       step.completed ? <CheckCircle className="w-3 h-3" /> :
                                       stepIndex + 1}
                                    </div>
                                    <span className="text-[9px] text-muted-foreground mt-1 text-center max-w-[52px] leading-tight">
                                      {step.step}
                                    </span>
                                  </div>
                                  {stepIndex < app.timeline.length - 1 && (
                                    <div className={`w-6 h-0.5 mx-0.5 ${step.completed ? "bg-success" : "bg-border"}`} />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              className="bg-gradient-primary text-primary-foreground"
                              onClick={() => navigate(`/jobseeker/job/${app.jobId}`)}
                            >
                              View Job <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                            {app.status === "interview" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate("/jobseeker/interview-prep")}
                              >
                                <Video className="w-4 h-4 mr-1" /> Prepare
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Applications;