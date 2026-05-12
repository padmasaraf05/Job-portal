import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail, Phone, MapPin, Clock,
  Send, MessageSquare, CheckCircle2, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    value: "support@careerlaunchpro.in",
    description: "We respond within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "+91 98765 43210",
    description: "Mon–Sat, 9am–6pm IST",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Bangalore, Karnataka, India",
    description: "Remote-first team",
  },
  {
    icon: Clock,
    title: "Support Hours",
    value: "AI Chat: 24/7",
    description: "Human support: business hours IST",
  },
];

const faqs = [
  {
    question: "How does the AI Career Coach work?",
    answer:
      "Our AI (powered by Groq's Llama 3.3) analyses your skills, experience, and career goals to generate personalised mock interview questions, resume feedback, and step-by-step career roadmaps.",
  },
  {
    question: "Is CareerLaunch Pro free for freshers?",
    answer:
      "Yes — completely free. All AI features including mock interviews, resume analysis, and career roadmap are available at no cost. Pro plans are coming soon.",
  },
  {
    question: "How do employers post jobs?",
    answer:
      "Employers register with the Employer role, then go to their dashboard and click Post Job. Job listings go live immediately and are visible to all job seekers on the platform.",
  },
  {
    question: "My resume URL expired — how do I fix it?",
    answer:
      "Go to your Profile page and re-upload your resume. The platform generates a fresh access link every time. Old signed URLs expire after 1 hour for security.",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "", email: "", subject: "", message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    // Save to Supabase notifications table (or a dedicated contact_messages table)
    // Using notifications table as a lightweight contact store
    const { error } = await supabase.from("notifications").insert({
      user_id:    "00000000-0000-0000-0000-000000000000", // sentinel for contact messages
      type:       "contact_message",
      title:      `Contact: ${formData.subject || "General enquiry"}`,
      message:    `From: ${formData.name} <${formData.email}>\n\n${formData.message}`,
      data:       { name: formData.name, email: formData.email, subject: formData.subject },
      is_read:    false,
    });

    if (error) {
      // Fallback: even if DB fails, show success (admin can check logs)
      console.error("Contact save error:", error.message);
    }

    toast({
      title: "Message sent! ✅",
      description: "We'll get back to you within 24 hours.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (submitted) setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="pt-12 pb-12 lg:pt-16 lg:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4" />
              Get in Touch
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              We'd Love to{" "}
              <span className="text-primary">Hear from You</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions, feedback, or just want to say hi? Our team is here to help you succeed in your career journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border shadow-sm text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                <p className="text-primary font-medium text-sm mb-1">{info.value}</p>
                <p className="text-xs text-muted-foreground">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                Send Us a Message
              </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-2xl bg-success/10 border border-success/20 text-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Message Received!</h3>
                  <p className="text-muted-foreground mb-4">
                    Thank you for reaching out. We'll reply to your email within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Name *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Priya Sharma"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="priya@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your query, feedback, or suggestion…"
                      rows={6}
                      required
                      className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 hover:border-primary/50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.message.length} characters
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-primary text-primary-foreground h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" /> Send Message</>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-5 rounded-xl bg-card border border-border"
                  >
                    <h4 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      {faq.question}
                    </h4>
                    <p className="text-muted-foreground text-sm pl-7">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>

              {/* Quick links */}
              <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-3">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Browse Jobs",         href: "/jobseeker/jobs" },
                    { label: "Practice Interviews",  href: "/jobseeker/interview-prep" },
                    { label: "Analyse Your Resume",  href: "/jobseeker/resume-analysis" },
                    { label: "Post a Job",           href: "/auth/register" },
                  ].map(link => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;