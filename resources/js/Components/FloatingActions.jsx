import React from 'react';
import { usePage } from '@inertiajs/react';
import { Phone, MessageCircle } from 'lucide-react';

export default function FloatingActions() {
  const { settings = {} } = usePage().props;

  const isEnabled = settings.floating_actions_enabled !== '0' && settings.floating_actions_enabled !== false;
  const phoneNumber = settings.hotline || settings.support_phone || '09612-888888';
  const rawPhone = phoneNumber.replace(/[^0-9+]/g, '');
  const whatsappNumber = settings.whatsapp_number || settings.support_phone || '8801700000000';
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappMessage = encodeURIComponent(settings.whatsapp_default_message || 'Hello, I would like to inquire about a product.');

  if (!isEnabled) return null;

  return (
    <aside aria-label="Quick Communication Actions" className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      {/* 1. Phone Call Action */}
      <a
        href={`tel:${rawPhone}`}
        className="w-12 h-12 rounded-full bg-[#0f2b48] hover:bg-[#0084ff] text-white flex items-center justify-center shadow-xl hover:scale-108 transition-all duration-200 group relative"
        title={`Call Hotline: ${phoneNumber}`}
        aria-label={`Call Hotline: ${phoneNumber}`}
      >
        <Phone className="w-5 h-5 group-hover:animate-bounce" />
        <span className="absolute right-14 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          {phoneNumber}
        </span>
      </a>

      {/* 2. WhatsApp Action */}
      <a
        href={`https://wa.me/${cleanWhatsapp}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-xl hover:scale-108 transition-all duration-200 group relative"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        {/* WhatsApp Icon */}
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        <span className="absolute right-14 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
}
