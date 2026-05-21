import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, LayoutDashboard, Search, FileText,
  Bookmark, User, ChevronDown, LogOut, Menu, X,
  Sparkles, BookOpen, Map, Video, Target,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const mainNav = [
  { label: "Dashboard",     href: "/jobseeker/dashboard" },
  { label: "Find Jobs",     href: "/jobseeker/jobs" },
  { label: "Applications",  href: "/jobseeker/applications" },
  { label: "Saved Jobs",    href: "/jobseeker/saved-jobs" },
];

const careerTools = [
  { label: "Resume Analysis",  href: "/jobseeker/resume-analysis",  icon: FileText },
  { label: "Interview Prep",   href: "/jobseeker/interview-prep",   icon: Video },
  { label: "Skill Assessment", href: "/jobseeker/skill-assessment", icon: Target },
  { label: "Learning Path",    href: "/jobseeker/learning-path",    icon: BookOpen },
  { label: "Career Roadmap",   href: "/jobseeker/career-roadmap",   icon: Map },
];

export const JobseekerNavbar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [mobileOpen, setMobileOpen]       = useState(false);
  const [toolsDropdown, setToolsDropdown] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out" });
    navigate("/auth/login");
  };

  const isActive = (href: string) => location.pathname === href;
  const isToolActive = careerTools.some(t => location.pathname === t.href);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm h-14">
        <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/jobseeker/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm hidden sm:block">
              CareerLaunch<span className="text-primary"></span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {mainNav.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Career Tools dropdown */}
            <div className="relative">
              <button
                onClick={() => setToolsDropdown(!toolsDropdown)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isToolActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI Tools
                <ChevronDown className={`w-3 h-3 transition-transform ${toolsDropdown ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {toolsDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setToolsDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-lg z-20 py-1 overflow-hidden"
                    >
                      {careerTools.map(tool => (
                        <Link
                          key={tool.href}
                          to={tool.href}
                          onClick={() => setToolsDropdown(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            isActive(tool.href)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <tool.icon className="w-4 h-4 shrink-0" />
                          {tool.label}
                        </Link>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side — Profile + Logout */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link to="/jobseeker/profile">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-card border-l border-border flex flex-col md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="font-bold text-foreground">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {mainNav.map(item => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-2 pb-1">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    AI Career Tools
                  </p>
                  {careerTools.map(tool => (
                    <Link
                      key={tool.href}
                      to={tool.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        isActive(tool.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <tool.icon className="w-4 h-4 shrink-0" />
                      {tool.label}
                    </Link>
                  ))}
                </div>

                <Link
                  to="/jobseeker/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                >
                  <User className="w-4 h-4 shrink-0" />
                  My Profile
                </Link>
              </nav>

              {/* Logout */}
              <div className="px-3 py-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer so content clears the fixed nav */}
      <div className="h-14" />
    </>
  );
};