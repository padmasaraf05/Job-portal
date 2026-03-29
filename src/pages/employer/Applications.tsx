import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  ChevronRight,
  Star,
  StarOff,
  MessageSquare,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    applied: "bg-secondary text-muted-foreground border-border",
    reviewed: "bg-warning/15 text-warning border-warning/30",
    shortlisted: "bg-primary/15 text-primary border-primary/30",
    interview: "bg-info/15 text-info border-info/30",
    accepted: "bg-success/15 text-success border-success/30",
    rejected: "bg-destructive/15 text-destructive border-destructive/30",
    withdrawn: "bg-muted text-muted-foreground border-border",
  };
  return colors[status] || colors.applied;
};

const statusLabels: Record<string, string> = {
  applied: "Applied",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const getMatchScoreColor = (score: number) => {
  if (score >= 85) return "text-success";
  if (score >= 65) return "text-warning";
  return "text-destructive";
};

const EmployerApplications = () => {
  const [searchParams] = useSearchParams();
  const preselectedJob = searchParams.get("job");

  const [applications, setApplications] = useState<any[]>([]);
  const [employerJobs, setEmployerJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStage, setActiveStage] = useState("all");
  const [jobFilter, setJobFilter] = useState(preselectedJob || "all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Fetch all applications for this employer's jobs ────────────
  const fetchApplications = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Step 1: Get all jobs posted by this employer
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, company")
      .eq("employer_id", user.id);

    if (jobsError || !jobs?.length) {
      setLoading(false);
      return;
    }

    setEmployerJobs(jobs);
    const jobIds = jobs.map((j) => j.id);

    // Step 2: Get all applications for those jobs + candidate profile
    const { data: appData, error: appError } = await supabase
      .from("applications")
      .select(
        `
        id,
        status,
        created_at,
        cover_letter,
        resume_url,
        job_id,
        jobs ( id, title, company ),
        profiles!applications_jobseeker_id_fkey (
          id,
          full_name,
          phone,
          skills,
          resume_url,
          headline
        )
      `
      )
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (appError) {
      console.error(appError);
      toast({ title: "Failed to load applications", variant: "destructive" });
      setLoading(false);
      return;
    }

    const formatted = (appData || []).map((app: any) => ({
      id: app.id,
      jobId: app.job_id,
      jobTitle: app.jobs?.title || "Job Title",
      company: app.jobs?.company || "",
      status: app.status || "applied",
      statusLabel: statusLabels[app.status] || "Applied",
      appliedDate: new Date(app.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      resumeUrl: app.resume_url || app.profiles?.resume_url || null,
      coverLetter: app.cover_letter || null,
      candidate: {
        id: app.profiles?.id || "",
        name: app.profiles?.full_name || "Unknown Candidate",
        phone: app.profiles?.phone || "",
        headline: app.profiles?.headline || "Job Seeker",
        skills: Array.isArray(app.profiles?.skills) ? app.profiles.skills : [],
        avatar:
          app.profiles?.full_name
            ?.split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?",
      },
      // Placeholder match score — real algorithm in Phase 5
      matchScore: Math.floor(Math.random() * 25) + 70,
      isStarred: false,
    }));

    setApplications(formatted);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ── Update application status ──────────────────────────────────
  const updateStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId);

    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", applicationId);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      setUpdatingId(null);
      return;
    }

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: newStatus,
              statusLabel: statusLabels[newStatus] || newStatus,
            }
          : a
      )
    );

    toast({
      title: "Status updated",
      description: `Application moved to "${statusLabels[newStatus] || newStatus}".`,
    });

    setUpdatingId(null);
  };

  // ── Toggle star (local only for now) ──────────────────────────
  const toggleStar = (applicationId: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId ? { ...a, isStarred: !a.isStarred } : a
      )
    );
  };

  // ── Filtering ──────────────────────────────────────────────────
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage =
      activeStage === "all" || app.status === activeStage;
    const matchesJob =
      jobFilter === "all" || app.jobId === jobFilter;
    return matchesSearch && matchesStage && matchesJob;
  });

  // Stage counts
  const stageCounts = (stage: string) =>
    stage === "all"
      ? applications.length
      : applications.filter((a) => a.status === stage).length;

  const pipelineStages = [
    "all", "applied", "reviewed", "shortlisted", "interview", "accepted", "rejected",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary-foreground/10">
                <Users className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">Applications</h1>
            </div>
            <p className="text-primary-foreground/80">
              Review and manage candidate applications across your job listings.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="container py-8">
        {/* Pipeline Tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeStage} onValueChange={setActiveStage}>
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-card border border-border h-auto flex-wrap gap-1 p-1">
              {pipelineStages.map((stage) => (
                <TabsTrigger
                  key={stage}
                  value={stage}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground capitalize"
                >
                  {stage === "all" ? "All" : statusLabels[stage]}
                  <Badge variant="secondary" className="text-xs">
                    {stageCounts(stage)}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates by name or job title…"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-full md:w-64">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {employerJobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchApplications}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading applications…</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No applications found
            </h3>
            <p className="text-muted-foreground">
              {applications.length === 0
                ? "No one has applied to your jobs yet."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          /* Applications List */
          <div className="space-y-4">
            {filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.04 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-0">
                    {/* Main Row */}
                    <div
                      className="flex items-center gap-4 p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() =>
                        setExpandedCard(
                          expandedCard === application.id ? null : application.id
                        )
                      }
                    >
                      {/* Star */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(application.id);
                        }}
                        className="text-muted-foreground hover:text-warning transition-colors shrink-0"
                      >
                        {application.isStarred ? (
                          <Star className="w-5 h-5 fill-warning text-warning" />
                        ) : (
                          <StarOff className="w-5 h-5" />
                        )}
                      </button>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                        {application.candidate.avatar}
                      </div>

                      {/* Candidate Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-foreground">
                            {application.candidate.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getStatusColor(application.status)}
                          >
                            {application.statusLabel}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Applied for:{" "}
                          <span className="font-medium text-foreground">
                            {application.jobTitle}
                          </span>
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {application.appliedDate}
                          </span>
                          {application.candidate.headline && (
                            <span>{application.candidate.headline}</span>
                          )}
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="text-center px-4 shrink-0">
                        <p
                          className={`text-2xl font-bold ${getMatchScoreColor(
                            application.matchScore
                          )}`}
                        >
                          {application.matchScore}%
                        </p>
                        <p className="text-xs text-muted-foreground">Match</p>
                      </div>

                      {/* Expand */}
                      <div className="text-muted-foreground shrink-0">
                        {expandedCard === application.id ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Panel */}
                    {expandedCard === application.id && (
                      <motion.div
                        className="border-t border-border p-5 bg-muted/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Candidate Details */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3">
                              Candidate Details
                            </h4>
                            <div className="space-y-2">
                              {application.candidate.phone && (
                                <a
                                  href={`tel:${application.candidate.phone}`}
                                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Phone className="w-4 h-4" />
                                  {application.candidate.phone}
                                </a>
                              )}
                              {application.candidate.skills.length > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Skills
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {application.candidate.skills
                                      .slice(0, 5)
                                      .map((s: string) => (
                                        <span
                                          key={s}
                                          className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary"
                                        >
                                          {s}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                              {application.coverLetter && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Cover Letter
                                  </p>
                                  <p className="text-sm text-foreground line-clamp-3">
                                    {application.coverLetter}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3">
                              Quick Actions
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              <Link
                                to={`/employer/candidate/${application.candidate.id}`}
                              >
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Profile
                                </Button>
                              </Link>
                              {application.resumeUrl && (
                                <a
                                  href={application.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="outline" size="sm">
                                    <FileText className="w-4 h-4 mr-1" />
                                    Resume
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Update Status */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3">
                              Update Status
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {application.status !== "shortlisted" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-primary hover:bg-primary/10"
                                  disabled={updatingId === application.id}
                                  onClick={() =>
                                    updateStatus(application.id, "shortlisted")
                                  }
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Shortlist
                                </Button>
                              )}
                              {application.status !== "interview" && (
                                <Button
                                  size="sm"
                                  className="bg-primary text-primary-foreground"
                                  disabled={updatingId === application.id}
                                  onClick={() =>
                                    updateStatus(application.id, "interview")
                                  }
                                >
                                  Schedule Interview
                                  <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                              )}
                              {application.status !== "accepted" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-success hover:bg-success/10"
                                  disabled={updatingId === application.id}
                                  onClick={() =>
                                    updateStatus(application.id, "accepted")
                                  }
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                              )}
                              {application.status !== "rejected" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:bg-destructive/10"
                                  disabled={updatingId === application.id}
                                  onClick={() =>
                                    updateStatus(application.id, "rejected")
                                  }
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              )}
                            </div>
                            {/* Current status label */}
                            <p className="text-xs text-muted-foreground mt-3">
                              Current:{" "}
                              <span className="font-medium text-foreground">
                                {application.statusLabel}
                              </span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployerApplications;