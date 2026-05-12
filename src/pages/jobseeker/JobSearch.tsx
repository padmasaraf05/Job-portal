import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Briefcase, Clock, Filter,
  SlidersHorizontal, Bookmark, BookmarkCheck,
  Zap, Building2, IndianRupee,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatSalary } from "@/lib/salaryUtils";

const jobTypes       = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];
const experienceLevels = ["Fresher", "0-2 years", "2-5 years", "5+ years"];
const locations      = ["Bangalore", "Hyderabad", "Mumbai", "Delhi NCR", "Chennai", "Remote"];

// ── Real skill match calculation ───────────────────────────────
function calcMatch(jobSkills: string[], userSkills: string[]): number {
  if (!jobSkills || jobSkills.length === 0) return 70; // no required skills → decent match
  if (!userSkills || userSkills.length === 0) return 30;

  const userLower = userSkills.map(s => s.toLowerCase().trim());
  const matched   = jobSkills.filter(s =>
    userLower.some(us => us.includes(s.toLowerCase().trim()) || s.toLowerCase().trim().includes(us))
  );

  const raw = Math.round((matched.length / jobSkills.length) * 100);
  // Clamp between 20–99 so it always looks meaningful
  return Math.min(99, Math.max(20, raw));
}

const JobSearch = () => {
  const [searchTerm, setSearchTerm]           = useState("");
  const [locationSearch, setLocationSearch]   = useState("");
  const [showFilters, setShowFilters]         = useState(true);
  const [salaryRange, setSalaryRange]         = useState([0]);
  const [selectedTypes, setSelectedTypes]     = useState<string[]>([]);
  const [selectedExp, setSelectedExp]         = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [jobList, setJobList]                 = useState<any[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [savedJobIds, setSavedJobIds]         = useState<string[]>([]);
  const [userId, setUserId]                   = useState<string | null>(null);
  const [userSkills, setUserSkills]           = useState<string[]>([]);

  const navigate  = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // 1. Get current user + profile skills
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        // Fetch saved jobs
        const { data: saved } = await supabase
          .from("saved_jobs")
          .select("job_id")
          .eq("jobseeker_id", user.id);
        if (saved) setSavedJobIds(saved.map((s: any) => s.job_id));

        // Fetch user skills for real match calculation
        const { data: prof } = await supabase
          .from("profiles")
          .select("skills")
          .eq("id", user.id)
          .single();
        if (prof?.skills && Array.isArray(prof.skills)) {
          setUserSkills(prof.skills);
        }
      }

      // 2. Fetch active jobs
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error && data) {
        // We'll calculate match after userSkills is set, so store raw jobs
        setJobList(data.map((job: any) => ({
          ...job,
          salaryDisplay: formatSalary(job.salary_min, job.salary_max, job.salary),
          posted: job.created_at
            ? new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : "Recently",
          applicants: job.application_count ?? 0,
          skills: Array.isArray(job.skills) ? job.skills : [],
        })));
      }

      setLoading(false);
    };

    init();
  }, []);

  // ── Save / unsave ──────────────────────────────────────────
  const toggleSave = async (jobId: string) => {
    if (!userId) {
      toast({ title: "Please login to save jobs", variant: "destructive" });
      return;
    }
    const isSaved = savedJobIds.includes(jobId);
    if (isSaved) {
      await supabase.from("saved_jobs").delete()
        .eq("jobseeker_id", userId).eq("job_id", jobId);
      setSavedJobIds(prev => prev.filter(id => id !== jobId));
      toast({ title: "Job removed from saved" });
    } else {
      const { error } = await supabase.from("saved_jobs")
        .insert({ jobseeker_id: userId, job_id: jobId });
      if (!error) {
        setSavedJobIds(prev => [...prev, jobId]);
        toast({ title: "Job saved!" });
      }
    }
  };

  // ── Client-side filtering ──────────────────────────────────
  const filteredJobs = jobList
    .filter(job => {
      const matchesSearch =
        !searchTerm ||
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        !locationSearch ||
        job.location?.toLowerCase().includes(locationSearch.toLowerCase());

      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(job.type);

      const matchesSelectedLocation =
        selectedLocations.length === 0 ||
        selectedLocations.some(loc =>
          job.location?.toLowerCase().includes(loc.toLowerCase())
        );

      const matchesSalary =
        salaryRange[0] === 0 ||
        !job.salary_min ||
        job.salary_min / 100000 >= salaryRange[0];

      const matchesExp =
        selectedExp.length === 0 ||
        selectedExp.some(exp => {
          if (exp === "Fresher")    return job.experience_level === "Fresher";
          if (exp === "0-2 years")  return job.experience_level === "Junior";
          if (exp === "2-5 years")  return job.experience_level === "Mid-level";
          if (exp === "5+ years")   return job.experience_level === "Senior";
          return true;
        });

      return matchesSearch && matchesLocation && matchesType &&
             matchesSelectedLocation && matchesSalary && matchesExp;
    })
    // Calculate real match % for each visible job
    .map(job => ({
      ...job,
      match: calcMatch(job.skills, userSkills),
    }))
    // Sort by match descending
    .sort((a, b) => b.match - a.match);

  const matchColor = (pct: number) => {
    if (pct >= 75) return "bg-success/10 text-success";
    if (pct >= 50) return "bg-warning/10 text-warning";
    return "bg-secondary text-muted-foreground";
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
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="City or remote"
                  className="pl-12 h-14 bg-card border-0 shadow-lg text-foreground rounded-xl"
                  value={locationSearch}
                  onChange={e => setLocationSearch(e.target.value)}
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
            <span className="text-foreground font-semibold">{filteredJobs.length}</span> jobs found
            {userSkills.length > 0 && (
              <span className="text-xs ml-2 text-primary">
                · Match calculated from your {userSkills.length} skills
              </span>
            )}
          </p>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
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
                    <Button
                      variant="ghost" size="sm" className="text-primary text-xs"
                      onClick={() => {
                        setSelectedTypes([]); setSelectedLocations([]);
                        setSelectedExp([]); setSalaryRange([0]);
                        setSearchTerm(""); setLocationSearch("");
                      }}
                    >
                      Clear All
                    </Button>
                  </div>

                  {/* Job Type */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Job Type</h4>
                    <div className="space-y-2">
                      {jobTypes.map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={checked =>
                              setSelectedTypes(prev =>
                                checked ? [...prev, type] : prev.filter(t => t !== type)
                              )
                            }
                          />
                          <span className="text-sm text-muted-foreground">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Experience</h4>
                    <div className="space-y-2">
                      {experienceLevels.map(level => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={selectedExp.includes(level)}
                            onCheckedChange={checked =>
                              setSelectedExp(prev =>
                                checked ? [...prev, level] : prev.filter(l => l !== level)
                              )
                            }
                          />
                          <span className="text-sm text-muted-foreground">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Min Salary: {salaryRange[0] === 0 ? "Any" : `₹${salaryRange[0]} LPA+`}
                    </h4>
                    <Slider value={salaryRange} onValueChange={setSalaryRange} max={30} step={2} className="mt-2" />
                  </div>

                  {/* Location */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Location</h4>
                    <div className="space-y-2">
                      {locations.map(loc => (
                        <label key={loc} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={selectedLocations.includes(loc)}
                            onCheckedChange={checked =>
                              setSelectedLocations(prev =>
                                checked ? [...prev, loc] : prev.filter(l => l !== loc)
                              )
                            }
                          />
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
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-6 border-0 shadow-lg">
                    <div className="animate-pulse flex gap-4">
                      <div className="w-14 h-14 rounded-xl bg-secondary" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-secondary rounded w-1/3" />
                        <div className="h-3 bg-secondary rounded w-1/4" />
                        <div className="h-3 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20">
                <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 border-0 shadow-lg card-hover group">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                          {job.company?.charAt(0) || "J"}
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
                              {/* Real match badge */}
                              <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${matchColor(job.match)}`}>
                                <Zap className="w-4 h-4" />
                                {job.match}% Match
                              </div>
                              <Button
                                variant="ghost" size="icon"
                                onClick={e => { e.stopPropagation(); toggleSave(job.id); }}
                                className="text-muted-foreground hover:text-primary"
                              >
                                {savedJobIds.includes(job.id)
                                  ? <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
                                  : <Bookmark className="w-5 h-5" />}
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {job.type && <Badge variant="secondary">{job.type}</Badge>}
                            <Badge variant="outline" className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" /> {job.salaryDisplay}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {job.posted}
                            </span>
                          </div>

                          {job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {job.skills.slice(0, 5).map((skill: string) => {
                                const hasSkill = userSkills.some(
                                  us => us.toLowerCase() === skill.toLowerCase()
                                );
                                return (
                                  <span
                                    key={skill}
                                    className={`px-2 py-1 text-xs rounded-md font-medium ${
                                      hasSkill
                                        ? "bg-success/10 text-success"
                                        : "bg-primary/10 text-primary"
                                    }`}
                                  >
                                    {hasSkill ? "✓ " : ""}{skill}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <span className="text-xs text-muted-foreground">
                              {job.applicants} applicants
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="outline" size="sm"
                                onClick={() => navigate(`/jobseeker/job/${job.id}`)}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;