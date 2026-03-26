import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Clock, 
  CheckCircle, 
  Award,
  Play,
  BarChart3,
  Zap,
  ChevronRight,
  Lock,
  Star
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const assessments = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    category: "Programming",
    questions: 30,
    duration: "45 mins",
    difficulty: "Beginner",
    completed: true,
    score: 85,
    percentile: 78,
    badge: "Proficient"
  },
  {
    id: 2,
    title: "React.js Advanced",
    category: "Frontend",
    questions: 25,
    duration: "40 mins",
    difficulty: "Intermediate",
    completed: true,
    score: 72,
    percentile: 65,
    badge: "Competent"
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    category: "Programming",
    questions: 20,
    duration: "60 mins",
    difficulty: "Advanced",
    completed: false,
    locked: false
  },
  {
    id: 4,
    title: "System Design Basics",
    category: "Architecture",
    questions: 15,
    duration: "30 mins",
    difficulty: "Intermediate",
    completed: false,
    locked: true
  },
  {
    id: 5,
    title: "TypeScript Essentials",
    category: "Programming",
    questions: 25,
    duration: "35 mins",
    difficulty: "Beginner",
    completed: false,
    locked: false
  },
];

const skillRadar = [
  { skill: "JavaScript", score: 85, maxScore: 100 },
  { skill: "React", score: 72, maxScore: 100 },
  { skill: "CSS", score: 78, maxScore: 100 },
  { skill: "TypeScript", score: 45, maxScore: 100 },
  { skill: "Node.js", score: 55, maxScore: 100 },
  { skill: "Git", score: 70, maxScore: 100 },
];

const badges = [
  { name: "JavaScript Pro", icon: "🏆", earned: true },
  { name: "React Expert", icon: "⚛️", earned: true },
  { name: "DSA Master", icon: "🧠", earned: false },
  { name: "Full Stack", icon: "🚀", earned: false },
];

const SkillAssessment = () => {
  const [activeTab, setActiveTab] = useState("available");

  const completedAssessments = assessments.filter(a => a.completed);
  const availableAssessments = assessments.filter(a => !a.completed);

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
              <Target className="w-8 h-8 text-primary" />
              Skill Assessments
            </h1>
            <p className="text-muted-foreground mt-1">
              Validate your skills and stand out to recruiters
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="available" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="available">Available ({availableAssessments.length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({completedAssessments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-4">
                  {availableAssessments.map((assessment, index) => (
                    <motion.div
                      key={assessment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`p-6 border-0 shadow-lg ${assessment.locked ? 'opacity-60' : 'card-hover'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            assessment.locked ? 'bg-muted' : 'bg-gradient-primary'
                          } text-primary-foreground`}>
                            {assessment.locked ? <Lock className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{assessment.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{assessment.category}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {assessment.duration}
                              </span>
                              <span>{assessment.questions} questions</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              assessment.difficulty === 'Beginner' ? 'secondary' :
                              assessment.difficulty === 'Intermediate' ? 'outline' : 'destructive'
                            }>
                              {assessment.difficulty}
                            </Badge>
                            <div className="mt-3">
                              {assessment.locked ? (
                                <Button variant="outline" disabled>
                                  <Lock className="w-4 h-4 mr-2" /> Locked
                                </Button>
                              ) : (
                                <Button className="bg-gradient-primary text-primary-foreground">
                                  <Play className="w-4 h-4 mr-2" /> Start
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  {completedAssessments.map((assessment, index) => (
                    <motion.div
                      key={assessment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 border-0 shadow-lg">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-success flex items-center justify-center text-success-foreground">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{assessment.title}</h3>
                              <Badge className="bg-success/10 text-success border-0">
                                {assessment.badge}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{assessment.category}</p>
                            
                            <div className="grid grid-cols-3 gap-4 mt-4 p-4 rounded-xl bg-secondary/50">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">{assessment.score}%</p>
                                <p className="text-xs text-muted-foreground">Score</p>
                              </div>
                              <div className="text-center border-x border-border">
                                <p className="text-2xl font-bold text-primary">{assessment.percentile}th</p>
                                <p className="text-xs text-muted-foreground">Percentile</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-success">
                                  {Math.round(assessment.score * assessment.questions! / 100)}/{assessment.questions}
                                </p>
                                <p className="text-xs text-muted-foreground">Correct</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              View Report
                            </Button>
                            <Button variant="ghost" size="sm">
                              Retake
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skill Overview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" /> Skill Overview
                  </h3>
                  <div className="space-y-4">
                    {skillRadar.map((item, index) => (
                      <motion.div
                        key={item.skill}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-foreground">{item.skill}</span>
                          <span className="text-muted-foreground">{item.score}%</span>
                        </div>
                        <div className="relative">
                          <Progress value={item.score} className="h-2" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Badges */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" /> Earned Badges
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((badge, index) => (
                      <motion.div
                        key={badge.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className={`p-4 rounded-xl text-center ${
                          badge.earned ? 'bg-primary/10' : 'bg-muted opacity-50'
                        }`}
                      >
                        <span className="text-3xl">{badge.icon}</span>
                        <p className="text-xs font-medium text-foreground mt-2">{badge.name}</p>
                        {!badge.earned && (
                          <Lock className="w-3 h-3 mx-auto mt-1 text-muted-foreground" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Pro Tip */}
              <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-semibold text-foreground">Pro Tip</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete 3 more assessments to unlock the "Full Stack" badge and get featured in top candidate lists!
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SkillAssessment;
