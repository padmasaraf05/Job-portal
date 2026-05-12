import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload, FileText, CheckCircle, ChevronRight,
  Briefcase, MapPin, IndianRupee, Building2,
  Plus, Sparkles, Loader2, AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatSalary } from "@/lib/salaryUtils";

const ApplyJob = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { toast }  = useToast();

  // ── State ──────────────────────────────────────────────────
  const [step, setStep]               = useState(1);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting]   = useState(false);

  // Real data from DB
  const [job, setJob]         = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [resumeViewUrl, setResumeViewUrl] = useState<string | null>(null);
  const [userId, setUserId]   = useState<string | null>(null);

  // Loading / error states
  const [loading, setLoading]             = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [jobNotFound, setJobNotFound]     = useState(false);

  const progress = (step / 3) * 100;

  // ── Fetch job + profile + duplicate check ──────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth/login");
        return;
      }
      setUserId(user.id);

      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("id, title, company, location, type, salary, salary_min, salary_max, description, requirements, skills, status, employer_id")
        .eq("id", id)
        .single();

      if (jobError || !jobData) {
        setJobNotFound(true);
        setLoading(false);
        return;
      }

      if (jobData.status !== "active") {
        setJobNotFound(true);
        setLoading(false);
        return;
      }

      setJob({
        ...jobData,
        salaryDisplay: formatSalary(jobData.salary_min, jobData.salary_max, jobData.salary),
      });

      // Fetch user profile (for resume URL)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, resume_url, headline, skills")
        .eq("id", user.id)
        .single();

      setProfile(profileData || {});

      // Generate fresh signed URL so user can verify their resume before submitting
      if (profileData?.resume_url) {
        const path = profileData.resume_url.startsWith("http")
          ? profileData.resume_url.match(/\/storage\/v1\/object\/(?:sign\/|public\/)?([^?]+)/)?.[1]
          : profileData.resume_url;
        if (path && !path.startsWith("http")) {
          const { data: signed } = await supabase.storage
            .from("resumes")
            .createSignedUrl(path, 3600);
          if (signed?.signedUrl) setResumeViewUrl(signed.signedUrl);
        } else {
          setResumeViewUrl(profileData.resume_url);
        }
      }

      // Check if already applied
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", id)
        .eq("jobseeker_id", user.id)
        .maybeSingle();

      if (existing) {
        setAlreadyApplied(true);
      }

      setLoading(false);
    };

    if (id) init();
  }, [id]);

  // ── Submit application ─────────────────────────────────────
  const handleApply = async () => {
    if (!userId || !id || !job) return;
    if (alreadyApplied) {
      toast({ title: "Already applied", description: "You have already applied for this job.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("applications").insert({
      job_id:       id,
      jobseeker_id: userId,
      employer_id:  job.employer_id,
      status:       "applied",
      cover_letter: coverLetter.trim() || null,
      resume_url:   profile?.resume_url || null,
    });

    if (error) {
      // Unique constraint violation = duplicate application
      if (error.code === "23505") {
        toast({ title: "Already applied", description: "You have already applied for this job.", variant: "destructive" });
      } else {
        toast({ title: "Submission failed", description: error.message, variant: "destructive" });
      }
      setSubmitting(false);
      return;
    }

    toast({
      title: "Application submitted! 🎉",
      description: `You applied for ${job.title} at ${job.company}.`,
    });

    navigate("/jobseeker/applications", { replace: true });
  };

  // ── Loading state ──────────────────────────────────────────
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

  // ── Job not found ──────────────────────────────────────────
  if (jobNotFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 border-0 shadow-lg text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Job Not Available</h2>
          <p className="text-muted-foreground mb-6">
            This job posting is no longer active or does not exist.
          </p>
          <Button onClick={() => navigate("/jobseeker/jobs")} className="bg-gradient-primary text-primary-foreground">
            Browse Jobs
          </Button>
        </Card>
      </div>
    );
  }

  // ── Already applied ────────────────────────────────────────
  if (alreadyApplied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 border-0 shadow-lg text-center max-w-md">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Already Applied</h2>
          <p className="text-muted-foreground mb-6">
            You have already submitted an application for <strong>{job?.title}</strong> at <strong>{job?.company}</strong>.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/jobseeker/jobs")}>Browse Jobs</Button>
            <Button className="bg-gradient-primary text-primary-foreground" onClick={() => navigate("/jobseeker/applications")}>
              My Applications
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6 max-w-4xl">

        {/* Job Summary */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 border-0 shadow-lg mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                {job.company?.charAt(0) || "J"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground truncate">{job.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" /> {job.salaryDisplay}
                  </span>
                </div>
              </div>
              {job.type && <Badge variant="secondary">{job.type}</Badge>}
            </div>
          </Card>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Application Progress</span>
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {["Resume", "Cover Letter", "Review"].map((label, index) => (
              <span key={label} className={`text-xs ${step > index ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── STEP 1: Resume ── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Your Resume
              </h2>

              {profile?.resume_url ? (
                <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Resume from your profile</p>
                    <p className="text-sm text-muted-foreground">
                      This resume will be sent to the employer
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {resumeViewUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resumeViewUrl, "_blank")}
                        title="Open resume in new tab to verify"
                      >
                        <FileText className="w-4 h-4 mr-1" /> View
                      </Button>
                    )}
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm">No resume on your profile</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        You can still apply — add a resume to your{" "}
                        <button
                          onClick={() => navigate("/jobseeker/profile")}
                          className="text-primary underline"
                        >
                          profile
                        </button>{" "}
                        to stand out.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Required skills vs user skills */}
              {job.skills?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-foreground mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string) => {
                      const hasSkill = profile?.skills?.some(
                        (s: string) => s.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <span
                          key={skill}
                          className={`px-2 py-1 text-xs rounded-md font-medium ${
                            hasSkill
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {hasSkill ? "✓ " : ""}{skill}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Green = skills you have on your profile
                  </p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep(2)} className="bg-gradient-primary text-primary-foreground">
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── STEP 2: Cover Letter ── */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Cover Letter
                <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
              </h2>

              <Label className="text-foreground mb-2 block">
                Write a cover letter to stand out from other applicants
              </Label>
              <Textarea
                placeholder={`Hi, I'm ${profile?.full_name || "your name"}, and I'm excited to apply for ${job.title} at ${job.company}. I believe my skills in...`}
                className="min-h-[200px] resize-none"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {coverLetter.length} characters
                  {coverLetter.length > 0 && coverLetter.length < 100 && (
                    <span className="text-warning ml-2">· A bit short — aim for 150+ characters</span>
                  )}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => navigate("/jobseeker/interview-prep")}
                >
                  <Sparkles className="w-4 h-4 mr-1" /> Practice Interview Instead
                </Button>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} className="bg-gradient-primary text-primary-foreground">
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" /> Review Your Application
              </h2>

              <div className="space-y-4">
                {/* Applicant */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <h3 className="font-medium text-foreground mb-2">Applicant</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.full_name || "You"}
                    {profile?.headline ? ` · ${profile.headline}` : ""}
                  </p>
                </div>

                {/* Resume */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">Resume</h3>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Edit</Button>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    {profile?.resume_url ? "Profile resume attached" : "No resume — applying without resume"}
                  </p>
                </div>

                {/* Cover Letter */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">Cover Letter</h3>
                    <Button variant="ghost" size="sm" onClick={() => setStep(2)}>Edit</Button>
                  </div>
                  {coverLetter.trim() ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">{coverLetter}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No cover letter included</p>
                  )}
                </div>

                {/* Applying to */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <h3 className="font-medium text-foreground mb-2">Applying For</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.title} at {job.company} · {job.location}
                  </p>
                </div>
              </div>

              {/* Confirmation */}
              <div className="mt-6 p-4 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Ready to submit!</p>
                    <p className="text-sm text-muted-foreground">
                      Your application will be sent to the recruiter at {job.company}. You can track its status in My Applications.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button
                  onClick={handleApply}
                  disabled={submitting}
                  className="bg-gradient-primary text-primary-foreground px-8"
                >
                  {submitting
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</>
                    : "Submit Application"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ApplyJob;