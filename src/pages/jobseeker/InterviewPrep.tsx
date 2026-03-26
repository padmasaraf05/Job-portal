import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Video, 
  Mic, 
  MicOff, 
  Play,
  Pause,
  SkipForward,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Volume2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockQuestions = [
  {
    id: 1,
    question: "Tell me about yourself and your background.",
    category: "Introduction",
    difficulty: "Easy",
    tips: ["Keep it 1-2 minutes", "Focus on relevant experience", "End with why you're interested"]
  },
  {
    id: 2,
    question: "What are your greatest strengths as a developer?",
    category: "Behavioral",
    difficulty: "Easy",
    tips: ["Be specific with examples", "Relate to job requirements", "Show self-awareness"]
  },
  {
    id: 3,
    question: "Explain the difference between React's state and props.",
    category: "Technical",
    difficulty: "Medium",
    tips: ["Define both concepts", "Give practical examples", "Explain when to use each"]
  },
  {
    id: 4,
    question: "How would you handle a disagreement with a team member?",
    category: "Behavioral",
    difficulty: "Medium",
    tips: ["Use STAR method", "Show conflict resolution skills", "Emphasize collaboration"]
  },
  {
    id: 5,
    question: "What is closure in JavaScript? Give an example.",
    category: "Technical",
    difficulty: "Hard",
    tips: ["Define the concept clearly", "Explain lexical scoping", "Provide practical use case"]
  },
];

const previousSessions = [
  {
    id: 1,
    date: "Dec 18, 2024",
    questions: 5,
    duration: "25 mins",
    score: 78,
    feedback: {
      strengths: ["Good communication", "Technical accuracy"],
      improvements: ["Speak slower", "More examples"]
    }
  },
  {
    id: 2,
    date: "Dec 15, 2024",
    questions: 4,
    duration: "20 mins",
    score: 72,
    feedback: {
      strengths: ["Clear explanations", "Confidence"],
      improvements: ["Eye contact", "Structured answers"]
    }
  },
];

const InterviewPrep = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Video className="w-8 h-8 text-primary" />
              AI Interview Coach
            </h1>
            <p className="text-muted-foreground mt-1">
              Practice with AI-powered mock interviews and get instant feedback
            </p>
          </div>

          <Tabs defaultValue="practice" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="practice">Practice Session</TabsTrigger>
              <TabsTrigger value="history">Past Sessions</TabsTrigger>
              <TabsTrigger value="questions">Question Bank</TabsTrigger>
            </TabsList>

            {/* Practice Tab */}
            <TabsContent value="practice">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Interview Area */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-2 space-y-6"
                >
                  {/* Video Area */}
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="aspect-video bg-gradient-hero relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isRecording ? (
                          <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="text-center"
                          >
                            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                              <Mic className="w-12 h-12 text-primary" />
                            </div>
                            <p className="text-primary-foreground text-lg">Recording your answer...</p>
                            <p className="text-primary-foreground/60 text-sm mt-1">Speak clearly into your microphone</p>
                          </motion.div>
                        ) : (
                          <div className="text-center">
                            <Video className="w-16 h-16 text-primary-foreground/40 mx-auto mb-4" />
                            <p className="text-primary-foreground/60">Camera preview will appear here</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Recording indicator */}
                      {isRecording && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-destructive rounded-full">
                          <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
                          <span className="text-destructive-foreground text-sm font-medium">Recording</span>
                        </div>
                      )}
                      
                      {/* Timer */}
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-background/80 backdrop-blur rounded-full">
                        <span className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" /> 00:45
                        </span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="p-4 bg-card">
                      <div className="flex items-center justify-center gap-4">
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="rounded-full w-12 h-12"
                          onClick={() => setIsRecording(!isRecording)}
                        >
                          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </Button>
                        <Button 
                          className={`rounded-full w-16 h-16 ${isRecording ? 'bg-destructive hover:bg-destructive/90' : 'bg-gradient-primary'} text-primary-foreground`}
                          onClick={() => setIsRecording(!isRecording)}
                        >
                          {isRecording ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="rounded-full w-12 h-12"
                          onClick={() => setCurrentQuestion((prev) => (prev + 1) % mockQuestions.length)}
                        >
                          <SkipForward className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Current Question */}
                  <Card className="p-6 border-0 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">
                        Question {currentQuestion + 1} of {mockQuestions.length}
                      </Badge>
                      <Badge variant={
                        mockQuestions[currentQuestion].difficulty === 'Easy' ? 'secondary' :
                        mockQuestions[currentQuestion].difficulty === 'Medium' ? 'outline' : 'destructive'
                      }>
                        {mockQuestions[currentQuestion].difficulty}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      {mockQuestions[currentQuestion].question}
                    </h2>
                    <div className="flex items-center gap-4">
                      <Progress value={(currentQuestion + 1) / mockQuestions.length * 100} className="flex-1" />
                      <Button variant="ghost" size="sm">
                        <Volume2 className="w-4 h-4 mr-2" /> Listen
                      </Button>
                    </div>
                  </Card>

                  {/* Feedback Panel */}
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-6 border-0 shadow-lg border-l-4 border-l-primary">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" /> AI Feedback
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-success/5">
                            <h4 className="text-sm font-medium text-success mb-2 flex items-center gap-2">
                              <ThumbsUp className="w-4 h-4" /> What went well
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Clear and structured response</li>
                              <li>• Good use of examples</li>
                              <li>• Confident delivery</li>
                            </ul>
                          </div>
                          <div className="p-4 rounded-xl bg-warning/5">
                            <h4 className="text-sm font-medium text-warning mb-2 flex items-center gap-2">
                              <ThumbsDown className="w-4 h-4" /> Areas to improve
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Speak a bit slower</li>
                              <li>• Add more specific metrics</li>
                              <li>• Maintain eye contact</li>
                            </ul>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>

                {/* Tips Sidebar */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" /> Tips for this question
                    </h3>
                    <ul className="space-y-3">
                      {mockQuestions[currentQuestion].tips.map((tip, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="font-semibold text-foreground mb-4">Category</h3>
                    <Badge className="bg-primary/10 text-primary border-0">
                      {mockQuestions[currentQuestion].category}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-4">
                      This type of question assesses your {mockQuestions[currentQuestion].category.toLowerCase()} skills.
                    </p>
                  </Card>

                  <Button 
                    className="w-full bg-gradient-primary text-primary-foreground"
                    onClick={() => setShowFeedback(!showFeedback)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> 
                    {showFeedback ? 'Hide Feedback' : 'Get AI Feedback'}
                  </Button>
                </motion.div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <div className="grid md:grid-cols-2 gap-6">
                {previousSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 border-0 shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{session.date}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.questions} questions • {session.duration}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{session.score}%</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-success/5">
                          <h4 className="text-xs font-medium text-success mb-2">Strengths</h4>
                          {session.feedback.strengths.map((s, i) => (
                            <p key={i} className="text-xs text-muted-foreground">• {s}</p>
                          ))}
                        </div>
                        <div className="p-3 rounded-lg bg-warning/5">
                          <h4 className="text-xs font-medium text-warning mb-2">To Improve</h4>
                          {session.feedback.improvements.map((s, i) => (
                            <p key={i} className="text-xs text-muted-foreground">• {s}</p>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button size="sm" className="flex-1 bg-gradient-primary text-primary-foreground">
                          <RefreshCw className="w-4 h-4 mr-1" /> Retry
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions">
              <div className="space-y-4">
                {mockQuestions.map((q, index) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {q.id}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{q.question}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{q.category}</Badge>
                            <Badge variant={
                              q.difficulty === 'Easy' ? 'secondary' :
                              q.difficulty === 'Medium' ? 'outline' : 'destructive'
                            } className="text-xs">
                              {q.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewPrep;
