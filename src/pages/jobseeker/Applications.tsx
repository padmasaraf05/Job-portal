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
  MessageSquare,
  Eye,
  Video
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";




const statusColors: Record<string, string> = {
  interview: "bg-info/10 text-info",
  review: "bg-warning/10 text-warning",
  offered: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  applied: "bg-secondary text-muted-foreground",
};

const Applications = () => {
  const [applications, setApplications] = useState<any[]>([]);
useEffect(() => {
  const fetchApplications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        jobs (
          id,
          title,
          company,
          location
        )
      `)
      .eq("jobseeker_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    // Map Supabase → your existing UI format
    const formatted = (data || []).map((app: any) => ({
      id: app.id,
      title: app.jobs?.title,
      company: app.jobs?.company,
      location: app.jobs?.location,
      appliedDate: new Date(app.created_at).toLocaleDateString(),
      status: app.status || "applied",
      statusLabel:
        app.status === "interview"
          ? "Interview Scheduled"
          : app.status === "offered"
          ? "Offer Received"
          : app.status === "rejected"
          ? "Not Selected"
          : "Applied",
      logo: app.jobs?.company?.charAt(0),

      // minimal timeline so your UI doesn't crash
      timeline: [
        { step: "Applied", completed: true },
        { step: "In Review", completed: app.status !== "applied" },
        { step: "Completed", completed: ["offered", "rejected"].includes(app.status) },
      ],
    }));

    setApplications(formatted);
  };

  fetchApplications();
}, []);

  const stats = {
    total: applications.length,
    interviews: applications.filter(a => a.status === "interview").length,
    offers: applications.filter(a => a.status === "offered").length,
    pending: applications.filter(a => a.status === "review").length,
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
              <p className="text-muted-foreground mt-1">Track your job applications and interview progress</p>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Applied", value: stats.total, icon: Clock, color: "text-primary" },
              { label: "Interviews", value: stats.interviews, icon: Video, color: "text-info" },
              { label: "Offers", value: stats.offers, icon: CheckCircle, color: "text-success" },
              { label: "In Review", value: stats.pending, icon: Eye, color: "text-warning" },
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

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              <TabsTrigger value="interview">Interviews ({stats.interviews})</TabsTrigger>
              <TabsTrigger value="offers">Offers ({stats.offers})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {applications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {app.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {app.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge className={statusColors[app.status]}>
                              {app.statusLabel}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Applied {app.appliedDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {app.timeline.map((step, stepIndex) => (
                            <div key={step.step} className="flex items-center">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                                  ${step.rejected 
                                    ? 'bg-destructive text-destructive-foreground' 
                                    : step.completed 
                                      ? 'bg-success text-success-foreground' 
                                      : step.current 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-secondary text-muted-foreground'
                                  }`}>
                                  {step.rejected ? (
                                    <XCircle className="w-4 h-4" />
                                  ) : step.completed ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    stepIndex + 1
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1 text-center max-w-[60px] line-clamp-1">
                                  {step.step}
                                </span>
                              </div>
                              {stepIndex < app.timeline.length - 1 && (
                                <div className={`w-8 h-0.5 mx-1 ${
                                  step.completed ? 'bg-success' : 'bg-border'
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {app.status === "interview" && (
                          <div className="text-right mb-2">
                            <p className="text-xs text-muted-foreground">Interview on</p>
                            <p className="text-sm font-medium text-foreground">
                              {app.interviewDate} at {app.interviewTime}
                            </p>
                          </div>
                        )}
                        {app.status === "offered" && (
                          <div className="text-right mb-2">
                            <p className="text-xs text-muted-foreground">Respond by</p>
                            <p className="text-sm font-medium text-accent">{app.offerDeadline}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" /> Message
                          </Button>
                          <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                            View <ChevronRight className="w-4 h-4 ml-1" />
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
                {applications.filter(a => a.status === "interview").map((app) => (
                  <Card key={app.id} className="p-6 border-0 shadow-lg border-l-4 border-l-info">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                        {app.logo}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{app.title}</h3>
                        <p className="text-sm text-muted-foreground">{app.company}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-info mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{app.interviewDate}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{app.interviewTime}</p>
                      </div>
                      <Button className="bg-gradient-primary text-primary-foreground">
                        <Video className="w-4 h-4 mr-2" /> Join Interview
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="offers">
              <div className="space-y-4">
                {applications.filter(a => a.status === "offered").map((app) => (
                  <Card key={app.id} className="p-6 border-0 shadow-lg border-l-4 border-l-success">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-success flex items-center justify-center text-success-foreground font-bold text-xl">
                        {app.logo}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{app.title}</h3>
                        <p className="text-sm text-muted-foreground">{app.company}</p>
                        <p className="text-xs text-accent mt-1">Respond by {app.offerDeadline}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">Decline</Button>
                        <Button className="bg-gradient-success text-success-foreground">
                          Accept Offer
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Applications;
