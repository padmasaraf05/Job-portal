import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Plus,
  X,
  CheckCircle2,
  FileText,
  Building2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const skillSuggestions = [
  "React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "Kubernetes",
  "GraphQL", "PostgreSQL", "MongoDB", "Git", "Agile", "Scrum", "CI/CD",
  "Machine Learning", "Data Analysis", "UI/UX Design", "Figma", "REST APIs",
];

const benefitOptions = [
  "Health Insurance", "PF / Gratuity", "Remote Work", "Flexible Hours",
  "Unlimited PTO", "Stock Options", "Learning Budget", "Gym Membership",
  "Parental Leave", "Home Office Stipend",
];

const PostJob = () => {
  const navigate = useNavigate();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cleanly separated fields — no more dual-use of workType
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    department: "",
    location: "",
    // jobType = Full-time / Internship / Contract etc.
    jobType: "",
    // workMode = Remote / Onsite / Hybrid
    workMode: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
  });

  const handleAddSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefit) ? prev.filter((b) => b !== benefit) : [...prev, benefit]
    );
  };

  // Shared insert builder — used by both Publish and Save as Draft
  const buildJobPayload = (status: "active" | "draft") => ({
    title: formData.title,
    company: formData.company,
    department: formData.department,
    location: formData.location,
    // 'type' column in DB stores Full-time / Internship etc.
    type: formData.jobType,
    // 'work_type' column stores Remote / Onsite / Hybrid
    work_type: formData.workMode,
    experience_level: formData.experienceLevel,
    salary_min: formData.salaryMin ? Number(formData.salaryMin) : null,
    salary_max: formData.salaryMax ? Number(formData.salaryMax) : null,
    description: formData.description,
    requirements: formData.requirements,
    skills: selectedSkills,
    benefits: selectedBenefits,
    // status 'active' makes the job visible in job search immediately
    // status 'draft' hides it until published
    status,
  });

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();

    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in Job Title, Company, Location, and Description.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please login again.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    const status = asDraft ? "draft" : "active";
    const payload = { ...buildJobPayload(status), employer_id: user.id };

    const { error } = await supabase.from("jobs").insert(payload);

    if (error) {
      console.error(error);
      toast({
        title: "Error posting job",
        description: error.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: asDraft ? "Draft saved!" : "Job posted successfully!",
      description: asDraft
        ? "Your job has been saved as a draft."
        : "Your job listing is now live and visible to candidates.",
    });

    navigate("/employer/manage-jobs");
  };

  const fadeUpItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary-foreground/10">
                <Briefcase className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">Post a New Job</h1>
            </div>
            <p className="text-primary-foreground/80">
              Create a compelling job listing to attract top talent.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="container py-8">
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Main Form ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Basic Information */}
              <motion.div variants={fadeUpItem} initial="hidden" animate="show">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>Tell candidates about the role</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Junior React Developer"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name *</Label>
                        <Input
                          id="company"
                          placeholder="e.g., Infosys"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="location"
                            className="pl-10"
                            placeholder="e.g., Bangalore, India"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          onValueChange={(value) =>
                            setFormData({ ...formData, department: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Product">Product</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Job Type — Full-time / Internship / Contract */}
                      <div className="space-y-2">
                        <Label>Job Type *</Label>
                        <Select
                          value={formData.jobType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, jobType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Full-time, Internship…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Work Mode — Remote / Onsite / Hybrid */}
                      <div className="space-y-2">
                        <Label>Work Mode</Label>
                        <Select
                          value={formData.workMode}
                          onValueChange={(value) =>
                            setFormData({ ...formData, workMode: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Remote, Onsite, Hybrid" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Onsite">Onsite</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <Select
                          onValueChange={(value) =>
                            setFormData({ ...formData, experienceLevel: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fresher">Fresher (0 years)</SelectItem>
                            <SelectItem value="Junior">Junior (0–2 years)</SelectItem>
                            <SelectItem value="Mid-level">Mid-level (2–5 years)</SelectItem>
                            <SelectItem value="Senior">Senior (5–8 years)</SelectItem>
                            <SelectItem value="Lead">Lead (8+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Salary range — stored in paise/rupees as integers */}
                      <div className="space-y-2">
                        <Label>Salary Range (Annual, ₹ LPA)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Min (e.g. 400000)"
                            type="number"
                            value={formData.salaryMin}
                            onChange={(e) =>
                              setFormData({ ...formData, salaryMin: e.target.value })
                            }
                          />
                          <span className="text-muted-foreground shrink-0">—</span>
                          <Input
                            placeholder="Max (e.g. 800000)"
                            type="number"
                            value={formData.salaryMax}
                            onChange={(e) =>
                              setFormData({ ...formData, salaryMax: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>

              {/* Job Description */}
              <motion.div
                variants={fadeUpItem}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                    <CardDescription>
                      Describe the role and what the candidate will be doing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the role, team, and what makes this opportunity exciting..."
                        className="min-h-[150px]"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requirements">Requirements</Label>
                      <Textarea
                        id="requirements"
                        placeholder="List the key requirements and qualifications..."
                        className="min-h-[120px]"
                        value={formData.requirements}
                        onChange={(e) =>
                          setFormData({ ...formData, requirements: e.target.value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Skills */}
              <motion.div
                variants={fadeUpItem}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Required Skills</CardTitle>
                    <CardDescription>
                      Add skills that candidates should have
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
                        {selectedSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a custom skill..."
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomSkill();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddCustomSkill}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Popular skills
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {skillSuggestions
                          .filter((s) => !selectedSkills.includes(s))
                          .slice(0, 12)
                          .map((skill) => (
                            <Button
                              key={skill}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleAddSkill(skill)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {skill}
                            </Button>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-6">
              {/* Benefits */}
              <motion.div
                variants={fadeUpItem}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Benefits & Perks</CardTitle>
                    <CardDescription>What you offer to employees</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {benefitOptions.map((benefit) => (
                        <button
                          key={benefit}
                          type="button"
                          onClick={() => toggleBenefit(benefit)}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                            selectedBenefits.includes(benefit)
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted/30"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              selectedBenefits.includes(benefit)
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30"
                            }`}
                          >
                            {selectedBenefits.includes(benefit) && (
                              <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{benefit}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Preview + Submit */}
              <motion.div
                variants={fadeUpItem}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-lg sticky top-8">
                  <CardHeader>
                    <CardTitle>Job Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-1">
                        {formData.title || "Job Title"}
                      </h3>
                      {formData.company && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {formData.company}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {formData.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {formData.location}
                          </span>
                        )}
                        {formData.jobType && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {formData.jobType}
                          </span>
                        )}
                        {formData.workMode && (
                          <span className="flex items-center gap-1">
                            {formData.workMode}
                          </span>
                        )}
                      </div>
                      {(formData.salaryMin || formData.salaryMax) && (
                        <p className="text-sm text-success mt-2 font-medium">
                          ₹
                          {formData.salaryMin
                            ? (Number(formData.salaryMin) / 100000).toFixed(1)
                            : "0"}
                          L –{" "}
                          {formData.salaryMax
                            ? (Number(formData.salaryMax) / 100000).toFixed(1)
                            : "0"}
                          L per year
                        </p>
                      )}
                      {selectedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {selectedSkills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary"
                            >
                              {s}
                            </span>
                          ))}
                          {selectedSkills.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{selectedSkills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary text-primary-foreground"
                      size="lg"
                      disabled={submitting}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {submitting ? "Publishing…" : "Publish Job"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={submitting}
                      onClick={(e) => handleSubmit(e as any, true)}
                    >
                      Save as Draft
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PostJob;