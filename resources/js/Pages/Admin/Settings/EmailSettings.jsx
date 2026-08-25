import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminModal from '../../../Components/Admin/AdminModal';
import { 
  Server, Shield, Check, Save, Radio, Mail, 
  Send, AlertTriangle, Sliders, RefreshCw, Key, Globe, Plus, CheckCircle2, Trash2, Edit 
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
  const { data: globalData, setData: setGlobalData, post: postGlobal, processing: globalProcessing, recentlySuccessful } = useForm({
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

  const handleOpenNewGateway = () => {
    setEditingGateway(null);
    resetGw();
    setGatewayModalOpen(true);
  };

  const handleOpenEditGateway = (gw) => {
    setEditingGateway(gw);
    setGwData({
      id: gw.id,
      name: gw.name,
      driver: gw.driver,
      is_active: gw.is_active,
      is_default: gw.is_default,
      is_fallback: gw.is_fallback,
      from_name: gw.from_name || 'TechMarket BD',
      from_email: gw.from_email || 'noreply@techmarketbd.com',
      reply_to_email: gw.reply_to_email || 'support@techmarketbd.com',
      config: gw.config || {},
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
    <AdminShell title="Email Gateway Infrastructure">
      <Head title="Email Settings & Gateway Configuration - TechMarket Admin" />

      <div className="space-y-6 w-full max-w-none">
        {/* Page Header */}
        <AdminPageHeader
          title="Email System & Gateway Infrastructure"
          subtitle="Configure SMTP & Cloud API providers, credentials encryption, delivery rate limits, and fallback failover."
          badge="SMTP Fleet"
          actions={
            <button
              type="button"
              onClick={handleOpenNewGateway}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Email Provider</span>
            </button>
          }
        />

        {recentlySuccessful && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Email delivery settings updated successfully.</span>
          </div>
        )}

        {/* SECTION A: GATEWAY PROVIDERS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2 font-heading">
                <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Configured Email Gateways</span>
              </h2>
              <p className="text-[11px] text-slate-400">Primary and failover relay connections</p>
            </div>
            <span className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">AES-256 Encrypted</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gateways.map((gw) => (
              <div
                key={gw.id}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4.5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      {gw.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {gw.is_default && (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
                          PRIMARY
                        </span>
                      )}
                      {gw.is_fallback && (
                        <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold">
                          FALLBACK
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/60 text-[11px] font-mono space-y-1 text-slate-500">
                    <div className="flex justify-between">
                      <span>Driver:</span>
                      <strong className="text-slate-900 dark:text-slate-100 uppercase">{gw.driver}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>From Email:</span>
                      <strong className="text-slate-900 dark:text-slate-100">{gw.from_email}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleOpenTestGateway(gw)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Test Ping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditGateway(gw)}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Provider</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION B: GLOBAL MASTER SETTINGS */}
        <form onSubmit={handleSaveGlobalSettings} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-2xs space-y-4 text-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2 font-heading">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Global Dispatch & Rate Limits</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Default Sender Name</label>
              <input
                type="text"
                value={globalData.email_default_from_name}
                onChange={(e) => setGlobalData('email_default_from_name', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Default Sender Address</label>
              <input
                type="email"
                value={globalData.email_default_from_email}
                onChange={(e) => setGlobalData('email_default_from_email', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={globalProcessing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{globalProcessing ? 'Saving...' : 'Save Global Email Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Test Modal */}
      {testModalOpen && editingGateway && (
        <AdminModal
          isOpen={testModalOpen}
          onClose={() => setTestModalOpen(false)}
          title={`Test Connection: ${editingGateway.name}`}
          subtitle="Dispatch a live test email to verify SMTP handshake, TLS certificate, and authentication."
          size="sm"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteGatewayTest(true)}
                disabled={testRunning}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testRunning ? 'Sending...' : 'Send Test Email'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Target Test Email Address *</label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
              />
            </div>

            {testFeedback && (
              <div className={`p-3 rounded-xl border text-xs font-semibold ${
                testFeedback.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300' 
                  : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              }`}>
                {testFeedback.message}
              </div>
            )}
          </div>
        </AdminModal>
      )}

      {/* Gateway Edit Modal */}
      {gatewayModalOpen && (
        <AdminModal
          isOpen={gatewayModalOpen}
          onClose={() => setGatewayModalOpen(false)}
          title={editingGateway ? `Edit Gateway: ${editingGateway.name}` : 'Add New Email Gateway'}
          subtitle="Configure SMTP connection parameters and authentication credentials."
          size="lg"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setGatewayModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGateway}
                disabled={gwProcessing}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{gwProcessing ? 'Saving...' : 'Save Provider'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Gateway Name *</label>
                <input
                  type="text"
                  value={gwData.name}
                  onChange={(e) => setGwData('name', e.target.value)}
                  placeholder="e.g. Primary Gmail SMTP"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Driver Type *</label>
                <select
                  value={gwData.driver}
                  onChange={(e) => setGwData('driver', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                >
                  <option value="smtp">Standard SMTP</option>
                  <option value="ses">Amazon SES</option>
                  <option value="mailgun">Mailgun API</option>
                  <option value="sendgrid">SendGrid API</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Sender Email *</label>
                <input
                  type="email"
                  value={gwData.from_email}
                  onChange={(e) => setGwData('from_email', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Sender Name</label>
                <input
                  type="text"
                  value={gwData.from_name}
                  onChange={(e) => setGwData('from_name', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gwData.is_active}
                  onChange={(e) => setGwData('is_active', e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">Active</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gwData.is_default}
                  onChange={(e) => setGwData('is_default', e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">Set as Primary</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gwData.is_fallback}
                  onChange={(e) => setGwData('is_fallback', e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">Set as Failover Fallback</span>
              </label>
            </div>
          </div>
        </AdminModal>
      )}
    </AdminShell>
  );
}
