import { motion } from "framer-motion";
import { 
  MapPin, 
  Clock, 
  IndianRupee, 
  Briefcase,
  Building2,
  Users,
  Globe,
  CheckCircle,
  XCircle,
  Bookmark,
  Share2,
  ChevronRight,
  Zap,
  GraduationCap,
  Star
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";



const skillMatch = [
  { skill: "React.js", userLevel: 78, required: 70, match: true },
  { skill: "JavaScript", userLevel: 85, required: 80, match: true },
  { skill: "TypeScript", userLevel: 65, required: 60, match: true },
  { skill: "REST APIs", userLevel: 55, required: 70, match: false },
  { skill: "Git", userLevel: 70, required: 60, match: true },
  { skill: "CSS/Tailwind", userLevel: 90, required: 75, match: true },
];

const similarJobs = [
  { title: "React Developer", company: "TCS", location: "Chennai", salary: "₹5-7 LPA", match: 89 },
  { title: "Frontend Engineer", company: "Wipro", location: "Hyderabad", salary: "₹7-9 LPA", match: 86 },
  { title: "Web Developer", company: "HCL", location: "Noida", salary: "₹4-6 LPA", match: 82 },
];

const JobDetails = () => {
  const { id } = useParams();
    const { toast } = useToast();
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();

  const matchedSkills = skillMatch.filter(s => s.match).length;
  const totalSkills = skillMatch.length;
  const handleApply = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    toast({
      title: "Login required",
      description: "Please login to apply",
      variant: "destructive",
    });
    return;
  }

  const { error } = await supabase.from("applications").insert({
    job_id: id,
    user_id: user.id,
    status: "applied",
  });

  if (error) {
    toast({
      title: "Already applied or error",
      description: error.message,
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Application submitted",
    description: "Successfully applied for this job",
  });
};

  useEffect(() => {  
const fetchJob = async () => {
    if (!id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setJobDetails({
        ...data,
        match: Math.floor(Math.random() * 20) + 80,
        applicants: data.applicants || 0,
      });
    }
  };
  fetchJob();
}, [id]);
if (loading || !jobDetails) {
  return <div className="p-10 text-center">Loading job...</div>;
}

if (!jobDetails) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Header Card */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-3xl shrink-0">
                  {jobDetails.logo}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{jobDetails.title}</h1>
                      <p className="text-lg text-muted-foreground">{jobDetails.company}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Bookmark className="w-5 h-5" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {jobDetails.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> {jobDetails.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" /> {jobDetails.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {jobDetails.posted}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="secondary">{jobDetails.type}</Badge>
                    <Badge variant="outline">{jobDetails.applicants} applicants</Badge>
                    <Badge className="bg-success/10 text-success border-0">
                      <Zap className="w-3 h-3 mr-1" /> {jobDetails.match}% Match
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
  <Button
  className="flex-1 bg-gradient-primary text-primary-foreground h-12"
  onClick={async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return alert("Please login");

    await supabase.from("applications").insert({
      job_id: jobDetails.id,
      jobseeker_id: user.id,
      status: "applied",
    });

    navigate("/jobseeker/applications");
  }}
>
  Apply Now <ChevronRight className="w-4 h-4 ml-1" />
</Button>


                <Button variant="outline" className="h-12">
                  Message Recruiter
                </Button>
              </div>
            </Card>

            {/* About Company */}
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> About the Company
              </h2>
              <p className="text-muted-foreground leading-relaxed">{jobDetails.about}</p>
              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> 50,000+ employees
                </span>
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> www.infosys.com
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning" /> 4.1/5 rating
                </span>
              </div>
            </Card>

            {/* Job Description */}
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-lg font-semibold text-foreground mb-4">Job Description</h2>
              <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {jobDetails.description}
              </div>
            </Card>

            {/* Requirements */}
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> Requirements
              </h2>
              <ul className="space-y-3">
                {jobDetails.requirements.map((req, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>

            {/* Benefits */}
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-lg font-semibold text-foreground mb-4">Benefits & Perks</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {jobDetails.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-success/5"
                  >
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Skill Match */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4">Your Skill Match</h3>
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-secondary"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${jobDetails.match * 3.52} 352`}
                      className="text-success"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{jobDetails.match}%</span>
                    <span className="text-xs text-muted-foreground">Match</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  You match <span className="text-success font-medium">{matchedSkills}/{totalSkills}</span> required skills
                </p>
              </div>
              <div className="space-y-4">
                {skillMatch.map((item, index) => (
                  <motion.div
                    key={item.skill}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">{item.skill}</span>
                      {item.match ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="relative">
                      <Progress value={item.userLevel} className="h-2" />
                      <div 
                        className="absolute top-0 w-0.5 h-2 bg-foreground/50"
                        style={{ left: `${item.required}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Your: {item.userLevel}%</span>
                      <span>Required: {item.required}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Similar Jobs */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4">Similar Jobs</h3>
              <div className="space-y-3">
                {similarJobs.map((job, index) => (
                  <motion.div
                    key={job.title}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <h4 className="font-medium text-foreground text-sm">{job.title}</h4>
                    <p className="text-xs text-muted-foreground">{job.company} • {job.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium text-foreground">{job.salary}</span>
                      <Badge variant="outline" className="text-xs">
                        {job.match}% match
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Apply Deadline */}
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-accent/10 to-warning/10">
              <div className="text-center">
                <Clock className="w-10 h-10 mx-auto text-accent mb-3" />
                <h3 className="font-semibold text-foreground">Apply Before</h3>
                <p className="text-2xl font-bold text-accent mt-1">{jobDetails.deadline}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Don't miss this opportunity!
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
