import React, { useState, useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import PageHeader from '../../../Components/Admin/PageHeader';
import { 
  Send, Users, Phone, MessageSquare, AlertCircle, 
  Sparkles, CheckCircle2, Sliders, ArrowLeft, Clock
} from 'lucide-react';

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

export default function SendSms({ gateways = [], templates = [], customerCount = 0 }) {
  const { data, setData, post, processing, errors } = useForm({
    recipient_mode: 'single', // single, multiple, all_customers
    phone: '',
    multiple_phones: '',
    message: '',
    gateway_slug: gateways[0]?.slug || '',
    is_promotional: true,
  });

  const [confirmBulk, setConfirmBulk] = useState(false);

  const calculation = useMemo(() => {
    return calculateSmsParts(data.message);
  }, [data.message]);

  const handleTemplateSelect = (e) => {
    const tmplId = e.target.value;
    if (!tmplId) return;
    const tmpl = templates.find(t => String(t.id) === String(tmplId));
    if (tmpl) {
      setData('message', tmpl.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.recipient_mode === 'all_customers' && !confirmBulk) {
      if (!confirm(`Are you sure you want to dispatch this SMS to ${customerCount} eligible registered customers?`)) {
        return;
      }
    }
    post('/admin/communication/send-sms');
  };

  return (
    <AdminLayout title="Compose & Dispatch SMS">
      <Head title="Send SMS - Admin Back-Office" />

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <Link href="/admin/communication/sms-dashboard" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              COMPOSE & DISPATCH SMS
            </h1>
            <p className="text-xs text-slate-400">Broadcast promotional offers or send direct transactional notices to customers.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 space-y-6 shadow-xl text-xs">
          
          {/* RECIPIENT MODE SELECTOR */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold">Recipient Target Mode *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'single', label: 'Single Recipient', desc: 'Send to a specific mobile number', icon: Phone },
                { id: 'multiple', label: 'Multiple Numbers', desc: 'Paste a list of mobile numbers', icon: MessageSquare },
                { id: 'all_customers', label: `All Customers (${customerCount})`, desc: 'Broadcast to customer database', icon: Users },
              ].map((mode) => {
                const isSelected = data.recipient_mode === mode.id;
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setData('recipient_mode', mode.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <div className="font-bold text-xs">{mode.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RECIPIENT INPUT FIELDS */}
          {data.recipient_mode === 'single' && (
            <div>
              <label className="block text-slate-300 font-bold mb-1">Mobile Phone Number *</label>
              <input
                type="text"
                required
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
                placeholder="e.g. 01711000000 or 8801812345678"
                className="w-full bg-slate-950 text-slate-100 p-3 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
              />
              {errors.phone && <p className="text-rose-400 text-[11px] mt-1">{errors.phone}</p>}
            </div>
          )}

          {data.recipient_mode === 'multiple' && (
            <div>
              <label className="block text-slate-300 font-bold mb-1">List of Mobile Numbers (Comma or Newline separated) *</label>
              <textarea
                rows={4}
                required
                value={data.multiple_phones}
                onChange={(e) => setData('multiple_phones', e.target.value)}
                placeholder="01711000000&#10;01822000000&#10;01933000000"
                className="w-full bg-slate-950 text-slate-100 p-3 rounded-xl border border-slate-800 focus:border-amber-500 font-mono text-xs"
              />
              {errors.multiple_phones && <p className="text-rose-400 text-[11px] mt-1">{errors.multiple_phones}</p>}
            </div>
          )}

          {data.recipient_mode === 'all_customers' && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start space-x-3 text-xs text-amber-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <div className="font-bold">Customer Base Broadcast Notice</div>
                <p className="text-slate-400 mt-0.5">
                  This message will be queued and sent to all <span className="font-bold text-white">{customerCount}</span> registered customers with verified phone numbers. Customers who opted out of promotional messages will be automatically excluded.
                </p>
              </div>
            </div>
          )}

          {/* TEMPLATE PICKER HELPER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Load from Template (Optional)</label>
              <select
                onChange={handleTemplateSelect}
                defaultValue=""
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 text-xs"
              >
                <option value="">-- Choose existing template --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">SMS Gateway Route</label>
              <select
                value={data.gateway_slug}
                onChange={(e) => setData('gateway_slug', e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 text-xs font-mono"
              >
                {gateways.map(gw => (
                  <option key={gw.id} value={gw.slug}>{gw.name} {gw.is_default ? '(Default)' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* MESSAGE CONTENT */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold">SMS Message Content *</label>
            <textarea
              rows={5}
              required
              value={data.message}
              onChange={(e) => setData('message', e.target.value)}
              placeholder="Type your SMS message here in English or Bangla..."
              className="w-full bg-slate-950 text-slate-100 p-3.5 rounded-xl border border-slate-800 focus:border-amber-500 text-xs leading-relaxed"
            />
            {errors.message && <p className="text-rose-400 text-[11px] mt-1">{errors.message}</p>}

            {/* Segment Calculator */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px]">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-slate-500">Characters: </span>
                  <span className="font-bold text-white">{calculation.length}</span>
                </div>
                <div>
                  <span className="text-slate-500">Encoding: </span>
                  <span className={`font-bold ${calculation.isUnicode ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {calculation.isUnicode ? 'Unicode (Bangla)' : 'GSM-7 Standard'}
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

          {/* PROMOTIONAL TOGGLE */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.is_promotional}
                onChange={(e) => setData('is_promotional', e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <span className="text-slate-300 font-bold">Mark as Promotional SMS (respects quiet hours and customer opt-outs)</span>
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={processing || !data.message.trim()}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/10 cursor-pointer uppercase transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{processing ? 'Dispatching to Queue...' : 'Dispatch SMS'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
