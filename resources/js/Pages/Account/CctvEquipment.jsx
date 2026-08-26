import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';
import ChatWidgetV3 from '@/Pages/Storefront/Version3/Components/ChatWidgetV3';
import {
  ShieldCheck,
  Video,
  HardDrive,
  Cpu,
  Calendar,
  AlertCircle,
  Plus,
  Wrench,
  Layers,
  MapPin
} from 'lucide-react';

export default function CctvEquipment({
  storefront_version,
  equipment = [],
}) {
  const { props } = usePage();
  const activeVersion = getStorefrontVersion(storefront_version || props?.storefront_version || props?.settings?.storefront_version || 'v1');
  const NavbarComponent = activeVersion.Navbar;
  const FooterComponent = activeVersion.Footer;
  const MobileBottomNavComponent = activeVersion.MobileBottomNav;

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-800 font-poppins selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Head title="My Installed CCTV Equipment & Warranties | TechMarket BD" />

      {NavbarComponent && <NavbarComponent />}

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <span>Installed CCTV Equipment & Warranties</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Registered surveillance cameras, recording units, storage drives, and active hardware warranties.
            </p>
          </div>

          <Link
            href="/account/cctv-services/create"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/20"
          >
            <Wrench className="w-4 h-4" />
            <span>Request Service Ticket</span>
          </Link>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-700 text-sm">No Installed Equipment Found</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Surveillance devices purchased with installation will appear here once commissioned.
              </p>
              <Link
                href="/cctv-estimator"
                className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Configure New System
              </Link>
            </div>
          ) : (
            equipment.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                      {item.device_type}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{item.camera_name || item.product_name_snapshot}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    item.status === 'operational' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 font-mono text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Serial #:</span>
                    <span className="font-bold text-slate-800">{item.serial_number}</span>
                  </div>
                  {item.location_floor && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span>{item.location_floor} - {item.location_room || 'General'}</span>
                    </div>
                  )}
                  {item.ip_address && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">IP Address:</span>
                      <span>{item.ip_address}</span>
                    </div>
                  )}
                </div>

                {/* Warranty Badge */}
                {item.warranty ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Warranty Active</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-mono">
                        Valid until: {new Date(item.warranty.warranty_end).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 text-[11px] text-center">
                    No active warranty record
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
