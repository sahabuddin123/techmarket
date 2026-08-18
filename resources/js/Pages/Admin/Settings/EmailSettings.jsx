import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Server, Shield, Check, Save, Radio, Mail, 
  Send, AlertTriangle, Sliders, RefreshCw, Key, Globe, X
} from 'lucide-react';

export default function EmailSettings({
  gateways = [],
  settings = {},
}) {
  const [editingGateway, setEditingGateway] = useState(null);
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('admin@techmarketbd.com');
  const [testRunning, setTestRunning] = useState(false);
  const [testFeedback, setTestFeedback] = useState(null);

  // Global Settings Form
  const { data: globalData, setData: setGlobalData, post: postGlobal, processing: globalProcessing } = useForm({
    email_enabled: settings.email_enabled ?? true,
    email_transactional_enabled: settings.email_transactional_enabled ?? true,
    email_promotional_enabled: settings.email_promotional_enabled ?? true,
    email_admin_alerts_enabled: settings.email_admin_alerts_enabled ?? true,
    email_queue_enabled: settings.email_queue_enabled ?? true,
    email_fallback_enabled: settings.email_fallback_enabled ?? true,
    email_default_from_name: settings.email_default_from_name || 'TechMarket BD',
    email_default_from_email: settings.email_default_from_email || 'noreply@techmarketbd.com',
    email_reply_to: settings.email_reply_to || 'support@techmarketbd.com',
    email_daily_limit: settings.email_daily_limit || '10000',
    email_per_minute_limit: settings.email_per_minute_limit || '60',
    email_batch_size: settings.email_batch_size || '50',
    email_max_retries: settings.email_max_retries || '3',
    email_retry_delay: settings.email_retry_delay || '30',
  });

  // Gateway Modal Form
  const { data: gwData, setData: setGwData, post: postGw, processing: gwProcessing, reset: resetGw } = useForm({
    id: null,
    name: '',
    driver: 'smtp',
    is_active: true,
    is_default: false,
    is_fallback: false,
    from_name: 'TechMarket BD',
    from_email: 'noreply@techmarketbd.com',
    reply_to_email: 'support@techmarketbd.com',
    config: {},
  });

  const handleOpenEditGateway = (gw) => {
    setEditingGateway(gw);
    setGwData({
      id: gw.id,
      name: gw.name,
      driver: gw.driver,
      is_active: gw.is_active,
      is_default: gw.is_default,
      is_fallback: gw.is_fallback,
      from_name: gw.from_name,
      from_email: gw.from_email,
      reply_to_email: gw.reply_to_email || '',
      config: gw.config || {},
    });
    setGatewayModalOpen(true);
  };

  const handleOpenNewGateway = () => {
    resetGw();
    setEditingGateway(null);
    setGwData({
      id: null,
      name: 'New Custom Gateway',
      driver: 'smtp',
      is_active: true,
      is_default: false,
      is_fallback: false,
      from_name: 'TechMarket BD',
      from_email: 'noreply@techmarketbd.com',
      reply_to_email: 'support@techmarketbd.com',
      config: {
        host: 'smtp.mailtrap.io',
        port: 587,
        username: '',
        password: '',
        encryption: 'tls',
      },
    });
    setGatewayModalOpen(true);
  };

  const handleSaveGateway = (e) => {
    e.preventDefault();
    const endpoint = editingGateway 
      ? `/admin/settings/email-gateways/${editingGateway.id}`
      : '/admin/settings/email-gateways';

    postGw(endpoint, {
      preserveScroll: true,
      onSuccess: () => {
        setGatewayModalOpen(false);
      },
    });
  };

  const handleSaveGlobalSettings = (e) => {
    e.preventDefault();
    postGlobal('/admin/settings/email', { preserveScroll: true });
  };

  const handleOpenTestGateway = (gw) => {
    setEditingGateway(gw);
    setTestFeedback(null);
    setTestModalOpen(true);
  };

  const handleExecuteGatewayTest = (withEmail = false) => {
    if (!editingGateway) return;
    setTestRunning(true);
    setTestFeedback(null);

    const payload = withEmail ? { test_email: testEmailAddress } : {};

    fetch(`/admin/settings/email-gateways/${editingGateway.id}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        setTestRunning(false);
        setTestFeedback({ success: data.success, message: data.message });
      })
      .catch(() => {
        setTestRunning(false);
        setTestFeedback({ success: false, message: 'Connection test failed or timeout.' });
      });
  };

  return (
    <AdminLayout title="Email Gateways & Settings">
      <Head title="Email Settings & Gateway Configuration — TechMarket BD" />

      <div className="space-y-6 font-['Hind_Siliguri',sans-serif] max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Mail className="w-6 h-6 text-amber-400" />
              <span>Email System & Gateway Infrastructure</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure SMTP & Cloud API providers, credentials encryption, delivery rate limits, and fallback failover
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNewGateway}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            + Add Email Provider
          </button>
        </div>

        {/* SECTION A: GATEWAY PROVIDERS */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-black text-white text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                <span>Configured Email Gateways</span>
              </h2>
              <p className="text-[11px] text-slate-400">Primary and failover relay connections</p>
            </div>
            <span className="text-[10.5px] font-mono text-emerald-400">AES-256 Encrypted Credentials</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gateways.map((gw) => (
              <div
                key={gw.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4.5 space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      {gw.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {gw.is_default && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                          PRIMARY
                        </span>
                      )}
                      {gw.is_fallback && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                          FALLBACK
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Driver:</span>
                      <strong className="text-slate-200 uppercase">{gw.driver}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>From Email:</span>
                      <strong className="text-slate-200">{gw.from_email}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Tested:</span>
                      <span className="text-slate-400">{gw.last_tested_at || 'Never'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleOpenTestGateway(gw)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Radio className="w-3 h-3 text-amber-400" />
                    <span>Test Connection</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditGateway(gw)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-sm"
                  >
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION B: GLOBAL SETTINGS & LIMITS */}
        <form onSubmit={handleSaveGlobalSettings} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="font-black text-white text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Sending Rules & Rate Limits</span>
            </h2>
            <span className="text-[11px] text-slate-400">Anti-Spam & Delivery Safeguards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* General Toggles */}
            <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Channel Toggles</span>
              
              <label className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-200">
                <span>Master Email System</span>
                <input
                  type="checkbox"
                  checked={globalData.email_enabled}
                  onChange={(e) => setGlobalData('email_enabled', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-200">
                <span>Transactional Emails</span>
                <input
                  type="checkbox"
                  checked={globalData.email_transactional_enabled}
                  onChange={(e) => setGlobalData('email_transactional_enabled', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-200">
                <span>Promotional Campaigns</span>
                <input
                  type="checkbox"
                  checked={globalData.email_promotional_enabled}
                  onChange={(e) => setGlobalData('email_promotional_enabled', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-200">
                <span>Admin Alerts</span>
                <input
                  type="checkbox"
                  checked={globalData.email_admin_alerts_enabled}
                  onChange={(e) => setGlobalData('email_admin_alerts_enabled', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-200">
                <span>Provider Failover</span>
                <input
                  type="checkbox"
                  checked={globalData.email_fallback_enabled}
                  onChange={(e) => setGlobalData('email_fallback_enabled', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                />
              </label>
            </div>

            {/* Default Identifiers */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Sender Identity</span>
              
              <div>
                <label className="block text-[10.5px] font-bold text-slate-400 mb-1">Default From Name</label>
                <input
                  type="text"
                  value={globalData.email_default_from_name}
                  onChange={(e) => setGlobalData('email_default_from_name', e.target.value)}
                  className="w-full bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-400 mb-1">Default From Email</label>
                <input
                  type="email"
                  value={globalData.email_default_from_email}
                  onChange={(e) => setGlobalData('email_default_from_email', e.target.value)}
                  className="w-full bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-400 mb-1">Reply-To Email</label>
                <input
                  type="email"
                  value={globalData.email_reply_to}
                  onChange={(e) => setGlobalData('email_reply_to', e.target.value)}
                  className="w-full bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono"
                />
              </div>
            </div>

            {/* Queue & Rate Limits */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Rate Limits & Queue</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Daily Limit</label>
                  <input
                    type="number"
                    value={globalData.email_daily_limit}
                    onChange={(e) => setGlobalData('email_daily_limit', e.target.value)}
                    className="w-full bg-slate-950 text-white px-2.5 py-1.5 rounded-xl border border-slate-700 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Per Min Limit</label>
                  <input
                    type="number"
                    value={globalData.email_per_minute_limit}
                    onChange={(e) => setGlobalData('email_per_minute_limit', e.target.value)}
                    className="w-full bg-slate-950 text-white px-2.5 py-1.5 rounded-xl border border-slate-700 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Retry Tries</label>
                  <input
                    type="number"
                    value={globalData.email_max_retries}
                    onChange={(e) => setGlobalData('email_max_retries', e.target.value)}
                    className="w-full bg-slate-950 text-white px-2.5 py-1.5 rounded-xl border border-slate-700 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Retry Delay (s)</label>
                  <input
                    type="number"
                    value={globalData.email_retry_delay}
                    onChange={(e) => setGlobalData('email_retry_delay', e.target.value)}
                    className="w-full bg-slate-950 text-white px-2.5 py-1.5 rounded-xl border border-slate-700 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={globalProcessing}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{globalProcessing ? 'Saving Settings...' : 'Save System Settings'}</span>
            </button>
          </div>
        </form>

        {/* MODAL 1: GATEWAY CONFIGURATION */}
        {gatewayModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>{editingGateway ? `Configure: ${editingGateway.name}` : 'Add Email Provider'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setGatewayModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveGateway} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Gateway Name *</label>
                    <input
                      type="text"
                      required
                      value={gwData.name}
                      onChange={(e) => setGwData('name', e.target.value)}
                      className="w-full bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Provider Driver *</label>
                    <select
                      value={gwData.driver}
                      onChange={(e) => setGwData('driver', e.target.value)}
                      className="w-full bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-700 font-mono cursor-pointer"
                    >
                      <option value="smtp">Custom SMTP Server</option>
                      <option value="brevo">Brevo (Sendinblue API)</option>
                      <option value="sendgrid">SendGrid Cloud API</option>
                      <option value="mailgun">Mailgun API</option>
                      <option value="ses">Amazon SES</option>
                      <option value="generic_smtp">Generic Host SMTP</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">From Name</label>
                    <input
                      type="text"
                      value={gwData.from_name}
                      onChange={(e) => setGwData('from_name', e.target.value)}
                      className="w-full bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">From Email</label>
                    <input
                      type="email"
                      required
                      value={gwData.from_email}
                      onChange={(e) => setGwData('from_email', e.target.value)}
                      className="w-full bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-700 font-mono"
                    />
                  </div>
                </div>

                {/* Driver-Specific Config Fields */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase font-mono block">
                    {gwData.driver.toUpperCase()} Configuration & Credentials
                  </span>

                  {(gwData.driver === 'smtp' || gwData.driver === 'generic_smtp' || gwData.driver === 'ses') && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-1">SMTP Host</label>
                          <input
                            type="text"
                            value={gwData.config.host || ''}
                            onChange={(e) => setGwData('config', { ...gwData.config, host: e.target.value })}
                            placeholder="e.g. smtp.gmail.com"
                            className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Port</label>
                          <input
                            type="number"
                            value={gwData.config.port || 587}
                            onChange={(e) => setGwData('config', { ...gwData.config, port: e.target.value })}
                            className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Username / Key</label>
                          <input
                            type="text"
                            value={gwData.config.username || ''}
                            onChange={(e) => setGwData('config', { ...gwData.config, username: e.target.value })}
                            className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Password / Secret</label>
                          <input
                            type="password"
                            value={gwData.config.password || ''}
                            onChange={(e) => setGwData('config', { ...gwData.config, password: e.target.value })}
                            placeholder="Leave blank to keep existing"
                            className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {(gwData.driver === 'brevo' || gwData.driver === 'sendgrid') && (
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">API Key</label>
                      <input
                        type="password"
                        value={gwData.config.api_key || ''}
                        onChange={(e) => setGwData('config', { ...gwData.config, api_key: e.target.value })}
                        placeholder="Leave blank to keep existing"
                        className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 font-mono text-xs"
                      />
                    </div>
                  )}

                  {gwData.driver === 'mailgun' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Domain</label>
                        <input
                          type="text"
                          value={gwData.config.domain || ''}
                          onChange={(e) => setGwData('config', { ...gwData.config, domain: e.target.value })}
                          placeholder="mg.yourdomain.com"
                          className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">API Key</label>
                        <input
                          type="password"
                          value={gwData.config.api_key || ''}
                          onChange={(e) => setGwData('config', { ...gwData.config, api_key: e.target.value })}
                          placeholder="Leave blank to keep existing"
                          className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded-lg border border-slate-700 font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Priority Toggles */}
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={gwData.is_default}
                      onChange={(e) => setGwData('is_default', e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span>Set as Primary Gateway</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={gwData.is_fallback}
                      onChange={(e) => setGwData('is_fallback', e.target.checked)}
                      className="rounded text-purple-500 focus:ring-purple-500"
                    />
                    <span>Set as Fallback Relay</span>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setGatewayModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={gwProcessing}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    Save Gateway
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: TEST GATEWAY & TEST EMAIL */}
        {testModalOpen && editingGateway && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>Test Gateway: {editingGateway.name}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Send Live Test Email To:</label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-700 font-mono text-xs"
                  />
                </div>

                {testFeedback && (
                  <div className={`p-3 rounded-xl border text-xs font-medium ${
                    testFeedback.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    {testFeedback.message}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  disabled={testRunning}
                  onClick={() => handleExecuteGatewayTest(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Check Ping Only
                </button>

                <button
                  type="button"
                  disabled={testRunning}
                  onClick={() => handleExecuteGatewayTest(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {testRunning ? 'Testing...' : 'Send Test Email'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
