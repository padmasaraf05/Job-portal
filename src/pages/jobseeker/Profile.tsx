import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Upload,
  Plus,
  Edit2,
  CheckCircle,
  Camera,
  Linkedin,
  Github
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const skills = [
  { name: "JavaScript", level: 85, endorsed: 12 },
  { name: "React", level: 78, endorsed: 8 },
  { name: "TypeScript", level: 65, endorsed: 5 },
  { name: "Node.js", level: 60, endorsed: 4 },
  { name: "HTML/CSS", level: 90, endorsed: 15 },
  { name: "Git", level: 70, endorsed: 6 },
];

const education = [
  {
    degree: "B.Tech in Computer Science",
    institution: "Delhi Technological University",
    year: "2020 - 2024",
    grade: "8.5 CGPA",
  },
  {
    degree: "Higher Secondary (PCM)",
    institution: "DPS RK Puram",
    year: "2018 - 2020",
    grade: "94.6%",
  },
];

const experience = [
  {
    role: "Frontend Developer Intern",
    company: "TechStart Solutions",
    duration: "Jun 2023 - Aug 2023",
    description: "Developed responsive web applications using React and TypeScript",
  },
];

const profileCompletion = [
  { label: "Basic Info", completed: true },
  { label: "Resume", completed: true },
  { label: "Skills", completed: true },
  { label: "Education", completed: true },
  { label: "Experience", completed: false },
  { label: "Certifications", completed: false },
  { label: "Portfolio", completed: false },
];

const Profile = () => {
  const completedItems = profileCompletion.filter(item => item.completed).length;
  const completionPercent = Math.round((completedItems / profileCompletion.length) * 100);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Profile Header */}
            <Card className="p-6 border-0 shadow-lg text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-hero opacity-10" />
              <div className="relative">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-28 h-28 border-4 border-primary/20">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" />
                    <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">PM</AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Priya Mehta</h2>
                <p className="text-muted-foreground mb-3">Aspiring Software Developer</p>
                <div className="flex justify-center gap-3 mb-4">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Linkedin className="w-4 h-4 mr-1" /> LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Github className="w-4 h-4 mr-1" /> GitHub
                  </Button>
                </div>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> priya.mehta@email.com
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> +91 98765 43210
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" /> New Delhi, India
                  </div>
                </div>
              </div>
            </Card>

            {/* Profile Completion */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4">Profile Strength</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-secondary"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${completionPercent * 2.2} 220`}
                      className="text-primary"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                    {completionPercent}%
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to get 3x more visibility to recruiters
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {profileCompletion.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`w-4 h-4 ${item.completed ? 'text-success' : 'text-muted-foreground/30'}`} />
                    <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Resume Upload */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4">Resume</h3>
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center bg-primary/5">
                <Upload className="w-10 h-10 mx-auto text-primary mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Upload your resume</p>
                <p className="text-xs text-muted-foreground mb-4">PDF, DOC up to 5MB</p>
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-success/10 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">resume_priya_2024.pdf</p>
                  <p className="text-xs text-muted-foreground">Updated 3 days ago</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Skills */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Skills
                </h3>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Add Skill
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-secondary/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{skill.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {skill.endorsed} endorsements
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={skill.level} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Education */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" /> Education
                </h3>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <motion.div
                    key={edu.degree}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">{edu.year}</span>
                        <Badge variant="outline">{edu.grade}</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Experience */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Experience
                </h3>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <motion.div
                    key={exp.role}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-4 p-4 rounded-xl bg-secondary/30"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center text-accent-foreground">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{exp.role}</h4>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">{exp.duration}</p>
                      <p className="text-sm text-foreground mt-2">{exp.description}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
