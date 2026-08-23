import React, { useState } from 'react';
import axios from 'axios';
import AdminLayout from '../AdminLayout';
import {
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Cable,
  Zap,
  Sliders,
  RefreshCw,
  Info,
  ShieldCheck
} from 'lucide-react';

export default function RuleTester({ availableCameras = [], availableRecorders = [] }) {
  const [systemType, setSystemType] = useState('ip');
  const [totalCameras, setTotalCameras] = useState(8);
  const [outdoorCameras, setOutdoorCameras] = useState(4);
  const [avgDistance, setAvgDistance] = useState(30);
  const [floorsCount, setFloorsCount] = useState(2);
  const [retentionDays, setRetentionDays] = useState(15);
  const [preferredCodec, setPreferredCodec] = useState('H.265+');
  const [requireInstallation, setRequireInstallation] = useState(true);

  const [selectedCameraId, setSelectedCameraId] = useState(availableCameras[0]?.product_id || '');
  const [selectedRecorderId, setSelectedRecorderId] = useState(availableRecorders[0]?.product_id || '');

  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRunTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const items = [];
    if (selectedCameraId) {
      items.push({
        product_id: selectedCameraId,
        quantity: totalCameras,
        item_type: 'selected_camera',
      });
    }

    if (selectedRecorderId) {
      items.push({
        product_id: selectedRecorderId,
        quantity: 1,
        item_type: 'recording_device',
      });
    }

    const payload = {
      requirements: {
        project_name: 'Admin Rule Diagnostic Test',
        project_type: 'commercial_office',
        system_type: systemType,
        total_cameras: totalCameras,
        outdoor_cameras: outdoorCameras,
        recording_days: retentionDays,
        recording_hours_per_day: 24,
        preferred_codec: preferredCodec,
        average_cable_distance_meters: avgDistance,
        floors_count: floorsCount,
        require_installation: requireInstallation,
      },
      items: items,
    };

    try {
      const response = await axios.post('/admin/cctv/test/run', payload);
      setTestResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation engine test error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Live CCTV Engine Tester" breadcrumbs={[{ label: 'CCTV Estimator', href: '/admin/cctv' }, { label: 'Rule Tester' }]}>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white font-heading">
              CCTV Calculation & Matrix Diagnostic Console
            </h1>
            <p className="text-xs text-slate-400">
              Simulate customer configuration inputs against the live Laravel calculation and compatibility engine.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Form */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleRunTest} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Simulation Parameters</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">System Architecture</label>
                  <select
                    value={systemType}
                    onChange={(e) => setSystemType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="ip">IP Network System</option>
                    <option value="analog">Analog / HD-TVI System</option>
                    <option value="hybrid">Hybrid System</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Total Cameras</label>
                    <input
                      type="number"
                      min="1"
                      max="64"
                      value={totalCameras}
                      onChange={(e) => setTotalCameras(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Outdoor Cameras</label>
                    <input
                      type="number"
                      min="0"
                      max={totalCameras}
                      value={outdoorCameras}
                      onChange={(e) => setOutdoorCameras(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Avg Distance (m/cam)</label>
                    <input
                      type="number"
                      min="5"
                      value={avgDistance}
                      onChange={(e) => setAvgDistance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Building Floors</label>
                    <input
                      type="number"
                      min="1"
                      value={floorsCount}
                      onChange={(e) => setFloorsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Retention (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Compression Codec</label>
                    <select
                      value={preferredCodec}
                      onChange={(e) => setPreferredCodec(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="H.265+">H.265+ (Smart 70% Save)</option>
                      <option value="H.265">H.265 (50% Save)</option>
                      <option value="H.264">H.264 (Standard)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Attached Camera Product</label>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="">-- Let Engine Auto-Recommend --</option>
                    {availableCameras.map((cam) => (
                      <option key={cam.product_id} value={cam.product_id}>
                        {cam.product?.title} ({cam.resolution_mp}MP | ৳{cam.product?.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Attached Recorder Product</label>
                  <select
                    value={selectedRecorderId}
                    onChange={(e) => setSelectedRecorderId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="">-- Let Engine Auto-Recommend --</option>
                    {availableRecorders.map((rec) => (
                      <option key={rec.product_id} value={rec.product_id}>
                        {rec.product?.title} (৳{rec.product?.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="instCheck"
                    checked={requireInstallation}
                    onChange={(e) => setRequireInstallation(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="instCheck" className="text-slate-300 cursor-pointer">
                    Include Professional Installation Algorithm
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{loading ? 'Evaluating Engine...' : 'Run Engine Calculation Test'}</span>
              </button>
            </form>
          </div>

          {/* Real-time Diagnostics Output */}
          <div className="lg:col-span-7 space-y-6">
            {!testResult && !loading && (
              <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-400">Ready for Live Simulation</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Configure the inputs on the left and click Run to test storage throughput, cable conversion, power draw, and compatibility validation in real-time.
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {testResult && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Validation Status Card */}
                <div
                  className={`p-5 rounded-2xl border ${
                    testResult.validation?.is_compatible
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {testResult.validation?.is_compatible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>
                      {testResult.validation?.is_compatible
                        ? 'Compatibility Engine: All Hardware Rules Passed'
                        : 'Compatibility Conflict Detected'}
                    </span>
                  </div>

                  {testResult.validation?.errors?.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[11px] text-rose-200 list-disc list-inside">
                      {testResult.validation.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}

                  {testResult.validation?.warnings?.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[11px] text-amber-200 list-disc list-inside">
                      {testResult.validation.warnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Storage & Cabling Metrics Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Storage */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-indigo-400">
                      <HardDrive className="w-4 h-4" />
                      <span>Storage Throughput</span>
                    </div>
                    <div className="font-mono space-y-1 text-slate-300 text-[11px]">
                      <div>Bitrate / Cam: <span className="text-white font-bold">{testResult.storage_metrics?.bitrate_per_camera_kbps} Kbps</span></div>
                      <div>Total Bandwidth: <span className="text-white font-bold">{testResult.storage_metrics?.total_incoming_bandwidth_mbps} Mbps</span></div>
                      <div>Gross Storage: <span className="text-emerald-400 font-bold">{testResult.storage_metrics?.gross_required_storage_tb_with_overhead} TB</span></div>
                      <div className="text-indigo-300 text-[10px] pt-1">
                        &rarr; Sizing: {testResult.storage_metrics?.recommended_hdd_capacity_tb} TB Surveillance Drive ({testResult.storage_metrics?.recommended_hdd_bays_required} Bay)
                      </div>
                    </div>
                  </div>

                  {/* Cabling */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-400">
                      <Cable className="w-4 h-4" />
                      <span>Cabling & Runs</span>
                    </div>
                    <div className="font-mono space-y-1 text-slate-300 text-[11px]">
                      <div>Net Run: <span className="text-white font-bold">{testResult.cable_metrics?.net_camera_distance_meters}m</span></div>
                      <div>Floor Risers: <span className="text-white font-bold">{testResult.cable_metrics?.inter_floor_riser_meters}m</span></div>
                      <div>Gross Total: <span className="text-amber-400 font-bold">{testResult.cable_metrics?.gross_total_cable_meters}m</span></div>
                      <div className="text-amber-300 text-[10px] pt-1">
                        &rarr; {testResult.cable_metrics?.recommended_rolls_count} x {testResult.cable_metrics?.recommended_cable_package_type}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Grand Total */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Grand Total</span>
                    <span className="text-xl font-black text-emerald-400">৳{Number(testResult.grand_total || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-right text-xs text-slate-400 space-y-0.5">
                    <div>Hardware: ৳{Number(testResult.subtotal_amount || 0).toLocaleString()}</div>
                    <div>Accessories: ৳{Number(testResult.accessory_amount || 0).toLocaleString()}</div>
                    <div>Installation: ৳{Number(testResult.installation_amount || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
