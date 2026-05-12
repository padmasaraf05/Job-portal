import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Briefcase, Brain, Users, TrendingUp, FileText,
  Target, ArrowRight, Sparkles, Building2,
  GraduationCap, Star,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Career Coach",
    description: "Get personalised career guidance powered by advanced AI that understands your unique skills and goals.",
  },
  {
    icon: FileText,
    title: "Smart Resume Analysis",
    description: "Get ATS-optimised resume feedback with AI suggestions tailored for your target roles.",
  },
  {
    icon: Target,
    title: "Job Matching",
    description: "Our algorithm matches you with jobs that fit your profile, increasing your interview chances.",
  },
  {
    icon: TrendingUp,
    title: "Skill Assessment",
    description: "Identify skill gaps and get curated learning paths to boost your employability.",
  },
  {
    icon: Users,
    title: "Employer Network",
    description: "Connect directly with verified employers actively looking for fresh talent.",
  },
  {
    icon: Sparkles,
    title: "Interview Prep",
    description: "Practice with AI-powered mock interviews with voice interaction and instant feedback.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Developer at TechCorp",
    content: "CareerLaunch Pro helped me land my dream job just 2 weeks after graduation. The AI coach was incredibly helpful!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Data Analyst at DataFlow",
    content: "The resume builder and interview prep features gave me the confidence I needed. Highly recommend for freshers!",
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    role: "Marketing Associate at BrandHub",
    content: "As someone new to the job market, the personalised guidance made all the difference. Great platform!",
    rating: 5,
  },
];

const Landing = () => {
  const [stats, setStats] = useState([
    { value: "—", label: "Jobs Posted" },
    { value: "—", label: "Job Seekers" },
    { value: "—", label: "Companies" },
    { value: "—", label: "Applications" },
  ]);

  const [successStories, setSuccessStories] = useState<{name: string; role: string; company: string; initial: string}[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [jobsRes, usersRes, employersRes, appsRes] = await Promise.all([
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "jobseeker"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "employer"),
        supabase.from("applications").select("*", { count: "exact", head: true }),
      ]);

      setStats([
        { value: jobsRes.count ? `${jobsRes.count}+` : "0", label: "Jobs Posted" },
        { value: usersRes.count ? `${usersRes.count}+` : "0", label: "Job Seekers" },
        { value: employersRes.count ? `${employersRes.count}+` : "0", label: "Companies" },
        { value: appsRes.count ? `${appsRes.count}+` : "0", label: "Applications" },
      ]);
    };

    const fetchSuccessStories = async () => {
      // Fetch shortlisted/accepted applications with job+profile info
      const { data } = await supabase
        .from("applications")
        .select(`
          status,
          jobs ( title, company ),
          profiles!applications_jobseeker_id_fkey ( full_name )
        `)
        .in("status", ["shortlisted", "accepted", "interview"])
        .limit(3);

      if (data && data.length > 0) {
        setSuccessStories(data.map((app: any) => ({
          name: app.profiles?.full_name || "Anonymous",
          role: app.jobs?.title || "Job Seeker",
          company: app.jobs?.company || "Top Company",
          initial: (app.profiles?.full_name || "A").charAt(0).toUpperCase(),
        })));
      }
    };

    fetchStats();
    fetchSuccessStories();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Career Platform for Freshers
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Launch Your Career with{" "}
              <span className="text-primary">AI-Powered Guidance</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Connect with top employers, get personalised career coaching, and access tools designed
              specifically for fresh graduates entering the job market.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" asChild className="bg-gradient-primary text-primary-foreground h-12 px-8">
                <Link to="/auth/register">
                  Start Your Journey <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-12 px-8">
                <Link to="/jobseeker/jobs">Browse Jobs</Link>
              </Button>
            </motion.div>

            {/* Real Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section className="py-0 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Everyone in the Hiring Ecosystem
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're a fresh graduate or a growing company, we've got you covered.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-card border border-border shadow-lg text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">For Freshers & Job Seekers</h3>
              <p className="text-muted-foreground mb-6">
                Get AI-powered career guidance, analyse your resume, practice interviews, and connect with top employers.
              </p>
              <Button asChild className="bg-gradient-primary text-primary-foreground">
                <Link to="/auth/register">Find Jobs</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-card border border-border shadow-lg text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">For Employers</h3>
              <p className="text-muted-foreground mb-6">
                Access a pool of talented freshers, post jobs easily, and find candidates that match your requirements.
              </p>
              <Button variant="outline" asChild>
                <Link to="/auth/register">Post Jobs</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools and AI-driven insights to accelerate your career journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-2 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of freshers who've launched successful careers with our platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.length > 0 ? successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">
                  "I got shortlisted for <strong>{story.role}</strong> at <strong>{story.company}</strong> through CareerLaunch Pro!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {story.initial}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{story.name}</div>
                    <div className="text-sm text-muted-foreground">{story.role} candidate</div>
                  </div>
                </div>
              </motion.div>
            )) : testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{t.content}"</p>
                <div>
                  <div className="font-semibold text-foreground">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
                Ready to Launch Your Career?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of freshers who've already taken the first step towards their dream career.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 h-12 px-8">
                  <Link to="/auth/register">
                    Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white/10 h-12 px-8">
                  <Link to="/contact">Talk to Us</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;