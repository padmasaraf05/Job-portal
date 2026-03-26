import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  ChevronRight,
  Star,
  StarOff,
  MessageSquare,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const mockApplications = [
  {
    id: 1,
    candidate: {
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      phone: "+1 (555) 123-4567",
      avatar: "SC",
      location: "San Francisco, CA",
      experience: "5 years"
    },
    job: "Senior Frontend Developer",
    status: "shortlisted",
    stage: "Technical Interview",
    appliedDate: "2024-01-15",
    rating: 5,
    isStarred: true,
    matchScore: 92
  },
  {
    id: 2,
    candidate: {
      name: "Michael Johnson",
      email: "michael.j@email.com",
      phone: "+1 (555) 234-5678",
      avatar: "MJ",
      location: "New York, NY",
      experience: "7 years"
    },
    job: "Product Manager",
    status: "new",
    stage: "Application Review",
    appliedDate: "2024-01-16",
    rating: 0,
    isStarred: false,
    matchScore: 85
  },
  {
    id: 3,
    candidate: {
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      phone: "+1 (555) 345-6789",
      avatar: "ER",
      location: "Los Angeles, CA",
      experience: "4 years"
    },
    job: "UX Designer",
    status: "reviewed",
    stage: "Portfolio Review",
    appliedDate: "2024-01-14",
    rating: 4,
    isStarred: true,
    matchScore: 88
  },
  {
    id: 4,
    candidate: {
      name: "David Kim",
      email: "david.kim@email.com",
      phone: "+1 (555) 456-7890",
      avatar: "DK",
      location: "Seattle, WA",
      experience: "3 years"
    },
    job: "Senior Frontend Developer",
    status: "rejected",
    stage: "Closed",
    appliedDate: "2024-01-12",
    rating: 2,
    isStarred: false,
    matchScore: 65
  },
  {
    id: 5,
    candidate: {
      name: "Lisa Wang",
      email: "lisa.wang@email.com",
      phone: "+1 (555) 567-8901",
      avatar: "LW",
      location: "Austin, TX",
      experience: "6 years"
    },
    job: "Data Scientist",
    status: "interviewing",
    stage: "Final Interview",
    appliedDate: "2024-01-10",
    rating: 5,
    isStarred: true,
    matchScore: 95
  },
  {
    id: 6,
    candidate: {
      name: "James Wilson",
      email: "james.w@email.com",
      phone: "+1 (555) 678-9012",
      avatar: "JW",
      location: "Chicago, IL",
      experience: "8 years"
    },
    job: "Backend Engineer",
    status: "offered",
    stage: "Offer Extended",
    appliedDate: "2024-01-08",
    rating: 5,
    isStarred: true,
    matchScore: 98
  },
];

const pipelineStages = [
  { id: "all", label: "All", count: mockApplications.length },
  { id: "new", label: "New", count: mockApplications.filter(a => a.status === 'new').length },
  { id: "reviewed", label: "Reviewed", count: mockApplications.filter(a => a.status === 'reviewed').length },
  { id: "shortlisted", label: "Shortlisted", count: mockApplications.filter(a => a.status === 'shortlisted').length },
  { id: "interviewing", label: "Interviewing", count: mockApplications.filter(a => a.status === 'interviewing').length },
  { id: "offered", label: "Offered", count: mockApplications.filter(a => a.status === 'offered').length },
  { id: "rejected", label: "Rejected", count: mockApplications.filter(a => a.status === 'rejected').length },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    new: "bg-info/15 text-info border-info/30",
    reviewed: "bg-warning/15 text-warning border-warning/30",
    shortlisted: "bg-accent/15 text-accent border-accent/30",
    interviewing: "bg-primary/15 text-primary border-primary/30",
    offered: "bg-success/15 text-success border-success/30",
    rejected: "bg-destructive/15 text-destructive border-destructive/30"
  };
  return colors[status] || colors.new;
};

const getMatchScoreColor = (score: number) => {
  if (score >= 90) return "text-success";
  if (score >= 75) return "text-warning";
  return "text-destructive";
};

const Applications = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStage, setActiveStage] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = app.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = activeStage === "all" || app.status === activeStage;
    const matchesJob = jobFilter === "all" || app.job === jobFilter;
    return matchesSearch && matchesStage && matchesJob;
  });

  const uniqueJobs = [...new Set(mockApplications.map(app => app.job))];

  const handleStatusChange = (applicationId: number, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Application status changed to ${newStatus}.`,
    });
  };

  const toggleStar = (applicationId: number) => {
    toast({
      title: "Candidate starred",
      description: "Candidate has been added to your favorites.",
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
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary-foreground/10">
                <Users className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-display font-bold">Applications</h1>
            </div>
            <p className="text-primary-foreground/80">Review and manage candidate applications across your job listings.</p>
          </motion.div>
        </div>
      </header>

      <main className="container py-8">
        {/* Pipeline Tabs */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeStage} onValueChange={setActiveStage}>
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-card border border-border">
              {pipelineStages.map((stage) => (
                <TabsTrigger 
                  key={stage.id} 
                  value={stage.id}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {stage.label}
                  <Badge variant="secondary" className="text-xs">
                    {stage.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="flex flex-col md:flex-row gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-full md:w-64">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {uniqueJobs.map((job) => (
                <SelectItem key={job} value={job}>{job}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card className="card-elevated overflow-hidden">
                <CardContent className="p-0">
                  {/* Main Row */}
                  <div 
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedCard(expandedCard === application.id ? null : application.id)}
                  >
                    {/* Avatar & Star */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleStar(application.id); }}
                        className="text-muted-foreground hover:text-warning transition-colors"
                      >
                        {application.isStarred ? (
                          <Star className="w-5 h-5 fill-warning text-warning" />
                        ) : (
                          <StarOff className="w-5 h-5" />
                        )}
                      </button>
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        {application.candidate.avatar}
                      </div>
                    </div>

                    {/* Candidate Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{application.candidate.name}</h3>
                        <Badge variant="outline" className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{application.job}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Applied {new Date(application.appliedDate).toLocaleDateString()}
                        </span>
                        <span>{application.candidate.location}</span>
                        <span>{application.candidate.experience}</span>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="text-center px-4">
                      <p className={`text-2xl font-display font-bold ${getMatchScoreColor(application.matchScore)}`}>
                        {application.matchScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>

                    {/* Current Stage */}
                    <div className="hidden md:block text-right px-4">
                      <p className="text-sm font-medium text-foreground">{application.stage}</p>
                      <p className="text-xs text-muted-foreground">Current Stage</p>
                    </div>

                    {/* Expand Icon */}
                    <div className="text-muted-foreground">
                      {expandedCard === application.id ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedCard === application.id && (
                    <motion.div 
                      className="border-t border-border p-4 bg-muted/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Contact Info */}
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3">Contact Information</h4>
                          <div className="space-y-2">
                            <a 
                              href={`mailto:${application.candidate.email}`}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                              {application.candidate.email}
                            </a>
                            <a 
                              href={`tel:${application.candidate.phone}`}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                              {application.candidate.phone}
                            </a>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h4>
                          <div className="flex flex-wrap gap-2">
                            <Link to={`/employer/candidate/${application.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View Profile
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-1" />
                              Resume
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>

                        {/* Move to Stage */}
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3">Update Status</h4>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-success hover:text-success hover:bg-success/10"
                              onClick={() => handleStatusChange(application.id, 'shortlisted')}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Shortlist
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-primary"
                              onClick={() => handleStatusChange(application.id, 'interviewing')}
                            >
                              Schedule Interview
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No applications found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Applications;
