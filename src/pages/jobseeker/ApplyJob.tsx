import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  ChevronRight,
  Briefcase,
  MapPin,
  IndianRupee,
  Building2,
  Plus,
  X,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const jobInfo = {
  title: "Junior React Developer",
  company: "Infosys",
  location: "Bangalore",
  salary: "₹6-8 LPA",
  logo: "I"
};

const resumes = [
  { id: 1, name: "resume_priya_2024.pdf", updated: "3 days ago", isDefault: true },
  { id: 2, name: "resume_priya_detailed.pdf", updated: "2 weeks ago", isDefault: false },
];

const questions = [
  { id: 1, question: "How many years of experience do you have with React?", type: "text" },
  { id: 2, question: "Are you willing to relocate to Bangalore?", type: "radio", options: ["Yes", "No", "Already in Bangalore"] },
  { id: 3, question: "What is your expected notice period?", type: "text" },
];

const ApplyJob = () => {
  const { id } = useParams();
const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedResume, setSelectedResume] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [coverLetter, setCoverLetter] = useState("");

  const progress = (step / 3) * 100;
const handleApply = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !id) return;

  // get job to find employer
  const { data: job } = await supabase
    .from("jobs")
    .select("employer_id")
    .eq("id", id)
    .single();

  await supabase.from("applications").insert({
    job_id: id,
    jobseeker_id: user.id,
    employer_id: job?.employer_id,
    status: "applied",
  });

  navigate("/jobseeker/dashboard");
};

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Job Summary */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 border-0 shadow-lg mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                {jobInfo.logo}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{jobInfo.title}</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {jobInfo.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {jobInfo.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" /> {jobInfo.salary}
                  </span>
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-0">94% Match</Badge>
            </div>
          </Card>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Application Progress</span>
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {["Resume", "Questions", "Review"].map((label, index) => (
              <span 
                key={label}
                className={`text-xs ${step > index ? 'text-primary font-medium' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Step 1: Resume Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Select Your Resume
              </h2>

              <div className="space-y-3 mb-6">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    onClick={() => setSelectedResume(resume.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedResume === resume.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedResume === resume.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{resume.name}</p>
                        <p className="text-sm text-muted-foreground">Updated {resume.updated}</p>
                      </div>
                      {resume.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      {selectedResume === resume.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-primary/5">
                <Upload className="w-12 h-12 mx-auto text-primary mb-3" />
                <p className="font-medium text-foreground mb-1">Upload a different resume</p>
                <p className="text-sm text-muted-foreground mb-4">PDF, DOC, DOCX up to 5MB</p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" /> Choose File
                </Button>
              </div>

              <div className="mt-6">
                <Label className="text-foreground mb-2 block">Cover Letter (Optional)</Label>
                <Textarea
                  placeholder="Write a cover letter to stand out from other applicants..."
                  className="min-h-[150px]"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="ghost" size="sm" className="text-primary">
                    <Sparkles className="w-4 h-4 mr-1" /> Generate with AI
                  </Button>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep(2)} className="bg-gradient-primary text-primary-foreground">
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Questions */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Application Questions
              </h2>

              <div className="space-y-6">
                {questions.map((q, index) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Label className="text-foreground mb-2 block">
                      {q.question} <span className="text-destructive">*</span>
                    </Label>
                    {q.type === "text" ? (
                      <Input 
                        placeholder="Your answer..."
                        value={answers[q.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      />
                    ) : (
                      <RadioGroup
                        value={answers[q.id] || ""}
                        onValueChange={(value) => setAnswers({ ...answers, [q.id]: value })}
                        className="flex flex-wrap gap-4"
                      >
                        {q.options?.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                            <Label htmlFor={`${q.id}-${option}`} className="cursor-pointer">{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="bg-gradient-primary text-primary-foreground">
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" /> Review Your Application
              </h2>

              <div className="space-y-6">
                {/* Resume Section */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">Resume</h3>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Edit</Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      {resumes.find(r => r.id === selectedResume)?.name}
                    </span>
                  </div>
                </div>

                {/* Cover Letter Section */}
                {coverLetter && (
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground">Cover Letter</h3>
                      <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Edit</Button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{coverLetter}</p>
                  </div>
                )}

                {/* Answers Section */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">Your Answers</h3>
                    <Button variant="ghost" size="sm" onClick={() => setStep(2)}>Edit</Button>
                  </div>
                  <div className="space-y-3">
                    {questions.map((q) => (
                      <div key={q.id}>
                        <p className="text-xs text-muted-foreground">{q.question}</p>
                        <p className="text-sm text-foreground">{answers[q.id] || "Not answered"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Ready to submit!</p>
                    <p className="text-sm text-muted-foreground">
                      Your application will be sent to the recruiter. You'll receive updates via email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleApply} className="bg-gradient-primary text-primary-foreground px-8">
                  Submit Application
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ApplyJob;
