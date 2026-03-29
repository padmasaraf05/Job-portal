import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Pause,
  Play,
  MapPin,
  Users,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    active: "bg-success/15 text-success border-success/30",
    draft: "bg-info/15 text-info border-info/30",
    closed: "bg-muted text-muted-foreground border-muted-foreground/30",
    expired: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return styles[status] || styles.draft;
};

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // ── Fetch employer's jobs ──────────────────────────────────────
  const fetchJobs = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, title, company, department, location, type, status, application_count, view_count, created_at, closes_at"
      )
      .eq("employer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load jobs", variant: "destructive" });
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ── Status update (pause → active toggle, or close) ───────────
  const updateJobStatus = async (jobId: string, newStatus: string, jobTitle: string) => {
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId)
      .eq("employer_id", userId); // Safety: only own jobs

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );

    toast({
      title: "Job updated",
      description: `"${jobTitle}" is now ${newStatus}.`,
    });
  };

  // ── Delete ─────────────────────────────────────────────────────
  const deleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Delete "${jobTitle}"? This cannot be undone.`)) return;

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId)
      .eq("employer_id", userId);

    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }

    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    toast({ title: "Job deleted", description: `"${jobTitle}" has been removed.` });
  };

  // ── Bulk actions ───────────────────────────────────────────────
  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedJobIds.length === 0) return;

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .in("id", selectedJobIds)
      .eq("employer_id", userId);

    if (error) {
      toast({ title: "Bulk update failed", variant: "destructive" });
      return;
    }

    setJobs((prev) =>
      prev.map((j) =>
        selectedJobIds.includes(j.id) ? { ...j, status: newStatus } : j
      )
    );
    setSelectedJobIds([]);
    toast({ title: `${selectedJobIds.length} job(s) updated to ${newStatus}` });
  };

  const bulkDelete = async () => {
    if (selectedJobIds.length === 0) return;
    if (!confirm(`Delete ${selectedJobIds.length} job(s)? This cannot be undone.`)) return;

    const { error } = await supabase
      .from("jobs")
      .delete()
      .in("id", selectedJobIds)
      .eq("employer_id", userId);

    if (error) {
      toast({ title: "Bulk delete failed", variant: "destructive" });
      return;
    }

    setJobs((prev) => prev.filter((j) => !selectedJobIds.includes(j.id)));
    setSelectedJobIds([]);
    toast({ title: `${selectedJobIds.length} job(s) deleted` });
  };

  // ── Selection helpers ──────────────────────────────────────────
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedJobIds.length === filteredJobs.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(filteredJobs.map((j) => j.id));
    }
  };

  const handleSelectJob = (id: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── Stats ──────────────────────────────────────────────────────
  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "active").length,
    draft: jobs.filter((j) => j.status === "draft").length,
    totalApplications: jobs.reduce((sum, j) => sum + (j.application_count || 0), 0),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground">
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
                <h1 className="text-3xl font-bold">Manage Jobs</h1>
              </div>
              <p className="text-primary-foreground/80">
                View, edit, and manage all your job listings.
              </p>
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
          {[
            { label: "Total Jobs", value: stats.total, icon: Briefcase, color: "text-primary" },
            { label: "Active", value: stats.active, icon: Play, color: "text-success" },
            { label: "Drafts", value: stats.draft, icon: Edit, color: "text-info" },
            { label: "Applications", value: stats.totalApplications, icon: Users, color: "text-accent" },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 opacity-20 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
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
              placeholder="Search by title, company, or location…"
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchJobs}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Bulk Actions */}
        {selectedJobIds.length > 0 && (
          <motion.div
            className="flex items-center gap-4 mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-sm font-medium">
              {selectedJobIds.length} job(s) selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkUpdateStatus("active")}
            >
              <Play className="w-4 h-4 mr-1" /> Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkUpdateStatus("closed")}
            >
              <Pause className="w-4 h-4 mr-1" /> Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={bulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedJobIds([])}
            >
              Cancel
            </Button>
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <Card className="border-0 shadow-lg p-8 text-center">
              <p className="text-muted-foreground">Loading your jobs…</p>
            </Card>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No jobs found
              </h3>
              <p className="text-muted-foreground mb-4">
                {jobs.length === 0
                  ? "You haven't posted any jobs yet."
                  : "Try adjusting your search or filters."}
              </p>
              <Link to="/employer/post-job">
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Post a New Job
                </Button>
              </Link>
            </div>
          ) : (
            <Card className="border-0 shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={
                          selectedJobIds.length === filteredJobs.length &&
                          filteredJobs.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Job Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Applications</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job, index) => (
                    <motion.tr
                      key={job.id}
                      className="hover:bg-muted/30 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.04 }}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={selectedJobIds.includes(job.id)}
                          onChange={() => handleSelectJob(job.id)}
                        />
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground">
                            {job.title}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            {job.department && <span>{job.department}</span>}
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                            {job.type && (
                              <Badge variant="outline" className="text-xs">
                                {job.type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadge(job.status)}
                        >
                          {job.status?.charAt(0).toUpperCase() +
                            job.status?.slice(1)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {job.application_count ?? 0}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {job.view_count ?? 0}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <p className="text-foreground">
                            {new Date(job.created_at).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                          </p>
                          {job.closes_at && (
                            <p className="text-muted-foreground text-xs">
                              Closes:{" "}
                              {new Date(job.closes_at).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short" }
                              )}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/employer/applications?job=${job.id}`)
                              }
                            >
                              <Users className="w-4 h-4 mr-2" />
                              View Applications
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {job.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateJobStatus(job.id, "closed", job.title)
                                }
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                Close Job
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateJobStatus(job.id, "active", job.title)
                                }
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => deleteJob(job.id, job.title)}
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
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ManageJobs;