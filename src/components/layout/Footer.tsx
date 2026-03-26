import { Link } from "react-router-dom";
import { Briefcase, Linkedin, Twitter, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  company: [
    { name: "About Us", path: "/about" },
    { name: "Careers", path: "/about" },
    { name: "Press", path: "/about" },
    { name: "Blog", path: "/about" },
  ],
  resources: [
    { name: "Career Tips", path: "/about" },
    { name: "Resume Builder", path: "/about" },
    { name: "Interview Prep", path: "/about" },
    { name: "Salary Guide", path: "/pricing" },
  ],
  support: [
    { name: "Help Center", path: "/contact" },
    { name: "Contact Us", path: "/contact" },
    { name: "Privacy Policy", path: "/about" },
    { name: "Terms of Service", path: "/about" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">
                CareerLaunch<span className="text-primary">Pro</span>
              </span>
            </Link>
            <p className="text-background/70 mb-6 max-w-sm">
              Empowering freshers to launch successful careers with AI-powered guidance and connecting them with top employers.
            </p>
            <div className="flex gap-4">
              {[Linkedin, Twitter, Facebook, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors duration-200"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-lg mb-4 capitalize">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-background/70 hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-background/70">
              <a href="mailto:hello@careerlaunchpro.com" className="flex items-center gap-2 hover:text-primary">
                <Mail className="w-4 h-4" />
                hello@careerlaunchpro.com
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-primary">
                <Phone className="w-4 h-4" />
                +1 (234) 567-890
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </span>
            </div>
            <p className="text-sm text-background/50">
              © {new Date().getFullYear()} CareerLaunch Pro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
