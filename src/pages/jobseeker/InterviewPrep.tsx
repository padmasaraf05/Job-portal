import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Mic, MicOff, Play, SkipForward, MessageSquare,
  ThumbsUp, ThumbsDown, Clock, Target, Sparkles, ChevronRight,
  RefreshCw, Loader2, CheckCircle, Send, History, BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────
interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: string;
  tips: string[];
}

interface Feedback {
  score: number;
  overall: string;
  strengths: string[];
  improvements: string[];
  ideal_answer_hint: string;
}

interface Session {
  id: string;
  interview_type: string;
  difficulty: string;
  questions: Question[];
  responses: { answer: string; feedback: Feedback }[];
  overall_score: number;
  completed_at: string;
}

// ─── Edge Function caller ─────────────────────────────────────
async function callMockInterview(payload: object) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await supabase.functions.invoke("mock-interview", {
    body: payload,
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {},
  });
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

const InterviewPrep = () => {
  const { toast } = useToast();

  // Setup
  const [interviewType, setInterviewType] = useState("HR");
  const [jobRole, setJobRole]             = useState("Frontend Developer");
  const [difficulty, setDifficulty]       = useState("Medium");

  // Session state
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questions, setQuestions]           = useState<Question[]>([]);
  const [currentQ, setCurrentQ]             = useState(0);
  const [answer, setAnswer]                 = useState("");
  const [feedbacks, setFeedbacks]           = useState<(Feedback | null)[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Loading states
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingFeedback, setLoadingFeedback]   = useState(false);

  // Voice recording
  const [isRecording, setIsRecording]     = useState(false);
  const [recordingText, setRecordingText] = useState("");
  const recognitionRef = useRef<any>(null);

  // History
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // ── Fetch past sessions ─────────────────────────────────────
  const fetchSessions = async () => {
    setLoadingSessions(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoadingSessions(false); return; }

    const { data } = await supabase
      .from("interviews")
      .select("*")
      .eq("jobseeker_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(10);

    setSessions((data || []) as Session[]);
    setLoadingSessions(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  // ── Start session ───────────────────────────────────────────
  const startSession = async () => {
    setLoadingQuestions(true);
    try {
      const { questions: qs } = await callMockInterview({
        action: "generate_questions",
        interviewType,
        jobRole,
        difficulty,
      });
      setQuestions(qs);
      setFeedbacks(new Array(qs.length).fill(null));
      setCurrentQ(0);
      setAnswer("");
      setSessionStarted(true);
      setSessionComplete(false);
    } catch (err: any) {
      toast({ title: "Failed to generate questions", description: err.message, variant: "destructive" });
    }
    setLoadingQuestions(false);
  };

  // ── Submit answer for scoring ───────────────────────────────
  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast({ title: "Please type or record your answer first" });
      return;
    }
    setLoadingFeedback(true);
    try {
      const { feedback } = await callMockInterview({
        action: "score_answer",
        question: questions[currentQ].question,
        answer,
      });

      const updated = [...feedbacks];
      updated[currentQ] = feedback;
      setFeedbacks(updated);
    } catch (err: any) {
      toast({ title: "Feedback failed", description: err.message, variant: "destructive" });
    }
    setLoadingFeedback(false);
  };

  // ── Next question ───────────────────────────────────────────
  const nextQuestion = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setAnswer("");
    } else {
      // All questions done — save session
      await saveSession();
      setSessionComplete(true);
    }
  };

  // ── Save session to DB ──────────────────────────────────────
  const saveSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const answeredFeedbacks = feedbacks.filter(Boolean) as Feedback[];
    const avgScore = answeredFeedbacks.length > 0
      ? Math.round(answeredFeedbacks.reduce((s, f) => s + f.score, 0) / answeredFeedbacks.length)
      : 0;

    await supabase.from("interviews").insert({
      jobseeker_id: user.id,
      interview_type: interviewType,
      difficulty,
      questions,
      responses: feedbacks.map((f, i) => ({
        question: questions[i]?.question,
        feedback: f,
      })),
      overall_score: avgScore,
      completed_at: new Date().toISOString(),
    });

    fetchSessions();
  };

  // ── Voice recording via Web Speech API ─────────────────────
  const toggleRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({ title: "Voice not supported", description: "Use Chrome or Edge for voice input.", variant: "destructive" });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
      setRecordingText(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast({ title: "Microphone error", description: "Check microphone permissions.", variant: "destructive" });
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // ── Overall score calc ──────────────────────────────────────
  const overallScore = () => {
    const answered = feedbacks.filter(Boolean) as Feedback[];
    if (!answered.length) return 0;
    return Math.round(answered.reduce((s, f) => s + f.score, 0) / answered.length);
  };

  // ─── SETUP SCREEN ─────────────────────────────────────────
  const SetupScreen = () => (
    <Card className="p-8 border-0 shadow-lg max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Configure Your Interview</h2>
        <p className="text-muted-foreground mt-2">AI will generate 5 tailored questions for you</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Interview Type</label>
          <div className="grid grid-cols-3 gap-3">
            {["HR", "Technical", "Behavioral"].map((type) => (
              <button
                key={type}
                onClick={() => setInterviewType(type)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  interviewType === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Target Job Role</label>
          <Select value={jobRole} onValueChange={setJobRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Frontend Developer", "Backend Developer", "Full Stack Developer",
                "React Developer", "Node.js Developer", "Data Analyst",
                "UI/UX Designer", "DevOps Engineer", "Product Manager", "QA Engineer"]
                .map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {["Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  difficulty === d
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full h-12 bg-gradient-primary text-primary-foreground text-base"
          onClick={startSession}
          disabled={loadingQuestions}
        >
          {loadingQuestions
            ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Questions…</>
            : <><Sparkles className="w-5 h-5 mr-2" /> Start AI Interview</>}
        </Button>
      </div>
    </Card>
  );

  // ─── SESSION COMPLETE SCREEN ─────────────────────────────────
  const CompleteScreen = () => {
    const score = overallScore();
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="p-10 border-0 shadow-lg max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Session Complete!</h2>
          <p className="text-muted-foreground mb-6">Great effort! Here's your performance summary.</p>

          <div className="text-6xl font-bold mb-2" style={{
            color: score >= 75 ? "hsl(var(--success))" : score >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))"
          }}>
            {score}%
          </div>
          <p className="text-muted-foreground mb-8">Overall Score</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {feedbacks.filter(Boolean).map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Q{i + 1}</p>
                <p className="text-lg font-bold text-foreground">{(f as Feedback).score}%</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setSessionStarted(false); setSessionComplete(false); }}>
              <RefreshCw className="w-4 h-4 mr-2" /> New Session
            </Button>
            <Button className="bg-gradient-primary text-primary-foreground" onClick={() => {
              setSessionStarted(true);
              setSessionComplete(false);
              setCurrentQ(0);
              setAnswer("");
              setFeedbacks(new Array(questions.length).fill(null));
            }}>
              Review Answers
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Video className="w-8 h-8 text-primary" />
              AI Interview Coach
            </h1>
            <p className="text-muted-foreground mt-1">
              Practice with AI-generated questions and get instant feedback
            </p>
          </div>

          <Tabs defaultValue="practice">
            <TabsList className="mb-6">
              <TabsTrigger value="practice"><Play className="w-4 h-4 mr-1" /> Practice</TabsTrigger>
              <TabsTrigger value="history"><History className="w-4 h-4 mr-1" /> Past Sessions</TabsTrigger>
            </TabsList>

            {/* ── PRACTICE TAB ── */}
            <TabsContent value="practice">
              {sessionComplete ? (
                <CompleteScreen />
              ) : !sessionStarted ? (
                <SetupScreen />
              ) : (
                <div className="grid lg:grid-cols-3 gap-8">

                  {/* Main area */}
                  <div className="lg:col-span-2 space-y-6">

                    {/* Progress bar */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground shrink-0">
                        Question {currentQ + 1} of {questions.length}
                      </span>
                      <Progress value={((currentQ + 1) / questions.length) * 100} className="flex-1" />
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSessionStarted(false);
                        setSessionComplete(false);
                      }}>
                        Exit
                      </Button>
                    </div>

                    {/* Question card */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQ}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <Card className="p-6 border-0 shadow-lg border-l-4 border-l-primary">
                          <div className="flex items-center gap-3 mb-4">
                            <Badge variant="secondary">{questions[currentQ]?.category}</Badge>
                            <Badge variant={
                              questions[currentQ]?.difficulty === "Easy" ? "secondary" :
                              questions[currentQ]?.difficulty === "Medium" ? "outline" : "destructive"
                            }>
                              {questions[currentQ]?.difficulty}
                            </Badge>
                          </div>
                          <h2 className="text-xl font-semibold text-foreground">
                            {questions[currentQ]?.question}
                          </h2>
                        </Card>
                      </motion.div>
                    </AnimatePresence>

                    {/* Answer input */}
                    <Card className="p-6 border-0 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-foreground">Your Answer</h3>
                        <Button
                          variant={isRecording ? "destructive" : "outline"}
                          size="sm"
                          onClick={toggleRecording}
                          className="gap-2"
                        >
                          {isRecording
                            ? <><MicOff className="w-4 h-4" /> Stop Recording</>
                            : <><Mic className="w-4 h-4" /> Voice Input</>}
                        </Button>
                      </div>

                      {isRecording && (
                        <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-destructive/10">
                          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                          <span className="text-sm text-destructive">Recording… speak clearly</span>
                        </div>
                      )}

                      <Textarea
                        placeholder="Type your answer here, or click Voice Input to speak…"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />

                      <div className="flex gap-3 mt-4">
                        <Button
                          className="flex-1 bg-gradient-primary text-primary-foreground"
                          onClick={submitAnswer}
                          disabled={loadingFeedback || !answer.trim()}
                        >
                          {loadingFeedback
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analysing…</>
                            : <><Send className="w-4 h-4 mr-2" /> Get AI Feedback</>}
                        </Button>
                        {feedbacks[currentQ] && (
                          <Button variant="outline" onClick={nextQuestion}>
                            {currentQ < questions.length - 1 ? "Next Question" : "Finish Session"}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </Card>

                    {/* Feedback panel */}
                    <AnimatePresence>
                      {feedbacks[currentQ] && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <Card className="p-6 border-0 shadow-lg border-l-4 border-l-success">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" /> AI Feedback
                              </h3>
                              <div className="text-2xl font-bold" style={{
                                color: feedbacks[currentQ]!.score >= 75
                                  ? "hsl(var(--success))"
                                  : feedbacks[currentQ]!.score >= 50
                                  ? "hsl(var(--warning))"
                                  : "hsl(var(--destructive))",
                              }}>
                                {feedbacks[currentQ]!.score}/100
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 p-3 rounded-lg bg-secondary/50">
                              {feedbacks[currentQ]!.overall}
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="p-4 rounded-xl bg-success/5">
                                <h4 className="text-sm font-medium text-success mb-2 flex items-center gap-2">
                                  <ThumbsUp className="w-4 h-4" /> Strengths
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {feedbacks[currentQ]!.strengths.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-4 rounded-xl bg-warning/5">
                                <h4 className="text-sm font-medium text-warning mb-2 flex items-center gap-2">
                                  <ThumbsDown className="w-4 h-4" /> Improve
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {feedbacks[currentQ]!.improvements.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg bg-primary/5">
                              <p className="text-xs font-medium text-primary mb-1">💡 Ideal Answer Hint</p>
                              <p className="text-sm text-muted-foreground">
                                {feedbacks[currentQ]!.ideal_answer_hint}
                              </p>
                            </div>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <Card className="p-6 border-0 shadow-lg">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" /> Tips for this question
                      </h3>
                      {questions[currentQ]?.tips.length > 0 ? (
                        <ul className="space-y-3">
                          {questions[currentQ].tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Think carefully before answering. Take your time.
                        </p>
                      )}
                    </Card>

                    {/* Question navigator */}
                    <Card className="p-6 border-0 shadow-lg">
                      <h3 className="font-semibold text-foreground mb-4">Questions</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {questions.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => { setCurrentQ(i); setAnswer(""); }}
                            className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                              i === currentQ
                                ? "bg-primary text-primary-foreground"
                                : feedbacks[i]
                                ? "bg-success/20 text-success"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Green = answered • Blue = current
                      </p>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── HISTORY TAB ── */}
            <TabsContent value="history">
              {loadingSessions ? (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
                  <p className="text-muted-foreground">Loading sessions…</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No sessions yet</h3>
                  <p className="text-muted-foreground">Complete your first practice session to see history here.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 border-0 shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Badge variant="secondary">{session.interview_type}</Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              {new Date(session.completed_at).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.questions?.length || 0} questions • {session.difficulty}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-foreground">
                              {session.overall_score}%
                            </p>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                        </div>
                        <Progress value={session.overall_score} className="h-2 mb-4" />
                        <Button variant="outline" size="sm" className="w-full" onClick={() => {
                          setQuestions(session.questions || []);
                          setFeedbacks((session.responses || []).map((r: any) => r.feedback));
                          setCurrentQ(0);
                          setAnswer("");
                          setSessionStarted(true);
                          setSessionComplete(false);
                        }}>
                          Review This Session
                        </Button>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewPrep;