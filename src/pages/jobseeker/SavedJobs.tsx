import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  MapPin, 
  Building2,
  Clock,
  IndianRupee,
  Zap,
  ArrowUpRight,
  FolderOpen,
  Bell
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const savedJobs = [
  { 
    id: 1,
    title: "Junior React Developer", 
    company: "Infosys", 
    location: "Bangalore", 
    salary: "₹6-8 LPA", 
    match: 94,
    posted: "2 days ago",
    savedDate: "Dec 18, 2024",
    type: "Full-time",
    logo: "I",
    applied: true
  },
  { 
    id: 2,
    title: "Frontend Developer Intern", 
    company: "Flipkart", 
    location: "Remote", 
    salary: "₹30k/month", 
    match: 91,
    posted: "5 hours ago",
    savedDate: "Dec 17, 2024",
    type: "Internship",
    logo: "F",
    applied: false
  },
  { 
    id: 3,
    title: "Software Engineer I", 
    company: "Microsoft", 
    location: "Hyderabad", 
    salary: "₹15-20 LPA", 
    match: 88,
    posted: "1 day ago",
    savedDate: "Dec 15, 2024",
    type: "Full-time",
    logo: "M",
    applied: true
  },
  { 
    id: 4,
    title: "React Native Developer", 
    company: "Paytm", 
    location: "Noida", 
    salary: "₹8-12 LPA", 
    match: 79,
    posted: "3 days ago",
    savedDate: "Dec 14, 2024",
    type: "Full-time",
    logo: "P",
    applied: false
  },
  { 
    id: 5,
    title: "UI Developer", 
    company: "Amazon", 
    location: "Bangalore", 
    salary: "₹12-18 LPA", 
    match: 76,
    posted: "5 days ago",
    savedDate: "Dec 10, 2024",
    type: "Full-time",
    logo: "A",
    applied: false
  },
];

const SavedJobs = () => {
  const [jobs, setJobs] = useState(savedJobs);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const removeJob = (id: number) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

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
                <BookmarkCheck className="w-8 h-8 text-primary" />
                Saved Jobs
              </h1>
              <p className="text-muted-foreground mt-1">
                You have {jobs.length} jobs saved for later
              </p>
            </div>
            <Card className="p-4 border-0 shadow-lg flex items-center gap-4">
              <Bell className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Job Alerts</p>
                <p className="text-xs text-muted-foreground">Get notified about similar jobs</p>
              </div>
              <Switch 
                checked={alertsEnabled} 
                onCheckedChange={setAlertsEnabled}
              />
            </Card>
          </div>

          {/* Empty State */}
          {jobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <FolderOpen className="w-20 h-20 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No saved jobs yet</h2>
              <p className="text-muted-foreground mb-6">
                Start exploring jobs and save the ones you like for later!
              </p>
              <Button className="bg-gradient-primary text-primary-foreground">
                Explore Jobs
              </Button>
            </motion.div>
          )}

          {/* Jobs Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 border-0 shadow-lg card-hover group relative overflow-hidden">
                    {/* Applied Badge */}
                    {job.applied && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-success/10 text-success border-0">
                          Applied
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                        {job.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors pr-16">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Building2 className="w-3 h-3" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" /> {job.salary}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary">{job.type}</Badge>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                            <Zap className="w-3 h-3" /> {job.match}% Match
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Bookmark className="w-3 h-3" /> Saved {job.savedDate}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeJob(job.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {!job.applied ? (
                          <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                            Apply <ArrowUpRight className="w-4 h-4 ml-1" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            View Application
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Stats */}
          {jobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{jobs.length}</p>
                    <p className="text-sm text-muted-foreground">Total Saved</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-success">{jobs.filter(j => j.applied).length}</p>
                    <p className="text-sm text-muted-foreground">Applied</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-accent">{jobs.filter(j => !j.applied).length}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SavedJobs;
