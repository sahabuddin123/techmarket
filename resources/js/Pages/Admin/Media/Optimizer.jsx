import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { 
  Zap, ArrowLeft, Settings2, Sliders, Image as ImageIcon, 
  CheckCircle2, AlertCircle, RefreshCw, Sparkles, HardDrive, 
  Gauge, TrendingDown, Cpu, FileCheck, Layers, Play
} from 'lucide-react';

export default function ImageOptimizer({ stats: initialStats }) {
  const [stats, setStats] = useState(initialStats || {});
  const [autoWebp, setAutoWebp] = useState(initialStats?.auto_convert_enabled ?? true);
  const [quality, setQuality] = useState(initialStats?.quality_setting ?? 85);
  const [maxWidth, setMaxWidth] = useState(initialStats?.max_width_setting ?? 1920);

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [batchLimit, setBatchLimit] = useState(50);
  const [processLogs, setProcessLogs] = useState([]);
  const [lastBatchResult, setLastBatchResult] = useState(null);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/admin/media/optimizer/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          auto_webp: autoWebp,
          quality: parseInt(quality),
          max_width: parseInt(maxWidth),
        }),
      });
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
      alert('✓ Optimizer configurations saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed saving settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleRunBatchOptimize = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProcessLogs([]);
    setLastBatchResult(null);

    try {
      const res = await fetch('/admin/media/optimizer/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          folder: selectedFolder,
          limit: parseInt(batchLimit),
          quality: parseInt(quality),
        }),
      });
      const data = await res.json();
      if (data.result) {
        setLastBatchResult(data.result);
        setProcessLogs(data.result.logs || []);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Batch optimization error:', err);
      alert('Optimization interrupted. Please check PHP memory limit and logs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const driverInfo = stats?.driver_info || {};

  return (
    <AdminShell>
      <Head title="Image Optimizer & WebP Engine - TechMarket Admin" />

      <div className="space-y-6 max-w-6xl mx-auto">
        <AdminPageHeader
          title="Image Optimizer & WebP Engine"
          subtitle="Automatically compress, scale, and convert storefront images to modern WebP format for blazing-fast speed and SEO."
          actions={
            <div className="flex items-center space-x-2.5">
              <Link
                href="/admin/media"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Media Library</span>
              </Link>
            </div>
          }
        />

        {/* 1. Top Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: WebP Adoption */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-heading">WebP Adoption</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
                {stats?.webp_percentage || 0}%
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{stats?.webp_count || 0}</span>
                <span>of {stats?.total_items || 0} total images</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Storage Used */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-heading">Storage Footprint</span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
                {stats?.total_size_formatted || '0 B'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                WebP portion: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{stats?.webp_formatted || '0 B'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Unoptimized Images */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-heading">Pending Non-WebP</span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-heading">
                {stats?.unoptimized_count || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Size: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{stats?.unoptimized_formatted || '0 B'}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Potential Space Savings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-heading">Estimated Savings</span>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-heading">
                ~{stats?.estimated_savings_formatted || '0 B'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Typical <span className="font-bold text-emerald-600">60% - 75%</span> size reduction
              </div>
            </div>
          </div>

        </div>

        {/* 2. Main Work Area: Settings & Batch Optimizer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Automation & Quality Configurations (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Optimizer Settings</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono">
                  {driverInfo.driver || 'GD Active'}
                </span>
              </div>

              {/* Setting 1: Auto-convert toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    Auto-Convert Uploads to WebP
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Automatically optimize JPG, PNG, GIF files into high-efficiency WebP upon upload.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoWebp}
                  onChange={(e) => setAutoWebp(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 shrink-0 cursor-pointer"
                />
              </div>

              {/* Setting 2: Quality Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <label className="text-slate-700 dark:text-slate-300">
                    WebP Quality: <span className="font-mono text-indigo-600 dark:text-indigo-400">{quality}%</span>
                  </label>
                  <span className="text-[10.5px] font-normal text-slate-400">
                    {quality >= 85 ? 'Recommended (Near-lossless)' : 'Higher Compression'}
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>40% (Smallest)</span>
                  <span>85% (Balanced)</span>
                  <span>95% (Maximum)</span>
                </div>
              </div>

              {/* Setting 3: Max Dimension Resize */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs">
                  Max Resolution Constraint (Pixels)
                </label>
                <select
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
                >
                  <option value="1280">1280 px (Standard HD Web)</option>
                  <option value="1600">1600 px (Crisp Web Standard)</option>
                  <option value="1920">1920 px (Full HD - Recommended)</option>
                  <option value="2560">2560 px (2K Ultra Quality)</option>
                  <option value="3840">3840 px (4K Max Resolution)</option>
                </select>
                <p className="text-[10.5px] text-slate-400">
                  Oversized camera/phone uploads will be proportionally downscaled to this max width/height.
                </p>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSavingSettings ? 'Saving...' : 'Save Optimizer Settings'}</span>
              </button>
            </form>

            {/* Core Web Vitals Info Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold font-heading text-amber-300">
                <Zap className="w-4 h-4" />
                <span>Why Convert to WebP?</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11.5px] leading-relaxed list-disc list-inside">
                <li><strong className="text-white">60-80% Smaller:</strong> Same visual quality as JPEG/PNG with a fraction of the bandwidth.</li>
                <li><strong className="text-white">Faster Storefront:</strong> Drastically boosts Google PageSpeed and Core Web Vitals score.</li>
                <li><strong className="text-white">Alpha Transparency:</strong> Flawlessly preserves PNG transparent backgrounds.</li>
                <li><strong className="text-white">Universal Support:</strong> 97%+ of modern browsers support WebP natively.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: 1-Click Batch Optimizer Tool (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-heading flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Bulk Optimization Engine</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {stats?.unoptimized_count || 0} unoptimized files remaining
                </span>
              </div>

              {/* Filter & Batch Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Target Folder
                  </label>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-hidden"
                  >
                    <option value="all">All Media Folders</option>
                    <option value="products">Products Images</option>
                    <option value="categories">Categories Artwork</option>
                    <option value="brands">Brands & Logos</option>
                    <option value="banners">Promotional Banners</option>
                    <option value="general">General / Icons</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Batch Size Per Execution
                  </label>
                  <select
                    value={batchLimit}
                    onChange={(e) => setBatchLimit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-hidden"
                  >
                    <option value="25">25 Files (Safe / Shared Hosting)</option>
                    <option value="50">50 Files (Recommended)</option>
                    <option value="100">100 Files (High Performance)</option>
                    <option value="250">250 Files (Large Batch)</option>
                  </select>
                </div>
              </div>

              {/* Action Trigger Button */}
              <button
                type="button"
                onClick={handleRunBatchOptimize}
                disabled={isProcessing || (stats?.unoptimized_count === 0)}
                className={`w-full font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
                  stats?.unoptimized_count === 0
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>
                  {isProcessing 
                    ? 'Converting Images to WebP (Please wait)...' 
                    : stats?.unoptimized_count === 0 
                      ? '✓ All Library Images are WebP' 
                      : `Start Optimizing ${batchLimit} Images → WebP`}
                </span>
              </button>

              {/* Batch Result Banner */}
              {lastBatchResult && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5 text-xs">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Batch Completed Successfully!</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    Processed <strong className="text-emerald-600 font-mono">{lastBatchResult.success_count}</strong> images. 
                    Freed <strong className="text-emerald-600 font-mono">{lastBatchResult.total_saved_formatted}</strong> of storage space (<strong className="text-emerald-600">{lastBatchResult.total_percent}% reduction</strong>).
                  </div>
                </div>
              )}

              {/* Live Batch Execution Table */}
              {processLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
                    Recent Conversion Logs
                  </div>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 text-[11px] font-bold">
                        <tr>
                          <th className="p-2.5">File</th>
                          <th className="p-2.5">Saved Space</th>
                          <th className="p-2.5">Compression</th>
                          <th className="p-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11.5px]">
                        {processLogs.map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 font-mono">
                            <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                              {log.filename}
                            </td>
                            <td className="p-2.5 text-emerald-600 font-bold">
                              {log.saved || '-'}
                            </td>
                            <td className="p-2.5 text-slate-500 font-bold">
                              {log.percent || '-'}
                            </td>
                            <td className="p-2.5 text-right">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'success'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-600 border border-rose-200'
                              }`}>
                                {log.status === 'success' ? '✓ WebP' : 'Failed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CLI Command Shortcut Helper */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-500" />
                  <span>Terminal / Server CLI Command:</span>
                </div>
                <div className="bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[11px] select-all">
                  php artisan media:optimize --quality=85
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminShell>
  );
}
