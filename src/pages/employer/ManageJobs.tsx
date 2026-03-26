import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Pause,
  Play,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    status: "active",
    applications: 45,
    views: 320,
    posted: "2024-01-10",
    expires: "2024-02-10"
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    type: "Full-time",
    status: "active",
    applications: 32,
    views: 215,
    posted: "2024-01-05",
    expires: "2024-02-05"
  },
  {
    id: 3,
    title: "UX Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    status: "active",
    applications: 28,
    views: 180,
    posted: "2024-01-08",
    expires: "2024-02-08"
  },
  {
    id: 4,
    title: "Data Scientist",
    department: "Data",
    location: "Austin, TX",
    type: "Full-time",
    status: "paused",
    applications: 19,
    views: 145,
    posted: "2023-12-20",
    expires: "2024-01-20"
  },
  {
    id: 5,
    title: "Backend Engineer",
    department: "Engineering",
    location: "Seattle, WA",
    type: "Full-time",
    status: "closed",
    applications: 67,
    views: 420,
    posted: "2023-12-01",
    expires: "2024-01-01"
  },
  {
    id: 6,
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Contract",
    status: "draft",
    applications: 0,
    views: 0,
    posted: null,
    expires: null
  },
];

const getStatusBadge = (status: string) => {
  const styles = {
    active: "bg-success/15 text-success border-success/30",
    paused: "bg-warning/15 text-warning border-warning/30",
    closed: "bg-muted text-muted-foreground border-muted-foreground/30",
    draft: "bg-info/15 text-info border-info/30"
  };
  return styles[status as keyof typeof styles] || styles.draft;
};

const ManageJobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job.id));
    }
  };

  const handleSelectJob = (id: number) => {
    if (selectedJobs.includes(id)) {
      setSelectedJobs(selectedJobs.filter(jobId => jobId !== id));
    } else {
      setSelectedJobs([...selectedJobs, id]);
    }
  };

  const handleAction = (action: string, jobTitle: string) => {
    toast({
      title: `${action} - ${jobTitle}`,
      description: `Action "${action}" performed successfully.`,
    });
  };

  const stats = {
    total: mockJobs.length,
    active: mockJobs.filter(j => j.status === 'active').length,
    paused: mockJobs.filter(j => j.status === 'paused').length,
    totalApplications: mockJobs.reduce((sum, j) => sum + j.applications, 0)
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
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary-foreground/10">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-display font-bold">Manage Jobs</h1>
              </div>
              <p className="text-primary-foreground/80">View, edit, and manage all your job listings.</p>
            </div>
            <Link to="/employer/post-job">
              <Button variant="secondary" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-display font-bold">{stats.total}</p>
                </div>
                <Briefcase className="w-8 h-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-display font-bold text-success">{stats.active}</p>
                </div>
                <Play className="w-8 h-8 text-success/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paused</p>
                  <p className="text-2xl font-display font-bold text-warning">{stats.paused}</p>
                </div>
                <Pause className="w-8 h-8 text-warning/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-display font-bold text-info">{stats.totalApplications}</p>
                </div>
                <Users className="w-8 h-8 text-info/30" />
              </div>
            </CardContent>
          </Card>
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
              placeholder="Search jobs by title, department, or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Bulk Actions */}
        {selectedJobs.length > 0 && (
          <motion.div 
            className="flex items-center gap-4 mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <span className="text-sm font-medium">{selectedJobs.length} job(s) selected</span>
            <Button variant="outline" size="sm" onClick={() => handleAction("Pause", `${selectedJobs.length} jobs`)}>
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction("Activate", `${selectedJobs.length} jobs`)}>
              <Play className="w-4 h-4 mr-1" />
              Activate
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleAction("Delete", `${selectedJobs.length} jobs`)}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </motion.div>
        )}

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-elevated overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-border"
                      checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                      onChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Job Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Applications</TableHead>
                  <TableHead className="text-center">Views</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job, index) => (
                  <motion.tr
                    key={job.id}
                    className="table-row-hover"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <TableCell>
                      <input 
                        type="checkbox" 
                        className="rounded border-border"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => handleSelectJob(job.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{job.title}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>{job.department}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          <Badge variant="outline" className="text-xs">{job.type}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(job.status)}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{job.applications}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{job.views}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.posted ? (
                        <div className="text-sm">
                          <p className="text-foreground">{new Date(job.posted).toLocaleDateString()}</p>
                          {job.expires && (
                            <p className="text-muted-foreground text-xs">
                              Expires: {new Date(job.expires).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not published</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("View", job.title)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Edit", job.title)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Duplicate", job.title)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {job.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleAction("Pause", job.title)}>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleAction("Activate", job.title)}>
                              <Play className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleAction("Delete", job.title)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>

        {filteredJobs.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Link to="/employer/post-job">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post a New Job
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ManageJobs;
