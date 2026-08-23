import React from 'react';
import { Mail, Phone } from 'lucide-react';

export default function TopUtilityBarV3({ settings = {} }) {
  const email = settings.support_email || settings.contact_email || 'info@techmarketbd.com';
  const phone = settings.support_phone || settings.contact_phone || settings.hotline || '+880 1700-000000';
  const announcement = settings.site_tagline || settings.tagline || 'Welcome to Your Trusted Gadget Hub in Bangladesh!';

  return (
    <div className="w-full bg-[#0153FD] text-white text-[10px] sm:text-xs py-1.5 px-3 sm:px-6 lg:px-8 select-none font-sans font-medium">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-2">
        {/* Left Announcement */}
        <div className="truncate flex-1 text-left">
          <span>{announcement}</span>
        </div>

        {/* Right Contacts */}
        <div className="flex items-center space-x-3 shrink-0 text-white/90">
          <a
            href={`mailto:${email}`}
            className="hidden md:flex items-center space-x-1 hover:text-white transition-colors"
          >
            <Mail className="w-3 h-3" />
            <span>{email}</span>
          </a>
          <span className="hidden md:inline opacity-40">|</span>
          <a
            href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
            className="flex items-center space-x-1 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>{phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
