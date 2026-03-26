import { motion } from "framer-motion";
import { 
  Map, 
  Star, 
  CheckCircle, 
  Circle,
  TrendingUp,
  Target,
  Award,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronDown,
  IndianRupee
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const currentPosition = {
  title: "Fresher / Student",
  skills: ["HTML", "CSS", "JavaScript", "React Basics"],
  level: 0
};

const careerMilestones = [
  {
    id: 1,
    title: "Junior Frontend Developer",
    salary: "₹4-6 LPA",
    experience: "0-1 years",
    skills: ["React", "JavaScript ES6+", "Git", "CSS/Tailwind"],
    description: "Entry-level position focused on implementing UI designs and components",
    status: "current",
    progress: 75,
    tips: ["Complete React certification", "Build 3 portfolio projects", "Practice Git daily"]
  },
  {
    id: 2,
    title: "Frontend Developer",
    salary: "₹6-10 LPA",
    experience: "1-3 years",
    skills: ["TypeScript", "State Management", "Testing", "Performance Optimization"],
    description: "Build complex features independently and mentor juniors",
    status: "next",
    progress: 0,
    tips: ["Learn TypeScript deeply", "Master state management patterns", "Contribute to open source"]
  },
  {
    id: 3,
    title: "Senior Frontend Developer",
    salary: "₹12-20 LPA",
    experience: "3-5 years",
    skills: ["Architecture", "System Design", "Team Leadership", "Code Review"],
    description: "Lead frontend architecture decisions and guide the team",
    status: "future",
    progress: 0,
    tips: ["Lead a major project", "Mentor 2+ developers", "Design component libraries"]
  },
  {
    id: 4,
    title: "Tech Lead / Staff Engineer",
    salary: "₹20-35 LPA",
    experience: "5-8 years",
    skills: ["Cross-functional Leadership", "Technical Strategy", "Stakeholder Management"],
    description: "Drive technical vision across multiple teams",
    status: "future",
    progress: 0,
    tips: ["Build cross-team influence", "Define technical roadmaps", "Drive organizational improvements"]
  },
  {
    id: 5,
    title: "Engineering Manager / Principal Engineer",
    salary: "₹35-60+ LPA",
    experience: "8+ years",
    skills: ["People Management", "Business Strategy", "Industry Expertise"],
    description: "Shape company's technical direction or lead engineering teams",
    status: "future",
    progress: 0,
    tips: ["Develop leadership skills", "Understand business metrics", "Build industry network"]
  },
];

const alternativePaths = [
  { title: "Full Stack Developer", match: 85 },
  { title: "Mobile Developer (React Native)", match: 78 },
  { title: "Frontend Architect", match: 72 },
  { title: "Developer Advocate", match: 65 },
];

const CareerRoadmap = () => {
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
              <Map className="w-8 h-8 text-primary" />
              Your Career Roadmap
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered career guidance based on your skills and goals
            </p>
          </div>

          {/* Current Position */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="p-6 border-0 shadow-lg bg-gradient-hero text-primary-foreground">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm opacity-80 mb-1">You are here</p>
                  <h2 className="text-2xl font-bold">{currentPosition.title}</h2>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {currentPosition.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/20">
                    <Sparkles className="w-5 h-5" />
                    <span>Career Score: 72/100</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Timeline */}
            <div className="lg:col-span-2">
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-border" />
                
                {/* Milestones */}
                <div className="space-y-8">
                  {careerMilestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className="relative pl-20"
                    >
                      {/* Node */}
                      <div className={`absolute left-4 w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.status === 'current' ? 'bg-primary text-primary-foreground animate-pulse-glow' :
                        milestone.status === 'next' ? 'bg-accent text-accent-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {milestone.status === 'current' ? (
                          <Star className="w-4 h-4" />
                        ) : milestone.status === 'next' ? (
                          <Target className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </div>

                      <Card className={`p-6 border-0 shadow-lg ${
                        milestone.status === 'current' ? 'border-l-4 border-l-primary' :
                        milestone.status === 'next' ? 'border-l-4 border-l-accent' : ''
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                              {milestone.title}
                              {milestone.status === 'current' && (
                                <Badge className="bg-primary/10 text-primary border-0">Current Target</Badge>
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
                        </div>

                        {milestone.status === 'current' && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress to this role</span>
                              <span className="font-medium text-foreground">{milestone.progress}%</span>
                            </div>
                            <Progress value={milestone.progress} className="h-2" />
                          </div>
                        )}

                        <div className="mb-4">
                          <p className="text-xs font-medium text-foreground mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {milestone.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {(milestone.status === 'current' || milestone.status === 'next') && (
                          <div className="p-3 rounded-lg bg-secondary/50">
                            <p className="text-xs font-medium text-foreground mb-2">💡 Tips to reach this level:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {milestone.tips.map((tip, i) => (
                                <li key={i}>• {tip}</li>
                              ))}
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
              {/* Skills Gap */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Skills to Develop
                  </h3>
                  <div className="space-y-4">
                    {["TypeScript", "Testing", "State Management", "Performance"].map((skill, index) => (
                      <div key={skill}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-foreground">{skill}</span>
                          <span className="text-muted-foreground">{30 + index * 15}%</span>
                        </div>
                        <Progress value={30 + index * 15} className="h-2" />
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 bg-gradient-primary text-primary-foreground">
                    <GraduationCap className="w-4 h-4 mr-2" /> Start Learning
                  </Button>
                </Card>
              </motion.div>

              {/* Alternative Paths */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" /> Alternative Paths
                  </h3>
                  <div className="space-y-3">
                    {alternativePaths.map((path, index) => (
                      <motion.div
                        key={path.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{path.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {path.match}% match
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* AI Insights */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">AI Career Insight</h4>
                      <p className="text-sm text-muted-foreground">
                        Based on your profile and current market trends, focusing on TypeScript and 
                        React ecosystem would accelerate your path to a Frontend Developer role by 6 months!
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-warning" /> Milestones Achieved
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: "First Resume Upload", icon: "📄" },
                      { name: "Profile Completed", icon: "✅" },
                      { name: "First Application", icon: "🚀" },
                      { name: "Skill Assessment", icon: "🎯" },
                    ].map((achievement, index) => (
                      <div 
                        key={achievement.name}
                        className="flex items-center gap-3 p-2 rounded-lg bg-success/5"
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <span className="text-sm text-foreground">{achievement.name}</span>
                        <CheckCircle className="w-4 h-4 text-success ml-auto" />
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CareerRoadmap;
