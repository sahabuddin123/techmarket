import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminModal from '../../../Components/Admin/AdminModal';
import { 
  Radio, Key, Sliders, CheckCircle2, AlertCircle, RefreshCw, 
  Send, Save, Eye, EyeOff, Building2, ExternalLink, ShieldCheck 
} from 'lucide-react';
import axios from 'axios';

export default function SmsGateways({ gateways = [] }) {
  const [selectedGatewaySlug, setSelectedGatewaySlug] = useState(gateways[0]?.slug || 'bulksmsbd');
  const [showSecret, setShowSecret] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testPhone, setTestPhone] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);

  const activeGateway = gateways.find(g => g.slug === selectedGatewaySlug) || gateways[0] || {};

  // Form State
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    is_active: Boolean(activeGateway.is_active),
    is_default: Boolean(activeGateway.is_default),
    credentials: {},
    settings: activeGateway.settings || {},
  });

  // Switch Active Tab
  const handleSelectTab = (slug) => {
    setSelectedGatewaySlug(slug);
    const target = gateways.find(g => g.slug === slug);
    if (target) {
      setData({
        is_active: Boolean(target.is_active),
        is_default: Boolean(target.is_default),
        credentials: {},
        settings: target.settings || {},
      });
      setTestResult(null);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    post(`/admin/settings/sms-gateways/${activeGateway.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setTestResult(null);
      }
    });
  };

  const handleTestConnection = async (withPhone = false) => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await axios.post(`/admin/settings/sms-gateways/${activeGateway.id}/test`, {
        test_phone: withPhone ? testPhone : null,
      });

      setTestResult({
        success: response.data.success,
        message: response.data.message,
        balance: response.data.balance,
        details: response.data.details,
      });

      if (withPhone) {
        setShowTestModal(false);
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Connection test failed.',
        details: err.response?.data?.error || err.message,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <AdminShell title="SMS Gateways">
      <Head title="SMS Gateway Integrations - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="SMS Gateway Integrations"
          subtitle="Configure multiple local Bangladesh SMS API providers with automatic failover, masking, and balance checks."
          badge="Telecom APIs"
          actions={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleTestConnection(false)}
                disabled={testing || !activeGateway.is_active}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs inline-flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTestModal(true)}
                disabled={!activeGateway.is_active}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Real SMS</span>
              </button>
            </div>
          }
        />

        {recentlySuccessful && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Gateway credentials saved and validated successfully.</span>
          </div>
        )}

        {testResult && (
          <div className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs ${
            testResult.success 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />}
            <div className="space-y-1">
              <div className="font-bold">{testResult.message}</div>
              {testResult.balance !== undefined && (
                <div className="font-mono text-[11px]">Account Balance: ৳{testResult.balance}</div>
              )}
            </div>
          </div>
        )}

        {/* GATEWAY TABS & MAIN FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Gateway Selector Cards */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Available Providers</div>
            {gateways.map((gw) => {
              const isSelected = gw.slug === selectedGatewaySlug;
              return (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => handleSelectTab(gw.slug)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 shadow-xs' 
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{gw.name}</span>
                    <div className="flex items-center space-x-1.5">
                      {gw.is_default && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Default
                        </span>
                      )}
                      <div className={`w-2 h-2 rounded-full ${gw.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{gw.status_notes}</p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Gateway Settings Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-2xs text-xs">
              {/* Top Toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center space-x-2 font-heading">
                    <span>{activeGateway.name}</span>
                    <span className="text-xs font-mono font-normal text-slate-400">({activeGateway.driver})</span>
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">{activeGateway.status_notes}</p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Enable/Disable Toggle */}
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Active</span>
                  </label>

                  {/* Make Default Radio */}
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.is_default}
                      onChange={(e) => setData('is_default', e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Set Default</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Credentials Inputs */}
              <div className="space-y-4">
                {activeGateway.slug === 'bulksmsbd' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">API Key / Token *</label>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={data.credentials.api_key || ''}
                          onChange={(e) => setData('credentials', { ...data.credentials, api_key: e.target.value })}
                          placeholder={activeGateway.credentials_configured ? "•••••••••••••••• (Leave blank to keep existing)" : "Enter BulkSMS BD API Key"}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Approved Sender ID / Masking *</label>
                      <input
                        type="text"
                        value={data.credentials.sender_id || ''}
                        onChange={(e) => setData('credentials', { ...data.credentials, sender_id: e.target.value })}
                        placeholder="e.g. 8809612000000 or TECHMARKET"
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">HTTP API Base Endpoint</label>
                      <input
                        type="text"
                        value={data.settings?.base_url || 'http://bulksmsbd.net/api/smsapi'}
                        onChange={(e) => setData('settings', { ...data.settings, base_url: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                )}

                {activeGateway.slug === 'greenweb' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Greenweb API Token *</label>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={data.credentials.token || ''}
                          onChange={(e) => setData('credentials', { ...data.credentials, token: e.target.value })}
                          placeholder={activeGateway.credentials_configured ? "•••••••••••••••• (Leave blank to keep existing)" : "Enter Greenweb API Token"}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Greenweb HTTP Endpoint</label>
                      <input
                        type="text"
                        value={data.settings?.base_url || 'http://api.greenweb.com.bd/api.php'}
                        onChange={(e) => setData('settings', { ...data.settings, base_url: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Save Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-[11px]">
                  Credentials are encrypted at rest with AES-256-CBC.
                </span>

                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{processing ? 'Saving...' : 'Save Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Test SMS Modal */}
      {showTestModal && (
        <AdminModal
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
          title={`Dispatch Test SMS via ${activeGateway.name}`}
          subtitle="A test message with a 6-digit confirmation code will be sent to your mobile number."
          size="sm"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleTestConnection(true)}
                disabled={testing || !testPhone}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testing ? 'Sending...' : 'Dispatch Live SMS'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Recipient Mobile Number (BD Format) *</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="01711000000"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono text-xs"
              />
            </div>
          </div>
        </AdminModal>
      )}
    </AdminShell>
  );
}
