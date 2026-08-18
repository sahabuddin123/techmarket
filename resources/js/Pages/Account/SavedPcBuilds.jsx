import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AccountLayout from '@/Layouts/AccountLayout';
import { Monitor, Cpu, Plus, Trash2, ArrowRight, Zap, Check } from 'lucide-react';

export default function SavedPcBuilds({ user, builds = [], unreadCount = 0 }) {
  const handleLoadBuild = (buildId) => {
    router.post(`/pc-builder/load/${buildId}`);
  };

  const handleDeleteBuild = (buildId, buildName) => {
    if (confirm(`Are you sure you want to delete '${buildName}'?`)) {
      router.delete(`/pc-builder/builds/${buildId}`);
    }
  };

  return (
    <AccountLayout unreadCount={unreadCount}>
      <Head title="Saved PC Builds - TechMarket BD" />

      <div className="bg-white border border-[#d9dde3] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:px-6 border-b border-[#e2e8f0] flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-bold text-[#1e293b]">
              Saved PC Builds
            </h1>
            <p className="text-xs text-[#64748b]">
              Manage and reload your saved custom desktop computer configurations.
            </p>
          </div>

          <Link
            href="/pc-builder"
            className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-[12px] font-semibold px-4 py-2 rounded-[4px] transition-colors shadow-xs inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Build</span>
          </Link>
        </div>

        {/* Content */}
        {builds.length > 0 ? (
          <div className="divide-y divide-[#edf0f5]">
            {builds.map((build) => (
              <div
                key={build.id}
                className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fbfcfd] transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-[14px] font-bold text-[#1e293b]">
                      {build.name}
                    </h2>
                    <span className="bg-[#f1f5f9] text-[#475569] text-[10.5px] font-semibold px-2 py-0.5 rounded-[4px]">
                      {build.component_count} Components
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-[#64748b]">
                    <span>Saved on: {build.created_at}</span>
                    {build.estimated_wattage > 0 && (
                      <span className="flex items-center text-amber-600 font-semibold">
                        <Zap className="w-3.5 h-3.5 mr-0.5" /> ~{build.estimated_wattage}W
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-semibold text-[#8b95a5]">Total Price</div>
                    <div className="text-[15px] font-black text-[#d32f2f]">
                      ৳{build.total_price.toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLoadBuild(build.id)}
                    className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-xs font-semibold px-3.5 py-1.5 rounded-[4px] flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Load in Builder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBuild(build.id, build.name)}
                    className="p-1.5 text-[#94a3b8] hover:text-[#d32f2f] hover:bg-red-50 rounded-[4px] transition-colors"
                    title="Delete saved build"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-[#8b95a5] space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center mx-auto">
              <Cpu className="w-7 h-7" />
            </div>
            <p className="text-[14px] font-semibold text-[#475569]">
              No saved custom PC configurations found.
            </p>
            <p className="text-[12.5px] text-[#8b95a5] max-w-sm mx-auto">
              Use our interactive PC Builder tool to pick compatible components, calculate power requirements, and save your custom build.
            </p>
            <div className="pt-2">
              <Link
                href="/pc-builder"
                className="text-[13px] font-bold text-[#274a7d] hover:underline"
              >
                Open PC Builder Tool →
              </Link>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
