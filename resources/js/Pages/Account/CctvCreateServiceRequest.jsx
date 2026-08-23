import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';
import ChatWidgetV3 from '@/Pages/Storefront/Version3/Components/ChatWidgetV3';
import {
  Wrench,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  Video
} from 'lucide-react';

export default function CctvCreateServiceRequest({
  storefront_version = 'v3',
  equipment = [],
  diagnosticQuestions = [],
}) {
  const { props } = usePage();
  const activeVersion = getStorefrontVersion(storefront_version || props?.settings?.storefront_version || 'v3');
  const NavbarComponent = activeVersion.Navbar;
  const FooterComponent = activeVersion.Footer;
  const MobileBottomNavComponent = activeVersion.MobileBottomNav;

  const [equipmentId, setEquipmentId] = useState(equipment[0]?.id || '');
  const [customerName, setCustomerName] = useState(props.auth?.user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(props.auth?.user?.phone || '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [problemCategory, setProblemCategory] = useState('camera');
  const [problemDescription, setProblemDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (10:00 AM - 1:00 PM)');
  const [diagnosticAnswers, setDiagnosticAnswers] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const selectedEquipment = equipment.find((e) => e.id === Number(equipmentId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        installed_equipment_id: equipmentId ? Number(equipmentId) : null,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        problem_category: problemCategory,
        problem_description: problemDescription,
        priority: priority,
        preferred_visit_date: preferredDate || null,
        preferred_time: preferredTime,
        diagnostic_answers: diagnosticAnswers,
      };

      const res = await axios.post('/account/cctv-services', payload);
      setSuccessData(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not submit service ticket. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-800 font-poppins selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Head title="Submit CCTV After-Sales Support Request | TechMarket BD" />

      {NavbarComponent && <NavbarComponent />}

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            <Wrench className="w-3.5 h-3.5" />
            <span>After-Sales Engineering & Warranty Support</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Submit a CCTV Service Request
          </h1>
          <p className="text-xs text-slate-500">
            Report hardware faults, signal loss, recording errors, or schedule maintenance visits.
          </p>
        </div>

        {successData ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-lg mx-auto space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 font-heading">Service Ticket Created!</h2>
              <p className="text-xs text-slate-500">An after-sales engineer has been notified to diagnose and attend to your request.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1">
              <div>Ticket Number: <span className="font-bold text-blue-600">{successData.ticket_number}</span></div>
              <div>Warranty Coverage: <span className={`font-bold uppercase ${successData.warranty_covered ? 'text-emerald-600' : 'text-amber-700'}`}>{successData.warranty_covered ? 'Covered (Free Service)' : 'Out of Warranty (Chargeable)'}</span></div>
            </div>

            <Link
              href="/account/cctv-services"
              className="inline-block w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
            >
              View My Support Tickets
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Target Equipment */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                1. Affected Equipment / Device
              </h3>

              {equipment.length > 0 ? (
                <div className="space-y-2">
                  <label className="block font-bold text-xs text-slate-700">Select Installed Device</label>
                  <select
                    value={equipmentId}
                    onChange={(e) => setEquipmentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium"
                  >
                    {equipment.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.camera_name || item.product_name_snapshot} (S/N: {item.serial_number}) - {item.location_floor || 'General'}
                      </option>
                    ))}
                  </select>

                  {selectedEquipment?.warranty && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Warranty Active until {new Date(selectedEquipment.warranty.warranty_end).toLocaleDateString()}</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase font-bold bg-emerald-100 px-2 py-0.5 rounded-md">Free Diagnostics</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  No registered equipment selected. Service request will be recorded as general CCTV support.
                </div>
              )}
            </div>

            {/* Problem Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                2. Problem Symptom & Description
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Category <span className="text-rose-500">*</span></label>
                  <select
                    value={problemCategory}
                    onChange={(e) => setProblemCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="camera">Camera Signal Loss / No Video</option>
                    <option value="recording">NVR/DVR Not Recording</option>
                    <option value="playback">Playback / Footage Retrieval Error</option>
                    <option value="night_vision">IR Night Vision Dark / Blurred</option>
                    <option value="mobile_app">Mobile App Remote Viewing Offline</option>
                    <option value="power">Power Supply / Adapter Failure</option>
                    <option value="cable">Physical Cable Damage</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urgency Priority <span className="text-rose-500">*</span></label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="low">Low (General Inquiry / Alignment)</option>
                    <option value="normal">Normal (Single Camera Offline)</option>
                    <option value="high">High (Multiple Cameras / Recording Down)</option>
                    <option value="urgent">Urgent (Entire System Down / Security Breach)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Detailed Problem Description <span className="text-rose-500">*</span></label>
                  <textarea
                    rows={3}
                    required
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="Describe what happened, error codes on screen, or when the failure occurred..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Premise Address & Contact */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                3. Service Location & Schedule
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Premises Address <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="House, Road, Area for technician visit"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Ticket...' : 'Submit Service Ticket'}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {storefront_version === 'v3' && <ChatWidgetV3 />}
      {MobileBottomNavComponent && <MobileBottomNavComponent />}
      {FooterComponent && <FooterComponent />}
    </div>
  );
}
