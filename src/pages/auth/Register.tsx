import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase, Mail, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, User, Building2, Phone, CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type Role = "jobseeker" | "employer";

const steps = [
  { id: 1, title: "Choose Role" },
  { id: 2, title: "Basic Info" },
  { id: 3, title: "Security" },
];

// ── Validation helpers ────────────────────────────────────────
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone: string) =>
  /^[+]?[\d\s\-()]{7,15}$/.test(phone);

const isValidName = (name: string) => name.trim().length >= 2;

const Register = () => {
  const { toast }  = useToast();
  const navigate   = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]       = useState<Role>("jobseeker");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    password: "",
    confirmPassword: "",
  });

  // ── Password strength ─────────────────────────────────────
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels   = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors   = [
    "bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-success", "bg-green-500",
  ];

  // ── Step validation ───────────────────────────────────────
  const validateStep2 = (): string | null => {
    if (!isValidName(formData.fullName))
      return "Full name must be at least 2 characters.";
    if (!isValidEmail(formData.email))
      return "Please enter a valid email address.";
    if (!isValidPhone(formData.phone))
      return "Please enter a valid phone number.";
    if (role === "employer" && formData.companyName.trim().length < 2)
      return "Company name must be at least 2 characters.";
    return null;
  };

  const validateStep3 = (): string | null => {
    if (formData.password.length < 8)
      return "Password must be at least 8 characters.";
    if (passwordStrength < 2)
      return "Password is too weak. Add uppercase letters, numbers, or symbols.";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match.";
    return null;
  };

  const handleNext = () => {
    if (currentStep === 2) {
      const error = validateStep2();
      if (error) {
        toast({ title: "Please fix the following", description: error, variant: "destructive" });
        return;
      }
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateStep3();
    if (error) {
      toast({ title: "Please fix the following", description: error, variant: "destructive" });
      return;
    }

    setIsLoading(true);

    // 1. Create Supabase auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      options: {
        data: {
          role,
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          company_name: formData.companyName.trim(),
        },
      },
    });

    if (signUpError) {
      toast({
        title: "Registration failed",
        description: signUpError.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      toast({
        title: "Registration failed",
        description: "No user was created. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // 2. Create profile row (upsert in case trigger already created one)
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      role,
      full_name: formData.fullName.trim(),
      phone: formData.phone.trim(),
      company_name: role === "employer" ? formData.companyName.trim() : null,
    });

    if (profileError) {
      console.warn("Profile creation warning:", profileError.message);
      // Non-fatal — profile may already exist via DB trigger
    }

    toast({
      title: "Account created!",
      description: `Welcome to CareerLaunch Pro, ${formData.fullName.split(" ")[0]}!`,
    });

    // 3. Redirect to the correct dashboard
    if (role === "employer") {
      navigate("/employer/dashboard", { replace: true });
    } else {
      navigate("/jobseeker/dashboard", { replace: true });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
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
          <h2 className="font-display text-3xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-primary-foreground/80 max-w-md">
            Join thousands of professionals who've accelerated their careers with our AI-powered platform.
          </p>
          <div className="mt-12 space-y-4 text-left">
            {["AI-powered career coaching", "Smart job matching", "Professional resume builder"].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-primary-foreground/90">
                <CheckCircle2 className="w-5 h-5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              CareerLaunch<span className="text-primary"></span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-8">Join us and launch your career to new heights</p>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
                    currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-200 ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <p className="text-sm font-medium text-foreground mb-3">Select your role:</p>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setRole("jobseeker")}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left ${
                      role === "jobseeker" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${role === "jobseeker" ? "bg-primary/10" : "bg-muted"}`}>
                      <User className={`w-7 h-7 ${role === "jobseeker" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${role === "jobseeker" ? "text-primary" : "text-foreground"}`}>Job Seeker</h4>
                      <p className="text-sm text-muted-foreground">Find jobs and grow your career</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("employer")}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left ${
                      role === "employer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${role === "employer" ? "bg-primary/10" : "bg-muted"}`}>
                      <Building2 className={`w-7 h-7 ${role === "employer" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${role === "employer" ? "text-primary" : "text-foreground"}`}>Employer</h4>
                      <p className="text-sm text-muted-foreground">Post jobs and find talent</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Basic Info */}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="pl-12"
                    />
                  </div>
                  {formData.fullName && !isValidName(formData.fullName) && (
                    <p className="text-xs text-destructive mt-1">Name must be at least 2 characters</p>
                  )}
                </div>

                {role === "employer" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Your Company Inc."
                        className="pl-12"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="pl-12"
                    />
                  </div>
                  {formData.email && !isValidEmail(formData.email) && (
                    <p className="text-xs text-destructive mt-1">Please enter a valid email address</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="pl-12"
                    />
                  </div>
                  {formData.phone && !isValidPhone(formData.phone) && (
                    <p className="text-xs text-destructive mt-1">Please enter a valid phone number</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Security */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password (min. 8 chars)"
                      className="pl-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
                              level <= passwordStrength ? strengthColors[passwordStrength - 1] : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Strength:{" "}
                        <span className={passwordStrength >= 3 ? "text-success" : "text-warning"}>
                          {strengthLabels[passwordStrength - 1] || "Very Weak"}
                        </span>
                        {formData.password.length < 8 && (
                          <span className="text-destructive ml-2">· Minimum 8 characters required</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="pl-12"
                    />
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                    <p className="text-xs text-success mt-1">✓ Passwords match</p>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <input
                    type="checkbox"
                    required
                    id="terms"
                    className="mt-1 w-4 h-4 rounded border-input"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    I agree to the{" "}
                    <Link to="/about" className="text-primary hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/about" className="text-primary hover:underline">Privacy Policy</Link>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <Button type="button" variant="outline" size="lg" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button type="button" variant="hero" size="lg" className="flex-1" onClick={handleNext}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creating Account…" : <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              )}
            </div>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;