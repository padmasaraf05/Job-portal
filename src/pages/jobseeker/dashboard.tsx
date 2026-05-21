import { motion } from "framer-motion";
import {
  Briefcase, Target, TrendingUp, Sparkles,
  BookOpen, Award, ChevronRight, Zap,
  Clock, MapPin, Map,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatSalary } from "@/lib/salaryUtils";


// ── Shared skill match calculation (same as JobSearch) ────────
function calcMatch(jobSkills: string[], userSkills: string[]): number {
  if (!jobSkills || jobSkills.length === 0) return 70;
  if (!userSkills || userSkills.length === 0) return 30;
  const userLower = userSkills.map(s => s.toLowerCase().trim());
  const matched   = jobSkills.filter(s =>
    userLower.some(us => us.includes(s.toLowerCase().trim()) || s.toLowerCase().trim().includes(us))
  );
  return Math.min(99, Math.max(20, Math.round((matched.length / jobSkills.length) * 100)));
}

const careerInsights = [
  {
    title: "Analyse your resume with AI",
    description: "Get a detailed score and improvement tips",
    icon: Sparkles,
    action: "Analyse Now",
    path: "/jobseeker/resume-analysis",
  },
  {
    title: "Practice mock interviews",
    description: "AI-generated questions with instant feedback",
    icon: BookOpen,
    action: "Start Practice",
    path: "/jobseeker/interview-prep",
  },
  {
    title: "Generate your career roadmap",
    description: "Personalised step-by-step career plan",
    icon: Map,
    action: "Generate",
    path: "/jobseeker/career-roadmap",
  },
  {
  title: "Take skill assessments",
  description: "Validate your skills with AI-generated quizzes",
  icon: Target,
  action: "Start Assessment",
  path: "/jobseeker/skill-assessment",
},
];

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [userName, setUserName]               = useState("there");
  const [applicationCount, setApplicationCount] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [userSkills, setUserSkills]           = useState<string[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Application count
      const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("jobseeker_id", user.id);
      setApplicationCount(count || 0);

      // 2. Profile → name, skills, completion %
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, skills, resume_url, bio, phone, avatar_url")
        .eq("id", user.id)
        .single();

      let skills: string[] = [];
      if (profile) {
        setUserName(profile.full_name?.split(" ")[0] || "there");
        skills = Array.isArray(profile.skills) ? profile.skills : [];
        setUserSkills(skills);

        const fields = [
          profile.full_name,
          profile.bio,
          profile.phone,
          profile.avatar_url,
          profile.resume_url,
          skills.length > 0,
        ];
        const filled = fields.filter(Boolean).length;
        setProfileCompletion(Math.round((filled / fields.length) * 100));
      }

      // 3. Latest 3 active jobs with real match %
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, title, company, location, salary, salary_min, salary_max, type, created_at, skills")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6); // fetch 6, sort by match, show top 3

      if (jobs) {
        const withMatch = jobs
          .map((job: any) => ({
            ...job,
            salaryDisplay: formatSalary(job.salary_min, job.salary_max, job.salary),
            // ✅ Real match calculation — same logic as JobSearch
            match: calcMatch(
              Array.isArray(job.skills) ? job.skills : [],
              skills
            ),
            posted: new Date(job.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "short",
            }),
          }))
          .sort((a, b) => b.match - a.match) // highest match first
          .slice(0, 3);

        setRecommendedJobs(withMatch);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: "Profile Views",
      value: "—",
      change: "Coming soon",
      icon: Target,
      color: "bg-gradient-primary",
      onClick: undefined,
    },
    {
      label: "Applications",
      value: applicationCount.toString(),
      change: "View all",
      icon: Briefcase,
      color: "bg-gradient-accent",
      onClick: () => navigate("/jobseeker/applications"),
    },
    {
      label: "Interview Invites",
      value: "—",
      change: "Coming soon",
      icon: Award,
      color: "bg-gradient-success",
      onClick: undefined,
    },
    {
      label: "Profile Complete",
      value: `${profileCompletion}%`,
      change: profileCompletion < 100 ? "Improve now" : "Complete!",
      icon: Sparkles,
      color: "bg-primary",
      onClick: () => navigate("/jobseeker/profile"),
    },
  ];

  const matchColor = (pct: number) =>
    pct >= 75 ? "bg-success/10 text-success" :
    pct >= 50 ? "bg-warning/10 text-warning" :
    "bg-secondary text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-hero text-primary-foreground py-12 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-lg opacity-90">
              Your career journey is looking bright. Here's what's happening today.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-6">
        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              onClick={stat.onClick}
              className={stat.onClick ? "cursor-pointer" : ""}
            >
              <Card className="p-6 card-hover bg-card border-0 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-success mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl text-primary-foreground`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Recommended Jobs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Recommended for You</h2>
                  {userSkills.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Based on your {userSkills.length} skills · sorted by match
                    </p>
                  )}
                </div>
                <Button onClick={() => navigate("/jobseeker/jobs")} variant="ghost" size="sm" className="text-primary">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 rounded-xl bg-secondary/50 animate-pulse">
                      <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
                      <div className="h-3 bg-secondary rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : recommendedJobs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground text-sm">No jobs posted yet. Check back soon!</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate("/jobseeker/jobs")}>
                    Browse all jobs
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      onClick={() => navigate(`/jobseeker/job/${job.id}`)}
                      className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {job.title}
                            </h3>
                            {job.type && <Badge variant="secondary" className="text-xs shrink-0">{job.type}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {job.posted}
                            </span>
                            <span className="font-medium text-foreground">{job.salaryDisplay}</span>
                          </div>
                        </div>
                        <div className="shrink-0 ml-3">
                          {/* ✅ Real match % with colour coding */}
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${matchColor(job.match)}`}>
                            <Zap className="w-3 h-3" />
                            {job.match}% Match
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* AI Career Coach */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-semibold text-foreground mb-6">AI Career Coach</h2>
              <div className="space-y-4">
                {careerInsights.map((insight, index) => (
                  <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 rounded-xl border border-border hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => navigate(insight.path)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <insight.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="w-full mt-3 text-primary text-xs">
                      {insight.action}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Profile Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pb-8"
        >
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  A complete profile gets 3× more interview calls from recruiters!
                </p>
                <div className="flex items-center gap-4">
                  <Progress value={profileCompletion} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-foreground">{profileCompletion}%</span>
                </div>
              </div>
              <Button
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                onClick={() => navigate("/jobseeker/profile")}
              >
                Complete Now
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;