import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { 
  Truck, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, 
  ExternalLink, Key, Eye, EyeOff, Save, Sparkles, Building2, MapPin,
  Copy, Check, Link2, Radio, Info, Shield
} from 'lucide-react';
import axios from 'axios';

export default function CourierSettings({ settings = {}, providers = [] }) {
  const [activeTab, setActiveTab] = useState('steadfast');
  const [showSteadfastSecret, setShowSteadfastSecret] = useState(false);
  const [showPathaoSecret, setShowPathaoSecret] = useState(false);
  const [showPathaoPassword, setShowPathaoPassword] = useState(false);

  // Webhook integration state
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [copiedWebhookToken, setCopiedWebhookToken] = useState(false);
  const [showWebhookToken, setShowWebhookToken] = useState(false);

  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    // Steadfast
    steadfast_enabled: Boolean(settings.steadfast_enabled),
    steadfast_base_url: settings.steadfast_base_url || 'https://portal.packzy.com/api/v1',
    steadfast_api_key: settings.steadfast_api_key || '',
    steadfast_secret_key: '',
    steadfast_default_pickup: settings.steadfast_default_pickup || 'TechMarket BD Showroom Hub, Multiplan Center, Elephant Road, Dhaka',
    steadfast_webhook_token: settings.steadfast_webhook_token || '',

    // Pathao
    pathao_enabled: Boolean(settings.pathao_enabled),
    pathao_environment: settings.pathao_environment || 'live',
    pathao_base_url: settings.pathao_base_url || 'https://api-hermes.pathao.com',
    pathao_client_id: settings.pathao_client_id || '',
    pathao_client_secret: '',
    pathao_username: settings.pathao_username || '',
    pathao_password: '',
    pathao_store_id: settings.pathao_store_id || '1',
    pathao_default_pickup: settings.pathao_default_pickup || 'TechMarket Central Showroom Hub',
  });

  const handleSave = (e) => {
    e.preventDefault();
    post('/admin/settings/courier', {
      preserveScroll: true,
      onSuccess: () => {
        setTestResult(null);
      }
    });
  };

  const handleTestConnection = async (provider) => {
    setTestingProvider(provider);
    setTestResult(null);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const payload = {
        provider,
        api_key: provider === 'steadfast' ? data.steadfast_api_key : undefined,
        secret_key: provider === 'steadfast' ? data.steadfast_secret_key : undefined,
        base_url: provider === 'steadfast' ? data.steadfast_base_url : data.pathao_base_url,
        client_id: provider === 'pathao' ? data.pathao_client_id : undefined,
        client_secret: provider === 'pathao' ? data.pathao_client_secret : undefined,
        username: provider === 'pathao' ? data.pathao_username : undefined,
        password: provider === 'pathao' ? data.pathao_password : undefined,
      };

      const res = await axios.post('/admin/settings/courier/test', payload, {
        headers: {
          'Accept': 'application/json',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {})
        }
      });

      setTestResult({
        provider,
        success: res.data.success,
        message: res.data.message,
        details: res.data.details,
      });
    } catch (err) {
      console.error('Courier connection test error:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || (err.response?.status === 419 ? 'CSRF Token Expired - Please refresh the page' : null);
      setTestResult({
        provider,
        success: false,
        message: serverMsg || err.message || 'Connection test failed.',
        details: err.response?.data || err.message,
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleGenerateWebhookToken = () => {
    const array = new Uint8Array(20);
    window.crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setData('steadfast_webhook_token', token);
  };

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'url') {
        setCopiedWebhookUrl(true);
        setTimeout(() => setCopiedWebhookUrl(false), 2000);
      } else if (type === 'token') {
        setCopiedWebhookToken(true);
        setTimeout(() => setCopiedWebhookToken(false), 2000);
      }
    });
  };

  const webhookCallbackUrl = settings.steadfast_webhook_url || (typeof window !== 'undefined' ? `${window.location.origin}/api/v1/courier/webhook/steadfast` : 'https://techmarket.com.bd/api/v1/courier/webhook/steadfast');

  return (
    <AdminShell title="Courier Logistics Settings">
      <Head title="Courier Logistics API Settings - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Courier & Logistics Gateway Integrations"
          subtitle="Manage credentials and webhook polling for Steadfast, Pathao Hermes, and RedX couriers."
          badge="Delivery APIs"
        />

        {/* Tab Selector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2 shadow-2xs flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('steadfast')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'steadfast'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Steadfast Courier</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pathao')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'pathao'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Pathao Logistics</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: STEADFAST COURIER */}
          {activeTab === 'steadfast' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center space-x-2 font-heading">
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded text-xs">API v1</span>
                    <span>Steadfast Courier Configuration</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect your Steadfast Merchant Portal API Key & Secret Key.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.steadfast_enabled}
                      onChange={(e) => setData('steadfast_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {data.steadfast_enabled ? 'Courier Active' : 'Courier Disabled'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Base API URL */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold">API Base Endpoint</label>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      Official Gateway: portal.packzy.com
                    </span>
                  </div>
                  <input
                    type="text"
                    value={data.steadfast_base_url}
                    onChange={(e) => setData('steadfast_base_url', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-hidden"
                    placeholder="https://portal.packzy.com/api/v1"
                  />
                  {errors.steadfast_base_url && <p className="text-rose-500 mt-1 font-semibold">{errors.steadfast_base_url}</p>}

                  {data.steadfast_base_url && data.steadfast_base_url.includes('portal.steadfast.com.bd') && (
                    <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300">
                      <span className="flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>Notice: Steadfast's official live API Gateway is <strong>https://portal.packzy.com/api/v1</strong>. (portal.steadfast.com.bd domain has unresolvable DNS).</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setData('steadfast_base_url', 'https://portal.packzy.com/api/v1')}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 ml-2 cursor-pointer"
                      >
                        Use Official Gateway
                      </button>
                    </div>
                  )}
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Steadfast API Key *</span>
                  </label>
                  <input
                    type="text"
                    value={data.steadfast_api_key}
                    onChange={(e) => setData('steadfast_api_key', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-hidden"
                    placeholder="Enter Steadfast API Key"
                  />
                </div>

                {/* Secret Key */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Steadfast Secret Key *</span>
                    </span>
                    {settings.steadfast_secret_key_configured && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ Configured in DB
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showSteadfastSecret ? "text" : "password"}
                      value={data.steadfast_secret_key}
                      onChange={(e) => setData('steadfast_secret_key', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-hidden"
                      placeholder={settings.steadfast_secret_key_configured ? "Leave blank to keep existing Secret" : "Enter Steadfast Secret Key"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSteadfastSecret(!showSteadfastSecret)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showSteadfastSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Default Pickup Location Note / Warehouse</span>
                  </label>
                  <input
                    type="text"
                    value={data.steadfast_default_pickup}
                    onChange={(e) => setData('steadfast_default_pickup', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden text-xs"
                    placeholder="TechMarket Showroom Hub, Multiplan Center, Elephant Road, Dhaka"
                  />
                </div>

                {/* Steadfast Webhook Integration Section */}
                <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                        <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                        <span>Steadfast Webhook Integration</span>
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded text-[10px] font-mono font-bold">
                          Auto Status Sync
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Receive real-time delivery status updates and transit tracking pings directly from Steadfast Courier.
                      </p>
                    </div>
                    <a
                      href="https://steadfast.com.bd/user/webhook/add"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <span>Open Steadfast Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4 text-xs">
                    {/* Callback URL */}
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Callback URL (Paste into Steadfast "Callback Url")</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">POST Endpoint</span>
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          readOnly
                          value={webhookCallbackUrl}
                          className="flex-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs select-all focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(webhookCallbackUrl, 'url')}
                          className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition cursor-pointer shrink-0"
                        >
                          {copiedWebhookUrl ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Auth Token (Bearer) */}
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Shield className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Auth Token (Bearer) (Paste into Steadfast "Auth Token(Bearer)")</span>
                        </span>
                        {data.steadfast_webhook_token && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            Token Set
                          </span>
                        )}
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showWebhookToken ? "text" : "password"}
                            value={data.steadfast_webhook_token}
                            onChange={(e) => setData('steadfast_webhook_token', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-hidden"
                            placeholder="Click 'Generate Token' or enter your secret token"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWebhookToken(!showWebhookToken)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {showWebhookToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleGenerateWebhookToken}
                            className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl font-bold text-xs transition cursor-pointer"
                            title="Generate secure random Bearer token"
                          >
                            Generate Token
                          </button>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(data.steadfast_webhook_token, 'token')}
                            disabled={!data.steadfast_webhook_token}
                            className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                          >
                            {copiedWebhookToken ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Token</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        Steadfast will send this as <code className="font-mono bg-slate-200/60 dark:bg-slate-900 px-1 py-0.5 rounded text-[10px]">Authorization: Bearer &#123;token&#125;</code> to secure all incoming webhook calls.
                      </p>
                    </div>

                    {/* Step-by-step instructions */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
                      <div className="flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Setup in 3 steps: 1) Copy Callback URL ➔ 2) Generate & Copy Token ➔ 3) Paste & Save in Steadfast Portal.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => handleTestConnection('steadfast')}
                  disabled={testingProvider === 'steadfast'}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingProvider === 'steadfast' ? 'animate-spin' : ''}`} />
                  <span>{testingProvider === 'steadfast' ? 'Testing Steadfast...' : 'Test Connection'}</span>
                </button>

                {testResult && testResult.provider === 'steadfast' && (
                  <div className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
                    testResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pathao' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center space-x-2 font-heading">
                    <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded text-xs">OAuth 2.0</span>
                    <span>Pathao Courier Hermes API Configuration</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Connect Pathao Merchant OAuth Credentials for automated booking & zone dispatch.</p>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.pathao_enabled}
                      onChange={(e) => setData('pathao_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {data.pathao_enabled ? 'Courier Active' : 'Courier Disabled'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Environment Mode</label>
                  <select
                    value={data.pathao_environment}
                    onChange={(e) => {
                      const env = e.target.value;
                      setData('pathao_environment', env);
                      setData('pathao_base_url', env === 'sandbox' ? 'https://courier-api-sandbox.pathao.com' : 'https://api-hermes.pathao.com');
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-hidden"
                  >
                    <option value="live">Live Production (api-hermes.pathao.com)</option>
                    <option value="sandbox">Sandbox Test (courier-api-sandbox.pathao.com)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Base Endpoint URL</label>
                  <input
                    type="text"
                    value={data.pathao_base_url}
                    onChange={(e) => setData('pathao_base_url', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-hidden"
                    placeholder="https://api-hermes.pathao.com"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Pathao Client ID *</span>
                  </label>
                  <input
                    type="text"
                    value={data.pathao_client_id}
                    onChange={(e) => setData('pathao_client_id', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-hidden"
                    placeholder="Enter Client ID"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Pathao Client Secret *</span>
                    </span>
                    {settings.pathao_client_secret_configured && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        ✓ Configured in DB
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPathaoSecret ? "text" : "password"}
                      value={data.pathao_client_secret}
                      onChange={(e) => setData('pathao_client_secret', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-hidden"
                      placeholder={settings.pathao_client_secret_configured ? "Leave blank to keep existing Secret" : "Enter Client Secret"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPathaoSecret(!showPathaoSecret)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPathaoSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Pathao Merchant Username / Email *</label>
                  <input
                    type="text"
                    value={data.pathao_username}
                    onChange={(e) => setData('pathao_username', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                    placeholder="merchant@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                    <span>Pathao Account Password *</span>
                    {settings.pathao_password_configured && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        ✓ Configured in DB
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPathaoPassword ? "text" : "password"}
                      value={data.pathao_password}
                      onChange={(e) => setData('pathao_password', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-hidden"
                      placeholder={settings.pathao_password_configured ? "Leave blank to keep existing Password" : "Enter Account Password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPathaoPassword(!showPathaoPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPathaoPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Pathao Store ID *</label>
                  <input
                    type="text"
                    value={data.pathao_store_id}
                    onChange={(e) => setData('pathao_store_id', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-hidden"
                    placeholder="e.g. 12345"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Pickup Location Name</label>
                  <input
                    type="text"
                    value={data.pathao_default_pickup}
                    onChange={(e) => setData('pathao_default_pickup', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                    placeholder="TechMarket Central Showroom Hub"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => handleTestConnection('pathao')}
                  disabled={testingProvider === 'pathao'}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingProvider === 'pathao' ? 'animate-spin' : ''}`} />
                  <span>{testingProvider === 'pathao' ? 'Testing Pathao...' : 'Test Connection'}</span>
                </button>

                {testResult && testResult.provider === 'pathao' && (
                  <div className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
                    testResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Changes will immediately take effect for order consignment booking.</span>

            <div className="flex items-center space-x-3">
              {recentlySuccessful && (
                <span className="text-emerald-600 text-xs font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings Saved</span>
                </span>
              )}

              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? 'Saving...' : 'Save Courier Credentials'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
