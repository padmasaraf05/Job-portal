import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase, Mail, Lock, Eye, EyeOff, ArrowRight,
  User, Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

type Role = "jobseeker" | "employer";

const Login = () => {
  const { toast }  = useToast();
  const navigate   = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]       = useState<Role>("jobseeker"); // UI only, doesn't affect redirect
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // ── Role resolution: DB profiles table is source of truth ──
    // user_metadata may be stale or missing role for admin accounts
    let userRole = data.user?.user_metadata?.role as string | undefined;

    if (!userRole || userRole === "jobseeker") {
      // Always verify from DB — catches admin accounts and role changes
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role) {
        userRole = profile.role;
      }
    }

    if (!userRole) {
      toast({
        title: "Role not found",
        description: "Your account has no role assigned. Contact support.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({ title: "Login successful!" });

    if (userRole === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else if (userRole === "employer") {
      navigate("/employer/dashboard", { replace: true });
    } else {
      navigate("/jobseeker/dashboard", { replace: true });
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              CareerLaunch<span className="text-primary"></span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to continue your career journey
          </p>

          {/* Role Selector — visual hint only, redirect is based on DB role */}
          <div className="mb-8">
            <p className="text-sm font-medium text-foreground mb-3">I am a:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("jobseeker")}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  role === "jobseeker"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <User className={`w-6 h-6 ${role === "jobseeker" ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${role === "jobseeker" ? "text-primary" : "text-muted-foreground"}`}>
                  Job Seeker
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("employer")}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  role === "employer"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Building2 className={`w-6 h-6 ${role === "employer" ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${role === "employer" ? "text-primary" : "text-muted-foreground"}`}>
                  Employer
                </span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Admin accounts are redirected automatically
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : (
                <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center text-primary-foreground"
        >
          <div className="w-24 h-24 rounded-3xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-8 animate-float">
            <Briefcase className="w-12 h-12" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">Your Career Awaits</h2>
          <p className="text-primary-foreground/80 max-w-md">
            Access AI-powered career guidance, job matching, and professional development tools all in one place.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;