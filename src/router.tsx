import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "@/pages/general/Landing";
import About from "@/pages/general/About";
import Contact from "@/pages/general/Contact";
import Pricing from "@/pages/general/Pricing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import NotFound from "@/pages/NotFound";

// Jobseeker
import JobSearch from "@/pages/jobseeker/JobSearch";
import JobDetails from "@/pages/jobseeker/JobDetails";
import ApplyJob from "@/pages/jobseeker/ApplyJob";
import JobseekerDashboard from "@/pages/jobseeker/dashboard";
import JobseekerApplications from "@/pages/jobseeker/Applications";
import Profile from "@/pages/jobseeker/Profile";
import SavedJobs from "@/pages/jobseeker/SavedJobs";
import SkillAssessment from "@/pages/jobseeker/SkillAssessment";
import InterviewPrep from "@/pages/jobseeker/InterviewPrep";
import ResumeAnalysis from "@/pages/jobseeker/ResumeAnalysis";
import CareerRoadmap from "@/pages/jobseeker/CareerRoadmap";
import LearningPath from "@/pages/jobseeker/LearningPath";

// Employer
import EmployerDashboard from "@/pages/employer/dashboard";
import ManageJobs from "@/pages/employer/ManageJobs";
import PostJob from "@/pages/employer/PostJob";
import EmployerApplications from "@/pages/employer/Applications";
import CandidateProfile from "@/pages/employer/CandidateProfile";

// Admin
import AdminDashboard from "@/pages/admin/dashboard";
import AdminJobs from "@/pages/admin/Jobs";
import AdminUsers from "@/pages/admin/Users";
import AdminReports from "@/pages/admin/Reports";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* General Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Auth */}
      <Route path="/auth">
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />

      {/* Jobseeker */}
      <Route path="/jobseeker">
        <Route path="dashboard"        element={<ProtectedRoute><JobseekerDashboard /></ProtectedRoute>} />
        <Route path="jobs"             element={<JobSearch />} />
        <Route path="job/:id"          element={<JobDetails />} />
        <Route path="apply/:id"        element={<ApplyJob />} />
        <Route path="applications"     element={<ProtectedRoute><JobseekerApplications /></ProtectedRoute>} />
        <Route path="profile"          element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* ── Previously missing routes ── */}
        <Route path="saved-jobs"       element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
        <Route path="skill-assessment" element={<ProtectedRoute><SkillAssessment /></ProtectedRoute>} />
        <Route path="interview-prep"   element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="resume-analysis"  element={<ProtectedRoute><ResumeAnalysis /></ProtectedRoute>} />
        <Route path="career-roadmap"   element={<ProtectedRoute><CareerRoadmap /></ProtectedRoute>} />
        <Route path="learning-path"    element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
      </Route>

      {/* Top-level shortcuts */}
      <Route path="/job-search" element={<Navigate to="/jobseeker/jobs" replace />} />
      <Route path="/profile"    element={<Navigate to="/jobseeker/profile" replace />} />

      {/* Employer */}
      <Route path="/employer">
        <Route path="dashboard"   element={<ProtectedRoute><EmployerDashboard /></ProtectedRoute>} />
        <Route path="manage-jobs" element={<ProtectedRoute><ManageJobs /></ProtectedRoute>} />
        <Route path="post-job"    element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
        <Route path="applications"element={<ProtectedRoute><EmployerApplications /></ProtectedRoute>} />
        <Route path="candidate/:id" element={<ProtectedRoute><CandidateProfile /></ProtectedRoute>} />
      </Route>

      {/* Admin */}
      <Route path="/admin">
        <Route path="dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="jobs"      element={<ProtectedRoute><AdminJobs /></ProtectedRoute>} />
        <Route path="users"     element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="reports"   element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};