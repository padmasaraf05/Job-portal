import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Target, Heart, Lightbulb, Users,
  Award, Globe, ArrowRight, Brain,
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We are committed to democratising career opportunities for every fresh graduate in India.",
  },
  {
    icon: Heart,
    title: "User-Centric",
    description: "Every feature we build starts with understanding our users' needs and real challenges.",
  },
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "We leverage cutting-edge AI to provide personalised career guidance at scale.",
  },
  {
    icon: Users,
    title: "Community Focused",
    description: "Building a supportive ecosystem where freshers and employers thrive together.",
  },
];

const milestones = [
  { year: "2024 Q1", title: "Founded",           description: "Started with a vision to help freshers land their first job" },
  { year: "2024 Q2", title: "Platform Launch",   description: "Launched job portal with AI career guidance features" },
  { year: "2024 Q3", title: "AI Coach",          description: "Introduced mock interviews, resume analysis, and career roadmap" },
  { year: "2025",    title: "Growing Strong",    description: "Hundreds of job seekers and employers joining every month" },
];

const team = [
  { name: "Padmasaraf",   role: "Founder & CEO",      initial: "P" },
  { name: "AI Engine",    role: "Powered by Groq AI",  initial: "AI" },
  { name: "You",          role: "Our Community",        initial: "👤" },
];

const About = () => {
  const [stats, setStats] = useState({ jobs: 0, seekers: 0, employers: 0, applications: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [j, s, e, a] = await Promise.all([
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "jobseeker"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "employer"),
        supabase.from("applications").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        jobs:         j.count || 0,
        seekers:      s.count || 0,
        employers:    e.count || 0,
        applications: a.count || 0,
      });
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="pt-12 pb-16 lg:pt-16 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-primary font-semibold mb-4"
            >
              About CareerLaunch Pro
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Empowering the Next Generation of{" "}
              <span className="text-primary">Professionals</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8"
            >
              We're on a mission to bridge the gap between education and employment — helping fresh graduates launch successful careers through AI-powered guidance and meaningful connections with real employers.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Our Story + Real Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  CareerLaunch Pro was born from a simple but painful observation: the Indian job market is incredibly tough for fresh graduates. Despite having talent and potential, many struggle to get their foot in the door — not because they lack skills, but because they lack direction, preparation, and access.
                </p>
                <p>
                  We built this platform to change that. By combining powerful AI with a real job portal, we give freshers the tools they need — resume analysis, mock interviews with voice AI, personalised career roadmaps, and direct connections with employers who are actively hiring.
                </p>
                <p>
                  Every number below is real — pulled live from our platform right now.
                </p>
              </div>

              {/* Real live stats */}
              <div className="mt-8 grid grid-cols-2 gap-6">
                {[
                  { value: stats.jobs,         label: "Active Jobs" },
                  { value: stats.seekers,      label: "Job Seekers" },
                  { value: stats.employers,    label: "Employers" },
                  { value: stats.applications, label: "Applications" },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-card border border-border">
                    <div className="font-display text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <Brain className="w-24 h-24 text-primary mx-auto mb-6 animate-pulse" />
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">AI-Powered</h3>
                  <p className="text-muted-foreground">Groq AI · Llama 3.3 · Real-time feedback</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">The principles that guide everything we build.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Our Journey</h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border" />
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                    <div className="p-4 rounded-xl bg-card border border-border inline-block text-left">
                      <div className="text-primary font-bold text-lg mb-1">{milestone.year}</div>
                      <h4 className="font-semibold text-foreground mb-1">{milestone.title}</h4>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Behind the Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A small but passionate team with a big mission.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">{member.initial}</span>
                </div>
                <h4 className="font-semibold text-foreground">{member.name}</h4>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join Us in Our Mission
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Whether you're a fresher looking for opportunities or a company seeking fresh talent, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-primary text-primary-foreground h-12 px-8">
                <Link to="/auth/register">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-12 px-8">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;