import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../AdminLayout';
import { 
  Layers, Plus, Sparkles, Flame, ShieldCheck, 
  ShoppingBag, ArrowRight, CheckCircle2, ArrowLeft
} from 'lucide-react';

export default function LandingPageTemplates({ templates = [] }) {
  return (
    <AdminLayout title="Campaign Templates">
      <Head title="Landing Page Templates — TechMarket BD" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
                Pre-Built Presets
              </span>
              <span className="text-xs text-slate-400">1-Click High-Converting Launch</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
              High-Converting Campaign Templates
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose a proven layout structure tailored for Meta/Facebook ad campaigns and Bangladeshi customer psychology.
            </p>
          </div>

          <Link
            href="/admin/marketing/landing-pages"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Landing Pages</span>
          </Link>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/60 transition-all space-y-4 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                    style={{
                      color: tmpl.theme,
                      borderColor: `${tmpl.theme}40`,
                      backgroundColor: `${tmpl.theme}15`
                    }}
                  >
                    {tmpl.tag}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-semibold">{tmpl.sections_count} Dynamic Sections</span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                  {tmpl.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {tmpl.description}
                </p>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>One-Click Quick Order Form with Live District Rates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Meta Pixel + CAPI + GA4 Enhanced Ecommerce Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mobile Sticky Order Bar & WhatsApp Instant Floaters</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Theme: {tmpl.theme}</span>

                <Link
                  href={`/admin/marketing/landing-pages/create?template=${tmpl.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md group-hover:scale-105"
                >
                  <span>Use This Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
