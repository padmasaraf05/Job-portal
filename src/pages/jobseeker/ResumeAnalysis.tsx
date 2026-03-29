import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Sparkles, CheckCircle, XCircle, AlertTriangle,
  Target, Award, Lightbulb, RefreshCw, Loader2, User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  overall_score: number;
  grade: string;
  summary: string;
  sections: { name: string; score: number; status: string }[];
  strengths: string[];
  improvements: { issue: string; impact: string; description: string }[];
  ats_score: number;
  ats_issues: { type: string; message: string }[];
  missing_keywords: string[];
  top_tip: string;
}

const ResumeAnalysis = () => {
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── Fetch profile ─────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingProfile(false); return; }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, headline, skills, education, experience, resume_url")
        .eq("id", user.id)
        .single();

      setProfile(data || {});
      setLoadingProfile(false);
    };
    fetchProfile();
  }, []);

  // ── Run analysis ──────────────────────────────────────────
  const runAnalysis = async () => {
    if (!profile) return;

    if (!profile.skills?.length && !profile.experience?.length && !profile.education?.length) {
      toast({
        title: "Profile incomplete",
        description: "Please add skills, education, or experience to your profile first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("analyze-resume", {
        body: {
          fullName:   profile.full_name,
          headline:   profile.headline,
          skills:     profile.skills || [],
          education:  profile.education || [],
          experience: profile.experience || [],
          targetRole,
        },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });

      if (res.error) throw new Error(res.error.message);
      setAnalysis(res.data.analysis);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    if (status === "excellent") return "text-success";
    if (status === "good") return "text-primary";
    return "text-warning";
  };

  const getProgressClass = (status: string) => {
    if (status === "excellent") return "[&>div]:bg-success";
    if (status === "needs_work") return "[&>div]:bg-warning";
    return "";
  };

  const getGradeColor = (grade: string) => {
    if (grade === "Excellent") return "bg-success/10 text-success";
    if (grade === "Good") return "bg-primary/10 text-primary";
    if (grade === "Average") return "bg-warning/10 text-warning";
    return "bg-destructive/10 text-destructive";
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
                <Sparkles className="w-8 h-8 text-primary" />
                AI Resume Analysis
              </h1>
              <p className="text-muted-foreground mt-1">
                Get actionable insights to improve your profile
              </p>
            </div>
          </div>

          {/* Setup card — shown before analysis */}
          {!analysis && (
            <Card className="p-8 border-0 shadow-lg max-w-2xl mx-auto mb-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Analyse Your Profile</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  AI will analyse your skills, education, and experience from your profile.
                </p>
              </div>

              {/* Profile preview */}
              <div className="p-4 rounded-xl bg-secondary/50 mb-6 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {profile?.full_name || "Your Profile"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Skills: {profile?.skills?.slice(0, 5).join(", ") || "None added yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Education: {profile?.education?.length || 0} entries
                </p>
                <p className="text-sm text-muted-foreground">
                  Experience: {profile?.experience?.length || 0} entries
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <Label>Target Role</Label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend Developer, Data Analyst"
                />
              </div>

              <Button
                className="w-full h-12 bg-gradient-primary text-primary-foreground"
                onClick={runAnalysis}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analysing your profile…</>
                  : <><Sparkles className="w-5 h-5 mr-2" /> Analyse with AI</>}
              </Button>

              {(!profile?.skills?.length) && (
                <p className="text-xs text-center text-warning mt-3">
                  ⚠ Add skills and experience to your profile for a more accurate analysis.
                </p>
              )}
            </Card>
          )}

          {/* Results */}
          {analysis && (
            <div className="grid lg:grid-cols-3 gap-8">

              {/* Score column */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-1 space-y-6"
              >
                <Card className="p-8 border-0 shadow-lg text-center">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Resume Score</h2>
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" className="text-secondary" />
                      <motion.circle
                        cx="96" cy="96" r="88"
                        stroke="hsl(var(--primary))" strokeWidth="12" fill="none" strokeLinecap="round"
                        initial={{ strokeDasharray: "0 553" }}
                        animate={{ strokeDasharray: `${analysis.overall_score * 5.53} 553` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        className="text-5xl font-bold text-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {analysis.overall_score}
                      </motion.span>
                      <span className="text-muted-foreground text-sm">out of 100</span>
                    </div>
                  </div>
                  <Badge className={`${getGradeColor(analysis.grade)} border-0 text-sm mb-3`}>
                    {analysis.grade}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{analysis.summary}</p>

                  <div className="mt-4 p-3 rounded-lg bg-primary/5 text-left">
                    <p className="text-xs font-medium text-primary mb-1">⚡ Top tip</p>
                    <p className="text-xs text-muted-foreground">{analysis.top_tip}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => { setAnalysis(null); }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Re-analyse
                  </Button>
                </Card>

                {/* Section scores */}
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="font-semibold text-foreground mb-4">Section Analysis</h3>
                  <div className="space-y-4">
                    {analysis.sections.map((section, i) => (
                      <motion.div
                        key={section.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                      >
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-foreground">{section.name}</span>
                          <span className={`font-medium ${getStatusColor(section.status)}`}>
                            {section.score}%
                          </span>
                        </div>
                        <Progress value={section.score} className={`h-2 ${getProgressClass(section.status)}`} />
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Feedback column */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 space-y-6"
              >
                {/* Strengths */}
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-success" /> What's Working Well
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {analysis.strengths.map((strength, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-success/5"
                      >
                        <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{strength}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Improvements */}
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-warning" /> Suggested Improvements
                  </h3>
                  <div className="space-y-4">
                    {analysis.improvements.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.08 }}
                        className="p-4 rounded-xl border border-border hover:border-warning/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-foreground">{item.issue}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            </div>
                          </div>
                          <Badge variant={item.impact === "High" ? "destructive" : "secondary"}>
                            {item.impact} Impact
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* ATS Compatibility */}
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> ATS Compatibility
                  </h3>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative w-20 h-20 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-secondary" />
                        <circle
                          cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none"
                          strokeDasharray={`${analysis.ats_score * 2.2} 220`}
                          className="text-primary"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                        {analysis.ats_score}%
                      </span>
                    </div>
                    <div className="flex-1">
                      {analysis.missing_keywords.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Missing Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {analysis.missing_keywords.map((kw) => (
                              <span key={kw} className="px-2 py-0.5 text-xs rounded bg-warning/10 text-warning font-medium">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {analysis.ats_issues.map((issue, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          issue.type === "success" ? "bg-success/5" :
                          issue.type === "warning" ? "bg-warning/5" : "bg-destructive/5"
                        }`}
                      >
                        {issue.type === "success"
                          ? <CheckCircle className="w-5 h-5 text-success shrink-0" />
                          : issue.type === "warning"
                          ? <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                          : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                        <span className="text-sm text-foreground">{issue.message}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;