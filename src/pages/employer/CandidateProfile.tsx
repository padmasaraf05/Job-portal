import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  GraduationCap,
  Award,
  Star,
  Download,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ExternalLink,
  Linkedin,
  Github,
  Globe,
  FileText,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const mockCandidate = {
  id: 1,
  name: "Sarah Chen",
  title: "Senior Frontend Developer",
  email: "sarah.chen@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  avatar: "SC",
  appliedFor: "Senior Frontend Developer",
  appliedDate: "2024-01-15",
  status: "shortlisted",
  matchScore: 92,
  summary: "Passionate frontend developer with 5+ years of experience building scalable web applications. Specialized in React, TypeScript, and modern CSS. Strong advocate for clean code and exceptional user experiences.",
  experience: [
    {
      id: 1,
      company: "TechStartup Inc.",
      role: "Senior Frontend Developer",
      duration: "2021 - Present",
      location: "San Francisco, CA",
      description: "Led frontend development for a SaaS platform serving 50K+ users. Implemented design system, reduced bundle size by 40%, and mentored junior developers."
    },
    {
      id: 2,
      company: "Digital Agency Co.",
      role: "Frontend Developer",
      duration: "2019 - 2021",
      location: "New York, NY",
      description: "Built responsive web applications for Fortune 500 clients. Collaborated with designers to implement pixel-perfect UIs."
    },
    {
      id: 3,
      company: "StartupXYZ",
      role: "Junior Developer",
      duration: "2018 - 2019",
      location: "Remote",
      description: "Developed features for e-commerce platform using React and Node.js."
    }
  ],
  education: [
    {
      id: 1,
      school: "Stanford University",
      degree: "M.S. Computer Science",
      year: "2018",
      gpa: "3.9/4.0"
    },
    {
      id: 2,
      school: "UC Berkeley",
      degree: "B.S. Computer Science",
      year: "2016",
      gpa: "3.8/4.0"
    }
  ],
  skills: [
    { name: "React", level: 95, endorsed: true },
    { name: "TypeScript", level: 90, endorsed: true },
    { name: "JavaScript", level: 95, endorsed: true },
    { name: "CSS/Tailwind", level: 88, endorsed: true },
    { name: "Node.js", level: 75, endorsed: false },
    { name: "GraphQL", level: 70, endorsed: false },
    { name: "Testing", level: 82, endorsed: true },
    { name: "Git", level: 90, endorsed: false },
  ],
  assessments: [
    { name: "React Proficiency", score: 94, maxScore: 100, date: "2024-01-16", status: "completed" },
    { name: "TypeScript Assessment", score: 88, maxScore: 100, date: "2024-01-16", status: "completed" },
    { name: "Problem Solving", score: 91, maxScore: 100, date: "2024-01-17", status: "completed" },
  ],
  socialLinks: {
    linkedin: "linkedin.com/in/sarahchen",
    github: "github.com/sarahchen",
    portfolio: "sarahchen.dev"
  },
  notes: [
    { id: 1, author: "John Doe", date: "2024-01-17", content: "Strong technical skills demonstrated in initial screening. Very articulate." },
    { id: 2, author: "Jane Smith", date: "2024-01-18", content: "Portfolio shows excellent attention to detail. Recommend moving to technical interview." },
  ]
};

const getSkillColor = (level: number) => {
  if (level >= 90) return "bg-success";
  if (level >= 75) return "bg-info";
  if (level >= 60) return "bg-warning";
  return "bg-muted";
};

const CandidateProfile = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const handleAction = (action: string) => {
    toast({
      title: action,
      description: `Action "${action}" performed successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              to="/employer/applications" 
              className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Applications
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center text-3xl font-display font-bold">
                {mockCandidate.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-display font-bold">{mockCandidate.name}</h1>
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                    {mockCandidate.status}
                  </Badge>
                </div>
                <p className="text-xl text-primary-foreground/90 mb-2">{mockCandidate.title}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {mockCandidate.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    Applied for: {mockCandidate.appliedFor}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(mockCandidate.appliedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {/* Match Score */}
              <div className="bg-primary-foreground/10 rounded-xl p-4 text-center">
                <p className="text-4xl font-display font-bold text-success">{mockCandidate.matchScore}%</p>
                <p className="text-sm text-primary-foreground/70">Match Score</p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start mb-6 bg-card border border-border">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Summary */}
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-display">
                        <User className="w-5 h-5 text-primary" />
                        Professional Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{mockCandidate.summary}</p>
                    </CardContent>
                  </Card>

                  {/* Recent Experience */}
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-display">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Recent Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mockCandidate.experience.slice(0, 2).map((exp, index) => (
                        <div key={exp.id} className={index > 0 ? "mt-4 pt-4 border-t border-border" : ""}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">{exp.role}</h4>
                              <p className="text-sm text-primary">{exp.company}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">{exp.duration}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Top Skills */}
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-display">
                        <Zap className="w-5 h-5 text-primary" />
                        Top Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {mockCandidate.skills.slice(0, 4).map((skill) => (
                          <div key={skill.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{skill.name}</span>
                              {skill.endorsed && (
                                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                                  Endorsed
                                </Badge>
                              )}
                            </div>
                            <Progress value={skill.level} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience">
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-display">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Work Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative pl-6 border-l-2 border-primary/20 space-y-8">
                        {mockCandidate.experience.map((exp) => (
                          <div key={exp.id} className="relative">
                            <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-primary border-4 border-background" />
                            <div>
                              <h4 className="font-semibold text-foreground text-lg">{exp.role}</h4>
                              <p className="text-primary font-medium">{exp.company}</p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {exp.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {exp.location}
                                </span>
                              </div>
                              <p className="text-muted-foreground mt-3">{exp.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-display">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockCandidate.education.map((edu) => (
                          <div key={edu.id} className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                            <div>
                              <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                              <p className="text-primary">{edu.school}</p>
                              <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-display">
                        <Target className="w-5 h-5 text-primary" />
                        Skills & Proficiencies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {mockCandidate.skills.map((skill) => (
                          <div key={skill.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{skill.name}</span>
                                {skill.endorsed && (
                                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                                    <Star className="w-3 h-3 mr-1 fill-success" />
                                    Endorsed
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">{skill.level}%</span>
                            </div>
                            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                className={`absolute top-0 left-0 h-full rounded-full ${getSkillColor(skill.level)}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.level}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Assessments Tab */}
              <TabsContent value="assessments">
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-display">
                        <Award className="w-5 h-5 text-primary" />
                        Assessment Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockCandidate.assessments.map((assessment) => (
                          <div key={assessment.name} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xl font-display font-bold text-primary">
                                {assessment.score}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{assessment.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Score: {assessment.score}/{assessment.maxScore} • Completed {new Date(assessment.date).toLocaleDateString()}
                              </p>
                              <Progress value={(assessment.score / assessment.maxScore) * 100} className="h-2 mt-2" />
                            </div>
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {assessment.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="card-elevated sticky top-8">
                <CardHeader>
                  <CardTitle className="font-display">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" size="lg" onClick={() => handleAction("Schedule Interview")}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleAction("Send Message")}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleAction("Download Resume")}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                  <Separator />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-success hover:text-success hover:bg-success/10"
                      onClick={() => handleAction("Move to Offer")}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Hire
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleAction("Reject")}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="font-display">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href={`mailto:${mockCandidate.email}`}
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {mockCandidate.email}
                  </a>
                  <a 
                    href={`tel:${mockCandidate.phone}`}
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {mockCandidate.phone}
                  </a>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {mockCandidate.location}
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="flex-1" asChild>
                      <a href={`https://${mockCandidate.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" className="flex-1" asChild>
                      <a href={`https://${mockCandidate.socialLinks.github}`} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" className="flex-1" asChild>
                      <a href={`https://${mockCandidate.socialLinks.portfolio}`} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="font-display">Interview Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockCandidate.notes.map((note) => (
                    <div key={note.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{note.author}</span>
                        <span className="text-xs text-muted-foreground">{new Date(note.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateProfile;
