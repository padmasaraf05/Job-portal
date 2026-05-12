import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, Target, Zap,
  Loader2, ExternalLink, RefreshCw, Map,
  CheckCircle, ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  getCachedRoadmap,
  setCachedRoadmap,
  clearRoadmapCache,
} from "@/lib/roadmapCache";

const LearningPath = () => {
  const { toast }  = useToast();
  const navigate   = useNavigate();

  const [profile, setProfile]                   = useState<any>(null);
  const [userId, setUserId]                     = useState<string | null>(null);
  const [recommendations, setRecommendations]   = useState<any[]>([]);
  const [skillGaps, setSkillGaps]               = useState<any[]>([]);
  const [targetRole, setTargetRole]             = useState<string>("Software Developer");
  const [loading, setLoading]                   = useState(true);
  const [generating, setGenerating]             = useState(false);
  const [stats, setStats]                       = useState({
    coursesEnrolled: 0, hoursTotal: 0, skillsToLearn: 0, skillsStrong: 0,
  });

  // ── Load profile + read shared cache ──────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, skills, experience, education, headline")
        .eq("id", user.id)
        .single();

      if (!prof) { setLoading(false); return; }
      setProfile(prof);

      const role = prof.headline || "Software Developer";
      setTargetRole(role);

      // ✅ READ FROM SHARED CACHE — same key as CareerRoadmap writes to
      const cached = getCachedRoadmap(user.id, prof.skills || []);

      if (cached) {
        // Use exactly the same data CareerRoadmap generated
        applyRoadmapData(cached, prof.skills || []);
        setLoading(false);
        return;
      }

      // No cache yet → generate once and save to shared cache
      await generateFromAI(user.id, prof);
      setLoading(false);
    };

    init();
  }, []);

  // ── Apply roadmap data from cache ──────────────────────────
  const applyRoadmapData = (roadmap: any, userSkills: string[]) => {
    const recs  = roadmap.learning_recommendations || [];
    const gaps  = roadmap.skills_to_develop        || [];

    setRecommendations(recs);
    setSkillGaps(gaps);

    const totalHours = recs.reduce((sum: number, r: any) => {
      const m = r.duration?.match(/(\d+)/);
      return sum + (m ? parseInt(m[1]) : 0);
    }, 0);

    setStats({
      coursesEnrolled: recs.length,
      hoursTotal:      totalHours,
      skillsToLearn:   gaps.filter((g: any) => g.current_level < 50).length,
      skillsStrong:    userSkills.length,
    });
  };

  // ── Generate from edge function + save to shared cache ─────
  const generateFromAI = async (uid: string, prof: any) => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("career-roadmap", {
        body: {
          skills:     prof.skills     || [],
          experience: prof.experience || [],
          education:  prof.education  || [],
          headline:   prof.headline   || "Fresher",
          targetRole: prof.headline   || "Software Developer",
        },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });

      if (res.error) throw new Error(res.error.message);

      const roadmap = res.data?.roadmap;
      if (roadmap) {
        // ✅ WRITE to shared cache — CareerRoadmap will read this same data
        setCachedRoadmap(uid, prof.skills || [], roadmap);
        applyRoadmapData(roadmap, prof.skills || []);
      }
    } catch (err: any) {
      console.error("Learning path generation failed:", err);
      toast({
        title: "Could not generate learning path",
        description: "Generate your Career Roadmap first, then come back here.",
        variant: "destructive",
      });
    }
    setGenerating(false);
  };

  // ── Refresh — clears cache and regenerates ─────────────────
  const handleRefresh = async () => {
    if (!userId || !profile) return;
    clearRoadmapCache(userId);
    setRecommendations([]);
    setSkillGaps([]);
    await generateFromAI(userId, profile);
  };

  // ── Build a course URL from resource description ───────────
  const getCourseUrl = (item: any): string => {
    const query = encodeURIComponent(`${item.skill} ${item.resource}`);
    const res   = (item.resource || "").toLowerCase();
    if (res.includes("udemy"))    return `https://www.udemy.com/courses/search/?q=${query}`;
    if (res.includes("coursera")) return `https://www.coursera.org/search?query=${query}`;
    if (res.includes("youtube"))  return `https://www.youtube.com/results?search_query=${query}`;
    if (res.includes("github"))   return `https://github.com/search?q=${encodeURIComponent(item.skill)}`;
    return `https://www.google.com/search?q=${query}`;
  };

  const importanceColor = (imp: string) => {
    if (imp === "High")   return "text-destructive bg-destructive/10 border-destructive/20";
    if (imp === "Medium") return "text-warning bg-warning/10 border-warning/20";
    return "text-success bg-success/10 border-success/20";
  };

  const levelLabel = (level: number) => {
    if (level < 30) return "Beginner";
    if (level < 60) return "Intermediate";
    return "Advanced";
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground font-medium">
            {generating ? "Generating your personalised learning path…" : "Loading your profile…"}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            This uses the same data as your Career Roadmap
          </p>
        </div>
      </div>
    );
  }

  // ── No profile skills ──────────────────────────────────────
  if (!profile || (!profile.skills?.length && !profile.experience?.length)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 border-0 shadow-lg text-center max-w-md">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Complete Your Profile First</h2>
          <p className="text-muted-foreground mb-6">
            Add your skills and experience to your profile so we can generate a personalised learning path.
          </p>
          <Button
            className="bg-gradient-primary text-primary-foreground"
            onClick={() => navigate("/jobseeker/profile")}
          >
            Go to Profile
          </Button>
        </Card>
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
                <BookOpen className="w-8 h-8 text-primary" />
                Learning Paths
              </h1>
              <p className="text-muted-foreground mt-1">
                Personalised for{" "}
                <span className="text-primary font-medium">{profile?.full_name || "you"}</span>
                {" "}· same data as your{" "}
                <button
                  onClick={() => navigate("/jobseeker/career-roadmap")}
                  className="text-primary underline font-medium"
                >
                  Career Roadmap
                </button>
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={generating}
              >
                {generating
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Refreshing…</>
                  : <><RefreshCw className="w-4 h-4 mr-2" /> Refresh</>}
              </Button>
              <Button
                className="bg-gradient-primary text-primary-foreground"
                onClick={() => navigate("/jobseeker/career-roadmap")}
              >
                <Map className="w-4 h-4 mr-2" /> View Career Roadmap
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Courses Recommended", value: stats.coursesEnrolled, icon: BookOpen, color: "text-primary" },
              { label: "Hours of Learning",   value: stats.hoursTotal,      icon: Clock,    color: "text-info" },
              { label: "Skills to Improve",   value: stats.skillsToLearn,   icon: Target,   color: "text-warning" },
              { label: "Skills You Have",     value: stats.skillsStrong,    icon: Zap,      color: "text-success" },
            ].map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
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

          {/* No data yet */}
          {skillGaps.length === 0 && recommendations.length === 0 && !generating && (
            <Card className="p-10 border-0 shadow-lg text-center mb-10">
              <Map className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Generate your Career Roadmap first
              </h3>
              <p className="text-muted-foreground mb-6">
                Your Learning Path is derived from your Career Roadmap. Generate it once and both pages stay in sync.
              </p>
              <Button
                className="bg-gradient-primary text-primary-foreground"
                onClick={() => navigate("/jobseeker/career-roadmap")}
              >
                <Map className="w-4 h-4 mr-2" /> Go to Career Roadmap
              </Button>
            </Card>
          )}

          {/* Current Skills */}
          {profile?.skills?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Your Current Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                    <CheckCircle className="w-3 h-3 mr-1 text-success" /> {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Skills to Develop — same as CareerRoadmap sidebar */}
          {skillGaps.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                Skills to Develop
                <span className="text-xs text-muted-foreground font-normal">
                  · same as Career Roadmap
                </span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {skillGaps.map((gap: any, index: number) => (
                  <motion.div
                    key={gap.skill}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card className="p-5 border-0 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-foreground">{gap.skill}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${importanceColor(gap.importance)}`}>
                          {gap.importance} Priority
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>Current: {levelLabel(gap.current_level)}</span>
                        <span>{gap.current_level}%</span>
                      </div>
                      <Progress value={gap.current_level} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">Target: Advanced (80%+)</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Resources — same as CareerRoadmap sidebar */}
          {recommendations.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                Recommended Learning Resources
                <span className="text-xs text-muted-foreground font-normal">
                  · same as Career Roadmap
                </span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((item: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="p-6 border-0 shadow-lg h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">
                          {item.skill}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.duration}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 flex-1 text-sm leading-relaxed">
                        {item.resource}
                      </h3>
                      <Button
                        variant="outline"
                        className="w-full mt-auto"
                        onClick={() => window.open(getCourseUrl(item), "_blank")}
                      >
                        Start Learning <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Practice Interviews",  desc: "Prepare with AI mock interviews",  href: "/jobseeker/interview-prep",  icon: "🎤" },
              { title: "Analyse Resume",        desc: "Get AI feedback on your resume",    href: "/jobseeker/resume-analysis",   icon: "📄" },
              { title: "Career Roadmap",        desc: "See your full career plan",          href: "/jobseeker/career-roadmap",    icon: "🗺️" },
            ].map(link => (
              <Card
                key={link.href}
                className="p-5 border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => navigate(link.href)}
              >
                <div className="text-2xl mb-2">{link.icon}</div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </Card>
            ))}
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default LearningPath;