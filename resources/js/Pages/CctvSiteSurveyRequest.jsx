import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';
import ChatWidgetV3 from '@/Pages/Storefront/Version3/Components/ChatWidgetV3';
import {
  MapPin,
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  User,
  Phone,
  Mail,
  Camera,
  Layers,
  FileCheck
} from 'lucide-react';

export default function CctvSiteSurveyRequest({
  storefront_version = 'v3',
  defaultDistrict = 'Dhaka',
  user = null,
}) {
  const { props } = usePage();
  const activeVersion = getStorefrontVersion(storefront_version || props?.settings?.storefront_version || 'v3');
  const NavbarComponent = activeVersion.Navbar;
  const FooterComponent = activeVersion.Footer;
  const MobileBottomNavComponent = activeVersion.MobileBottomNav;

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [district, setDistrict] = useState(defaultDistrict);
  const [upazilaArea, setUpazilaArea] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (10:00 AM - 1:00 PM)');
  const [floorsCount, setFloorsCount] = useState(1);
  const [projectType, setProjectType] = useState('commercial_office');
  const [estimatedCameras, setEstimatedCameras] = useState(4);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        project_name: projectName,
        project_address: projectAddress,
        district: district,
        upazila_area: upazilaArea,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        floors_count: floorsCount,
        project_type: projectType,
        estimated_camera_count: estimatedCameras,
        notes: notes,
      };

      const res = await axios.post('/site-survey', payload);
      setSuccessData(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not submit site survey request. Please verify required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-800 font-poppins selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Head title="Request On-Site CCTV Survey & Technical Assessment | TechMarket BD" />

      {/* Storefront Navbar */}
      {NavbarComponent && <NavbarComponent />}

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Professional Surveillance Engineering Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Request an On-Site CCTV Site Survey
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Have a certified surveillance engineer inspect your premises, measure exact cable routing, calculate blind spots, and design an optimal CCTV architecture.
          </p>
        </div>

        {/* Success Confirmation or Form */}
        {successData ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-lg mx-auto space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 font-heading">Survey Request Submitted!</h2>
              <p className="text-xs text-slate-500">Our engineering department will contact you to verify premises access and dispatch a technician.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1">
              <div>Tracking Number: <span className="font-bold text-blue-600">{successData.survey_number}</span></div>
              <div>Status: <span className="font-bold uppercase text-amber-700">{successData.status}</span></div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/cctv-estimator"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Go to CCTV Builder
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Client Contact Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                1. Contact Person & Identification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Engr. Tanvir Ahmed"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 01711000000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. tanvir@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Premises Location & Scope */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                2. Premises Location & Building Scope
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Premises Type</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="commercial_office">Commercial Corporate Office</option>
                    <option value="residential_home">Residential Villa / Apartment</option>
                    <option value="warehouse_factory">Industrial Factory / Warehouse</option>
                    <option value="retail_shop">Retail Outlet / Shopping Complex</option>
                    <option value="educational_institution">School / University Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">District <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Dhaka, Chittagong, Gazipur"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Detailed Site Address <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={projectAddress}
                    onChange={(e) => setProjectAddress(e.target.value)}
                    placeholder="House/Plot number, Road number, Sector/Area, Landmark"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Estimates */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                3. Preferred Date & Approximate Requirements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Time Window</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                    <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
                    <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approximate Camera Points</label>
                  <input
                    type="number"
                    min="1"
                    max="128"
                    value={estimatedCameras}
                    onChange={(e) => setEstimatedCameras(Number(e.target.value))}
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
                <span>{submitting ? 'Submitting Request...' : 'Submit Site Survey Request'}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Floating Live Chat for Version 3 */}
      {storefront_version === 'v3' && <ChatWidgetV3 />}

      {/* Mobile Bottom Navigation */}
      {MobileBottomNavComponent && <MobileBottomNavComponent />}

      {/* Storefront Footer */}
      {FooterComponent && <FooterComponent />}
    </div>
  );
}
