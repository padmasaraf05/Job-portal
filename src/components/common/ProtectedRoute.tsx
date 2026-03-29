import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const [loading, setLoading]   = useState(true);
  const [session, setSession]   = useState<any>(null);
  const [role, setRole]         = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        // Pull role from profiles table (source of truth)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        setRole(profile?.role ?? data.session.user.user_metadata?.role ?? null);
      }

      setLoading(false);
    };

    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not logged in → go to login
  if (!session) {
    return <Navigate to="/auth/login" replace />;
  }

  // Admin-only route but user is not admin → redirect to their dashboard
  if (adminOnly && role !== "admin") {
    const destination =
      role === "employer" ? "/employer/dashboard" : "/jobseeker/dashboard";
    return <Navigate to={destination} replace />;
  }

  return children;
};