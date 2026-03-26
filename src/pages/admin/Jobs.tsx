import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Building2,
  DollarSign,
  Calendar,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const jobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Tech Solutions Inc",
    location: "San Francisco, CA",
    salary: "$120k - $160k",
    type: "Full-time",
    status: "pending",
    postedDate: "Dec 18, 2024",
    applications: 45,
    featured: true,
  },
  {
    id: 2,
    title: "Product Manager",
    company: "Global Innovations",
    location: "New York, NY",
    salary: "$130k - $180k",
    type: "Full-time",
    status: "approved",
    postedDate: "Dec 17, 2024",
    applications: 78,
    featured: false,
  },
  {
    id: 3,
    title: "UX Designer",
    company: "StartupHub Co",
    location: "Remote",
    salary: "$90k - $120k",
    type: "Contract",
    status: "approved",
    postedDate: "Dec 16, 2024",
    applications: 32,
    featured: true,
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "Analytics Pro",
    location: "Austin, TX",
    salary: "$140k - $190k",
    type: "Full-time",
    status: "pending",
    postedDate: "Dec 18, 2024",
    applications: 12,
    featured: false,
  },
  {
    id: 5,
    title: "Marketing Specialist",
    company: "Brand Masters",
    location: "Chicago, IL",
    salary: "$60k - $80k",
    type: "Part-time",
    status: "rejected",
    postedDate: "Dec 15, 2024",
    applications: 0,
    featured: false,
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company: "Cloud Systems LLC",
    location: "Seattle, WA",
    salary: "$150k - $200k",
    type: "Full-time",
    status: "approved",
    postedDate: "Dec 14, 2024",
    applications: 56,
    featured: true,
  },
];

const stats = [
  { title: "Total Jobs", value: "1,847", icon: Building2, color: "text-primary" },
  { title: "Pending Review", value: "124", icon: Clock, color: "text-warning" },
  { title: "Approved", value: "1,658", icon: CheckCircle, color: "text-success" },
  { title: "Rejected", value: "65", icon: XCircle, color: "text-destructive" },
];

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || job.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <AdminLayout title="Jobs" subtitle="Moderate and manage job postings">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="stat-card">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold font-display">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Jobs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="font-display">Job Postings</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-border px-4">
                <TabsList className="h-12 bg-transparent p-0 gap-6">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                  >
                    All Jobs
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-warning rounded-none px-0 pb-3"
                  >
                    Pending
                  </TabsTrigger>
                  <TabsTrigger
                    value="approved"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-success rounded-none px-0 pb-3"
                  >
                    Approved
                  </TabsTrigger>
                  <TabsTrigger
                    value="rejected"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-destructive rounded-none px-0 pb-3"
                  >
                    Rejected
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="m-0">
                <div className="divide-y divide-border">
                  {filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {job.title}
                            </h3>
                            {job.featured && (
                              <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                                Featured
                              </Badge>
                            )}
                            <Badge
                              className={
                                job.status === "approved"
                                  ? "bg-success/10 text-success border-success/20"
                                  : job.status === "pending"
                                  ? "bg-warning/10 text-warning border-warning/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                              }
                            >
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              {job.salary}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {job.postedDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {job.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {job.applications} applications
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90 text-success-foreground"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Listing
                              </DropdownMenuItem>
                              {job.status !== "pending" && (
                                <DropdownMenuItem>
                                  <Clock className="mr-2 h-4 w-4" />
                                  Set to Pending
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
};

export default Jobs;
