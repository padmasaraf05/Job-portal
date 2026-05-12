import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Check, X, Sparkles, Building2, Crown,
  ArrowRight, HelpCircle, Zap,
} from "lucide-react";

const plans = {
  jobseekers: [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Everything a fresher needs to get started",
      icon: Sparkles,
      popular: false,
      badge: null,
      features: [
        { name: "Unlimited job search & apply",      included: true },
        { name: "AI Resume Analysis",                included: true },
        { name: "AI Mock Interview (5/month)",        included: true },
        { name: "AI Career Roadmap",                  included: true },
        { name: "Application tracking",              included: true },
        { name: "Save jobs",                         included: true },
        { name: "Skill assessment",                  included: true },
        { name: "Priority support",                  included: false },
      ],
    },
    {
      name: "Pro",
      price: "199",
      period: "month",
      description: "For serious job seekers who want an edge",
      icon: Crown,
      popular: true,
      badge: "Coming Soon",
      features: [
        { name: "Everything in Free",                included: true },
        { name: "Unlimited AI Mock Interviews",       included: true },
        { name: "Advanced resume templates",          included: true },
        { name: "Priority job recommendations",       included: true },
        { name: "LinkedIn profile review",            included: true },
        { name: "1-on-1 career coaching session",     included: true },
        { name: "Featured applicant badge",           included: true },
        { name: "Priority support (24h response)",    included: true },
      ],
    },
  ],
  employers: [
    {
      name: "Starter",
      price: "999",
      period: "month",
      description: "For startups and small teams",
      icon: Building2,
      popular: false,
      badge: null,
      features: [
        { name: "5 active job postings",             included: true },
        { name: "View all applications",             included: true },
        { name: "Application status management",     included: true },
        { name: "Candidate profile access",          included: true },
        { name: "Basic analytics",                   included: true },
        { name: "AI candidate matching",             included: false },
        { name: "Bulk job posting",                  included: false },
        { name: "Dedicated account manager",         included: false },
      ],
    },
    {
      name: "Business",
      price: "2,999",
      period: "month",
      description: "For growing companies hiring at scale",
      icon: Crown,
      popular: true,
      badge: "Coming Soon",
      features: [
        { name: "Unlimited job postings",            included: true },
        { name: "AI candidate matching & scoring",   included: true },
        { name: "Priority listing in search",        included: true },
        { name: "Advanced analytics dashboard",      included: true },
        { name: "Bulk job posting via CSV",          included: true },
        { name: "API access",                        included: true },
        { name: "Company branding on listings",      included: true },
        { name: "Dedicated account manager",         included: true },
      ],
    },
  ],
};

const Pricing = () => {
  const [activeTab, setActiveTab] = useState<"jobseekers" | "employers">("jobseekers");

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="pt-12 pb-12 lg:pt-16 lg:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Currently 100% Free — No credit card required
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Simple, Transparent{" "}
              <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              All core features are free for job seekers. Pro and Business plans are coming soon.
              Start for free today.
            </p>

            <div className="inline-flex p-1 bg-muted rounded-xl">
              <button
                onClick={() => setActiveTab("jobseekers")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "jobseekers"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                For Job Seekers
              </button>
              <button
                onClick={() => setActiveTab("employers")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "employers"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                For Employers
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans[activeTab].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl scale-[1.02]"
                    : "bg-card border border-border shadow-lg"
                }`}
              >
                {/* Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                      {plan.badge || "Most Popular"}
                    </span>
                  </div>
                )}
                {plan.badge && !plan.popular && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium border border-border">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.popular ? "bg-primary-foreground/20" : "bg-primary/10"
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                    <p className={`text-sm ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="mb-6 flex items-end gap-1">
                  {plan.price === "0" ? (
                    <span className="font-display text-4xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className={`text-lg font-semibold ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>₹</span>
                      <span className="font-display text-4xl font-bold">{plan.price}</span>
                      <span className={`mb-1 ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>/{plan.period}</span>
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className={`w-5 h-5 shrink-0 ${plan.popular ? "text-primary-foreground" : "text-success"}`} />
                      ) : (
                        <X className={`w-5 h-5 shrink-0 ${plan.popular ? "text-primary-foreground/40" : "text-muted-foreground/40"}`} />
                      )}
                      <span className={`text-sm ${
                        !feature.included
                          ? plan.popular ? "text-primary-foreground/50" : "text-muted-foreground/50"
                          : plan.popular ? "text-primary-foreground" : "text-foreground"
                      }`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full ${
                    plan.popular
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-gradient-primary text-primary-foreground"
                  }`}
                  asChild
                >
                  <Link to="/auth/register">
                    {plan.price === "0" ? "Get Started Free" : "Join Waitlist"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Free note */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            🎉 All features marked as Free are available right now — no sign up fees, no hidden charges.
          </p>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Need a Custom Enterprise Solution?
            </h2>
            <p className="text-muted-foreground mb-8">
              For large organisations, recruitment agencies, or universities with unique requirements — we offer custom plans with bulk posting, API access, white-label options, and dedicated support.
            </p>
            <Button size="lg" asChild className="bg-gradient-primary text-primary-foreground h-12 px-8">
              <Link to="/contact">
                Contact Us <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Pricing FAQs</h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-4">
            {[
              {
                q: "Is it really free for job seekers?",
                a: "Yes — completely free. All AI features (resume analysis, mock interviews, career roadmap) are available without paying anything. Pro plan coming soon.",
              },
              {
                q: "When will Pro plans launch?",
                a: "We're working on Pro plans for job seekers and Business plans for employers. You can join the waitlist by clicking 'Join Waitlist' above.",
              },
              {
                q: "Are there any hidden charges?",
                a: "No. We will always notify you clearly before any charges. The current free tier will remain free even after Pro plans launch.",
              },
              {
                q: "How do employers post jobs currently?",
                a: "Employers can register, create a company profile, and post jobs immediately — completely free during our early access period.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="p-5 rounded-xl bg-card border border-border"
              >
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-muted-foreground text-sm pl-7">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;