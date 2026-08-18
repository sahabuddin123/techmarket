import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Truck, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, 
  ExternalLink, Key, Eye, EyeOff, Save, Sparkles, Building2, MapPin
} from 'lucide-react';
import axios from 'axios';

export default function CourierSettings({ settings, providers }) {
  const [activeTab, setActiveTab] = useState('steadfast');
  const [showSteadfastSecret, setShowSteadfastSecret] = useState(false);
  const [showPathaoSecret, setShowPathaoSecret] = useState(false);
  const [showPathaoPassword, setShowPathaoPassword] = useState(false);

  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    // Steadfast
    steadfast_enabled: Boolean(settings.steadfast_enabled),
    steadfast_base_url: settings.steadfast_base_url || 'https://portal.steadfast.com.bd/api/v1',
    steadfast_api_key: settings.steadfast_api_key || '',
    steadfast_secret_key: '',
    steadfast_default_pickup: settings.steadfast_default_pickup || 'TechMarket BD Showroom Hub, Multiplan Center, Elephant Road, Dhaka',

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
      const res = await axios.post('/admin/settings/courier/test', { provider });
      setTestResult({
        provider,
        success: res.data.success,
        message: res.data.message,
        details: res.data.details,
      });
    } catch (err) {
      setTestResult({
        provider,
        success: false,
        message: err.response?.data?.message || err.message || 'Connection test failed.',
      });
    } finally {
      setTestingProvider(null);
    }
  };

  return (
    <AdminLayout title="Courier Integrations & API Settings">
      <Head title="Courier Settings - Admin Back-Office" />

      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2.5">
              <Truck className="w-7 h-7 text-amber-500" />
              <span>Courier Integrations & Logistics</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Configure Steadfast & Pathao Courier APIs for automated consignment generation, live tracking & COD settlements.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => router.visit('/admin/shipments')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-2"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>View All Shipments</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => { setActiveTab('steadfast'); setTestResult(null); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2.5 transition-all ${
              activeTab === 'steadfast'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Steadfast Courier</span>
            {data.steadfast_enabled && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase bg-slate-950/20 text-slate-950">Active</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('pathao'); setTestResult(null); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2.5 transition-all ${
              activeTab === 'pathao'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span>Pathao Courier</span>
            {data.pathao_enabled && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase bg-slate-950/20 text-slate-950">Active</span>
            )}
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: STEADFAST COURIER */}
          {activeTab === 'steadfast' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-black text-white uppercase flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-xs">API v1</span>
                    <span>Steadfast Courier Configuration</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
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
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                  <span className="text-xs font-bold text-slate-200">
                    {data.steadfast_enabled ? 'Courier Active' : 'Courier Disabled'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Base API URL */}
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1.5">API Base Endpoint</label>
                  <input
                    type="text"
                    value={data.steadfast_base_url}
                    onChange={(e) => setData('steadfast_base_url', e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-3 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
                    placeholder="https://portal.steadfast.com.bd/api/v1"
                  />
                  {errors.steadfast_base_url && <p className="text-rose-400 mt-1 font-semibold">{errors.steadfast_base_url}</p>}
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Steadfast API Key *</span>
                  </label>
                  <input
                    type="text"
                    value={data.steadfast_api_key}
                    onChange={(e) => setData('steadfast_api_key', e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-3 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
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
                      className="w-full bg-slate-950 text-slate-200 p-3 pr-10 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
                      placeholder={settings.steadfast_secret_key_configured ? "Leave blank to keep existing Secret" : "Enter Steadfast Secret Key"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSteadfastSecret(!showSteadfastSecret)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showSteadfastSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Default Pickup Location */}
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Default Pickup Location Note / Warehouse</span>
                  </label>
                  <input
                    type="text"
                    value={data.steadfast_default_pickup}
                    onChange={(e) => setData('steadfast_default_pickup', e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-3 rounded-xl border border-slate-800 focus:border-amber-500 text-xs"
                    placeholder="TechMarket Showroom Hub, Multiplan Center, Elephant Road, Dhaka"
                  />
                </div>
              </div>

              {/* Test Connection Button & Result */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => handleTestConnection('steadfast')}
                  disabled={testingProvider === 'steadfast'}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-400 rounded-xl font-bold text-xs transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingProvider === 'steadfast' ? 'animate-spin' : ''}`} />
                  <span>{testingProvider === 'steadfast' ? 'Testing Steadfast...' : 'Test Connection'}</span>
                </button>

                {testResult && testResult.provider === 'steadfast' && (
                  <div className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
                    testResult.success 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PATHAO COURIER */}
          {activeTab === 'pathao' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-black text-white uppercase flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded text-xs">OAuth 2.0</span>
                    <span>Pathao Courier Hermes API Configuration</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect Pathao Merchant OAuth Credentials for automated booking & zone dispatch.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.pathao_enabled}
                      onChange={(e) => setData('pathao_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                  <span className="text-xs font-bold text-slate-200">
                    {data.pathao_enabled ? 'Courier Active' : 'Courier Disabled'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Environment Mode */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Environment Mode</label>
                  <select
                    value={data.pathao_environment}
                    onChange={(e) => {
                      const env = e.target.value;
                      setData('pathao_environment', env);
                      setData('pathao_base_url', env === 'sandbox' ? 'https://courier-api-sandbox.pathao.com' : 'https://api-hermes.pathao.com');
                    }}
                    className="w-full bg-slate-950 text-slate-200 p-3 rounded-xl border border-slate-800 focus:border-amber-500 text-xs font-bold"
                  >
                    <option value="live">Live Production (api-hermes.pathao.com)</option>
                    <option value="sandbox">Sandbox Test (courier-api-sandbox.pathao.com)</option>
                  </select>
                </div>

                {/* Base API URL */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Base Endpoint URL</label>
                  <input
                    type="text"
                    value={data.pathao_base_url}
                    onChange={(e) => setData('pathao_base_url', e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-3 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
                    placeholder="https://api-hermes.pathao.com"
                  />
                </div>

                {/* Client ID */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pathao Client ID *</span>
                  </label>
                  <input
                    type="text"
                    value={data.pathao_client_id}
                    onChange={(e) => setData('pathao_client_id', e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-3 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
                    placeholder="Enter Client ID"
                  />
                </div>

                {/* Client Secret */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pathao Client Secret *</span>
                    </span>
                    {settings.pathao_client_secret_configured && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ Configured in DB
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPathaoSecret ? "text" : "password"}
                      value={data.pathao_client_secret}
                      onChange={(e) => setData('pathao_client_secret', e.target.value)}
                      className="w-full bg-slate-950 text-slate-200 p-3 pr-10 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
                      placeholder={settings.pathao_client_secret_configured ? "Leave blank to keep existing Secret" : "Enter Client Secret"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPathaoSecret(!showPathaoSecret)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPathaoSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Pathao Merchant Username / Email *</label>
                  <input
                    type="text"
                    value={data.pathao_username}
                    onChange={(e) => setData('pathao_username', e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-3 rounded-xl border border-slate-800 focus:border-amber-500 text-xs"
                    placeholder="merchant@domain.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                    <span>Pathao Account Password *</span>
                    {settings.pathao_password_configured && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ Configured in DB
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPathaoPassword ? "text" : "password"}
                      value={data.pathao_password}
                      onChange={(e) => setData('pathao_password', e.target.value)}
                      className="w-full bg-slate-950 text-slate-200 p-3 pr-10 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
                      placeholder={settings.pathao_password_configured ? "Leave blank to keep existing Password" : "Enter Pathao Password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPathaoPassword(!showPathaoPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPathaoPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Store ID */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Default Store / Warehouse ID</span>
                  </label>
                  <input
                    type="text"
                    value={data.pathao_store_id}
                    onChange={(e) => setData('pathao_store_id', e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-3 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
                    placeholder="1"
                  />
                </div>

                {/* Default Pickup Note */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Default Pickup Branch Name</label>
                  <input
                    type="text"
                    value={data.pathao_default_pickup}
                    onChange={(e) => setData('pathao_default_pickup', e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-3 rounded-xl border border-slate-800 focus:border-amber-500 text-xs"
                    placeholder="TechMarket Central Showroom Hub"
                  />
                </div>
              </div>

              {/* Test Connection Button & Result */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => handleTestConnection('pathao')}
                  disabled={testingProvider === 'pathao'}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-rose-400 rounded-xl font-bold text-xs transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingProvider === 'pathao' ? 'animate-spin' : ''}`} />
                  <span>{testingProvider === 'pathao' ? 'Testing Pathao...' : 'Test Connection'}</span>
                </button>

                {testResult && testResult.provider === 'pathao' && (
                  <div className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
                    testResult.success 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="flex items-center justify-end space-x-4 pt-2">
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving Settings...' : 'Save Courier Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
