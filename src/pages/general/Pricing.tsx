import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Sparkles,
  Building2,
  Crown,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

const plans = {
  jobseekers: [
    {
      name: "Free",
      price: "0",
      description: "Perfect for getting started",
      icon: Sparkles,
      popular: false,
      features: [
        { name: "AI Career Coach (5 queries/month)", included: true },
        { name: "Basic Resume Builder", included: true },
        { name: "Job Search & Apply", included: true },
        { name: "Email Notifications", included: true },
        { name: "Advanced Resume Templates", included: false },
        { name: "Mock Interviews", included: false },
        { name: "Skill Assessments", included: false },
        { name: "Priority Support", included: false },
      ],
    },
    {
      name: "Pro",
      price: "19",
      description: "For serious job seekers",
      icon: Crown,
      popular: true,
      features: [
        { name: "Unlimited AI Career Coach", included: true },
        { name: "Premium Resume Templates", included: true },
        { name: "Job Search & Apply", included: true },
        { name: "Email & SMS Notifications", included: true },
        { name: "AI Mock Interviews", included: true },
        { name: "Skill Assessments", included: true },
        { name: "Application Tracking", included: true },
        { name: "Priority Support", included: true },
      ],
    },
  ],
  employers: [
    {
      name: "Starter",
      price: "99",
      description: "For small teams",
      icon: Building2,
      popular: false,
      features: [
        { name: "5 Job Postings/month", included: true },
        { name: "Basic Candidate Search", included: true },
        { name: "Email Applications", included: true },
        { name: "Standard Support", included: true },
        { name: "AI Candidate Matching", included: false },
        { name: "Bulk Job Posting", included: false },
        { name: "Analytics Dashboard", included: false },
        { name: "API Access", included: false },
      ],
    },
    {
      name: "Business",
      price: "299",
      description: "For growing companies",
      icon: Crown,
      popular: true,
      features: [
        { name: "Unlimited Job Postings", included: true },
        { name: "Advanced Candidate Search", included: true },
        { name: "AI Candidate Matching", included: true },
        { name: "Priority Listing", included: true },
        { name: "Bulk Job Posting", included: true },
        { name: "Analytics Dashboard", included: true },
        { name: "API Access", included: true },
        { name: "Dedicated Account Manager", included: true },
      ],
    },
  ],
};

const Pricing = () => {
  const [activeTab, setActiveTab] = useState<"jobseekers" | "employers">("jobseekers");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              Choose the plan that's right for you. All plans include our core features with no hidden fees.
            </p>

            {/* Tab Switcher */}
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
                    ? "bg-gradient-hero text-primary-foreground shadow-xl scale-[1.02]"
                    : "bg-card border border-border shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.popular ? "bg-primary-foreground/20" : "bg-primary/10"
                    }`}
                  >
                    <plan.icon
                      className={`w-6 h-6 ${
                        plan.popular ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                    <p
                      className={`text-sm ${
                        plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="font-display text-4xl font-bold">${plan.price}</span>
                  <span
                    className={`${
                      plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    /month
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check
                          className={`w-5 h-5 ${
                            plan.popular ? "text-primary-foreground" : "text-primary"
                          }`}
                        />
                      ) : (
                        <X
                          className={`w-5 h-5 ${
                            plan.popular ? "text-primary-foreground/40" : "text-muted-foreground/40"
                          }`}
                        />
                      )}
                      <span
                        className={`text-sm ${
                          !feature.included
                            ? plan.popular
                              ? "text-primary-foreground/50"
                              : "text-muted-foreground/50"
                            : ""
                        }`}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "accent" : "outline"}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link to="/register">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-muted-foreground mb-8">
              For large organizations with unique requirements, we offer custom enterprise plans with dedicated support, SLA guarantees, and custom integrations.
            </p>
            <Button variant="default" size="lg" asChild>
              <Link to="/contact">
                Contact Sales <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Pricing FAQs
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-4">
            {[
              {
                q: "Can I switch plans anytime?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "Yes, all paid plans come with a 14-day free trial. No credit card required.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and bank transfers for enterprise plans.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="feature-card"
              >
                <h4 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  {faq.q}
                </h4>
                <p className="text-muted-foreground text-sm pl-7">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
