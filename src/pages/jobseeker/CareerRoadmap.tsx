import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Map, Star, CheckCircle, Circle, TrendingUp, Target, Award,
  Briefcase, GraduationCap, Sparkles, IndianRupee, Loader2,
  RefreshCw, BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Milestone {
  id: number;
  title: string;
  salary: string;
  experience: string;
  timeline: string;
  skills_needed: string[];
  description: string;
  status: "current" | "next" | "future";
  progress: number;
  tips: string[];
}

interface Roadmap {
  current_level: string;
  career_score: number;
  target_role: string;
  milestones: Milestone[];
  skills_to_develop: { skill: string; current_level: number; importance: string }[];
  alternative_paths: { title: string; match: number }[];
  ai_insight: string;
  learning_recommendations: { skill: string; resource: string; duration: string }[];
}

const CareerRoadmap = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile]       = useState<any>(null);
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [roadmap, setRoadmap]       = useState<Roadmap | null>(null);
  const [loading, setLoading]       = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── Fetch profile ─────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingProfile(false); return; }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, headline, skills, education, experience")
        .eq("id", user.id)
        .single();

      setProfile(data || {});
      setLoadingProfile(false);
    };
    fetchProfile();
  }, []);

  // ── Generate roadmap ──────────────────────────────────────
  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("career-roadmap", {
        body: {
          skills:     profile?.skills || [],
          experience: profile?.experience || [],
          education:  profile?.education || [],
          headline:   profile?.headline || "",
          targetRole,
        },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });

      if (res.error) throw new Error(res.error.message);
      setRoadmap(res.data.roadmap);
    } catch (err: any) {
      toast({ title: "Failed to generate roadmap", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const milestoneNodeStyle = (status: string) => {
    if (status === "current") return "bg-primary text-primary-foreground";
    if (status === "next") return "bg-accent text-accent-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Map className="w-8 h-8 text-primary" />
              Your Career Roadmap
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered career guidance based on your actual profile
            </p>
          </div>

          {/* Setup — shown before generating */}
          {!roadmap && (
            <Card className="p-8 border-0 shadow-lg max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Map className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Generate Your Roadmap</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  AI analyses your skills and experience to build a personalised career plan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 mb-6 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Analysing: {profile?.full_name || "Your Profile"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Skills: {profile?.skills?.slice(0, 5).join(", ") || "None added yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Experience: {profile?.experience?.length || 0} entries ·
                  Education: {profile?.education?.length || 0} entries
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <Label>What role do you want to reach?</Label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer, Data Scientist"
                />
              </div>

              <Button
                className="w-full h-12 bg-gradient-primary text-primary-foreground"
                onClick={generateRoadmap}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Building your roadmap…</>
                  : <><Sparkles className="w-5 h-5 mr-2" /> Generate AI Roadmap</>}
              </Button>
            </Card>
          )}

          {/* Roadmap results */}
          {roadmap && (
            <>
              {/* Current position banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <Card className="p-6 border-0 shadow-lg bg-gradient-hero text-primary-foreground">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm opacity-80 mb-1">You are here</p>
                      <h2 className="text-2xl font-bold">{roadmap.current_level}</h2>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(profile?.skills || []).slice(0, 5).map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/20">
                        <Sparkles className="w-5 h-5" />
                        <span>Career Score: {roadmap.career_score}/100</span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRoadmap(null)}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8">

                {/* Timeline */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-border" />

                    <div className="space-y-8">
                      {roadmap.milestones.map((milestone, index) => (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.12 }}
                          className="relative pl-20"
                        >
                          <div className={`absolute left-4 w-8 h-8 rounded-full flex items-center justify-center ${milestoneNodeStyle(milestone.status)}`}>
                            {milestone.status === "current" ? <Star className="w-4 h-4" /> :
                             milestone.status === "next" ? <Target className="w-4 h-4" /> :
                             <Circle className="w-4 h-4" />}
                          </div>

                          <Card className={`p-6 border-0 shadow-lg ${
                            milestone.status === "current" ? "border-l-4 border-l-primary" :
                            milestone.status === "next" ? "border-l-4 border-l-accent" : ""
                          }`}>
                            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 flex-wrap">
                                  {milestone.title}
                                  {milestone.status === "current" && (
                                    <Badge className="bg-primary/10 text-primary border-0 text-xs">
                                      Current Target
                                    </Badge>
                                  )}
                                </h3>
                                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" /> {milestone.experience}
                              </span>
                              <span className="flex items-center gap-1 text-success font-medium">
                                <IndianRupee className="w-4 h-4" /> {milestone.salary}
                              </span>
                              <span className="text-muted-foreground text-xs">⏱ {milestone.timeline}</span>
                            </div>

                            {milestone.status === "current" && milestone.progress > 0 && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium text-foreground">{milestone.progress}%</span>
                                </div>
                                <Progress value={milestone.progress} className="h-2" />
                              </div>
                            )}

                            <div className="mb-4">
                              <p className="text-xs font-medium text-foreground mb-2">Required Skills:</p>
                              <div className="flex flex-wrap gap-2">
                                {milestone.skills_needed.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                                ))}
                              </div>
                            </div>

                            {milestone.tips.length > 0 && (
                              <div className="p-3 rounded-lg bg-secondary/50">
                                <p className="text-xs font-medium text-foreground mb-2">💡 Tips to reach this level:</p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {milestone.tips.map((tip, i) => <li key={i}>• {tip}</li>)}
                                </ul>
                              </div>
                            )}
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">

                  {/* Skills to develop */}
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="p-6 border-0 shadow-lg">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Skills to Develop
                      </h3>
                      <div className="space-y-4">
                        {roadmap.skills_to_develop.map((item) => (
                          <div key={item.skill}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-foreground">{item.skill}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{item.current_level}%</span>
                                <Badge variant={item.importance === "High" ? "destructive" : "secondary"} className="text-xs">
                                  {item.importance}
                                </Badge>
                              </div>
                            </div>
                            <Progress value={item.current_level} className="h-2" />
                          </div>
                        ))}
                      </div>
                      <Button
                        className="w-full mt-4 bg-gradient-primary text-primary-foreground"
                        onClick={() => navigate("/jobseeker/learning-path")}
                      >
                        <GraduationCap className="w-4 h-4 mr-2" /> Start Learning
                      </Button>
                    </Card>
                  </motion.div>

                  {/* Alternative paths */}
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="p-6 border-0 shadow-lg">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Map className="w-5 h-5 text-primary" /> Alternative Paths
                      </h3>
                      <div className="space-y-3">
                        {roadmap.alternative_paths.map((path) => (
                          <div
                            key={path.title}
                            className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{path.title}</span>
                              <Badge variant="outline" className="text-xs">{path.match}% match</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>

                  {/* AI insight */}
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-6 h-6 text-primary shrink-0" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">AI Career Insight</h4>
                          <p className="text-sm text-muted-foreground">{roadmap.ai_insight}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Learning recommendations */}
                  {roadmap.learning_recommendations.length > 0 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                      <Card className="p-6 border-0 shadow-lg">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-primary" /> Recommended Resources
                        </h3>
                        <div className="space-y-3">
                          {roadmap.learning_recommendations.map((rec, i) => (
                            <div key={i} className="p-3 rounded-lg bg-secondary/50">
                              <p className="text-sm font-medium text-foreground">{rec.skill}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{rec.resource}</p>
                              <p className="text-xs text-primary mt-1">{rec.duration}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CareerRoadmap;