import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';
import ChatWidgetV3 from '@/Pages/Storefront/Version3/Components/ChatWidgetV3';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  User
} from 'lucide-react';

export default function CctvServiceRequests({
  storefront_version = 'v3',
  requests = [],
}) {
  const { props } = usePage();
  const activeVersion = getStorefrontVersion(storefront_version || props?.settings?.storefront_version || 'v3');
  const NavbarComponent = activeVersion.Navbar;
  const FooterComponent = activeVersion.Footer;
  const MobileBottomNavComponent = activeVersion.MobileBottomNav;

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-800 font-poppins selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Head title="My CCTV Service Tickets & Support | TechMarket BD" />

      {NavbarComponent && <NavbarComponent />}

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
              <Wrench className="w-6 h-6 text-blue-600" />
              <span>Surveillance After-Sales Support & Service Tickets</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track engineer assignments, troubleshooting diagnoses, warranty claims, and scheduled technician visits.
            </p>
          </div>

          <Link
            href="/account/cctv-services/create"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Open Service Ticket</span>
          </Link>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-700 text-sm">No Active Service Tickets</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                If you encounter any issues with your cameras or recording systems, open a service ticket for rapid resolution.
              </p>
              <Link
                href="/account/cctv-services/create"
                className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Create Support Request
              </Link>
            </div>
          ) : (
            requests.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                        #{ticket.ticket_number}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ticket.status === 'completed' || ticket.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : ticket.status === 'submitted'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{ticket.problem_category.toUpperCase()}: {ticket.problem_description}</h3>
                  </div>

                  <div className="text-right text-xs">
                    <div className="font-mono text-[11px] text-slate-400">Created: {new Date(ticket.created_at).toLocaleDateString()}</div>
                    {ticket.warranty_id && (
                      <div className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 sm:justify-end">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Covered under warranty</span>
                      </div>
                    )}
                  </div>
                </div>

                {ticket.technician && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-800">Assigned Technician: {ticket.technician.name}</span>
                    </div>
                    <span className="text-slate-500 font-mono">{ticket.technician.phone || '01700-000000'}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {storefront_version === 'v3' && <ChatWidgetV3 />}
      {MobileBottomNavComponent && <MobileBottomNavComponent />}
      {FooterComponent && <FooterComponent />}
    </div>
  );
}
