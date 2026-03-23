import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Facebook, Linkedin, Twitter, Instagram, Youtube } from 'lucide-react';

const footerLinks = {
  About: ['About redBus', 'Contact us', 'Sitemap', 'Offices', 'Careers'],
  Info: ['FAQ', 'Privacy policy', 'Blog', 'Bus operator registration', 'Insurance partner', 'User agreement', 'Price Bus', 'Bus Timetables', 'Report Security Issue'],
  'Global Sites': ['India', 'Singapore', 'Malaysia', 'Indonesia', 'Peru', 'Colombia', 'Zurichsuide', 'Vietnam'],
  'Our Partners': ['redRail', 'redBus Hotels', 'Makemytrip Hotels'],
};

const Footer: React.FC = () => (
  <footer className="bg-[#1a1a2e] text-gray-300">
    {/* ── Top Section ── */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section}>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">{section}</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors duration-150">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* ── Divider ── */}
    <div className="border-t border-gray-700" />

    {/* ── Bottom Bar ── */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#d63031] rounded-lg flex items-center justify-center">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-white">
              red<span className="text-[#d63031]">Bus</span>
            </span>
          </div>
          <span className="text-gray-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} redBus. All rights reserved.
          </span>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-3">
          {[Facebook, Linkedin, Twitter, Instagram, Youtube].map((Icon, i) => (
            <a 
              key={i}
              href="#"
              className="w-8 h-8 rounded-full bg-gray-700 hover:bg-[#d63031] flex items-center justify-center transition-colors duration-200"
              aria-label="Social media"
            >
              <Icon className="w-4 h-4 text-white" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;