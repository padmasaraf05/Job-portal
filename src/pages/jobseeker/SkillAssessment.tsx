import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Clock, CheckCircle, Award,
  Play, BarChart3, Zap, Lock,
  Loader2, RefreshCw, X, ChevronRight, Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────
interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface AssessmentItem {
  id: string;
  title: string;
  category: string;
  questions: number;
  duration: string;
  difficulty: string;
  skill: string;
}

// ── Always-available universal assessments ─────────────────────
const UNIVERSAL: AssessmentItem[] = [
  { id: "dsa",          title: "Data Structures & Algorithms", category: "Programming",  questions: 10, duration: "~5 mins", difficulty: "Advanced",     skill: "DSA" },
  { id: "system-design",title: "System Design Basics",         category: "Architecture", questions: 10, duration: "~5 mins", difficulty: "Advanced",     skill: "System Design" },
  { id: "git",          title: "Git & Version Control",        category: "DevOps",       questions: 10, duration: "~5 mins", difficulty: "Beginner",     skill: "Git" },
];

// ── Skill → catalogue entry mapping ───────────────────────────
// Used to build profile-based assessments
const SKILL_MAP: Record<string, Omit<AssessmentItem, "id" | "skill">> = {
  "javascript": { title: "JavaScript Fundamentals",  category: "Programming", questions: 10, duration: "~5 mins", difficulty: "Beginner"     },
  "js":         { title: "JavaScript Fundamentals",  category: "Programming", questions: 10, duration: "~5 mins", difficulty: "Beginner"     },
  "react":      { title: "React.js",                 category: "Frontend",    questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "typescript": { title: "TypeScript Essentials",    category: "Programming", questions: 10, duration: "~5 mins", difficulty: "Beginner"     },
  "ts":         { title: "TypeScript Essentials",    category: "Programming", questions: 10, duration: "~5 mins", difficulty: "Beginner"     },
  "css":        { title: "CSS & Tailwind",            category: "Frontend",    questions: 10, duration: "~5 mins", difficulty: "Beginner"     },
  "html":       { title: "HTML Essentials",           category: "Frontend",    questions: 10, duration: "~5 mins", difficulty: "Beginner"     },
  "nodejs":     { title: "Node.js Backend",           category: "Backend",     questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "node.js":    { title: "Node.js Backend",           category: "Backend",     questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "node":       { title: "Node.js Backend",           category: "Backend",     questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "python":     { title: "Python Basics",             category: "Programming", questions: 10, duration: "~5 mins", difficulty: "Beginner"     },
  "sql":        { title: "SQL & Databases",           category: "Backend",     questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "java":       { title: "Java Fundamentals",         category: "Programming", questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "c++":        { title: "C++ Basics",                category: "Programming", questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "docker":     { title: "Docker & Containers",       category: "DevOps",      questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "aws":        { title: "AWS Cloud Basics",          category: "Cloud",       questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "mongodb":    { title: "MongoDB Basics",            category: "Backend",     questions: 10, duration: "~5 mins", difficulty: "Beginner"     },
  "graphql":    { title: "GraphQL APIs",              category: "Backend",     questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "vue":        { title: "Vue.js Basics",             category: "Frontend",    questions: 10, duration: "~5 mins", difficulty: "Beginner"     },
  "angular":    { title: "Angular Fundamentals",      category: "Frontend",    questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "flutter":    { title: "Flutter Basics",            category: "Mobile",      questions: 10, duration: "~5 mins", difficulty: "Beginner"     },
  "kotlin":     { title: "Kotlin Fundamentals",       category: "Mobile",      questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "spring":     { title: "Spring Boot",               category: "Backend",     questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
  "spring boot":{ title: "Spring Boot",               category: "Backend",     questions: 10, duration: "~5 mins", difficulty: "Intermediate" },
};

function buildCatalogue(profileSkills: string[]): AssessmentItem[] {
  const seen = new Set<string>();
  const items: AssessmentItem[] = [];

  // Profile skills first
  for (const raw of profileSkills) {
    const key = raw.toLowerCase().trim();
    const entry = SKILL_MAP[key];
    if (entry && !seen.has(key)) {
      seen.add(key);
      items.push({ id: key, skill: raw, ...entry });
    }
  }

  // Add universals not already present
  for (const u of UNIVERSAL) {
    if (!seen.has(u.skill.toLowerCase())) {
      seen.add(u.skill.toLowerCase());
      items.push(u);
    }
  }

  return items;
}

const TIME_PER_QUESTION = 30;

function getBadge(score: number): string {
  if (score >= 90) return "Expert";
  if (score >= 75) return "Proficient";
  if (score >= 60) return "Competent";
  return "Beginner";
}

function getBadgeEmoji(badge: string): string {
  if (badge === "Expert")     return "🏆";
  if (badge === "Proficient") return "⭐";
  if (badge === "Competent")  return "✅";
  return "📘";
}

// ──────────────────────────────────────────────────────────────
const SkillAssessment = () => {
  const { toast } = useToast();

  // ── Page state ────────────────────────────────────────────────
  const [loading, setLoading]               = useState(true);
  const [userId, setUserId]                 = useState<string | null>(null);
  const [completedList, setCompletedList]   = useState<any[]>([]);
  const [profileSkills, setProfileSkills]   = useState<string[]>([]);
  const [skillScores, setSkillScores]       = useState<Record<string, number>>({});
  const [catalogue, setCatalogue]           = useState<AssessmentItem[]>([]);
  const [activeTab, setActiveTab]           = useState("available");

  // ── Quiz state — kept flat to avoid object recreation issues ──
  const [quizPhase, setQuizPhase]       = useState<"idle"|"loading"|"quiz"|"results">("idle");
  const [quizAssessment, setQuizAssessment] = useState<AssessmentItem | null>(null);
  const [questions, setQuestions]       = useState<Question[]>([]);
  const [currentQ, setCurrentQ]         = useState(0);
  const [selected, setSelected]         = useState<number | null>(null);
  const [answered, setAnswered]         = useState(false);
  const [answers, setAnswers]           = useState<(number|null)[]>([]);
  const [corrects, setCorrects]         = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft]         = useState(TIME_PER_QUESTION);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load data ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const [profileRes, assessRes] = await Promise.all([
        supabase.from("profiles").select("skills").eq("id", user.id).single(),
        supabase.from("skill_assessments").select("*").eq("jobseeker_id", user.id).order("completed_at", { ascending: false }),
      ]);

      const skills = Array.isArray(profileRes.data?.skills) ? profileRes.data.skills : [];
      setProfileSkills(skills);
      setCatalogue(buildCatalogue(skills));

      const completed = assessRes.data || [];
      setCompletedList(completed);

      const scoreMap: Record<string, number> = {};
      completed.forEach((a: any) => { if (a.skill_name && a.score) scoreMap[a.skill_name] = a.score; });
      setSkillScores(scoreMap);
      setLoading(false);
    };
    fetchData();
  }, []);

  // ── Timer ─────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // Start timer whenever currentQ changes during quiz
  useEffect(() => {
    if (quizPhase !== "quiz" || answered) return;
    setTimeLeft(TIME_PER_QUESTION);
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          stopTimer();
          // Time's up — mark as wrong, auto-advance
          setAnswered(true);
          setAnswers(prev => { const a = [...prev]; a[currentQ] = null; return a; });
          setCorrects(prev => { const c = [...prev]; c[currentQ] = false; return c; });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return stopTimer;
  }, [currentQ, quizPhase]); // only deps that should restart the timer

  useEffect(() => () => stopTimer(), []);

  // ── Save results when quiz ends ───────────────────────────────
  useEffect(() => {
    if (quizPhase !== "results" || !userId || !quizAssessment) return;
    const correct    = corrects.filter(Boolean).length;
    const total      = questions.length;
    const score      = total > 0 ? Math.round((correct / total) * 100) : 0;
    const percentile = Math.min(95, Math.max(20, score - 5 + Math.floor(Math.random() * 15)));
    const badge      = getBadge(score);

    supabase.from("skill_assessments").insert({
      jobseeker_id: userId,
      skill_name:   quizAssessment.skill,
      score, percentile, badge,
      completed_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (!error) {
        const entry = { skill_name: quizAssessment.skill, score, percentile, badge, completed_at: new Date().toISOString() };
        setCompletedList(prev => [entry, ...prev]);
        setSkillScores(prev => ({ ...prev, [quizAssessment.skill]: score }));
        toast({ title: `${quizAssessment.skill} complete! ${score}% — ${badge} ${getBadgeEmoji(badge)}` });
      }
    });
  }, [quizPhase]);

  // ── Start quiz ────────────────────────────────────────────────
  const startQuiz = async (assessment: AssessmentItem) => {
    stopTimer();
    setQuizPhase("loading");
    setQuizAssessment(assessment);
    setQuestions([]);
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setAnswers(new Array(assessment.questions).fill(null));
    setCorrects(new Array(assessment.questions).fill(false));
    setTimeLeft(TIME_PER_QUESTION);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("skill-quiz", {
        body: { skill: assessment.skill, difficulty: assessment.difficulty, count: assessment.questions },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (res.error) throw new Error(res.error.message);
      const qs: Question[] = res.data?.questions;
      if (!qs?.length) throw new Error("No questions returned");
      setQuestions(qs);
      setQuizPhase("quiz");
    } catch (err: any) {
      toast({ title: "Failed to load quiz", description: err.message, variant: "destructive" });
      setQuizPhase("idle");
    }
  };

  // ── Select answer ─────────────────────────────────────────────
  const selectAnswer = useCallback((optionIndex: number) => {
    if (answered) return;
    stopTimer();
    const isCorrect = optionIndex === questions[currentQ]?.correct;
    setSelected(optionIndex);
    setAnswered(true);
    setAnswers(prev => { const a = [...prev]; a[currentQ] = optionIndex; return a; });
    setCorrects(prev => { const c = [...prev]; c[currentQ] = isCorrect; return c; });
    if (currentQ >= questions.length - 1) {
      // Small delay so user sees the result before results screen
      setTimeout(() => setQuizPhase("results"), 1500);
    }
  }, [answered, currentQ, questions, stopTimer]);

  // ── Next question ─────────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    if (currentQ >= questions.length - 1) return;
    setCurrentQ(q => q + 1);
    setSelected(null);
    setAnswered(false);
  }, [currentQ, questions.length]);

  // ── Close quiz ────────────────────────────────────────────────
  const closeQuiz = () => { stopTimer(); setQuizPhase("idle"); };

  // ── Derived ───────────────────────────────────────────────────
  const completedSkillNames = completedList.map(c => c.skill_name);
  const available   = catalogue.filter(a => !completedSkillNames.includes(a.skill));
  const skillOverview = profileSkills.slice(0, 8).map(s => ({ skill: s, score: skillScores[s] ?? 0 }));
  const earnedBadges  = completedList.map(a => ({
    name: a.skill_name, icon: getBadgeEmoji(a.badge || getBadge(a.score)),
    score: a.score, badge: a.badge || getBadge(a.score),
  }));

  const quizScore = questions.length > 0
    ? Math.round((corrects.filter(Boolean).length / questions.length) * 100) : 0;

  const timerPct   = (timeLeft / TIME_PER_QUESTION) * 100;
  const timerColor = timeLeft <= 10 ? "text-destructive" : timeLeft <= 20 ? "text-warning" : "text-primary";

  const optionStyle = (i: number) => {
    const q = questions[currentQ];
    if (!q) return "";
    if (!answered) {
      return selected === i
        ? "border-primary bg-primary/10 text-foreground"
        : "border-border hover:border-primary/50 hover:bg-primary/5 text-foreground cursor-pointer";
    }
    if (i === q.correct)                    return "border-success bg-success/10 text-success";
    if (i === selected && i !== q.correct)  return "border-destructive bg-destructive/10 text-destructive";
    return "border-border text-muted-foreground opacity-50";
  };

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── LOADING OVERLAY ── */}
      {quizPhase === "loading" && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">Generating questions…</p>
            <p className="text-muted-foreground text-sm mt-1">
              AI is creating {quizAssessment?.questions} questions for {quizAssessment?.skill}
            </p>
          </div>
        </div>
      )}

      {/* ── QUIZ OVERLAY — rendered inline, no sub-component ── */}
      {quizPhase === "quiz" && questions[currentQ] && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{quizAssessment?.title}</p>
                <p className="font-semibold text-foreground">
                  Question {currentQ + 1} of {questions.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 font-mono font-bold text-xl ${timerColor}`}>
                  <Clock className="w-5 h-5" />
                  {timeLeft}s
                </div>
                <Button variant="ghost" size="icon" onClick={closeQuiz}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1.5 mb-5">
              <Progress value={((currentQ) / questions.length) * 100} className="h-1.5" />
              <div
                className="h-1.5 rounded-full transition-all duration-1000"
                style={{
                  width: `${timerPct}%`,
                  backgroundColor: timeLeft <= 10 ? "hsl(var(--destructive))" : timeLeft <= 20 ? "hsl(38,92%,50%)" : "hsl(var(--primary))",
                }}
              />
            </div>

            {/* Answer tracker dots */}
           {/* Answer tracker dots */}
<div className="flex gap-1.5 mb-5">
  {questions.map((_, i) => (
    <div
      key={i}
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
        i < currentQ || (i === currentQ && answered)
          ? corrects[i]
            ? "bg-success text-black"
            : "bg-destructive text-white"
          : i === currentQ
          ? "bg-primary text-white"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {i < currentQ || (i === currentQ && answered)
        ? corrects[i] ? "✓" : "✗"
        : i + 1}
    </div>
  ))}
</div>

            {/* Question card */}
            <Card className="p-6 border-0 shadow-xl mb-4">
              <p className="text-lg font-semibold text-foreground mb-6 leading-relaxed">
                {questions[currentQ].question}
              </p>

              <div className="space-y-3">
                {questions[currentQ].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    disabled={answered}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-sm leading-relaxed ${optionStyle(i)}`}
                  >
                    <span className="font-bold mr-3 text-muted-foreground">
                      {["A", "B", "C", "D"][i]}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>

              {/* Explanation after answering */}
              {answered && (
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs font-semibold text-primary mb-1">💡 Explanation</p>
                  <p className="text-sm text-muted-foreground">{questions[currentQ].explanation}</p>
                </div>
              )}
            </Card>

            {/* Next / Finish */}
            {answered && currentQ < questions.length - 1 && (
              <div className="flex justify-end">
                <Button className="bg-gradient-primary text-primary-foreground" onClick={nextQuestion}>
                  Next Question <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
            {answered && currentQ === questions.length - 1 && (
              <div className="flex justify-end">
                <Button className="bg-gradient-primary text-primary-foreground" onClick={() => setQuizPhase("results")}>
                  See Results <Trophy className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RESULTS OVERLAY — inline ── */}
      {quizPhase === "results" && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <Card className="p-8 border-0 shadow-2xl text-center">
              {/* Score ring */}
              <div className="relative w-36 h-36 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted/30" />
                  <circle
                    cx="72" cy="72" r="60"
                    stroke="currentColor" strokeWidth="10" fill="none"
                    strokeDasharray={`${quizScore * 3.77} 377`}
                    strokeLinecap="round"
                    className={quizScore >= 75 ? "text-success" : quizScore >= 60 ? "text-warning" : "text-destructive"}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{quizScore}%</span>
                  <span className="text-xs text-muted-foreground">Score</span>
                </div>
              </div>

              <div className="text-3xl mb-1">{getBadgeEmoji(getBadge(quizScore))}</div>
              <h2 className="text-2xl font-bold text-foreground mb-1">{getBadge(quizScore)}!</h2>
              <p className="text-muted-foreground mb-5">
                {quizAssessment?.title} · {corrects.filter(Boolean).length}/{questions.length} correct
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-5 p-4 rounded-xl bg-secondary/50">
                <div>
                  <p className="text-2xl font-bold text-success">{corrects.filter(Boolean).length}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="border-x border-border">
                  <p className="text-2xl font-bold text-destructive">{questions.length - corrects.filter(Boolean).length}</p>
                  <p className="text-xs text-muted-foreground">Wrong</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{questions.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>

              {/* Review */}
              <div className="text-left space-y-2 mb-5 max-h-44 overflow-y-auto pr-1">
                {questions.map((q, i) => (
                  <div key={i} className={`p-3 rounded-lg text-sm flex items-start gap-2 ${corrects[i] ? "bg-success/10" : "bg-destructive/10"}`}>
                    <span className={`shrink-0 font-bold ${corrects[i] ? "text-success" : "text-destructive"}`}>
                      {corrects[i] ? "✓" : "✗"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-foreground font-medium line-clamp-1">{q.question}</p>
                      {!corrects[i] && (
                        <p className="text-xs text-muted-foreground mt-0.5">Correct: {q.options[q.correct]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1"
                  onClick={() => { setQuizPhase("idle"); setActiveTab("completed"); }}>
                  View Results
                </Button>
                <Button className="flex-1 bg-gradient-primary text-primary-foreground"
                  onClick={() => quizAssessment && startQuiz(quizAssessment)}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Retake
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── MAIN PAGE ── */}
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                Skill Assessments
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-generated quizzes based on your profile skills · 10 questions · 30s per question
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">

                {/* Main */}
                <div className="lg:col-span-2">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="available">Available ({available.length})</TabsTrigger>
                      <TabsTrigger value="completed">Completed ({completedList.length})</TabsTrigger>
                    </TabsList>

                    {/* Available */}
                    <TabsContent value="available" className="space-y-4">
                      {profileSkills.length === 0 && (
                        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 mb-4">
                          <p className="text-sm text-warning font-medium">No skills on your profile</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Assessments below are universal. Add skills to your profile for personalised quizzes.
                          </p>
                        </div>
                      )}

                      {available.length === 0 ? (
                        <Card className="p-10 border-0 shadow-lg text-center">
                          <Trophy className="w-12 h-12 text-warning mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">All done!</h3>
                          <p className="text-muted-foreground">You've completed assessments for all your profile skills.</p>
                        </Card>
                      ) : (
                        available.map((assessment, index) => (
                          <motion.div key={assessment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
                            <Card className="p-6 border-0 shadow-lg card-hover">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shrink-0">
                                  <Target className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground">{assessment.title}</h3>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <span>{assessment.category}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {assessment.duration}</span>
                                    <span>{assessment.questions} questions · 30s each</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <Badge variant={assessment.difficulty === "Beginner" ? "secondary" : assessment.difficulty === "Intermediate" ? "outline" : "destructive"}>
                                    {assessment.difficulty}
                                  </Badge>
                                  <div className="mt-3">
                                    <Button className="bg-gradient-primary text-primary-foreground" onClick={() => startQuiz(assessment)}>
                                      <Play className="w-4 h-4 mr-2" /> Start Quiz
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </TabsContent>

                    {/* Completed */}
                    <TabsContent value="completed" className="space-y-4">
                      {completedList.length === 0 ? (
                        <Card className="p-10 border-0 shadow-lg text-center">
                          <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">No assessments yet</h3>
                          <p className="text-muted-foreground mb-4">Take your first quiz to validate your skills.</p>
                          <Button onClick={() => setActiveTab("available")} className="bg-gradient-primary text-primary-foreground">Browse Assessments</Button>
                        </Card>
                      ) : (
                        completedList.map((a, index) => (
                          <motion.div key={`${a.skill_name}-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
                            <Card className="p-6 border-0 shadow-lg">
                              <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center shrink-0 text-2xl">
                                  {getBadgeEmoji(a.badge || getBadge(a.score))}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-foreground">{a.skill_name}</h3>
                                    <Badge className="bg-success/10 text-success border-0">{a.badge || getBadge(a.score)}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {a.completed_at ? new Date(a.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                                  </p>
                                  <div className="grid grid-cols-3 gap-4 mt-4 p-4 rounded-xl bg-secondary/50">
                                    <div className="text-center">
                                      <p className={`text-2xl font-bold ${a.score >= 75 ? "text-success" : a.score >= 60 ? "text-warning" : "text-destructive"}`}>{a.score}%</p>
                                      <p className="text-xs text-muted-foreground">Score</p>
                                    </div>
                                    <div className="text-center border-x border-border">
                                      <p className="text-2xl font-bold text-primary">{a.percentile ? `${a.percentile}th` : "—"}</p>
                                      <p className="text-xs text-muted-foreground">Percentile</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-2xl">{getBadgeEmoji(a.badge || getBadge(a.score))}</p>
                                      <p className="text-xs text-muted-foreground">Badge</p>
                                    </div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  const cat = catalogue.find(c => c.skill === a.skill_name)
                                    || { id: a.skill_name, skill: a.skill_name, title: a.skill_name, category: "Programming", questions: 10, duration: "~5 mins", difficulty: "Intermediate" };
                                  startQuiz(cat as AssessmentItem);
                                }}>
                                  <RefreshCw className="w-4 h-4 mr-1" /> Retake
                                </Button>
                              </div>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" /> Skill Overview
                    </h3>
                    {skillOverview.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Add skills to your profile</p>
                    ) : (
                      <div className="space-y-4">
                        {skillOverview.map(item => (
                          <div key={item.skill}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-foreground">{item.skill}</span>
                              <span className="text-muted-foreground text-xs">{item.score > 0 ? `${item.score}%` : "Not assessed"}</span>
                            </div>
                            <Progress value={item.score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" /> Earned Badges
                    </h3>
                    {earnedBadges.length === 0 ? (
                      <div className="text-center py-4">
                        <Lock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Complete quizzes to earn badges</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {earnedBadges.slice(0, 6).map((badge, i) => (
                          <div key={i} className="p-4 rounded-xl text-center bg-primary/10">
                            <span className="text-3xl">{badge.icon}</span>
                            <p className="text-xs font-medium text-foreground mt-2 truncate">{badge.name}</p>
                            <p className="text-xs text-success mt-0.5">{badge.score}% · {badge.badge}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
                    <div className="flex items-start gap-3">
                      <Zap className="w-6 h-6 text-primary shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground">How it works</h4>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          <li>• Quizzes based on your profile skills</li>
                          <li>• AI generates fresh questions each time</li>
                          <li>• 30 seconds per question</li>
                          <li>• Instant explanation after each answer</li>
                          <li>• Score saved to your profile</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SkillAssessment;