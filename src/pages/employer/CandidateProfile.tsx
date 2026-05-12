import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Briefcase,
  GraduationCap, Award, Download, MessageSquare,
  Calendar, Clock, CheckCircle2, XCircle,
  ArrowLeft, Linkedin, Github, Globe,
  FileText, TrendingUp, Target, Zap, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { EmployerLayout } from "@/components/layout/EmployerLayout";

// ── Same match calculation as jobseeker side ──────────────────
function calcMatch(jobSkills: string[], userSkills: string[]): number {
  if (!jobSkills || jobSkills.length === 0) return 70;
  if (!userSkills || userSkills.length === 0) return 30;
  const userLower = userSkills.map(s => s.toLowerCase().trim());
  const matched   = jobSkills.filter(s =>
    userLower.some(us => us.includes(s.toLowerCase().trim()) || s.toLowerCase().trim().includes(us))
  );
  return Math.min(99, Math.max(20, Math.round((matched.length / jobSkills.length) * 100)));
}

const statusLabels: Record<string, string> = {
  applied:     "Applied",
  reviewed:    "Reviewed",
  shortlisted: "Shortlisted",
  interview:   "Interview Scheduled",
  accepted:    "Accepted",
  rejected:    "Rejected",
};

const CandidateProfile = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { toast }  = useToast();

  const [candidate, setCandidate]       = useState<any>(null);
  const [application, setApplication]   = useState<any>(null);
  const [resumeUrl, setResumeUrl]       = useState<string | null>(null);
  const [matchScore, setMatchScore]     = useState<number>(0);
  const [loading, setLoading]           = useState(true);
  const [updating, setUpdating]         = useState(false);
  const [activeTab, setActiveTab]       = useState("overview");

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) { setLoading(false); return; }
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch candidate profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, bio, skills, education, experience, resume_url, headline, linkedin_url, github_url, portfolio_url, avatar_url")
        .eq("id", id)
        .single();

      if (profileError || !profile) {
        toast({ title: "Candidate not found", variant: "destructive" });
        setLoading(false);
        return;
      }

      setCandidate({
        ...profile,
        skills:     Array.isArray(profile.skills)     ? profile.skills     : [],
        education:  Array.isArray(profile.education)  ? profile.education  : [],
        experience: Array.isArray(profile.experience) ? profile.experience : [],
        avatar:     (profile.full_name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
      });

      // 2. Fetch most recent application by this candidate to employer's jobs
      if (user) {
        const { data: apps } = await supabase
          .from("applications")
          .select(`
            id, status, created_at, cover_letter, resume_url, job_id,
            jobs ( id, title, company, skills )
          `)
          .eq("jobseeker_id", id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (apps && apps.length > 0) {
          const app = apps[0];
          setApplication({
            id:          app.id,
            status:      app.status,
            appliedDate: new Date(app.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            coverLetter: app.cover_letter,
            jobTitle:    (app as any).jobs?.title   || "Position",
            company:     (app as any).jobs?.company || "",
            jobSkills:   Array.isArray((app as any).jobs?.skills) ? (app as any).jobs.skills : [],
          });

          // ✅ Real match score using same algorithm as jobseeker side
          const jobSkills = Array.isArray((app as any).jobs?.skills) ? (app as any).jobs.skills : [];
          const candSkills = Array.isArray(profile.skills) ? profile.skills : [];
          setMatchScore(calcMatch(jobSkills, candSkills));

          // Resume URL — prefer application resume, fallback to profile resume
          const rawUrl = app.resume_url || profile.resume_url;
          if (rawUrl) {
            await generateResumeUrl(rawUrl);
          }
        } else {
          // No application found — compute match from profile skills alone
          setMatchScore(profile.skills?.length > 0 ? 60 : 30);
        }
      }

      setLoading(false);
    };

    fetchCandidate();
  }, [id]);

  // ── Generate fresh signed URL ─────────────────────────────
  const generateResumeUrl = async (rawUrl: string) => {
    try {
      const path = rawUrl.startsWith("http")
        ? rawUrl.match(/\/storage\/v1\/object\/(?:sign\/|public\/)?([^?]+)/)?.[1]
        : rawUrl;

      if (path && !path.startsWith("http")) {
        const { data } = await supabase.storage.from("resumes").createSignedUrl(path, 3600);
        if (data?.signedUrl) { setResumeUrl(data.signedUrl); return; }
      }
      setResumeUrl(rawUrl);
    } catch { setResumeUrl(rawUrl); }
  };

  // ── Update application status ─────────────────────────────
  const updateStatus = async (newStatus: string) => {
    if (!application?.id) return;
    setUpdating(true);

    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", application.id);

    if (error) {
      toast({ title: "Update failed", variant: "destructive" });
    } else {
      setApplication((prev: any) => ({ ...prev, status: newStatus }));
      toast({ title: `Status updated to ${statusLabels[newStatus] || newStatus}` });
    }
    setUpdating(false);
  };

  // ── Match colour ──────────────────────────────────────────
  const matchColor = matchScore >= 75 ? "text-success" : matchScore >= 50 ? "text-warning" : "text-destructive";

  if (loading) {
    return (
      <EmployerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </EmployerLayout>
    );
  }

  if (!candidate) {
    return (
      <EmployerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Candidate not found</p>
            <Button onClick={() => navigate("/employer/applications")}>Back to Applications</Button>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-gradient-hero text-primary-foreground">
          <div className="container py-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Link to="/employer/applications" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Applications
              </Link>

              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center text-3xl font-bold">
                  {candidate.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-3xl font-bold">{candidate.full_name || "Candidate"}</h1>
                    {application?.status && (
                      <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                        {statusLabels[application.status] || application.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl text-primary-foreground/90 mb-2">
                    {candidate.headline || "Job Seeker"}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
                    {application?.jobTitle && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" /> Applied for: {application.jobTitle}
                      </span>
                    )}
                    {application?.appliedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {application.appliedDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Score — real calculation */}
                <div className="bg-primary-foreground/10 rounded-xl p-4 text-center shrink-0">
                  <p className={`text-4xl font-bold ${matchColor}`}>{matchScore}%</p>
                  <p className="text-sm text-primary-foreground/70">Match Score</p>
                  <p className="text-xs text-primary-foreground/50 mt-1">
                    {candidate.skills.length} skills matched
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        <main className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start mb-6 bg-card border border-border">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview">
                  <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Bio */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" /> Professional Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {candidate.bio || `${candidate.full_name} is a ${candidate.headline || "job seeker"} with ${candidate.skills.length > 0 ? `skills in ${candidate.skills.slice(0, 3).join(", ")}` : "various skills"}.`}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Top Skills */}
                    {candidate.skills.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" /> Skills
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill: string) => {
                              const isMatch = application?.jobSkills?.some(
                                (s: string) => s.toLowerCase() === skill.toLowerCase()
                              );
                              return (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className={isMatch ? "bg-success/10 text-success" : ""}
                                >
                                  {isMatch ? "✓ " : ""}{skill}
                                </Badge>
                              );
                            })}
                          </div>
                          {application?.jobSkills?.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-3">
                              Green = matches job requirements
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Cover Letter */}
                    {application?.coverLetter && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" /> Cover Letter
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {application.coverLetter}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recent Experience */}
                    {candidate.experience.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary" /> Recent Experience
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {candidate.experience.slice(0, 2).map((exp: any, i: number) => (
                            <div key={i} className={i > 0 ? "mt-4 pt-4 border-t border-border" : ""}>
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-foreground">{exp.role || exp.title}</h4>
                                  <p className="text-sm text-primary">{exp.company}</p>
                                </div>
                                <span className="text-sm text-muted-foreground shrink-0 ml-2">
                                  {exp.start_year || exp.from}{exp.end_year || exp.to ? ` – ${exp.end_year || exp.to}` : " – Present"}
                                </span>
                              </div>
                              {exp.description && (
                                <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience">
                  <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {candidate.experience.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary" /> Work Experience
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="relative pl-6 border-l-2 border-primary/20 space-y-8">
                            {candidate.experience.map((exp: any, i: number) => (
                              <div key={i} className="relative">
                                <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-primary border-4 border-background" />
                                <h4 className="font-semibold text-foreground text-lg">{exp.role || exp.title}</h4>
                                <p className="text-primary font-medium">{exp.company}</p>
                                <p className="text-sm text-muted-foreground">
                                  {exp.start_year || exp.from} – {exp.end_year || exp.to || "Present"}
                                </p>
                                {exp.description && (
                                  <p className="text-muted-foreground mt-2 text-sm">{exp.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {candidate.education.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-primary" /> Education
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {candidate.education.map((edu: any, i: number) => (
                              <div key={i} className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                                <div>
                                  <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                                  <p className="text-primary text-sm">{edu.institution || edu.school}</p>
                                  {edu.grade && <p className="text-xs text-muted-foreground">Grade: {edu.grade}</p>}
                                </div>
                                <span className="text-sm text-muted-foreground shrink-0 ml-2">
                                  {edu.end_year || edu.year}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {candidate.experience.length === 0 && candidate.education.length === 0 && (
                      <Card>
                        <CardContent className="py-10 text-center">
                          <p className="text-muted-foreground">No experience or education details added yet</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value="skills">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" /> Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {candidate.skills.length === 0 ? (
                          <p className="text-muted-foreground text-center py-6">No skills listed</p>
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            {candidate.skills.map((skill: string) => {
                              const isMatch = application?.jobSkills?.some(
                                (s: string) => s.toLowerCase() === skill.toLowerCase()
                              );
                              return (
                                <div
                                  key={skill}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                    isMatch ? "bg-success/10 text-success border border-success/20" : "bg-secondary text-foreground"
                                  }`}
                                >
                                  {isMatch ? "✓ " : ""}{skill}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card className="sticky top-4">
                  <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {resumeUrl && (
                      <Button className="w-full" variant="outline" onClick={() => window.open(resumeUrl, "_blank")}>
                        <Download className="w-4 h-4 mr-2" /> View / Download Resume
                      </Button>
                    )}
                    <Separator />
                    <div className="space-y-2">
                      {application?.status !== "shortlisted" && (
                        <Button
                          variant="outline" size="sm" className="w-full text-primary hover:bg-primary/10"
                          disabled={updating}
                          onClick={() => updateStatus("shortlisted")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Shortlist
                        </Button>
                      )}
                      {application?.status !== "interview" && (
                        <Button
                          className="w-full bg-primary text-primary-foreground" size="sm"
                          disabled={updating}
                          onClick={() => updateStatus("interview")}
                        >
                          <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
                        </Button>
                      )}
                      {application?.status !== "accepted" && (
                        <Button
                          variant="outline" size="sm" className="w-full text-success hover:bg-success/10"
                          disabled={updating}
                          onClick={() => updateStatus("accepted")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Accept
                        </Button>
                      )}
                      {application?.status !== "rejected" && (
                        <Button
                          variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive/10"
                          disabled={updating}
                          onClick={() => updateStatus("rejected")}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      )}
                    </div>
                    {application?.status && (
                      <p className="text-xs text-muted-foreground text-center">
                        Current: <span className="font-medium text-foreground">{statusLabels[application.status] || application.status}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {candidate.phone && (
                      <a href={`tel:${candidate.phone}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="w-4 h-4" /> {candidate.phone}
                      </a>
                    )}
                    {(candidate.linkedin_url || candidate.github_url || candidate.portfolio_url) && (
                      <>
                        <Separator />
                        <div className="flex gap-2">
                          {candidate.linkedin_url && (
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <a href={candidate.linkedin_url.startsWith("http") ? candidate.linkedin_url : `https://${candidate.linkedin_url}`} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {candidate.github_url && (
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <a href={candidate.github_url.startsWith("http") ? candidate.github_url : `https://${candidate.github_url}`} target="_blank" rel="noopener noreferrer">
                                <Github className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {candidate.portfolio_url && (
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <a href={candidate.portfolio_url.startsWith("http") ? candidate.portfolio_url : `https://${candidate.portfolio_url}`} target="_blank" rel="noopener noreferrer">
                                <Globe className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                    {!candidate.phone && !candidate.linkedin_url && (
                      <p className="text-sm text-muted-foreground">No contact details available</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </EmployerLayout>
  );
};

export default CandidateProfile;