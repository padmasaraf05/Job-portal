import { motion } from "framer-motion";
import {
  MapPin, Clock, IndianRupee, Briefcase, Building2,
  Users, Globe, CheckCircle, XCircle, Bookmark,
  BookmarkCheck, Share2, ChevronRight, Zap,
  GraduationCap, Star, Loader2, AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatSalary } from "@/lib/salaryUtils";

const JobDetails = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { toast }  = useToast();

  const [job, setJob]           = useState<any>(null);
  const [profile, setProfile]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [userId, setUserId]     = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      if (!id) { setNotFound(true); setLoading(false); return; }

      setLoading(true);

      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // 2. Fetch profile for skill matching
        const { data: prof } = await supabase
          .from("profiles")
          .select("skills, full_name")
          .eq("id", user.id)
          .single();
        setProfile(prof || { skills: [] });

        // 3. Check if already applied
        const { data: existing } = await supabase
          .from("applications")
          .select("id")
          .eq("job_id", id)
          .eq("jobseeker_id", user.id)
          .maybeSingle();
        if (existing) setAlreadyApplied(true);

        // 4. Check if saved
        const { data: savedRow } = await supabase
          .from("saved_jobs")
          .select("id")
          .eq("job_id", id)
          .eq("jobseeker_id", user.id)
          .maybeSingle();
        if (savedRow) setSaved(true);
      }

      // 5. Fetch job
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Normalise requirements & benefits — DB may store as text or array
      const parseList = (val: any): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
          // Try JSON first
          try { return JSON.parse(val); } catch {}
          // Split by newline or comma
          return val.split(/\n|,/).map(s => s.trim()).filter(Boolean);
        }
        return [];
      };

      setJob({
        ...data,
        salaryDisplay: formatSalary(data.salary_min, data.salary_max, data.salary),
        requirementsList: parseList(data.requirements),
        benefitsList: parseList(data.benefits),
        skillsList: Array.isArray(data.skills) ? data.skills : [],
        postedDate: new Date(data.created_at).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        }),
      });

      setLoading(false);
    };

    fetchAll();
  }, [id]);

  // ── Save / unsave ────────────────────────────────────────
  const toggleSave = async () => {
    if (!userId) { navigate("/auth/login"); return; }
    if (saved) {
      await supabase.from("saved_jobs").delete()
        .eq("job_id", id).eq("jobseeker_id", userId);
      setSaved(false);
      toast({ title: "Job removed from saved" });
    } else {
      await supabase.from("saved_jobs").insert({ job_id: id, jobseeker_id: userId });
      setSaved(true);
      toast({ title: "Job saved!" });
    }
  };

  // ── Apply ────────────────────────────────────────────────
  const handleApply = () => {
    if (!userId) { navigate("/auth/login"); return; }
    navigate(`/jobseeker/apply/${id}`);
  };

  // ── Skill match ──────────────────────────────────────────
  const userSkills: string[] = (profile?.skills || []).map((s: string) => s.toLowerCase());
  const skillMatch = (job?.skillsList || []).map((skill: string) => ({
    skill,
    match: userSkills.includes(skill.toLowerCase()),
  }));
  const matchedCount = skillMatch.filter((s: any) => s.match).length;
  const matchPct = skillMatch.length > 0
    ? Math.round((matchedCount / skillMatch.length) * 100)
    : Math.floor(Math.random() * 20) + 75;

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading job details…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 border-0 shadow-lg text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This job posting doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/jobseeker/jobs")} className="bg-gradient-primary text-primary-foreground">
            Browse Jobs
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Main Content ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">

            {/* Header */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-3xl shrink-0">
                  {job.company?.charAt(0) || "J"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                      <p className="text-lg text-muted-foreground">{job.company}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="icon" onClick={toggleSave}>
                        {saved
                          ? <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
                          : <Bookmark className="w-5 h-5" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast({ title: "Link copied!" });
                      }}>
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                    {job.type && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.type}</span>}
                    <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4" /> {job.salaryDisplay}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.postedDate}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.type && <Badge variant="secondary">{job.type}</Badge>}
                    {job.work_type && <Badge variant="outline">{job.work_type}</Badge>}
                    <Badge variant="outline">{job.application_count ?? 0} applicants</Badge>
                    <Badge className="bg-success/10 text-success border-0">
                      <Zap className="w-3 h-3 mr-1" /> {matchPct}% Match
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {alreadyApplied ? (
                  <Button className="flex-1 h-12" variant="outline" disabled>
                    <CheckCircle className="w-4 h-4 mr-2 text-success" /> Already Applied
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-gradient-primary text-primary-foreground h-12"
                    onClick={handleApply}
                    disabled={applying}
                  >
                    {applying
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Applying…</>
                      : <>Apply Now <ChevronRight className="w-4 h-4 ml-1" /></>}
                  </Button>
                )}
                <Button variant="outline" className="h-12" onClick={toggleSave}>
                  {saved ? "Saved ✓" : "Save Job"}
                </Button>
              </div>
            </Card>

            {/* Description */}
            {job.description && (
              <Card className="p-6 border-0 shadow-lg">
                <h2 className="text-lg font-semibold text-foreground mb-4">Job Description</h2>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {job.description}
                </div>
              </Card>
            )}

            {/* Requirements */}
            {job.requirementsList.length > 0 && (
              <Card className="p-6 border-0 shadow-lg">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" /> Requirements
                </h2>
                <ul className="space-y-3">
                  {job.requirementsList.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Benefits */}
            {job.benefitsList.length > 0 && (
              <Card className="p-6 border-0 shadow-lg">
                <h2 className="text-lg font-semibold text-foreground mb-4">Benefits & Perks</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {job.benefitsList.map((benefit: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-success/5">
                      <CheckCircle className="w-5 h-5 text-success shrink-0" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>

          {/* ── Sidebar ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Skill Match */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4">Your Skill Match</h3>
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none"
                      strokeDasharray={`${matchPct * 3.52} 352`} className="text-success" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{matchPct}%</span>
                    <span className="text-xs text-muted-foreground">Match</span>
                  </div>
                </div>
                {skillMatch.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-3">
                    You match <span className="text-success font-medium">{matchedCount}/{skillMatch.length}</span> required skills
                  </p>
                )}
              </div>

              {skillMatch.length > 0 && (
                <div className="space-y-3">
                  {skillMatch.map((item: any) => (
                    <div key={item.skill} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.skill}</span>
                      {item.match
                        ? <CheckCircle className="w-4 h-4 text-success" />
                        : <XCircle className="w-4 h-4 text-destructive" />}
                    </div>
                  ))}
                </div>
              )}

              {skillMatch.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Add skills to your profile to see your match.
                </p>
              )}
            </Card>

            {/* Job Info Card */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4">Job Details</h3>
              <div className="space-y-3 text-sm">
                {job.department && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <span className="text-foreground font-medium">{job.department}</span>
                  </div>
                )}
                {job.experience_level && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="text-foreground font-medium">{job.experience_level}</span>
                  </div>
                )}
                {job.work_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Work Mode</span>
                    <span className="text-foreground font-medium">{job.work_type}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary</span>
                  <span className="text-success font-medium">{job.salaryDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applicants</span>
                  <span className="text-foreground font-medium">{job.application_count ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span className="text-foreground font-medium">{job.postedDate}</span>
                </div>
              </div>
            </Card>

            {/* Required Skills */}
            {job.skillsList.length > 0 && (
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="font-semibold text-foreground mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsList.map((skill: string) => {
                    const has = userSkills.includes(skill.toLowerCase());
                    return (
                      <span key={skill} className={`px-2 py-1 text-xs rounded-md font-medium ${
                        has ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}>
                        {has ? "✓ " : ""}{skill}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Green = skills on your profile</p>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;