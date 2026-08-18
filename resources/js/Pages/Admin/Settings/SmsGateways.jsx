import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import PageHeader from '../../../Components/Admin/PageHeader';
import SectionCard from '../../../Components/Admin/SectionCard';
import StatusBadge from '../../../Components/Admin/StatusBadge';
import { 
  Radio, Key, Sliders, CheckCircle2, AlertCircle, RefreshCw, 
  Send, Save, Eye, EyeOff, Sparkles, Building2, ExternalLink,
  ShieldCheck, HelpCircle, PhoneCall
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
      const payload = withPhone ? { test_phone: testPhone } : {};
      const res = await axios.post(`/admin/settings/sms-gateways/${activeGateway.id}/test`, payload);
      setTestResult({
        success: res.data.success,
        message: res.data.message,
        details: res.data.details,
      });
      if (withPhone && res.data.success) {
        setShowTestModal(false);
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Connection test failed.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <AdminLayout title="SMS Gateway Integrations & API Credentials">
      <Head title="SMS Gateways - Admin Back-Office" />

      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="SMS Gateways & Providers"
          subtitle="Configure official Bangladesh SMS providers (BulkSMS BD, MIM SMS, Greenweb) or custom HTTP APIs. Sensitive keys are encrypted at rest."
          badge="Telecom Hub"
          actions={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowTestModal(true)}
                disabled={!activeGateway.is_active}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold text-xs inline-flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test SMS</span>
              </button>
              <button
                type="button"
                onClick={() => handleTestConnection(false)}
                disabled={testing}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs inline-flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-amber-400' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>
          }
        />

        {/* FEEDBACK BANNER */}
        {recentlySuccessful && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Gateway settings and encrypted credentials updated successfully.</span>
          </div>
        )}

        {testResult && (
          <div className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs font-medium ${
            testResult.success 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <div className="space-y-1">
              <div className="font-bold">{testResult.message}</div>
              {testResult.details && (
                <pre className="text-[10px] font-mono bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 overflow-x-auto max-w-xl">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* GATEWAY TABS & MAIN FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Gateway Selector Cards */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Available Providers</div>
            {gateways.map((gw) => {
              const isSelected = gw.slug === selectedGatewaySlug;
              return (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => handleSelectTab(gw.slug)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-md shadow-amber-500/5' 
                      : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{gw.name}</span>
                    <div className="flex items-center space-x-1.5">
                      {gw.is_default && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Default
                        </span>
                      )}
                      <div className={`w-2 h-2 rounded-full ${gw.is_active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{gw.status_notes}</p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Gateway Settings Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 space-y-6 shadow-xl text-xs">
              
              {/* Top Toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
                    <span>{activeGateway.name}</span>
                    <span className="text-xs font-mono font-normal text-slate-400">({activeGateway.driver})</span>
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">{activeGateway.status_notes}</p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Enable/Disable Toggle */}
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5.5 rounded-full transition-colors relative ${data.is_active ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-transform ${data.is_active ? 'left-5' : 'left-0.75'}`} />
                    </div>
                    <span className="font-bold text-slate-300">Active</span>
                  </label>

                  {/* Make Default Radio */}
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.is_default}
                      onChange={(e) => setData('is_default', e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                    <span className="font-bold text-slate-300">Set Default</span>
                  </label>
                </div>
              </div>

              {/* DRIVER SPECIFIC FIELDS */}
              {activeGateway.driver === 'bulksmsbd' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">API Key *</label>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={data.credentials.api_key !== undefined ? data.credentials.api_key : ''}
                          onChange={(e) => setData('credentials', { ...data.credentials, api_key: e.target.value })}
                          placeholder={activeGateway.masked_credentials?.api_key || 'Enter BulkSMS BD API Key...'}
                          className="w-full bg-slate-950 text-slate-100 p-2.5 pr-10 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Leave blank to keep existing encrypted API key.</p>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Sender ID *</label>
                      <input
                        type="text"
                        value={data.credentials.sender_id !== undefined ? data.credentials.sender_id : (data.settings.sender_id || '')}
                        onChange={(e) => {
                          setData('credentials', { ...data.credentials, sender_id: e.target.value });
                          setData('settings', { ...data.settings, sender_id: e.target.value });
                        }}
                        placeholder={activeGateway.masked_credentials?.sender_id || 'e.g. 8809612XXXXXX or Brand Masking'}
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">API Base URL</label>
                    <input
                      type="text"
                      value={data.settings.base_url || 'http://bulksmsbd.net/api/smsapi'}
                      onChange={(e) => setData('settings', { ...data.settings, base_url: e.target.value })}
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {activeGateway.driver === 'mimsms' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Username *</label>
                      <input
                        type="text"
                        value={data.credentials.username !== undefined ? data.credentials.username : ''}
                        onChange={(e) => setData('credentials', { ...data.credentials, username: e.target.value })}
                        placeholder={activeGateway.masked_credentials?.username || 'Enter MIM SMS Username...'}
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">API Key *</label>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={data.credentials.api_key !== undefined ? data.credentials.api_key : ''}
                          onChange={(e) => setData('credentials', { ...data.credentials, api_key: e.target.value })}
                          placeholder={activeGateway.masked_credentials?.api_key || 'Enter MIM SMS API Key...'}
                          className="w-full bg-slate-950 text-slate-100 p-2.5 pr-10 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Sender ID *</label>
                      <input
                        type="text"
                        value={data.credentials.sender_id !== undefined ? data.credentials.sender_id : (data.settings.sender_id || '')}
                        onChange={(e) => {
                          setData('credentials', { ...data.credentials, sender_id: e.target.value });
                          setData('settings', { ...data.settings, sender_id: e.target.value });
                        }}
                        placeholder={activeGateway.masked_credentials?.sender_id || 'e.g. 88096XXXXXXXX'}
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">API Endpoint</label>
                      <input
                        type="text"
                        value={data.settings.base_url || 'https://api.mimsms.com/api/SmsSending/SMS'}
                        onChange={(e) => setData('settings', { ...data.settings, base_url: e.target.value })}
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeGateway.driver === 'greenweb' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">API Token *</label>
                    <div className="relative">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        value={data.credentials.token !== undefined ? data.credentials.token : ''}
                        onChange={(e) => setData('credentials', { ...data.credentials, token: e.target.value })}
                        placeholder={activeGateway.masked_credentials?.token || 'Enter Greenweb API Token...'}
                        className="w-full bg-slate-950 text-slate-100 p-2.5 pr-10 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Leave blank to keep existing encrypted token.</p>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">API Base URL</label>
                    <input
                      type="text"
                      value={data.settings.base_url || 'http://api.greenweb.com.bd/api.php'}
                      onChange={(e) => setData('settings', { ...data.settings, base_url: e.target.value })}
                      className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {activeGateway.driver === 'generic_http' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-bold mb-1">API Endpoint URL *</label>
                      <input
                        type="text"
                        value={data.settings.api_url || ''}
                        onChange={(e) => setData('settings', { ...data.settings, api_url: e.target.value })}
                        placeholder="https://api.yoursmsgateway.com/v1/send"
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">HTTP Method</label>
                      <select
                        value={data.settings.http_method || 'POST'}
                        onChange={(e) => setData('settings', { ...data.settings, http_method: e.target.value })}
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500"
                      >
                        <option value="POST">POST (JSON)</option>
                        <option value="GET">GET (Query String)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">API Key / Bearer Token</label>
                      <input
                        type={showSecret ? 'text' : 'password'}
                        value={data.credentials.api_key !== undefined ? data.credentials.api_key : ''}
                        onChange={(e) => setData('credentials', { ...data.credentials, api_key: e.target.value })}
                        placeholder={activeGateway.masked_credentials?.api_key || 'Bearer / API Token...'}
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Sender ID / Masking</label>
                      <input
                        type="text"
                        value={data.credentials.sender_id !== undefined ? data.credentials.sender_id : (data.settings.sender_id || '')}
                        onChange={(e) => {
                          setData('credentials', { ...data.credentials, sender_id: e.target.value });
                          setData('settings', { ...data.settings, sender_id: e.target.value });
                        }}
                        placeholder="e.g. TECHMARKET"
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Phone Number Field Name</label>
                      <input
                        type="text"
                        value={data.settings.phone_field || 'to'}
                        onChange={(e) => setData('settings', { ...data.settings, phone_field: e.target.value })}
                        placeholder="e.g. to, mobile, recipient, phone"
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Message Text Field Name</label>
                      <input
                        type="text"
                        value={data.settings.message_field || 'message'}
                        onChange={(e) => setData('settings', { ...data.settings, message_field: e.target.value })}
                        placeholder="e.g. message, text, msg, content"
                        className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Save Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Last verified: {activeGateway.last_tested_at || 'Never'}
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/10 cursor-pointer uppercase transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{processing ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* SEND TEST SMS MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <PhoneCall className="w-5 h-5 text-amber-500" />
              <span>Send Test SMS via {activeGateway.name}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enter a real 11-digit Bangladesh mobile number to test direct delivery.
            </p>

            <div>
              <label className="block text-slate-300 font-bold mb-1 text-xs">Recipient Phone *</label>
              <input
                type="text"
                required
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="017XXXXXXXX / 018XXXXXXXX"
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleTestConnection(true)}
                disabled={testing || !testPhone}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testing ? 'Sending...' : 'Dispatch Test'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
