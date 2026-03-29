import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Upload,
  Plus,
  Edit2,
  CheckCircle,
  Camera,
  Linkedin,
  Github,
  Save,
  X,
  FileText,
  Trash2,
  Globe,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  grade: string;
}

interface ExperienceEntry {
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  headline: string;
  location: string;
  avatar_url: string;
  resume_url: string;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
}

const EMPTY_PROFILE: ProfileData = {
  id: "",
  full_name: "",
  email: "",
  phone: "",
  bio: "",
  headline: "",
  location: "",
  avatar_url: "",
  resume_url: "",
  skills: [],
  education: [],
  experience: [],
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
};

// ─── Profile Completion Calculator ───────────────────────────────────────────
function getCompletionItems(p: ProfileData) {
  return [
    { label: "Basic Info",   completed: !!(p.full_name && p.phone) },
    { label: "Headline",     completed: !!p.headline },
    { label: "Bio",          completed: !!p.bio },
    { label: "Resume",       completed: !!p.resume_url },
    { label: "Avatar",       completed: !!p.avatar_url },
    { label: "Skills",       completed: p.skills.length > 0 },
    { label: "Education",    completed: p.education.length > 0 },
    { label: "Experience",   completed: p.experience.length > 0 },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────
const Profile = () => {
  const { toast } = useToast();

  const [profile, setProfile]           = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [editingInfo, setEditingInfo]   = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [resumeFileName, setResumeFileName]   = useState("");

  // Form state for inline edits
  const [infoForm, setInfoForm] = useState<Partial<ProfileData>>({});

  // Skill input
  const [newSkill, setNewSkill] = useState("");

  // Education / Experience modals
  const [addingEdu,  setAddingEdu]  = useState(false);
  const [addingExp,  setAddingExp]  = useState(false);
  const [eduForm,    setEduForm]    = useState<EducationEntry>({ degree: "", institution: "", year: "", grade: "" });
  const [expForm,    setExpForm]    = useState<ExperienceEntry>({ role: "", company: "", duration: "", description: "" });

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch profile on mount ─────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const merged: ProfileData = {
        ...EMPTY_PROFILE,
        id: user.id,
        email: user.email || "",
        ...(data || {}),
        skills:    Array.isArray(data?.skills)    ? data.skills    : [],
        education: Array.isArray(data?.education) ? data.education : [],
        experience:Array.isArray(data?.experience)? data.experience: [],
      };

      setProfile(merged);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // ── Save a partial update to Supabase ─────────────────────────
  const saveField = async (updates: Partial<ProfileData>) => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setProfile(prev => ({ ...prev, ...updates }));
      toast({ title: "Profile updated" });
    }
    setSaving(false);
  };

  // ── Basic info save ────────────────────────────────────────────
  const handleSaveInfo = async () => {
    await saveField(infoForm);
    setEditingInfo(false);
  };

  // ── Resume upload ──────────────────────────────────────────────
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF or Word document.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Resume must be under 5MB.", variant: "destructive" });
      return;
    }

    setResumeUploading(true);
    const path = `${profile.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setResumeUploading(false);
      return;
    }

    // Get a signed URL (valid 10 years for practical purposes)
    const { data: urlData } = await supabase.storage
      .from("resumes")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);

    const resumeUrl = urlData?.signedUrl || "";
    setResumeFileName(file.name);
    await saveField({ resume_url: resumeUrl });
    setResumeUploading(false);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  // ── Avatar upload ──────────────────────────────────────────────
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Avatar must be under 2MB.", variant: "destructive" });
      return;
    }

    setAvatarUploading(true);
    const path = `${profile.id}/avatar_${Date.now()}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setAvatarUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    await saveField({ avatar_url: urlData.publicUrl });
    setAvatarUploading(false);
    e.target.value = "";
  };

  // ── Skills ─────────────────────────────────────────────────────
  const addSkill = async () => {
    const skill = newSkill.trim();
    if (!skill || profile.skills.includes(skill)) return;
    const updated = [...profile.skills, skill];
    setNewSkill("");
    await saveField({ skills: updated });
  };

  const removeSkill = async (skill: string) => {
    const updated = profile.skills.filter(s => s !== skill);
    await saveField({ skills: updated });
  };

  // ── Education ──────────────────────────────────────────────────
  const addEducation = async () => {
    if (!eduForm.degree || !eduForm.institution) return;
    const updated = [...profile.education, eduForm];
    await saveField({ education: updated });
    setEduForm({ degree: "", institution: "", year: "", grade: "" });
    setAddingEdu(false);
  };

  const removeEducation = async (index: number) => {
    const updated = profile.education.filter((_, i) => i !== index);
    await saveField({ education: updated });
  };

  // ── Experience ─────────────────────────────────────────────────
  const addExperience = async () => {
    if (!expForm.role || !expForm.company) return;
    const updated = [...profile.experience, expForm];
    await saveField({ experience: updated });
    setExpForm({ role: "", company: "", duration: "", description: "" });
    setAddingExp(false);
  };

  const removeExperience = async (index: number) => {
    const updated = profile.experience.filter((_, i) => i !== index);
    await saveField({ experience: updated });
  };

  // ── Derived values ─────────────────────────────────────────────
  const completionItems = getCompletionItems(profile);
  const completedCount  = completionItems.filter(i => i.completed).length;
  const completionPct   = Math.round((completedCount / completionItems.length) * 100);

  const initials = profile.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading your profile…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left Column ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Profile Header Card */}
            <Card className="p-6 border-0 shadow-lg text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-hero opacity-10" />
              <div className="relative">

                {/* Avatar with upload */}
                <div className="relative inline-block mb-4">
                  <Avatar className="w-28 h-28 border-4 border-primary/20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {avatarUploading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Camera className="w-4 h-4" />}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                {/* Name & Headline */}
                {editingInfo ? (
                  <div className="space-y-3 text-left">
                    <div>
                      <Label className="text-xs">Full Name</Label>
                      <Input
                        value={infoForm.full_name ?? profile.full_name}
                        onChange={e => setInfoForm(f => ({ ...f, full_name: e.target.value }))}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Headline</Label>
                      <Input
                        value={infoForm.headline ?? profile.headline}
                        onChange={e => setInfoForm(f => ({ ...f, headline: e.target.value }))}
                        placeholder="e.g. Aspiring Software Developer"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <Input
                        value={infoForm.phone ?? profile.phone}
                        onChange={e => setInfoForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Location</Label>
                      <Input
                        value={infoForm.location ?? profile.location}
                        onChange={e => setInfoForm(f => ({ ...f, location: e.target.value }))}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Bio</Label>
                      <Textarea
                        value={infoForm.bio ?? profile.bio}
                        onChange={e => setInfoForm(f => ({ ...f, bio: e.target.value }))}
                        placeholder="Short introduction about yourself"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">LinkedIn URL</Label>
                      <Input
                        value={infoForm.linkedin_url ?? profile.linkedin_url}
                        onChange={e => setInfoForm(f => ({ ...f, linkedin_url: e.target.value }))}
                        placeholder="https://linkedin.com/in/you"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">GitHub URL</Label>
                      <Input
                        value={infoForm.github_url ?? profile.github_url}
                        onChange={e => setInfoForm(f => ({ ...f, github_url: e.target.value }))}
                        placeholder="https://github.com/you"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Portfolio URL</Label>
                      <Input
                        value={infoForm.portfolio_url ?? profile.portfolio_url}
                        onChange={e => setInfoForm(f => ({ ...f, portfolio_url: e.target.value }))}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-primary text-primary-foreground"
                        onClick={handleSaveInfo}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingInfo(false); setInfoForm({}); }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-foreground">
                      {profile.full_name || "Your Name"}
                    </h2>
                    <p className="text-muted-foreground mb-1">
                      {profile.headline || "Add a headline"}
                    </p>
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {profile.bio}
                      </p>
                    )}

                    {/* Social links */}
                    <div className="flex justify-center gap-3 mb-4">
                      {profile.linkedin_url ? (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="rounded-full">
                            <Linkedin className="w-4 h-4 mr-1" /> LinkedIn
                          </Button>
                        </a>
                      ) : null}
                      {profile.github_url ? (
                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="rounded-full">
                            <Github className="w-4 h-4 mr-1" /> GitHub
                          </Button>
                        </a>
                      ) : null}
                      {profile.portfolio_url ? (
                        <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="rounded-full">
                            <Globe className="w-4 h-4 mr-1" /> Portfolio
                          </Button>
                        </a>
                      ) : null}
                    </div>

                    {/* Contact details */}
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" /> {profile.email || "No email"}
                      </div>
                      {profile.phone && (
                        <div className="flex items-center justify-center gap-2">
                          <Phone className="w-4 h-4" /> {profile.phone}
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center justify-center gap-2">
                          <MapPin className="w-4 h-4" /> {profile.location}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setInfoForm({});
                        setEditingInfo(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Profile Completion */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4">Profile Strength</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-secondary" />
                    <circle
                      cx="40" cy="40" r="35"
                      stroke="currentColor" strokeWidth="6" fill="none"
                      strokeDasharray={`${completionPct * 2.2} 220`}
                      className="text-primary transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                    {completionPct}%
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to get 3x more visibility to recruiters
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {completionItems.map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`w-4 h-4 shrink-0 ${item.completed ? "text-success" : "text-muted-foreground/30"}`} />
                    <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Resume Upload */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4">Resume</h3>

              {/* Upload zone */}
              <div
                className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => resumeInputRef.current?.click()}
              >
                {resumeUploading ? (
                  <>
                    <Loader2 className="w-10 h-10 mx-auto text-primary mb-3 animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading…</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto text-primary mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      {profile.resume_url ? "Replace resume" : "Upload your resume"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOC up to 5MB</p>
                  </>
                )}
              </div>
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleResumeUpload}
              />

              {/* Current resume */}
              {profile.resume_url && (
                <div className="mt-4 p-3 rounded-lg bg-success/10 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {resumeFileName || "Resume uploaded"}
                    </p>
                    <p className="text-xs text-muted-foreground">Click above to replace</p>
                  </div>
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="sm">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              )}
            </Card>
          </motion.div>

          {/* ── Right Column ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Skills */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Skills
                </h3>
              </div>

              {/* Add skill input */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a skill (e.g. React, Python)"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={addSkill}
                  disabled={saving}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {profile.skills.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No skills added yet. Add your first skill above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <span
                      key={skill}
                      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Education */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" /> Education
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingEdu(!addingEdu)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              {/* Add education form */}
              {addingEdu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Degree / Course *</Label>
                      <Input
                        placeholder="B.Tech in Computer Science"
                        value={eduForm.degree}
                        onChange={e => setEduForm(f => ({ ...f, degree: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Institution *</Label>
                      <Input
                        placeholder="University / College name"
                        value={eduForm.institution}
                        onChange={e => setEduForm(f => ({ ...f, institution: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Year</Label>
                      <Input
                        placeholder="2020 - 2024"
                        value={eduForm.year}
                        onChange={e => setEduForm(f => ({ ...f, year: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Grade / CGPA</Label>
                      <Input
                        placeholder="8.5 CGPA / 85%"
                        value={eduForm.grade}
                        onChange={e => setEduForm(f => ({ ...f, grade: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-gradient-primary text-primary-foreground"
                      onClick={addEducation}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAddingEdu(false)}>
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {profile.education.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No education added yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shrink-0">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                          {edu.year && <span className="text-muted-foreground">{edu.year}</span>}
                          {edu.grade && <Badge variant="outline">{edu.grade}</Badge>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>

            {/* Experience */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Experience
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingExp(!addingExp)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              {/* Add experience form */}
              {addingExp && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Role / Position *</Label>
                      <Input
                        placeholder="Frontend Developer Intern"
                        value={expForm.role}
                        onChange={e => setExpForm(f => ({ ...f, role: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Company *</Label>
                      <Input
                        placeholder="Company name"
                        value={expForm.company}
                        onChange={e => setExpForm(f => ({ ...f, company: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Duration</Label>
                      <Input
                        placeholder="Jun 2023 - Aug 2023"
                        value={expForm.duration}
                        onChange={e => setExpForm(f => ({ ...f, duration: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      placeholder="What you worked on and achieved…"
                      value={expForm.description}
                      onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-gradient-primary text-primary-foreground"
                      onClick={addExperience}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAddingExp(false)}>
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {profile.experience.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No experience added yet. Add internships or projects!
                </p>
              ) : (
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 rounded-xl bg-secondary/30 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center text-accent-foreground shrink-0">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{exp.role}</h4>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        {exp.duration && (
                          <p className="text-xs text-muted-foreground mt-1">{exp.duration}</p>
                        )}
                        {exp.description && (
                          <p className="text-sm text-foreground mt-2">{exp.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;