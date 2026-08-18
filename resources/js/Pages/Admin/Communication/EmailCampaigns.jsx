import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Send, Plus, Users, Calendar, CheckCircle2, AlertTriangle, 
  Clock, Trash2, Eye, Play, Sparkles, Filter, X, ChevronRight, BarChart2
} from 'lucide-react';

export default function EmailCampaigns({
  campaigns = { data: [] },
  templates = [],
  totalCustomers = 0,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estimatedAudience, setEstimatedAudience] = useState(totalCustomers);
  const [calculatingAudience, setCalculatingAudience] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    name: '',
    subject: '',
    preheader: '',
    template_id: templates[0]?.id || '',
    audience_type: 'all_customers',
    audience_filters: {
      inactive_days: 30,
      product_id: '',
      district: '',
    },
    action: 'launch',
    scheduled_at: '',
  });

  // Calculate dynamic audience count when audience parameters change
  useEffect(() => {
    if (!isModalOpen) return;

    setCalculatingAudience(true);
    fetch('/admin/communication/email-campaigns/preview-audience', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({
        audience_type: data.audience_type,
        audience_filters: data.audience_filters,
      }),
    })
      .then(res => res.json())
      .then(resData => {
        setEstimatedAudience(resData.count ?? 0);
        setCalculatingAudience(false);
      })
      .catch(() => setCalculatingAudience(false));
  }, [data.audience_type, data.audience_filters, isModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/communication/email-campaigns', {
      preserveScroll: true,
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
      },
    });
  };

  const handleLaunchCampaign = (id) => {
    if (confirm('Are you sure you want to dispatch this email campaign now?')) {
      router.post(`/admin/communication/email-campaigns/${id}/launch`, {}, { preserveScroll: true });
    }
  };

  const handleDeleteCampaign = (id) => {
    if (confirm('Delete this campaign?')) {
      router.delete(`/admin/communication/email-campaigns/${id}`, { preserveScroll: true });
    }
  };

  return (
    <AdminLayout title="Email Campaigns">
      <Head title="Email Campaigns & Broadcasts — TechMarket BD" />

      <div className="space-y-6 font-['Hind_Siliguri',sans-serif]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Send className="w-6 h-6 text-amber-400" />
              <span>Email Marketing Campaigns</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Segment audiences, broadcast promotional newsletters, and track delivery conversions
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:scale-105 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Campaign List */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-black text-white text-sm">All Campaigns ({campaigns.data?.length || 0})</h2>
            <span className="text-[11px] text-slate-400 font-mono">Real-time background delivery</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {(!campaigns.data || campaigns.data.length === 0) ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <div className="text-white font-bold text-sm">No email campaigns created yet</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Create targeted email newsletters, flash sale alerts, and customer re-engagement campaigns.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 cursor-pointer"
                >
                  Create First Campaign
                </button>
              </div>
            ) : (
              campaigns.data.map((c) => {
                const isSending = c.status === 'sending';
                const isCompleted = c.status === 'completed';
                const isDraft = c.status === 'draft';

                return (
                  <div key={c.id} className="p-5 hover:bg-slate-900/40 transition-colors space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-extrabold text-white text-base">{c.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isCompleted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            isSending ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse' :
                            isDraft ? 'bg-slate-800 text-slate-400' :
                            'bg-purple-500/20 text-purple-300'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                          Subject: <span className="text-amber-400 font-bold">{c.subject}</span>
                          {c.preheader && <span className="text-slate-500 ml-1.5">• {c.preheader}</span>}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        {isDraft && (
                          <button
                            type="button"
                            onClick={() => handleLaunchCampaign(c.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Launch Now</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(c.id)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Counters */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/60 font-mono text-xs">
                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 uppercase block">Audience</span>
                        <span className="font-bold text-white text-sm">{c.total_recipients || 0}</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-emerald-400 uppercase block">Sent</span>
                        <span className="font-bold text-emerald-300 text-sm">{c.total_sent || 0}</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-rose-400 uppercase block">Failed</span>
                        <span className="font-bold text-rose-300 text-sm">{c.total_failed || 0}</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-purple-400 uppercase block">Opened</span>
                        <span className="font-bold text-purple-300 text-sm">{c.total_opened || 0}</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-sky-400 uppercase block">Audience Group</span>
                        <span className="font-bold text-slate-300 text-xs truncate block capitalize">
                          {c.audience_type?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Campaign Creation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Create Email Marketing Campaign</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g. Ramadan Tech Mega Sale 2026"
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-500 font-bold"
                  />
                  {errors.name && <p className="text-rose-400 text-[10px] mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Email Subject *</label>
                    <input
                      type="text"
                      required
                      value={data.subject}
                      onChange={(e) => setData('subject', e.target.value)}
                      placeholder="e.g. 🔥 সেরা টেক পণ্যে ৫০% পর্যন্ত বিশেষ ছাড়!"
                      className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Preheader Text</label>
                    <input
                      type="text"
                      value={data.preheader}
                      onChange={(e) => setData('preheader', e.target.value)}
                      placeholder="e.g. সীমিত সময়ের অফার। এখনই অর্ডার করুন।"
                      className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Template Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Select Email Template *</label>
                  <select
                    value={data.template_id}
                    onChange={(e) => setData('template_id', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none cursor-pointer"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>[{t.category}] {t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Audience Segmentation */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 uppercase font-mono flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-amber-400" />
                      <span>Target Audience Segmentation</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-mono font-bold">
                      {calculatingAudience ? 'Calculating...' : `${estimatedAudience} Eligible Recipients`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { key: 'all_customers', label: 'All Registered Customers' },
                      { key: 'active_buyers', label: 'Active Buyers (Delivered Orders)' },
                      { key: 'inactive_customers', label: 'Inactive Customers (30+ Days)' },
                      { key: 'custom_filtered', label: 'Custom Regional Filter' },
                    ].map(aud => (
                      <button
                        key={aud.key}
                        type="button"
                        onClick={() => setData('audience_type', aud.key)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          data.audience_type === aud.key
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {aud.label}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10.5px] text-slate-500">
                    * Unsubscribed customers are automatically filtered out from marketing campaigns to comply with anti-spam policies.
                  </p>
                </div>

                {/* Launch Action Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Dispatch Mode</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200 text-xs font-bold">
                      <input
                        type="radio"
                        name="action"
                        value="launch"
                        checked={data.action === 'launch'}
                        onChange={(e) => setData('action', e.target.value)}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span>Dispatch Immediately</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200 text-xs font-bold">
                      <input
                        type="radio"
                        name="action"
                        value="draft"
                        checked={data.action === 'draft'}
                        onChange={(e) => setData('action', e.target.value)}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span>Save as Draft</span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{processing ? 'Processing...' : (data.action === 'launch' ? 'Send Campaign Now' : 'Save Campaign')}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
