import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  MapPin,
  ChevronRight,
  Filter,
  Eye,
  Video,
  Briefcase,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

// Keys match exact DB status values
const statusColors: Record<string, string> = {
  applied: "bg-secondary text-muted-foreground",
  reviewed: "bg-warning/10 text-warning",
  shortlisted: "bg-primary/10 text-primary",
  interview: "bg-info/10 text-info",
  accepted: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  withdrawn: "bg-secondary text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  applied: "Applied",
  reviewed: "In Review",
  shortlisted: "Shortlisted",
  interview: "Interview Scheduled",
  accepted: "Offer Received",
  rejected: "Not Selected",
  withdrawn: "Withdrawn",
};

const Applications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          status,
          created_at,
          cover_letter,
          resume_url,
          jobs (
            id,
            title,
            company,
            location,
            type
          )
        `
        )
        .eq("jobseeker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const formatted = (data || []).map((app: any) => {
        const status = app.status || "applied";
        const statusOrder = [
          "applied",
          "reviewed",
          "shortlisted",
          "interview",
          "accepted",
        ];
        const currentStep = statusOrder.indexOf(status);

        return {
          id: app.id,
          jobId: app.jobs?.id,
          title: app.jobs?.title || "Job Title",
          company: app.jobs?.company || "Company",
          location: app.jobs?.location || "Location",
          type: app.jobs?.type || "Full-time",
          appliedDate: new Date(app.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          status,
          statusLabel: statusLabels[status] ?? "Applied",
          logo: app.jobs?.company?.charAt(0) || "J",
          timeline:
            status === "rejected"
              ? [
                  { step: "Applied", completed: true, rejected: false },
                  { step: "Reviewed", completed: true, rejected: false },
                  { step: "Rejected", completed: false, rejected: true },
                ]
              : [
                  {
                    step: "Applied",
                    completed: currentStep >= 0,
                    rejected: false,
                  },
                  {
                    step: "Reviewed",
                    completed: currentStep >= 1,
                    rejected: false,
                  },
                  {
                    step: "Shortlisted",
                    completed: currentStep >= 2,
                    rejected: false,
                  },
                  {
                    step: "Interview",
                    completed: currentStep >= 3,
                    rejected: false,
                  },
                  {
                    step: "Offered",
                    completed: currentStep >= 4,
                    rejected: false,
                  },
                ],
        };
      });

      setApplications(formatted);
      setLoading(false);
    };

    fetchApplications();
  }, []);

  const stats = {
    total: applications.length,
    interviews: applications.filter((a) => a.status === "interview").length,
    offers: applications.filter((a) => a.status === "accepted").length,
    pending: applications.filter((a) => a.status === "reviewed").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                My Applications
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your job applications and interview progress
              </p>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Applied",
                value: stats.total,
                icon: Clock,
                color: "text-primary",
              },
              {
                label: "Interviews",
                value: stats.interviews,
                icon: Video,
                color: "text-info",
              },
              {
                label: "Offers",
                value: stats.offers,
                icon: CheckCircle,
                color: "text-success",
              },
              {
                label: "In Review",
                value: stats.pending,
                icon: Eye,
                color: "text-warning",
              },
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
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No applications yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Start applying to jobs to track your progress here.
              </p>
              <Button
                className="bg-gradient-primary text-primary-foreground"
                onClick={() => navigate("/jobseeker/jobs")}
              >
                Find Jobs
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  All ({applications.length})
                </TabsTrigger>
                <TabsTrigger value="interview">
                  Interviews ({stats.interviews})
                </TabsTrigger>
                <TabsTrigger value="offers">
                  Offers ({stats.offers})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {applications.map((app, index) => (
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
                            <h3 className="font-semibold text-foreground text-lg">
                              {app.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> {app.company}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {app.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge
                                className={
                                  statusColors[app.status] ||
                                  "bg-secondary text-muted-foreground"
                                }
                              >
                                {app.statusLabel}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Applied {app.appliedDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 overflow-x-auto">
                          <div className="flex items-center gap-1 min-w-max">
                            {app.timeline.map(
                              (
                                step: {
                                  step: string;
                                  completed: boolean;
                                  rejected: boolean;
                                },
                                stepIndex: number
                              ) => (
                                <div
                                  key={step.step}
                                  className="flex items-center"
                                >
                                  <div className="flex flex-col items-center">
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs
                                      ${
                                        step.rejected
                                          ? "bg-destructive text-destructive-foreground"
                                          : step.completed
                                          ? "bg-success text-success-foreground"
                                          : "bg-secondary text-muted-foreground"
                                      }`}
                                    >
                                      {step.rejected ? (
                                        <XCircle className="w-3 h-3" />
                                      ) : step.completed ? (
                                        <CheckCircle className="w-3 h-3" />
                                      ) : (
                                        stepIndex + 1
                                      )}
                                    </div>
                                    <span className="text-[9px] text-muted-foreground mt-1 text-center max-w-[52px] leading-tight">
                                      {step.step}
                                    </span>
                                  </div>
                                  {stepIndex < app.timeline.length - 1 && (
                                    <div
                                      className={`w-6 h-0.5 mx-0.5 ${
                                        step.completed
                                          ? "bg-success"
                                          : "bg-border"
                                      }`}
                                    />
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-gradient-primary text-primary-foreground"
                              onClick={() =>
                                navigate(`/jobseeker/job/${app.jobId}`)
                              }
                            >
                              View Job <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="interview">
                <div className="space-y-4">
                  {applications
                    .filter((a) => a.status === "interview")
                    .map((app) => (
                      <Card
                        key={app.id}
                        className="p-6 border-0 shadow-lg border-l-4 border-l-info"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                            {app.logo}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                              {app.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {app.company}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-info">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium text-sm">
                              Interview Scheduled
                            </span>
                          </div>
                          <Button className="bg-gradient-primary text-primary-foreground">
                            <Video className="w-4 h-4 mr-2" /> Prepare
                          </Button>
                        </div>
                      </Card>
                    ))}
                  {applications.filter((a) => a.status === "interview")
                    .length === 0 && (
                    <p className="text-center text-muted-foreground py-10">
                      No interviews scheduled yet.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="offers">
                <div className="space-y-4">
                  {applications
                    .filter((a) => a.status === "accepted")
                    .map((app) => (
                      <Card
                        key={app.id}
                        className="p-6 border-0 shadow-lg border-l-4 border-l-success"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-success flex items-center justify-center text-success-foreground font-bold text-xl">
                            {app.logo}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                              {app.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {app.company}
                            </p>
                          </div>
                          <Badge className="bg-success/10 text-success">
                            Offer Received
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  {applications.filter((a) => a.status === "accepted")
                    .length === 0 && (
                    <p className="text-center text-muted-foreground py-10">
                      No offers yet. Keep applying!
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Applications;