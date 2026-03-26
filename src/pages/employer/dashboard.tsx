import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ArrowUpRight,
  Calendar,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const mockStats = [
  { label: "Active Jobs", value: 12, icon: Briefcase, change: "+2 this week", trend: "up" },
  { label: "Total Applications", value: 248, icon: Users, change: "+34 this week", trend: "up" },
  { label: "Profile Views", value: 1842, icon: Eye, change: "+12%", trend: "up" },
  { label: "Hire Rate", value: "68%", icon: TrendingUp, change: "+5%", trend: "up" },
];

const mockRecentJobs = [
  { 
    id: 1, 
    title: "Senior Frontend Developer", 
    location: "San Francisco, CA", 
    applications: 45, 
    views: 320,
    status: "active",
    daysPosted: 5
  },
  { 
    id: 2, 
    title: "Product Manager", 
    location: "New York, NY", 
    applications: 32, 
    views: 215,
    status: "active",
    daysPosted: 12
  },
  { 
    id: 3, 
    title: "UX Designer", 
    location: "Remote", 
    applications: 28, 
    views: 180,
    status: "active",
    daysPosted: 8
  },
  { 
    id: 4, 
    title: "Data Scientist", 
    location: "Austin, TX", 
    applications: 19, 
    views: 145,
    status: "paused",
    daysPosted: 20
  },
];

const mockRecentApplications = [
  { id: 1, name: "Sarah Chen", role: "Senior Frontend Developer", status: "shortlisted", avatar: "SC", appliedAgo: "2 hours ago" },
  { id: 2, name: "Michael Johnson", role: "Product Manager", status: "new", avatar: "MJ", appliedAgo: "5 hours ago" },
  { id: 3, name: "Emily Rodriguez", role: "UX Designer", status: "reviewed", avatar: "ER", appliedAgo: "1 day ago" },
  { id: 4, name: "David Kim", role: "Senior Frontend Developer", status: "rejected", avatar: "DK", appliedAgo: "2 days ago" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "new": return "bg-info/15 text-info";
    case "reviewed": return "bg-warning/15 text-warning";
    case "shortlisted": return "bg-success/15 text-success";
    case "rejected": return "bg-destructive/15 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
};

const EmployerDashboard = () => {
  const navigate = useNavigate();

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
            <h1 className="text-3xl font-display font-bold mb-2">Welcome back, TechCorp Inc.</h1>
            <p className="text-primary-foreground/80">Here's what's happening with your hiring pipeline today.</p>
          </motion.div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {mockStats.map((stat, index) => (
            <motion.div key={stat.label} variants={fadeUpItem}>
              <Card className="stat-card group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-success flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Jobs Performance */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display">Job Performance</CardTitle>
                <Link to="/employer/manage-jobs">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentJobs.map((job, index) => (
                    <motion.div 
                      key={job.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
                          <span className={`badge-status ${job.status === 'active' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {job.daysPosted}d ago
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-foreground">{job.applications}</p>
                          <p className="text-muted-foreground">Applications</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-foreground">{job.views}</p>
                          <p className="text-muted-foreground">Views</p>
                        </div>
                        <div className="w-24">
                          <Progress value={(job.applications / job.views) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1 text-center">
                            {((job.applications / job.views) * 100).toFixed(0)}% conversion
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display">Recent Applications</CardTitle>
                <Link to="/employer/applications">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentApplications.map((application, index) => (
                    <motion.div 
                      key={application.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                        {application.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{application.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{application.role}</p>
                      </div>
                      <div className="text-right">
                        <span className={`badge-status ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{application.appliedAgo}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="gradient-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-display font-semibold mb-1">Ready to find your next great hire?</h3>
                  <p className="text-primary-foreground/80">Post a new job and reach thousands of qualified candidates.</p>
                </div>
                <Link to="/employer/post-job">
                  <Button variant="secondary" size="lg" className="whitespace-nowrap">
                    Post a New Job
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default EmployerDashboard;
