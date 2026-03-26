import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface AdminLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AdminLayout = ({ title, subtitle, children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 container mx-auto px-6">
        {title && (
          <header className="mb-6">
            <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </header>
        )}

        <div className="mb-16">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout;
