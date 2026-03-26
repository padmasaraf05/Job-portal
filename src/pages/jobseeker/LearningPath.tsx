import { motion } from "framer-motion";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star,
  CheckCircle,
  Lock,
  Trophy,
  Target,
  Zap,
  ChevronRight,
  Filter
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const learningPaths = [
  {
    id: 1,
    title: "React Mastery",
    description: "Master React from basics to advanced patterns",
    totalModules: 12,
    completedModules: 8,
    duration: "24 hours",
    level: "Intermediate",
    enrolled: true,
    modules: [
      { name: "React Fundamentals", duration: "2h", completed: true },
      { name: "State Management", duration: "3h", completed: true },
      { name: "Hooks Deep Dive", duration: "2.5h", completed: true },
      { name: "Context API", duration: "2h", completed: true },
      { name: "Performance Optimization", duration: "2h", completed: true },
      { name: "Testing React Apps", duration: "3h", completed: true },
      { name: "React Patterns", duration: "2.5h", completed: true },
      { name: "Redux Toolkit", duration: "3h", completed: true },
      { name: "React Router", duration: "1.5h", completed: false, current: true },
      { name: "Server Components", duration: "2h", completed: false },
      { name: "Animation Libraries", duration: "1.5h", completed: false },
      { name: "Final Project", duration: "3h", completed: false },
    ]
  },
  {
    id: 2,
    title: "TypeScript Essentials",
    description: "Type-safe JavaScript development",
    totalModules: 8,
    completedModules: 3,
    duration: "16 hours",
    level: "Beginner",
    enrolled: true,
    modules: [
      { name: "TypeScript Basics", duration: "2h", completed: true },
      { name: "Types & Interfaces", duration: "2.5h", completed: true },
      { name: "Generics", duration: "2h", completed: true },
      { name: "Advanced Types", duration: "2h", completed: false, current: true },
      { name: "TypeScript with React", duration: "3h", completed: false },
      { name: "Utility Types", duration: "1.5h", completed: false },
      { name: "Best Practices", duration: "1.5h", completed: false },
      { name: "Practical Project", duration: "2h", completed: false },
    ]
  },
];

const recommendedCourses = [
  {
    id: 3,
    title: "Node.js Backend Development",
    description: "Build scalable server-side applications",
    duration: "20 hours",
    level: "Intermediate",
    rating: 4.8,
    enrolled: 2340,
    match: 92
  },
  {
    id: 4,
    title: "Data Structures & Algorithms",
    description: "Crack coding interviews with DSA",
    duration: "30 hours",
    level: "Advanced",
    rating: 4.9,
    enrolled: 5620,
    match: 88
  },
  {
    id: 5,
    title: "System Design Fundamentals",
    description: "Design scalable distributed systems",
    duration: "18 hours",
    level: "Advanced",
    rating: 4.7,
    enrolled: 1890,
    match: 85
  },
];

const LearningPath = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                Learning Paths
              </h1>
              <p className="text-muted-foreground mt-1">
                Personalized courses to boost your career
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
              <Button className="bg-gradient-primary text-primary-foreground">
                Explore All Courses
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Courses Enrolled", value: "2", icon: BookOpen, color: "text-primary" },
              { label: "Hours Learned", value: "18", icon: Clock, color: "text-info" },
              { label: "Certificates", value: "1", icon: Trophy, color: "text-success" },
              { label: "Skills Gained", value: "8", icon: Zap, color: "text-accent" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
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

          {/* Currently Learning */}
          <h2 className="text-xl font-semibold text-foreground mb-4">Continue Learning</h2>
          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            {learningPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 border-0 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{path.title}</h3>
                      <p className="text-sm text-muted-foreground">{path.description}</p>
                    </div>
                    <Badge variant="secondary">{path.level}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" /> {path.duration}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" /> {path.totalModules} modules
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">
                        {path.completedModules}/{path.totalModules} completed
                      </span>
                    </div>
                    <Progress 
                      value={(path.completedModules / path.totalModules) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Module List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {path.modules.map((module, modIndex) => (
                      <div 
                        key={modIndex}
                        className={`flex items-center gap-3 p-2 rounded-lg ${
                          module.current ? 'bg-primary/10' : ''
                        }`}
                      >
                        {module.completed ? (
                          <CheckCircle className="w-5 h-5 text-success shrink-0" />
                        ) : module.current ? (
                          <Play className="w-5 h-5 text-primary shrink-0" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                        )}
                        <span className={`flex-1 text-sm ${
                          module.completed ? 'text-muted-foreground' : 
                          module.current ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}>
                          {module.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{module.duration}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full mt-4 bg-gradient-primary text-primary-foreground">
                    <Play className="w-4 h-4 mr-2" /> Continue Learning
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recommended */}
          <h2 className="text-xl font-semibold text-foreground mb-4">Recommended for You</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="p-6 border-0 shadow-lg card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-success/10 text-success border-0">
                      {course.match}% Match
                    </Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-warning fill-warning" /> {course.rating}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-4">
                    {course.enrolled.toLocaleString()} students enrolled
                  </p>

                  <Button variant="outline" className="w-full">
                    View Course <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LearningPath;
