import { motion } from "framer-motion";
import { 
  FileText, 
  Sparkles, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  Award,
  Lightbulb,
  RefreshCw,
  Download
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const resumeScore = {
  overall: 78,
  sections: [
    { name: "Contact Info", score: 100, status: "excellent" },
    { name: "Summary", score: 65, status: "needs_work" },
    { name: "Experience", score: 80, status: "good" },
    { name: "Skills", score: 85, status: "good" },
    { name: "Education", score: 100, status: "excellent" },
    { name: "Keywords", score: 55, status: "needs_work" },
  ]
};

const strengths = [
  "Clear and well-organized structure",
  "Quantified achievements in experience section",
  "Relevant technical skills highlighted",
  "Education credentials properly formatted",
];

const improvements = [
  { 
    issue: "Add a professional summary", 
    impact: "High",
    description: "A 2-3 line summary helps recruiters quickly understand your value proposition"
  },
  { 
    issue: "Include more industry keywords", 
    impact: "High",
    description: "Add terms like 'Agile', 'CI/CD', 'RESTful APIs' to pass ATS screening"
  },
  { 
    issue: "Quantify more achievements", 
    impact: "Medium",
    description: "Use numbers and percentages to demonstrate impact"
  },
  { 
    issue: "Add relevant certifications", 
    impact: "Medium",
    description: "Include AWS, React, or other tech certifications if available"
  },
];

const atsCompatibility = {
  score: 72,
  issues: [
    { type: "warning", message: "Tables detected - may cause parsing issues" },
    { type: "error", message: "Some graphics/icons may not be read by ATS" },
    { type: "success", message: "Standard fonts used throughout" },
    { type: "success", message: "Clear section headings detected" },
  ]
};

const ResumeAnalysis = () => {
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
                <Sparkles className="w-8 h-8 text-primary" />
                AI Resume Analysis
              </h1>
              <p className="text-muted-foreground mt-1">
                Get actionable insights to improve your resume
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" /> Re-analyze
              </Button>
              <Button className="bg-gradient-primary text-primary-foreground">
                <Download className="w-4 h-4 mr-2" /> Download Report
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-1"
            >
              <Card className="p-8 border-0 shadow-lg text-center">
                <h2 className="text-lg font-semibold text-foreground mb-6">Resume Score</h2>
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-secondary"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 553" }}
                      animate={{ strokeDasharray: `${resumeScore.overall * 5.53} 553` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--success))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                      className="text-5xl font-bold text-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {resumeScore.overall}
                    </motion.span>
                    <span className="text-muted-foreground">out of 100</span>
                  </div>
                </div>
                <Badge className="bg-warning/10 text-warning border-0 text-sm">
                  Good - Room for improvement
                </Badge>
                <p className="text-sm text-muted-foreground mt-4">
                  Your resume is in the top 35% of candidates
                </p>
              </Card>

              {/* Section Scores */}
              <Card className="p-6 border-0 shadow-lg mt-6">
                <h3 className="font-semibold text-foreground mb-4">Section Analysis</h3>
                <div className="space-y-4">
                  {resumeScore.sections.map((section, index) => (
                    <motion.div
                      key={section.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{section.name}</span>
                        <span className={`font-medium ${
                          section.status === 'excellent' ? 'text-success' :
                          section.status === 'good' ? 'text-primary' : 'text-warning'
                        }`}>
                          {section.score}%
                        </span>
                      </div>
                      <Progress 
                        value={section.score} 
                        className={`h-2 ${
                          section.status === 'excellent' ? '[&>div]:bg-success' :
                          section.status === 'needs_work' ? '[&>div]:bg-warning' : ''
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Feedback Sections */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Strengths */}
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-success" /> What's Working Well
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {strengths.map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-success/5"
                    >
                      <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{strength}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Improvements */}
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-warning" /> Suggested Improvements
                </h3>
                <div className="space-y-4">
                  {improvements.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-4 rounded-xl border border-border hover:border-warning/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-foreground">{item.issue}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        </div>
                        <Badge variant={item.impact === "High" ? "destructive" : "secondary"}>
                          {item.impact} Impact
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* ATS Compatibility */}
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" /> ATS Compatibility
                </h3>
                <div className="flex items-center gap-6 mb-6">
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
                        strokeDasharray={`${atsCompatibility.score * 2.2} 220`}
                        className="text-primary"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                      {atsCompatibility.score}%
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Your resume has a good chance of passing through Applicant Tracking Systems. 
                      Fix the issues below to improve your score.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {atsCompatibility.issues.map((issue, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        issue.type === 'success' ? 'bg-success/5' :
                        issue.type === 'warning' ? 'bg-warning/5' : 'bg-destructive/5'
                      }`}
                    >
                      {issue.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : issue.type === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      <span className="text-sm text-foreground">{issue.message}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
