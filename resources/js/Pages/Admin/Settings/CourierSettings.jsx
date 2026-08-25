import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { 
  Truck, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, 
  ExternalLink, Key, Eye, EyeOff, Save, Sparkles, Building2, MapPin
} from 'lucide-react';
import axios from 'axios';

export default function CourierSettings({ settings = {}, providers = [] }) {
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
        message: err.response?.data?.message || 'Connection test failed.',
        details: err.response?.data?.error || err.message,
      });
    } finally {
      setTestingProvider(null);
    }
  };

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
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">API Base Endpoint</label>
                  <input
                    type="text"
                    value={data.steadfast_base_url}
                    onChange={(e) => setData('steadfast_base_url', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-hidden"
                    placeholder="https://portal.steadfast.com.bd/api/v1"
                  />
                  {errors.steadfast_base_url && <p className="text-rose-500 mt-1 font-semibold">{errors.steadfast_base_url}</p>}
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
