import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, MoreHorizontal, Shield,
  UserCheck, UserX, ChevronLeft, ChevronRight,
  Loader2, RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

const Users = () => {
  const { toast } = useToast();

  const [users, setUsers]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter]   = useState("all");
  const [page, setPage]               = useState(0);
  const [total, setTotal]             = useState(0);
  const [updatingId, setUpdatingId]   = useState<string | null>(null);

  // ── Stats ─────────────────────────────────────────────────
  const [stats, setStats] = useState({
    total: 0, jobseekers: 0, employers: 0, admins: 0,
  });

  const fetchUsers = async () => {
    setLoading(true);

    // Stats
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("role, is_verified");

    if (allProfiles) {
      setStats({
        total:      allProfiles.length,
        jobseekers: allProfiles.filter((p) => p.role === "jobseeker").length,
        employers:  allProfiles.filter((p) => p.role === "employer").length,
        admins:     allProfiles.filter((p) => p.role === "admin").length,
      });
    }

    // Paged user list
    let query = supabase
      .from("profiles")
      .select("id, full_name, role, phone, created_at, is_verified, resume_url", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (roleFilter !== "all") {
      query = query.eq("role", roleFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      toast({ title: "Failed to load users", variant: "destructive" });
    } else {
      setUsers(data || []);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  // ── Ban / Activate ─────────────────────────────────────────
  const toggleVerified = async (userId: string, currentState: boolean, userName: string) => {
    setUpdatingId(userId);

    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: !currentState })
      .eq("id", userId);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, is_verified: !currentState } : u)
      );
      toast({
        title: currentState ? `${userName} deactivated` : `${userName} activated`,
      });
    }

    setUpdatingId(null);
  };

  // ── Change role ────────────────────────────────────────────
  const changeRole = async (userId: string, newRole: string, userName: string) => {
    setUpdatingId(userId);

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      toast({ title: "Role update failed", variant: "destructive" });
    } else {
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, role: newRole } : u)
      );
      toast({ title: `${userName} is now ${newRole}` });
    }

    setUpdatingId(null);
  };

  // ── Client-side search ─────────────────────────────────────
  const filteredUsers = users.filter((u) =>
    !searchQuery ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    { title: "Total Users",    value: stats.total,      icon: UserCheck, color: "text-primary" },
    { title: "Job Seekers",    value: stats.jobseekers, icon: UserCheck, color: "text-success" },
    { title: "Employers",      value: stats.employers,  icon: Shield,    color: "text-accent" },
    { title: "Admins",         value: stats.admins,     icon: Shield,    color: "text-warning" },
  ];

  return (
    <AdminLayout title="Users" subtitle="Manage platform users">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-70`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Users</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-56 pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0); }}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="jobseeker">Job Seeker</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchUsers}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-border hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {user.full_name?.charAt(0)?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {user.full_name || "Unnamed user"}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {user.id.slice(0, 8)}…
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="secondary"
                            className={
                              user.role === "admin"     ? "bg-primary/10 text-primary" :
                              user.role === "employer"  ? "bg-accent/10 text-accent" :
                              "bg-muted text-muted-foreground"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={
                              user.is_verified
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }
                          >
                            {user.is_verified ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-right">
                          {updatingId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => toggleVerified(user.id, user.is_verified, user.full_name)}
                                >
                                  {user.is_verified ? (
                                    <><UserX className="mr-2 h-4 w-4" /> Deactivate</>
                                  ) : (
                                    <><UserCheck className="mr-2 h-4 w-4" /> Activate</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.role !== "admin" && (
                                  <DropdownMenuItem onClick={() => changeRole(user.id, "admin", user.full_name)}>
                                    <Shield className="mr-2 h-4 w-4" /> Make Admin
                                  </DropdownMenuItem>
                                )}
                                {user.role !== "jobseeker" && (
                                  <DropdownMenuItem onClick={() => changeRole(user.id, "jobseeker", user.full_name)}>
                                    <UserCheck className="mr-2 h-4 w-4" /> Set as Job Seeker
                                  </DropdownMenuItem>
                                )}
                                {user.role !== "employer" && (
                                  <DropdownMenuItem onClick={() => changeRole(user.id, "employer", user.full_name)}>
                                    <Shield className="mr-2 h-4 w-4" /> Set as Employer
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total} users
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
};

export default Users;