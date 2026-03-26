import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Filter,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Zap,
  Building2,
  IndianRupee,
  X,
  ChevronDown
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

const jobs = [
  { 
    id: 1,
    title: "Junior React Developer", 
    company: "Infosys", 
    location: "Bangalore", 
    type: "Full-time",
    salary: "₹6-8 LPA", 
    match: 94,
    posted: "2 hours ago",
    skills: ["React", "JavaScript", "CSS"],
    applicants: 45,
    saved: false,
    
  },
  { 
    id: 2,
    title: "Frontend Developer Intern", 
    company: "Flipkart", 
    location: "Remote", 
    type: "Internship",
    salary: "₹30k/month", 
    match: 91,
    posted: "5 hours ago",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    applicants: 128,
    saved: true,
    
  },
  { 
    id: 3,
    title: "Software Engineer I", 
    company: "Microsoft", 
    location: "Hyderabad", 
    type: "Full-time",
    salary: "₹15-20 LPA", 
    match: 88,
    posted: "1 day ago",
    skills: ["TypeScript", "React", "Node.js"],
    applicants: 312,
    saved: false,
    
  },
  { 
    id: 4,
    title: "Web Developer", 
    company: "TCS", 
    location: "Chennai", 
    type: "Full-time",
    salary: "₹4-6 LPA", 
    match: 85,
    posted: "2 days ago",
    skills: ["HTML", "CSS", "JavaScript"],
    applicants: 89,
    saved: false,
    
  },
  { 
    id: 5,
    title: "React Native Developer", 
    company: "Paytm", 
    location: "Noida", 
    type: "Full-time",
    salary: "₹8-12 LPA", 
    match: 79,
    posted: "3 days ago",
    skills: ["React Native", "JavaScript", "Mobile Development"],
    applicants: 67,
    saved: false,
    
  },
];

const jobTypes = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];
const experienceLevels = ["Fresher", "0-2 years", "2-5 years", "5+ years"];
const locations = ["Bangalore", "Hyderabad", "Mumbai", "Delhi NCR", "Chennai", "Remote"];

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [savedJobs, setSavedJobs] = useState<number[]>([2]);
  const [salaryRange, setSalaryRange] = useState([0]);
  const [jobList, setJobList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();
const { toast } = useToast();


  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
  const formatted = data.map((job) => ({
  ...job,

  // fallback safety (VERY IMPORTANT)
  title: job.title || "Frontend Developer",
  company: job.company || "Unknown Company",
  location: job.location || "Remote",

  type: job.type || "Full-time",
  salary: job.salary || "₹6-10 LPA",

  posted: job.posted || "Recently",

  match: job.match ?? Math.floor(Math.random() * 20) + 80,
  applicants: job.applicants ?? Math.floor(Math.random() * 100),

  skills: Array.isArray(job.skills) ? job.skills : ["React", "JavaScript"],
}));

  setJobList(formatted);
  console.log("JOBS:", formatted);

}


      setLoading(false);
    };

    fetchJobs();
  }, []);

  const toggleSave = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };
  const handleApply = async (jobId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    navigate("/auth/login");
    return;
  }

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    jobseeker_id: user.id,
    status: "applied",
  });

  if (error) {
    toast({
      title: "Already applied or error",
      description: error.message,
      variant: "destructive",
    });
  } else {
    toast({
      title: "Application submitted",
      description: "You have successfully applied for this job",
    });
  }
};


  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-gradient-hero py-10 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl font-bold text-primary-foreground text-center mb-6">
              Find Your Dream Job
            </h1>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Job title, keywords, or company"
                  className="pl-12 h-14 bg-card border-0 shadow-lg text-foreground rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="City or remote"
                  className="pl-12 h-14 bg-card border-0 shadow-lg text-foreground rounded-xl"
                />
              </div>
              <Button className="h-14 px-8 bg-gradient-accent text-accent-foreground hover:opacity-90 shadow-lg rounded-xl">
                <Search className="w-5 h-5 mr-2" /> Search
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold">248</span> jobs found
          </p>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="hidden md:block w-72 shrink-0"
              >
                <Card className="p-6 border-0 shadow-lg sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Filter className="w-4 h-4" /> Filters
                    </h3>
                    <Button variant="ghost" size="sm" className="text-primary text-xs">
                      Clear All
                    </Button>
                  </div>

                  {/* Job Type */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Job Type</h4>
                    <div className="space-y-2">
                      {jobTypes.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox id={type} />
                          <span className="text-sm text-muted-foreground">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Experience</h4>
                    <div className="space-y-2">
                      {experienceLevels.map((level) => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox id={level} />
                          <span className="text-sm text-muted-foreground">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Salary Range: ₹{salaryRange[0]} LPA+
                    </h4>
                    <Slider
                      value={salaryRange}
                      onValueChange={setSalaryRange}
                      max={30}
                      step={2}
                      className="mt-2"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Location</h4>
                    <div className="space-y-2">
                      {locations.map((loc) => (
                        <label key={loc} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox id={loc} />
                          <span className="text-sm text-muted-foreground">{loc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="space-y-4">
              {jobList.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 border-0 shadow-lg card-hover group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                        {job.logo || job.company?.charAt(0)}

                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Building2 className="w-4 h-4" />
                              <span>{job.company}</span>
                              <span>•</span>
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-semibold">
                              <Zap className="w-4 h-4" />
                              {job.match}% Match
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => toggleSave(job.id)}
                              className="text-muted-foreground hover:text-primary"
                            >
                              {savedJobs.includes(job.id) ? (
                                <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
                              ) : (
                                <Bookmark className="w-5 h-5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge variant="secondary">{job.type}</Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" /> {job.salary}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {job.posted}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.skills.map((skill) => (
                            <span 
                              key={skill}
                              className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            {job.applicants} applicants
                          </span>
                          <div className="flex gap-2">
                            <Button
  variant="outline"
  size="sm"
  onClick={() => navigate(`/jobseeker/job/${job.id}`)}
  //onClick={() => navigate(`/jobseeker/jobs/:id}`)}
>
  View Details
</Button>

                            <Button
  size="sm"
  className="bg-gradient-primary text-primary-foreground"
  onClick={() => navigate(`/jobseeker/apply/${job.id}`)}
>
  Apply Now
</Button>


                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
