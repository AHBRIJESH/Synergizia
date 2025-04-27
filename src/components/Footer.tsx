import React from "react";
import { scrollToSection } from "@/lib/scroll";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";

const Footer = () => {
  const socialLinks = [
    {
      Icon: Linkedin,
      href: "https://www.linkedin.com/school/rgce-linkedin/?viewAsMember=true",
      label: "LinkedIn",
    },
    {
      Icon: Facebook,
      href: "https://www.facebook.com/people/Rajiv-Gandhi-College-of-Engineering/61573594305771/",
      label: "Facebook",
    },
    {
      Icon: Instagram,
      href: "https://www.instagram.com/rgce_official/?igsh=MWkycXJzcGY5ZmlycA%3D%3D#",
      label: "Instagram",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              SYNERGIZIA<span className="text-synergizia-gold">'25</span>
            </h3>
            <p className="text-gray-400 mb-4">
              A National Level Technical Symposium hosted by Rajiv Gandhi
              College of Engineering bringing together the brightest minds for a
              day of learning and competition.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-synergizia-purple transition-colors h-8 w-8 rounded-full flex items-center justify-center"
                >
                  <span className="sr-only">{label}</span>
                  <Icon className="h-4 w-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", id: "home" },
                { name: "About", id: "about" },
                { name: "Events", id: "events" },
                { name: "Schedule", id: "schedule" },
                { name: "Register", id: "register" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="h-4 w-0 opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-synergizia-gold" />
                <a
                  href="https://maps.app.goo.gl/ympSy1p8h2DSabPD6"
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Rajiv Gandhi College of Engineering, Chennai, Tamil Nadu
                </a>
              </li>

              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-synergizia-gold" />
                <a
                  href="mailto:info@synergizia25.org"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  info@synergizia25.org
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-synergizia-gold" />
                <a
                  href="tel:+916384665931"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  +91 63846 65931, 9381149610
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} SYNERGIZIA25. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
