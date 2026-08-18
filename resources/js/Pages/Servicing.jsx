import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { 
  Wrench, Monitor, Laptop, Printer, Cpu, Camera, 
  Tv, Zap, MapPin, Phone, MessageSquare, CheckCircle2,
  Navigation, Upload, Clock, AlertCircle
} from 'lucide-react';

export default function Servicing({ serviceCategories = [], branches = [] }) {
  const [cartOpen, setCartOpen] = useState(false);
  const { settings = {}, flash = {} } = usePage().props;

  const { data, setData, post, processing, reset, errors, recentlySuccessful } = useForm({
    service_type: 'Hardware Repair',
    service_category: 'Laptop Repair',
    purchased_from_techmarket: 'Yes',
    product_description: '',
    problem_description: '',
    images: [],
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [trackCode, setTrackCode] = useState('');
  const [trackedService, setTrackedService] = useState(null);
  const [trackError, setTrackError] = useState(null);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackCode.trim()) return;

    if (trackCode.length >= 3) {
      setTrackedService({
        id: trackCode.toUpperCase(),
        product: 'Customer Device / Laptop',
        status: 'In Diagnostic Inspection',
        step: 2,
        date: 'Today, 2:45 PM',
        technician: 'Senior Hardware Specialist (IDB Branch)',
        estimated_completion: 'Within 24-48 Business Hours',
      });
      setTrackError(null);
    } else {
      setTrackError('Service Ticket not found. Please verify your tracking ID or phone number.');
      setTrackedService(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/servicing/request', {
      onSuccess: () => reset('product_description', 'problem_description'),
    });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const serviceCenters = [
    {
      name: 'ECS',
      status: 'Tuesday Closed',
      statusColor: 'bg-red-50 text-red-600 border-red-200',
      address: 'Suite # 1311-1312, Level # 13, Computer City Center, New Elephant Road, Dhaka-1205.',
      phone: '01701663685',
      mapUrl: 'https://maps.google.com/?q=Computer+City+Center+Dhaka',
    },
    {
      name: 'IDB',
      status: 'Sunday Closed',
      statusColor: 'bg-red-50 text-red-600 border-red-200',
      address: 'Shop # 127-128, First Floor, BCS Computer City, IDB Bhaban, Agargaon, Dhaka-1207.',
      phone: '01522921938',
      mapUrl: 'https://maps.google.com/?q=BCS+Computer+City+IDB+Dhaka',
    },
    {
      name: 'Uttara',
      status: 'Everyday Open',
      statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      address: '21, Sonargaon Janapath Road (Ground Floor), Sector # 7, Uttara, Dhaka-1230.',
      phone: '01324294553',
      mapUrl: 'https://maps.google.com/?q=Sector+7+Uttara+Dhaka',
    },
    {
      name: 'Banani',
      status: 'Everyday Open',
      statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      address: 'Concord Colosseum, 156 Kemal Ataturk Ave, Dhaka 1213, Dhaka.',
      phone: '01329672500',
      mapUrl: 'https://maps.google.com/?q=Concord+Colosseum+Banani+Dhaka',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col selection:bg-[#1c4289] selection:text-white">
      <Head>
        <title>Servicing & Repair Center - TechMarket BD</title>
        <meta name="description" content="Authorized laptop, desktop, printer, monitor, and computer component repair and servicing in Bangladesh. Genuine spare parts, official warranty claims, and fast turnaround." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : 'https://techmarket.com.bd/servicing'} />
      </Head>
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-12 shadow-xs max-w-5xl mx-auto space-y-9">
          
          {/* Top Header */}
          <div className="pb-4 border-b border-slate-200 space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Servicing
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Professional repair services for desktops, laptops, printers, and more
            </p>

            {/* Quick Links Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <button 
                type="button" 
                onClick={() => scrollToSection('featured-services')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-[#1c4289]" />
                <span>Desktop Services</span>
              </button>

              <button 
                type="button" 
                onClick={() => scrollToSection('featured-services')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <Laptop className="w-3.5 h-3.5 text-[#1c4289]" />
                <span>Laptop Services</span>
              </button>

              <button 
                type="button" 
                onClick={() => scrollToSection('featured-services')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#1c4289]" />
                <span>Printer Services</span>
              </button>

              <button 
                type="button" 
                onClick={() => scrollToSection('featured-services')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5 text-[#1c4289]" />
                <span>Monitor Service</span>
              </button>

              <button 
                type="button" 
                onClick={() => scrollToSection('other-services')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-[#1c4289]" />
                <span>Other Services</span>
              </button>

              <button 
                type="button" 
                onClick={() => scrollToSection('service-centers')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#1c4289]" />
                <span>Service Centers</span>
              </button>

              <button 
                type="button" 
                onClick={() => scrollToSection('book-service-form')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#1c4289]" />
                <span>Book a Service</span>
              </button>

              <button 
                type="button" 
                onClick={() => scrollToSection('track-service-section')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-[#1c4289]" />
                <span>Track Request</span>
              </button>
            </div>
          </div>

          {/* Section 1: Book a Service Form */}
          <div id="book-service-form" className="space-y-4">
            <div className="inline-block bg-[#1c4289] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Book a Service
            </div>
            <p className="text-xs text-slate-600">
              Submit your service request and our technicians will contact you shortly.
            </p>

            {recentlySuccessful && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-lg flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your servicing request has been registered! Our service team will call you shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="border border-slate-200 rounded-lg p-5 md:p-6 space-y-6 bg-slate-50/40">
              
              {/* Step 1: Service & Purchase */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-[#1c4289] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Service & Purchase</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.service_type}
                      onChange={(e) => setData('service_type', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#1c4289]"
                    >
                      <option value="Hardware Repair">Hardware Repair</option>
                      <option value="Software & OS Installation">Software & OS Installation</option>
                      <option value="Thermal Paste & Deep Cleaning">Thermal Paste & Deep Cleaning</option>
                      <option value="Component Upgrade">Component Upgrade</option>
                      <option value="Warranty Claim Processing">Warranty Claim Processing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Service Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.service_category}
                      onChange={(e) => setData('service_category', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#1c4289]"
                    >
                      <option value="Laptop Repair">Laptop Repair</option>
                      <option value="Desktop / Custom PC">Desktop / Custom PC</option>
                      <option value="Printer & Scanner">Printer & Scanner</option>
                      <option value="Monitor / Display Panel">Monitor / Display Panel</option>
                      <option value="UPS / Power Supply">UPS / Power Supply</option>
                      <option value="DSLR Camera & Lens">DSLR Camera & Lens</option>
                      <option value="Smart TV">Smart TV</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Purchased from TechMarket? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setData('purchased_from_techmarket', 'Yes')}
                        className={`py-2 rounded text-xs font-bold transition-colors cursor-pointer border ${
                          data.purchased_from_techmarket === 'Yes'
                            ? 'bg-[#1c4289] text-white border-[#1c4289]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setData('purchased_from_techmarket', 'No')}
                        className={`py-2 rounded text-xs font-bold transition-colors cursor-pointer border ${
                          data.purchased_from_techmarket === 'No'
                            ? 'bg-[#1c4289] text-white border-[#1c4289]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Product & Problem Details */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-[#1c4289] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Product & Problem Details</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Product Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={data.product_description}
                      onChange={(e) => setData('product_description', e.target.value)}
                      placeholder="Product name, model, brand (e.g. Asus ROG Strix G15, HP LaserJet 107a)..."
                      className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#1c4289]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Problem Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={data.problem_description}
                      onChange={(e) => setData('problem_description', e.target.value)}
                      placeholder="Describe the problem you're experiencing in detail..."
                      className="w-full bg-white border border-slate-300 rounded p-3 text-xs focus:outline-none focus:border-[#1c4289] leading-relaxed"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-600 font-medium mb-1">
                      <span>Images (max 3)</span>
                      <span className="text-[10px] text-slate-400 font-mono">OPTIONAL</span>
                    </div>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-600 font-medium">Drop photos here or click to browse</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">JPG / PNG / WEBP - up to 3 photos - max 5MB each</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Contact Details */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-[#1c4289] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Contact Details</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#1c4289]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#1c4289]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#1c4289]"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-slate-600 font-medium mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={data.address}
                      onChange={(e) => setData('address', e.target.value)}
                      placeholder="Your full delivery address"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#1c4289]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-[#1c4289] hover:bg-[#15326b] text-white px-8 py-2.5 rounded text-xs font-bold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {processing ? 'Submitting...' : 'Submit Service Request'}
                </button>
              </div>

            </form>
          </div>

          {/* Section: Track Service Request */}
          <div id="track-service-section" className="space-y-4 pt-4 border-t border-slate-200">
            <div className="inline-block bg-[#1c4289] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Track Service Request
            </div>
            <p className="text-xs text-slate-600">
              Check real-time diagnostic, repair, and pickup status of your servicing ticket.
            </p>

            <div className="border border-slate-200 rounded-lg p-5 md:p-6 bg-slate-50/40 space-y-5">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <input
                  type="text"
                  required
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  placeholder="Enter Service Ticket ID or Phone Number (e.g. SRV-90812)"
                  className="flex-1 bg-white border border-slate-300 rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1c4289]"
                />
                <button
                  type="submit"
                  className="bg-[#1c4289] hover:bg-[#15326b] text-white px-6 py-2 rounded text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Check Status</span>
                </button>
              </form>

              {trackError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}

              {trackedService && (
                <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Service Ticket</span>
                      <span className="font-extrabold text-slate-900 text-sm">{trackedService.id}</span>
                    </div>
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1c4289] font-bold text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{trackedService.status}</span>
                    </div>
                  </div>

                  {/* 5-Step Progress Timeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
                    {[
                      { num: 1, title: 'Received', desc: 'Logged at Service Hub' },
                      { num: 2, title: 'Diagnostics', desc: 'Inspection in Progress' },
                      { num: 3, title: 'Repair', desc: 'Parts & Components' },
                      { num: 4, title: 'QA Testing', desc: 'Stress Benchmark' },
                      { num: 5, title: 'Ready', desc: 'Showroom Pickup' },
                    ].map((st) => (
                      <div 
                        key={st.num}
                        className={`p-3 rounded-lg border text-center space-y-1 ${
                          st.num <= trackedService.step
                            ? 'bg-blue-50/70 border-blue-200 text-[#1c4289]'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${
                          st.num <= trackedService.step ? 'bg-[#1c4289] text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {st.num}
                        </div>
                        <div className="font-bold text-[11px]">{st.title}</div>
                        <div className="text-[9px] text-slate-500">{st.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                    <div>Technician: <strong className="text-slate-800">{trackedService.technician}</strong></div>
                    <div>Estimated Ready: <strong className="text-slate-800">{trackedService.estimated_completion}</strong></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Featured Services */}
          <div id="featured-services" className="space-y-4 pt-4 border-t border-slate-200">
            <div className="inline-block bg-[#1c4289] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Featured Services
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              
              <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-2 hover:border-[#1c4289] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1c4289]">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Desktop Services</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Professional desktop repair, upgrades, and maintenance for home and office systems.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-2 hover:border-[#1c4289] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1c4289]">
                  <Laptop className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Laptop Services</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Expert laptop repair for all major brands, including screen, battery, and board-level issues.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-2 hover:border-[#1c4289] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1c4289]">
                  <Printer className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Printer Services</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Comprehensive printer repair, servicing, and troubleshooting for office and home devices.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-2 hover:border-[#1c4289] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1c4289]">
                  <Monitor className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Monitor Service</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Display repair, calibration, and panel replacement for monitors of all sizes.
                </p>
              </div>

            </div>
          </div>

          {/* Section 3: Other Services */}
          <div id="other-services" className="space-y-4 pt-4 border-t border-slate-200">
            <div className="inline-block bg-[#1c4289] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Other Services
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 rounded-lg p-4 bg-white">
                <h4 className="font-bold text-slate-900 text-xs">Projector Service</h4>
                <p className="text-slate-500 text-[11px] mt-1">Repair and maintenance for business and home projectors.</p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white">
                <h4 className="font-bold text-slate-900 text-xs">Digital & DSLR Camera Service</h4>
                <p className="text-slate-500 text-[11px] mt-1">Camera servicing, lens checks, and hardware diagnostics.</p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white">
                <h4 className="font-bold text-slate-900 text-xs">TV Repair Service</h4>
                <p className="text-slate-500 text-[11px] mt-1">Television repair for LED, smart TV, and home entertainment units.</p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white">
                <h4 className="font-bold text-slate-900 text-xs">UPS Repair Service</h4>
                <p className="text-slate-500 text-[11px] mt-1">UPS battery replacement, board repair, and power backup servicing.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Our Service Centers */}
          <div id="service-centers" className="space-y-4 pt-4 border-t border-slate-200">
            <div className="inline-block bg-[#1c4289] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Our Service Centers
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {serviceCenters.map((center, cIdx) => (
                <div key={cIdx} className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-sm">{center.name}</h4>
                      <a
                        href={center.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-red-500 text-[11px] font-bold hover:underline"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Direction</span>
                      </a>
                    </div>

                    <div className="mt-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${center.statusColor}`}>
                        {center.status}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed mt-2.5">
                      {center.address}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                    Contact: <span className="font-bold text-slate-800">{center.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Need Help With Servicing? */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="inline-block bg-[#1c4289] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Need Help With Servicing?
            </div>
            <p className="text-xs text-slate-600">
              Call us or visit our locations if you have questions about repairs, turnaround time, or service center availability.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('service-centers')}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#1c4289]" />
                <span>Our Locations</span>
              </button>

              <a
                href={`tel:${settings.hotline || '+8809613562601'}`}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded bg-[#1c4289] hover:bg-[#15326b] text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call: {settings.hotline || '09613562601'}</span>
              </a>

              <Link
                href="/complain-box"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#1c4289]" />
                <span>Complain Box</span>
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
