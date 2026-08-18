import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import PageHeader from '../../../Components/Admin/PageHeader';
import SectionCard from '../../../Components/Admin/SectionCard';
import StatusBadge from '../../../Components/Admin/StatusBadge';
import { 
  FileText, Sparkles, Save, Eye, CheckCircle2, AlertCircle, 
  HelpCircle, Tag, Copy, Check, Send, RotateCcw, Flame
} from 'lucide-react';
import axios from 'axios';

// Client-side Unicode / GSM Calculator Helper
function calculateSmsParts(text = '') {
  const gsmRegex = /^[A-Za-z0-9\s\r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#%&'()*+,\-.\/:;<=>?¡¿üäö]*$/;
  const isUnicode = !gsmRegex.test(text);
  const length = text.length;

  if (length === 0) {
    return { length: 0, isUnicode: false, parts: 0, remaining: 160 };
  }

  if (isUnicode) {
    const single = 70;
    const multi = 67;
    const parts = length <= single ? 1 : Math.ceil(length / multi);
    const remaining = length <= single ? single - length : (parts * multi) - length;
    return { length, isUnicode: true, parts, remaining };
  } else {
    const single = 160;
    const multi = 153;
    const parts = length <= single ? 1 : Math.ceil(length / multi);
    const remaining = length <= single ? single - length : (parts * multi) - length;
    return { length, isUnicode: false, parts, remaining };
  }
}

export default function SmsTemplates({ templates = [] }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || 1);
  const [copiedVar, setCopiedVar] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0] || {};

  const { data, setData, post, processing, recentlySuccessful } = useForm({
    message: activeTemplate.message || '',
    is_active: Boolean(activeTemplate.is_active),
  });

  const handleSelectTemplate = (tmpl) => {
    setSelectedTemplateId(tmpl.id);
    setData({
      message: tmpl.message || '',
      is_active: Boolean(tmpl.is_active),
    });
    setPreviewData(null);
  };

  const handleInsertVariable = (varKey) => {
    const placeholder = `{{${varKey}}}`;
    setData('message', (data.message || '') + ' ' + placeholder);
    setCopiedVar(varKey);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    post(`/admin/communication/sms-templates/${activeTemplate.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setPreviewData(null);
      }
    });
  };

  const handleFetchPreview = async () => {
    setLoadingPreview(true);
    try {
      const res = await axios.post(`/admin/communication/sms-templates/${activeTemplate.id}/preview`, {
        message: data.message,
      });
      setPreviewData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const calculation = useMemo(() => {
    return calculateSmsParts(data.message);
  }, [data.message]);

  const categories = [
    { key: 'transactional', label: 'Order & Transactional' },
    { key: 'auth', label: 'Auth & Verification' },
    { key: 'admin_alert', label: 'Admin Security Alerts' },
  ];

  return (
    <AdminLayout title="SMS Templates & Dynamic Message Rules">
      <Head title="SMS Templates - Admin Back-Office" />

      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="SMS Template Automation Engine"
          subtitle="Manage automated SMS notifications for customers and administrators. Supports Bangla Unicode and dynamic variable placeholders."
          badge="Automations"
        />

        {recentlySuccessful && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Template '{activeTemplate.name}' saved and synced with active dispatchers.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Template List by Category */}
          <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
            {categories.map((cat) => {
              const catTemplates = templates.filter(t => t.category === cat.key);
              if (catTemplates.length === 0) return null;

              return (
                <div key={cat.key} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    {cat.label} ({catTemplates.length})
                  </div>
                  {catTemplates.map((t) => {
                    const isSelected = t.id === selectedTemplateId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTemplate(t)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-xs'
                            : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs truncate max-w-[170px]">{t.name}</span>
                          <div className={`w-2 h-2 rounded-full ${t.is_active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">{t.event_key}</div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Right Column: Template Editor */}
          <div className="lg:col-span-3 space-y-6">
            <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 space-y-6 shadow-xl text-xs">
              
              {/* Top Template Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
                    <span>{activeTemplate.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700">
                      {activeTemplate.event_key}
                    </span>
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Category: <span className="capitalize font-bold text-slate-300">{activeTemplate.category?.replace('_', ' ')}</span> • Recipient: <span className="capitalize font-bold text-slate-300">{activeTemplate.recipient_type}</span>
                  </p>
                </div>

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
                  <span className="font-bold text-slate-300">Enable Automated SMS</span>
                </label>
              </div>

              {/* Dynamic Variables Tool Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    <span>Insert Dynamic Variables</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Click variable tag to insert into template text</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(activeTemplate.variables || [
                    'customer_name', 'order_number', 'order_total', 'courier_name', 
                    'tracking_number', 'store_name', 'store_phone', 'invoice_url'
                  ]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-amber-400 font-mono text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <span>{`{{${v}}}`}</span>
                      {copiedVar === v ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Text Area */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">SMS Content *</label>
                <textarea
                  rows={5}
                  required
                  value={data.message}
                  onChange={(e) => setData('message', e.target.value)}
                  placeholder="Enter message template text with {{placeholders}}..."
                  className="w-full bg-slate-950 text-slate-100 p-3.5 rounded-xl border border-slate-800 focus:border-amber-500 font-sans text-xs leading-relaxed"
                />

                {/* Live Character & Segment Telemetry Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px]">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-slate-500">Characters: </span>
                      <span className="font-bold text-white">{calculation.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Encoding: </span>
                      <span className={`font-bold ${calculation.isUnicode ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {calculation.isUnicode ? 'Unicode (Bangla / Special)' : 'GSM-7 Standard'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Estimated Parts: </span>
                      <span className="font-bold text-amber-400">{calculation.parts} SMS</span>
                    </div>
                  </div>

                  <div className="text-slate-400 text-[10px]">
                    Remaining in part: <span className="text-slate-200 font-bold">{calculation.remaining}</span> chars
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleFetchPreview}
                  disabled={loadingPreview}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>{loadingPreview ? 'Rendering...' : 'Render Live Preview'}</span>
                </button>

                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/10 cursor-pointer uppercase"
                >
                  <Save className="w-4 h-4" />
                  <span>{processing ? 'Saving...' : 'Save Template'}</span>
                </button>
              </div>
            </form>

            {/* LIVE RENDERED PREVIEW CARD */}
            {previewData && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-xs text-amber-400 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Live Rendered SMS Sample</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {previewData.calculation?.parts} SMS Parts ({previewData.calculation?.length} Chars)
                  </span>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 font-sans text-xs text-slate-100 leading-relaxed shadow-inner">
                  {previewData.rendered_text}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
