import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  MapPin,
  Building2,
  Clock,
  IndianRupee,
  Zap,
  ArrowUpRight,
  FolderOpen,
  Bell,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SavedJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch saved jobs joined with job details
    const { data: savedData, error } = await supabase
      .from("saved_jobs")
      .select(
        `
        id,
        job_id,
        created_at,
        jobs (
          id,
          title,
          company,
          location,
          salary,
          salary_min,
          salary_max,
          type,
          skills,
          status
        )
      `
      )
      .eq("jobseeker_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading saved jobs", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Check which of these jobs the user has already applied to
    const jobIds = (savedData || []).map((s: any) => s.job_id);

    let appliedJobIds = new Set<string>();
    if (jobIds.length > 0) {
      const { data: appliedData } = await supabase
        .from("applications")
        .select("job_id")
        .eq("jobseeker_id", user.id)
        .in("job_id", jobIds);

      appliedJobIds = new Set((appliedData || []).map((a: any) => a.job_id));
    }

    const formatted = (savedData || []).map((saved: any) => ({
      id: saved.id,        // saved_jobs row id — used to delete
      jobId: saved.job_id, // actual job id — used for navigation
      title: saved.jobs?.title || "Job Title",
      company: saved.jobs?.company || "Company",
      location: saved.jobs?.location || "Location",
      salary:
        saved.jobs?.salary_min && saved.jobs?.salary_max
          ? `₹${(saved.jobs.salary_min / 100000).toFixed(0)}-${(
              saved.jobs.salary_max / 100000
            ).toFixed(0)} LPA`
          : saved.jobs?.salary || "Salary not disclosed",
      type: saved.jobs?.type || "Full-time",
      skills: Array.isArray(saved.jobs?.skills) ? saved.jobs.skills : [],
      logo: saved.jobs?.company?.charAt(0) || "J",
      savedDate: new Date(saved.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      match: Math.floor(Math.random() * 20) + 75, // real match scoring in Phase 5
      applied: appliedJobIds.has(saved.job_id),
      isClosed: saved.jobs?.status !== "active",
    }));

    setJobs(formatted);
    setLoading(false);
  };

  const removeJob = async (savedRowId: string) => {
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("id", savedRowId);

    if (!error) {
      setJobs((prev) => prev.filter((job) => job.id !== savedRowId));
      toast({ title: "Job removed from saved" });
    } else {
      toast({ title: "Failed to remove job", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading saved jobs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BookmarkCheck className="w-8 h-8 text-primary" />
                Saved Jobs
              </h1>
              <p className="text-muted-foreground mt-1">
                You have {jobs.length} job{jobs.length !== 1 ? "s" : ""} saved
                for later
              </p>
            </div>
            <Card className="p-4 border-0 shadow-lg flex items-center gap-4">
              <Bell className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Job Alerts
                </p>
                <p className="text-xs text-muted-foreground">
                  Get notified about similar jobs
                </p>
              </div>
              <Switch
                checked={alertsEnabled}
                onCheckedChange={setAlertsEnabled}
              />
            </Card>
          </div>

          {/* Empty State */}
          {jobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <FolderOpen className="w-20 h-20 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No saved jobs yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Start exploring jobs and save the ones you like for later!
              </p>
              <Button
                className="bg-gradient-primary text-primary-foreground"
                onClick={() => navigate("/jobseeker/jobs")}
              >
                Explore Jobs
              </Button>
            </motion.div>
          )}

          {/* Jobs Grid */}
          {jobs.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <AnimatePresence>
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 border-0 shadow-lg card-hover group relative overflow-hidden">
                      {/* Status badges */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        {job.isClosed && (
                          <Badge className="bg-destructive/10 text-destructive border-0 text-xs">
                            Closed
                          </Badge>
                        )}
                        {job.applied && !job.isClosed && (
                          <Badge className="bg-success/10 text-success border-0 text-xs">
                            Applied
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                          {job.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors pr-20">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Building2 className="w-3 h-3" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" /> {job.salary}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary">{job.type}</Badge>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                              <Zap className="w-3 h-3" /> {job.match}% Match
                            </span>
                          </div>

                          {job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {job.skills.slice(0, 3).map((skill: string) => (
                                <span
                                  key={skill}
                                  className="px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Bookmark className="w-3 h-3" /> Saved{" "}
                            {job.savedDate}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeJob(job.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {job.isClosed ? (
                            <Button size="sm" variant="outline" disabled>
                              Closed
                            </Button>
                          ) : job.applied ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate("/jobseeker/applications")}
                            >
                              View Application
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-gradient-primary text-primary-foreground"
                              onClick={() =>
                                navigate(`/jobseeker/apply/${job.jobId}`)
                              }
                            >
                              Apply <ArrowUpRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Stats summary */}
          {jobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {jobs.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Saved</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-success">
                      {jobs.filter((j) => j.applied).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Applied</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-accent">
                      {jobs.filter((j) => !j.applied && !j.isClosed).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SavedJobs;