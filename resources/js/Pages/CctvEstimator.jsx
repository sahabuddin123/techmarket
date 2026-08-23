import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';
import ChatWidgetV3 from '@/Pages/Storefront/Version3/Components/ChatWidgetV3';
import {
  ShieldCheck,
  Video,
  HardDrive,
  Cable,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  FileText,
  Tag,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  Share2,
  Printer,
  Copy,
  Check,
  Building,
  MapPin,
  Clock,
  Zap,
  HelpCircle,
  X,
  Eye,
  SlidersHorizontal,
  Coins,
  Cpu,
  History,
  Scale,
  Maximize2,
  CheckCheck
} from 'lucide-react';

export default function CctvEstimator({
  storefront_version = 'v3',
  catalogCameras = [],
  catalogRecorders = [],
  catalogStorage = [],
  catalogCables = [],
  catalogAccessories = [],
  engineSettings = {},
}) {
  const { props } = usePage();
  const activeVersion = getStorefrontVersion(storefront_version || props?.settings?.storefront_version || 'v3');
  const NavbarComponent = activeVersion.Navbar;
  const FooterComponent = activeVersion.Footer;
  const MobileBottomNavComponent = activeVersion.MobileBottomNav;

  // Active Wizard Step (1: Project, 2: Requirements, 3: Cameras, 4: Recorder, 5: Storage, 6: Cable, 7: Accessories, 8: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Active Strategy Preset ('custom', 'budget', 'balanced', 'premium')
  const [activePreset, setActivePreset] = useState('balanced');
  const [isPresetComparisonOpen, setIsPresetComparisonOpen] = useState(false);
  const [presetData, setPresetData] = useState(null);
  const [loadingPresets, setLoadingPresets] = useState(false);

  // Step 1: Project Details
  const [projectName, setProjectName] = useState('Surveillance Security Setup');
  const [projectType, setProjectType] = useState('residential_home');
  const [locationDistrict, setLocationDistrict] = useState('Dhaka');
  const [locationAddress, setLocationAddress] = useState('');
  const [floorsCount, setFloorsCount] = useState(1);
  const [areasCount, setAreasCount] = useState(4);
  const [requireInstallation, setRequireInstallation] = useState(true);
  const [notes, setNotes] = useState('');

  // Step 2: Technical Requirements
  const [systemType, setSystemType] = useState('ip');
  const [totalCameras, setTotalCameras] = useState(4);
  const [outdoorCameras, setOutdoorCameras] = useState(2);
  const [ptzCameras, setPtzCameras] = useState(0);
  const [requiredResolutionMp, setRequiredResolutionMp] = useState(4.0);
  const [preferredCodec, setPreferredCodec] = useState('H.265+');
  const [recordingDays, setRecordingDays] = useState(engineSettings.default_recording_days || 15);
  const [recordingHoursPerDay, setRecordingHoursPerDay] = useState(engineSettings.default_recording_hours || 24);
  const [recordingMode, setRecordingMode] = useState('continuous');
  const [avgCableDistance, setAvgCableDistance] = useState(25);
  const [requireAudio, setRequireAudio] = useState(true);
  const [requireColorNightVision, setRequireColorNightVision] = useState(true);
  const [requireAiDetection, setRequireAiDetection] = useState(false);

  // Step 3-7: Component Selections
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [selectedRecorder, setSelectedRecorder] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedCable, setSelectedCable] = useState(null);
  const [selectedAccessories, setSelectedAccessories] = useState([]);

  // Budget Control Target
  const [targetBudget, setTargetBudget] = useState('');
  const [budgetEvaluation, setBudgetEvaluation] = useState(null);

  // Live Calculation State from Backend
  const [calculating, setCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [calculationError, setCalculationError] = useState(null);

  // Replacement Drawer State
  const [replacementModal, setReplacementModal] = useState({ open: false, type: null });

  // Technical Specs Modal State
  const [specModalProduct, setSpecModalProduct] = useState(null);

  // Component Comparison Modal State (for 2 products)
  const [comparisonItems, setComparisonItems] = useState([]);

  // In-session Configuration Timeline / History
  const [timelineEvents, setTimelineEvents] = useState([
    { text: 'Surveillance Project Initialized', time: new Date().toLocaleTimeString() }
  ]);

  const addTimelineEvent = useCallback((text) => {
    setTimelineEvents((prev) => [
      { text, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 7),
    ]);
  }, []);

  // Commercial Quote & Expert Review Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteRequestType, setQuoteRequestType] = useState('standard_quote'); // standard_quote, expert_review, site_survey, corporate_proposal
  const [quoteCustomerName, setQuoteCustomerName] = useState('');
  const [quoteCustomerPhone, setQuoteCustomerPhone] = useState('');
  const [quoteCustomerEmail, setQuoteCustomerEmail] = useState('');
  const [quoteCompanyName, setQuoteCompanyName] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteSuccessData, setQuoteSuccessData] = useState(null);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Cart conversion state
  const [cartAdding, setCartAdding] = useState(false);
  const [cartSuccessMessage, setCartSuccessMessage] = useState(null);

  // Filtered camera catalog matching current system architecture
  const filteredCameras = useMemo(() => {
    return catalogCameras.filter((c) => c.system_type === systemType || c.system_type === 'all');
  }, [catalogCameras, systemType]);

  // Filtered recorder catalog matching current system architecture
  const filteredRecorders = useMemo(() => {
    return catalogRecorders.filter((r) => r.system_type === systemType || r.system_type === 'all' || r.system_type === 'hybrid');
  }, [catalogRecorders, systemType]);

  // Selected camera count calculation
  const currentSelectedCameraCount = useMemo(() => {
    return selectedCameras.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }, [selectedCameras]);

  // Trigger Authoritative Live Calculation from Laravel Backend
  const executeCalculation = useCallback(async () => {
    setCalculating(true);
    setCalculationError(null);

    const items = [];

    // Add selected cameras
    selectedCameras.forEach((cam) => {
      items.push({
        product_id: cam.id,
        item_type: 'selected_camera',
        product_type: 'camera',
        sku: cam.sku,
        name: cam.title,
        unit_price: cam.price,
        quantity: cam.quantity || 1,
        metadata: {
          resolution_mp: cam.resolution_mp,
          environment: cam.environment,
        },
      });
    });

    // Add selected recorder
    if (selectedRecorder) {
      items.push({
        product_id: selectedRecorder.id,
        item_type: 'recording_device',
        product_type: selectedRecorder.product_type || 'nvr',
        sku: selectedRecorder.sku,
        name: selectedRecorder.title,
        unit_price: selectedRecorder.price,
        quantity: 1,
        metadata: {
          channel_count: selectedRecorder.channel_count,
          max_camera_resolution_mp: selectedRecorder.max_camera_resolution_mp,
        },
      });
    }

    // Add selected HDD
    if (selectedStorage) {
      items.push({
        product_id: selectedStorage.id,
        item_type: 'storage_drive',
        product_type: 'storage',
        sku: selectedStorage.sku,
        name: selectedStorage.title,
        unit_price: selectedStorage.price,
        quantity: selectedStorage.quantity || 1,
        metadata: {
          capacity_tb: selectedStorage.capacity_tb,
        },
      });
    }

    // Add selected Cable
    if (selectedCable) {
      items.push({
        product_id: selectedCable.id,
        item_type: 'transmission_cable',
        product_type: 'cable',
        sku: selectedCable.sku,
        name: selectedCable.title,
        unit_price: selectedCable.price,
        quantity: selectedCable.quantity || 1,
      });
    }

    // Add selected accessories
    selectedAccessories.forEach((acc) => {
      items.push({
        product_id: acc.id,
        item_type: acc.item_type || 'required_accessory',
        product_type: acc.product_type || 'accessory',
        sku: acc.sku,
        name: acc.title,
        unit_price: acc.price,
        quantity: acc.quantity || 1,
      });
    });

    // Add Installation Service if required
    if (requireInstallation) {
      const instService = catalogAccessories.find((a) => a.product_type === 'service');
      const baseFee = engineSettings.installation_base_charge || 1500;
      const perCamFee = (engineSettings.installation_per_camera_charge || 500) * totalCameras;
      const calcInstPrice = baseFee + perCamFee;

      items.push({
        product_id: instService?.id || null,
        item_type: 'installation_service',
        product_type: 'service',
        sku: instService?.sku || 'SVC-CCTV-INST',
        name: 'Professional CCTV Installation & Cabling Service',
        unit_price: calcInstPrice,
        quantity: 1,
      });
    }

    const payload = {
      requirements: {
        project_name: projectName,
        project_type: projectType,
        location_district: locationDistrict,
        location_address: locationAddress,
        floors_count: floorsCount,
        areas_count: areasCount,
        system_type: systemType,
        total_cameras: totalCameras,
        indoor_cameras: Math.max(0, totalCameras - outdoorCameras),
        outdoor_cameras: outdoorCameras,
        ptz_cameras: ptzCameras,
        required_resolution_mp: requiredResolutionMp,
        preferred_codec: preferredCodec,
        recording_days: recordingDays,
        recording_hours_per_day: recordingHoursPerDay,
        recording_mode: recordingMode,
        average_cable_distance_meters: avgCableDistance,
        require_audio: requireAudio,
        require_color_night_vision: requireColorNightVision,
        require_ai_detection: requireAiDetection,
        require_installation: requireInstallation,
        notes: notes,
      },
      items: items,
    };

    try {
      const response = await axios.post('/api/v1/cctv/estimates/calculate', payload);
      setCalculationResult(response.data.data);

      // Evaluate budget if specified
      if (targetBudget && Number(targetBudget) > 0) {
        const budgetRes = await axios.post('/api/v1/cctv/budget-evaluate', {
          ...payload,
          target_budget: Number(targetBudget),
        });
        setBudgetEvaluation(budgetRes.data.data);
      } else {
        setBudgetEvaluation(null);
      }
    } catch (err) {
      setCalculationError(err.response?.data?.message || 'Error calculating surveillance metrics.');
    } finally {
      setCalculating(false);
    }
  }, [
    projectName,
    projectType,
    locationDistrict,
    locationAddress,
    floorsCount,
    areasCount,
    systemType,
    totalCameras,
    outdoorCameras,
    ptzCameras,
    requiredResolutionMp,
    preferredCodec,
    recordingDays,
    recordingHoursPerDay,
    recordingMode,
    avgCableDistance,
    requireAudio,
    requireColorNightVision,
    requireAiDetection,
    requireInstallation,
    notes,
    selectedCameras,
    selectedRecorder,
    selectedStorage,
    selectedCable,
    selectedAccessories,
    catalogAccessories,
    engineSettings,
    targetBudget,
  ]);

  // Initial and reactive calculation trigger on requirements/item changes
  useEffect(() => {
    const timer = setTimeout(() => {
      executeCalculation();
    }, 200);
    return () => clearTimeout(timer);
  }, [executeCalculation]);

  // Auto-Select Recommended Components on first load if none selected
  useEffect(() => {
    if (selectedCameras.length === 0 && filteredCameras.length > 0) {
      const defaultCam = filteredCameras[0];
      setSelectedCameras([{ ...defaultCam, quantity: totalCameras }]);
    }
  }, [filteredCameras, totalCameras]);

  useEffect(() => {
    if (!selectedRecorder && filteredRecorders.length > 0) {
      const match = filteredRecorders.find((r) => r.channel_count >= totalCameras) || filteredRecorders[0];
      setSelectedRecorder(match);
    }
  }, [filteredRecorders, totalCameras]);

  useEffect(() => {
    if (!selectedStorage && catalogStorage.length > 0) {
      setSelectedStorage(catalogStorage[0]);
    }
  }, [catalogStorage]);

  useEffect(() => {
    if (!selectedCable && catalogCables.length > 0) {
      const match = catalogCables.find((c) => c.cable_type.includes(systemType === 'ip' ? 'cat6' : 'coaxial')) || catalogCables[0];
      setSelectedCable(match);
    }
  }, [catalogCables, systemType]);

  // Load Presets from Laravel for Comparison
  const fetchPresets = async () => {
    setLoadingPresets(true);
    try {
      const payload = {
        total_cameras: totalCameras,
        system_type: systemType,
        recording_days: recordingDays,
        average_cable_distance_meters: avgCableDistance,
        floors_count: floorsCount,
      };
      const res = await axios.post('/api/v1/cctv/presets', payload);
      setPresetData(res.data.data);
      setIsPresetComparisonOpen(true);
    } catch (err) {
      alert('Could not generate preset comparison from backend.');
    } finally {
      setLoadingPresets(false);
    }
  };

  // Apply a Strategy Preset
  const handleApplyPreset = (presetKey) => {
    setActivePreset(presetKey);
    addTimelineEvent(`Applied ${presetKey.toUpperCase()} System Strategy`);

    if (presetKey === 'budget') {
      setRequiredResolutionMp(2.0);
      setPreferredCodec('H.265');
      setRecordingDays(10);
      setRequireAiDetection(false);
      // Pick budget camera & recorder
      if (filteredCameras.length > 0) {
        const sorted = [...filteredCameras].sort((a, b) => a.price - b.price);
        setSelectedCameras([{ ...sorted[0], quantity: totalCameras }]);
      }
    } else if (presetKey === 'balanced') {
      setRequiredResolutionMp(4.0);
      setPreferredCodec('H.265+');
      setRecordingDays(15);
      setRequireColorNightVision(true);
      if (filteredCameras.length > 0) {
        const match = filteredCameras.find((c) => c.resolution_mp >= 4.0) || filteredCameras[0];
        setSelectedCameras([{ ...match, quantity: totalCameras }]);
      }
    } else if (presetKey === 'premium') {
      setRequiredResolutionMp(8.0);
      setPreferredCodec('H.265+');
      setRecordingDays(30);
      setRequireAiDetection(true);
      setRequireColorNightVision(true);
      if (filteredCameras.length > 0) {
        const sorted = [...filteredCameras].sort((a, b) => b.price - a.price);
        setSelectedCameras([{ ...sorted[0], quantity: totalCameras }]);
      }
    }

    setIsPresetComparisonOpen(false);
  };

  // Replace component selection
  const handleReplaceComponent = (item) => {
    if (replacementModal.type === 'camera') {
      setSelectedCameras([{ ...item, quantity: totalCameras }]);
      addTimelineEvent(`Replaced Camera with ${item.title}`);
    } else if (replacementModal.type === 'recorder') {
      setSelectedRecorder(item);
      addTimelineEvent(`Replaced Hub with ${item.title}`);
    } else if (replacementModal.type === 'storage') {
      setSelectedStorage(item);
      addTimelineEvent(`Replaced Storage with ${item.title}`);
    } else if (replacementModal.type === 'cable') {
      setSelectedCable(item);
      addTimelineEvent(`Replaced Cable with ${item.title}`);
    }
    setReplacementModal({ open: false, type: null });
  };

  // Add / Remove camera selections
  const handleToggleCamera = (camera) => {
    setSelectedCameras((prev) => {
      const exists = prev.find((c) => c.id === camera.id);
      if (exists) {
        addTimelineEvent(`Removed ${camera.title}`);
        return prev.filter((c) => c.id !== camera.id);
      } else {
        const remainingNeeded = Math.max(1, totalCameras - currentSelectedCameraCount);
        addTimelineEvent(`Added ${camera.title} (x${remainingNeeded})`);
        return [...prev, { ...camera, quantity: remainingNeeded }];
      }
    });
  };

  const handleUpdateCameraQty = (cameraId, delta) => {
    setSelectedCameras((prev) =>
      prev.map((c) => {
        if (c.id === cameraId) {
          const newQty = Math.max(1, (c.quantity || 1) + delta);
          return { ...c, quantity: newQty };
        }
        return c;
      })
    );
  };

  // Add Complete System to Cart with live revalidation
  const handleAddToCart = async () => {
    if (!calculationResult || !calculationResult.items) return;

    setCartAdding(true);
    setCartSuccessMessage(null);

    const payloadItems = calculationResult.items.map((item) => ({
      product_id: item.product_id,
      name: item.product_name_snapshot,
      sku: item.product_sku_snapshot,
      quantity: item.quantity,
      unit_price: item.unit_price_snapshot,
    }));

    try {
      const response = await axios.post('/cctv-estimator/add-to-cart', { items: payloadItems });
      if (response.data.status === 'success') {
        setCartSuccessMessage(response.data.message);
        setTimeout(() => {
          window.location.href = '/cart';
        }, 800);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not transfer items to cart. Please check availability.');
    } finally {
      setCartAdding(false);
    }
  };

  // Submit Formal Commercial Quote or Expert Review Request
  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setQuoteSubmitting(true);

    try {
      const savePayload = {
        requirements: calculationResult?.requirements_snapshot || {},
        items: calculationResult?.items?.map((item) => ({
          product_id: item.product_id,
          item_type: item.item_type,
          product_sku_snapshot: item.product_sku_snapshot,
          product_name_snapshot: item.product_name_snapshot,
          product_type: item.product_type,
          system_type: item.system_type,
          unit_price_snapshot: item.unit_price_snapshot,
          quantity: item.quantity,
          unit: item.unit,
          subtotal_price: item.subtotal_price,
          is_required: item.is_required,
        })) || [],
      };

      const estResponse = await axios.post('/api/v1/cctv/estimates', savePayload);
      const estNum = estResponse.data.data.estimate_number;

      const quotePayload = {
        customer_name: quoteCustomerName,
        customer_phone: quoteCustomerPhone,
        customer_email: quoteCustomerEmail,
        company_name: quoteCompanyName,
        notes: `[Request Type: ${quoteRequestType.toUpperCase()}] ${quoteNotes}`,
      };

      const qteResponse = await axios.post(`/api/v1/cctv/estimates/${estNum}/quote`, quotePayload);
      setQuoteSuccessData(qteResponse.data.data);
      addTimelineEvent(`Generated Official Quote #${qteResponse.data.data.quote_number}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quote request. Please verify required fields.');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  // Qualitative System Health Evaluation
  const healthStatus = useMemo(() => {
    if (!calculationResult?.validation) return { label: 'Evaluating', color: 'text-slate-400', bg: 'bg-slate-100' };
    if (!calculationResult.validation.is_compatible) return { label: 'Invalid System', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
    if (calculationResult.validation.warnings?.length > 0) return { label: 'Good (With Notes)', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    return { label: 'Optimal Architecture', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
  }, [calculationResult]);

  // Expansion Headroom
  const expansionHeadroom = useMemo(() => {
    if (!selectedRecorder) return null;
    const channels = selectedRecorder.channel_count || 4;
    const freeChannels = Math.max(0, channels - totalCameras);
    return {
      totalChannels: channels,
      occupiedChannels: totalCameras,
      freeChannels: freeChannels,
    };
  }, [selectedRecorder, totalCameras]);

  const stepsList = [
    { num: 1, title: 'Project', desc: 'Site & Setup' },
    { num: 2, title: 'Requirements', desc: 'Surveillance Specs' },
    { num: 3, title: 'Cameras', desc: 'Optics & Form Factor' },
    { num: 4, title: 'Recorder', desc: 'NVR / DVR Hub' },
    { num: 5, title: 'Storage', desc: 'Surveillance HDD' },
    { num: 6, title: 'Cabling', desc: 'Runs & Networking' },
    { num: 7, title: 'Accessories', desc: 'Terminals & Labor' },
    { num: 8, title: 'Review & BOM', desc: 'Summary & Quote' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-800 font-poppins selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Head title="CCTV System Builder & Storage Estimator | TechMarket BD" />

      {/* Storefront Navbar */}
      {NavbarComponent && <NavbarComponent />}

      {/* Main Estimator App */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">
        {/* Top Hero Banner with Strategy Presets */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Enterprise CCTV System Builder & Architecture Matrix</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white leading-tight">
                Design Your Complete Surveillance Solution
              </h1>
              <p className="text-blue-200/80 text-xs sm:text-sm">
                Real-time storage bitrate calculations, transmission cable conversion, multi-factor compatibility matrices, and commercial quotations.
              </p>
            </div>

            {/* Presets Strategy Switcher */}
            <div className="bg-slate-950/60 p-2 rounded-2xl border border-white/10 flex flex-wrap items-center gap-1.5 shrink-0">
              {[
                { id: 'budget', label: 'Budget', badge: 'Economy' },
                { id: 'balanced', label: 'Balanced', badge: 'Popular' },
                { id: 'premium', label: 'Enterprise 4K', badge: 'Ultra AI' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activePreset === p.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 uppercase">{p.badge}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={fetchPresets}
                disabled={loadingPresets}
                className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-all cursor-pointer flex items-center gap-1 ml-1"
                title="Compare all 3 presets side-by-side"
              >
                {loadingPresets ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
                <span>Compare Presets</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step Progress Stepper */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            {stepsList.map((s) => {
              const isCurrent = currentStep === s.num;
              const isCompleted = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : isCompleted
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-white text-blue-600'
                        : isCompleted
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold leading-tight">{s.title}</div>
                    <div className="text-[10px] opacity-80 leading-none">{s.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Wizard Left (8 Cols) vs Sticky Bill of Materials Right (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Wizard Step Body */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live System Health & Warning Hub */}
            {calculationResult?.validation && (
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${healthStatus.bg}`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white shadow-xs">
                    {calculationResult.validation.is_compatible ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${healthStatus.color}`}>
                      Architecture Status: {healthStatus.label}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {expansionHeadroom ? `${expansionHeadroom.occupiedChannels}/${expansionHeadroom.totalChannels} Channels Occupied (${expansionHeadroom.freeChannels} Free for Future Expansion)` : 'Evaluated against live rules'}
                    </div>
                  </div>
                </div>

                {calculationResult.validation.warnings?.length > 0 && (
                  <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>{calculationResult.validation.warnings.length} Advisory Notes</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: Project Setup */}
            {currentStep === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900 font-heading">Step 1: Project Setup & Premises Details</h2>
                  <p className="text-xs text-slate-500">Provide basic premises information to tune installation distance and accessory calculations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Uttara Villa Security"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Premises Type</label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="residential_home">Residential Home / Villa</option>
                      <option value="commercial_office">Commercial Corporate Office</option>
                      <option value="warehouse_factory">Warehouse / Industrial Factory</option>
                      <option value="retail_shop">Retail Shop / Showroom</option>
                      <option value="educational_institution">School / College Campus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location District</label>
                    <input
                      type="text"
                      value={locationDistrict}
                      onChange={(e) => setLocationDistrict(e.target.value)}
                      placeholder="e.g. Dhaka, Chittagong, Sylhet"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Building Floors Count</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={floorsCount}
                      onChange={(e) => setFloorsCount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Target Budget Control Field */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-blue-600" />
                      <span>Target Budget (Optional)</span>
                    </label>
                    {budgetEvaluation && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          budgetEvaluation.budget_status === 'within_budget'
                            ? 'bg-emerald-100 text-emerald-800'
                            : budgetEvaluation.budget_status === 'near_budget'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {budgetEvaluation.budget_status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(e.target.value)}
                    placeholder="Enter maximum target budget in BDT (e.g. 60000)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  {budgetEvaluation && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      Target: ৳{budgetEvaluation.target_budget.toLocaleString()} • Actual: ৳{budgetEvaluation.grand_total.toLocaleString()} • Difference: ৳{budgetEvaluation.difference.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900">Include Certified Professional Installation Service</div>
                    <div className="text-[11px] text-slate-500">Includes camera mounting, channel conduit wiring, DVR configuration, and mobile app setup.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireInstallation}
                    onChange={(e) => setRequireInstallation(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <span>Continue to Requirements</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Surveillance Requirements */}
            {currentStep === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900 font-heading">Step 2: Surveillance Technical Requirements</h2>
                  <p className="text-xs text-slate-500">Specify camera quantities, retention duration, compression codecs, and night vision preferences.</p>
                </div>

                {/* System Architecture Switcher */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">System Architecture</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'ip', title: 'IP Network System', desc: 'PoE Ethernet Cat6, high clarity, AI smart alerts' },
                      { id: 'analog', title: 'HD Analog / Coaxial', desc: 'RG59/3C2V Siamese, budget friendly' },
                      { id: 'hybrid', title: 'Hybrid XVR System', desc: 'Combines Analog & IP channels' },
                    ].map((sys) => (
                      <button
                        key={sys.id}
                        type="button"
                        onClick={() => {
                          setSystemType(sys.id);
                          addTimelineEvent(`Switched Architecture to ${sys.title}`);
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          systemType === sys.id
                            ? 'bg-blue-50/80 border-blue-600 text-blue-900 ring-2 ring-blue-600/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{sys.title}</div>
                        <div className="text-[11px] text-slate-500 mt-1 leading-tight">{sys.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantities & Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Camera Positions</label>
                    <input
                      type="number"
                      min="1"
                      max="64"
                      value={totalCameras}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value));
                        setTotalCameras(val);
                        addTimelineEvent(`Updated Camera Count to ${val}`);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Outdoor Weatherproof Cameras</label>
                    <input
                      type="number"
                      min="0"
                      max={totalCameras}
                      value={outdoorCameras}
                      onChange={(e) => setOutdoorCameras(Math.min(totalCameras, Number(e.target.value)))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Storage Retention (Days)</label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={recordingDays}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value));
                        setRecordingDays(val);
                        addTimelineEvent(`Updated Retention Days to ${val}`);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Standard</label>
                    <select
                      value={requiredResolutionMp}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setRequiredResolutionMp(val);
                        addTimelineEvent(`Updated Resolution to ${val}MP`);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                    >
                      <option value={2.0}>2.0 MP (1080P Full HD)</option>
                      <option value={3.0}>3.0 MP (Super HD)</option>
                      <option value={4.0}>4.0 MP (2K Quad HD)</option>
                      <option value={5.0}>5.0 MP (5MP Ultra HD)</option>
                      <option value={8.0}>8.0 MP (4K Ultra HD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Compression Codec</label>
                    <select
                      value={preferredCodec}
                      onChange={(e) => setPreferredCodec(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                    >
                      <option value="H.265+">H.265+ (Smart Codec ~70% Storage Save)</option>
                      <option value="H.265">H.265 (High Efficiency ~50% Save)</option>
                      <option value="H.264">H.264 (Standard Legacy)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Average Cable Run (m/cam)</label>
                    <input
                      type="number"
                      min="5"
                      max="150"
                      value={avgCableDistance}
                      onChange={(e) => setAvgCableDistance(Math.max(5, Number(e.target.value)))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                  >
                    <span>Choose Cameras</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Camera Selection */}
            {currentStep === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-heading">Step 3: Select Surveillance Cameras</h2>
                    <p className="text-xs text-slate-500">
                      Required cameras: <span className="font-bold text-blue-600">{totalCameras}</span> • Currently selected: <span className="font-bold text-slate-900">{currentSelectedCameraCount}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReplacementModal({ open: true, type: 'camera' })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Browse Compatible Cameras</span>
                  </button>
                </div>

                {/* Camera Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCameras.map((cam) => {
                    const selected = selectedCameras.find((c) => c.id === cam.id);
                    return (
                      <div
                        key={cam.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                          selected
                            ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-600/10'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold uppercase">
                              {cam.resolution_mp} MP • {cam.camera_form_factor}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 font-mono">
                              ৳{cam.price.toLocaleString()}
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{cam.title}</h3>

                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            <div>Lens: {cam.lens_mm}mm • IR: {cam.ir_distance_meters}m</div>
                            <div>Tech: {cam.low_light_tech || 'Standard IR'} • {cam.environment}</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setSpecModalProduct(cam)}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Specs</span>
                          </button>

                          {selected ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateCameraQty(cam.id, -1)}
                                className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-xs font-bold"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold font-mono px-1">{selected.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCameraQty(cam.id, 1)}
                                className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-xs font-bold"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleCamera(cam)}
                                className="text-[11px] text-rose-500 hover:underline ml-2"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleCamera(cam)}
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Add to Estimate
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                  >
                    <span>Select Recorder (NVR/DVR)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Recorder Selection */}
            {currentStep === 4 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-heading">Step 4: Select Video Recording Hub (NVR/DVR)</h2>
                    <p className="text-xs text-slate-500">The recorder must support at least {totalCameras} channels and your maximum camera resolution.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReplacementModal({ open: true, type: 'recorder' })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Replace Recorder</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredRecorders.map((rec) => {
                    const isSelected = selectedRecorder?.id === rec.id;
                    const isEnoughChannels = rec.channel_count >= totalCameras;
                    return (
                      <div
                        key={rec.id}
                        onClick={() => {
                          setSelectedRecorder(rec);
                          addTimelineEvent(`Selected Hub: ${rec.title}`);
                        }}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-[10px] font-bold uppercase">
                              {rec.channel_count} Channels • {rec.product_type}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 font-mono">
                              ৳{rec.price.toLocaleString()}
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-slate-900">{rec.title}</h3>

                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            <div>Max Camera Res: {rec.max_camera_resolution_mp} MP</div>
                            <div>HDD Bays: {rec.hdd_bay_count} • PoE Ports: {rec.poe_port_count}</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 text-blue-600 font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Selected Hub
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold">Click to Select</span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSpecModalProduct(rec);
                            }}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Specs</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                  >
                    <span>Storage Sizing (HDD)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Storage Sizing */}
            {currentStep === 5 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900 font-heading">Step 5: Storage Capacity Sizing</h2>
                  <p className="text-xs text-slate-500">Live storage bitrate metrics calculated by the Laravel surveillance calculation engine.</p>
                </div>

                {/* Storage Engine Metrics Banner */}
                {calculationResult?.storage_metrics && (
                  <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Total Bitrate</span>
                      <span className="font-bold text-slate-900">{calculationResult.storage_metrics.bitrate_per_camera_kbps} Kbps/cam</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Daily System Storage</span>
                      <span className="font-bold text-slate-900">{calculationResult.storage_metrics.daily_storage_gb} GB/day</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Gross Calculated</span>
                      <span className="font-bold text-indigo-700">{calculationResult.storage_metrics.gross_required_storage_tb_with_overhead} TB</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Recommended HDD</span>
                      <span className="font-bold text-emerald-600">{calculationResult.storage_metrics.recommended_hdd_capacity_tb} TB Surveillance</span>
                    </div>
                  </div>
                )}

                {/* HDD Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {catalogStorage.map((hdd) => {
                    const isSelected = selectedStorage?.id === hdd.id;
                    return (
                      <div
                        key={hdd.id}
                        onClick={() => {
                          setSelectedStorage(hdd);
                          addTimelineEvent(`Selected Storage: ${hdd.capacity_tb}TB`);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                              {hdd.capacity_tb} TB
                            </span>
                            <span className="text-xs font-bold text-emerald-600 font-mono">
                              ৳{hdd.price.toLocaleString()}
                            </span>
                          </div>
                          <h3 className="text-xs font-bold text-slate-900">{hdd.title}</h3>
                          <div className="text-[11px] text-slate-500">Surveillance Grade 24/7 • {hdd.rpm} RPM</div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-xs">
                          {isSelected ? (
                            <span className="text-blue-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Selected Storage
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold">Select HDD</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(6)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                  >
                    <span>Cabling & Network</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Cabling & Network */}
            {currentStep === 6 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900 font-heading">Step 6: Transmission Cabling & Network Hardware</h2>
                  <p className="text-xs text-slate-500">Transmission rolls calculated including multi-floor riser allowances and safety margins.</p>
                </div>

                {/* Cable Metrics Banner */}
                {calculationResult?.cable_metrics && (
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Net Camera Run</span>
                      <span className="font-bold text-slate-900">{calculationResult.cable_metrics.net_camera_distance_meters} Meters</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Gross Cable with Margin</span>
                      <span className="font-bold text-amber-800">{calculationResult.cable_metrics.gross_total_cable_meters} Meters</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Recommended Purchase</span>
                      <span className="font-bold text-emerald-600">{calculationResult.cable_metrics.recommended_rolls_count} x {calculationResult.cable_metrics.recommended_cable_package_type}</span>
                    </div>
                  </div>
                )}

                {/* Cable Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catalogCables.map((cbl) => {
                    const isSelected = selectedCable?.id === cbl.id;
                    return (
                      <div
                        key={cbl.id}
                        onClick={() => {
                          setSelectedCable(cbl);
                          addTimelineEvent(`Selected Cable: ${cbl.title}`);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-bold uppercase">
                              {cbl.cable_type} • {cbl.meters_per_unit}m
                            </span>
                            <span className="text-xs font-bold text-emerald-600 font-mono">
                              ৳{cbl.price.toLocaleString()}
                            </span>
                          </div>
                          <h3 className="text-xs font-bold text-slate-900">{cbl.title}</h3>
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-xs">
                          {isSelected ? (
                            <span className="text-blue-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Selected Cable Roll
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold">Select Cable</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(7)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                  >
                    <span>Accessories & Services</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: Accessories & Labor */}
            {currentStep === 7 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900 font-heading">Step 7: Essential Accessories & Installation</h2>
                  <p className="text-xs text-slate-500">Waterproof junction boxes and connectors automatically tuned to your camera count.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Waterproof PVC Junction Boxes</div>
                      <div className="text-[11px] text-slate-500">1x box per camera position ({totalCameras} units included in estimate)</div>
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-600">Auto-Calculated</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {systemType === 'ip' ? 'RJ45 Modular Connectors' : 'BNC Video & 12V DC Connectors'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {systemType === 'ip' ? `${totalCameras * 2}x RJ45 Terminals` : `${totalCameras * 2}x BNC + ${totalCameras}x DC`}
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-600">Auto-Calculated</span>
                  </div>

                  {requireInstallation && (
                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-blue-950">Professional Installation & Cabling Service</div>
                        <div className="text-[11px] text-blue-700">Complete technician deployment, camera alignment, conduit channel wiring & mobile NVR cloud setup</div>
                      </div>
                      <span className="text-xs font-bold font-mono text-blue-900">
                        ৳{((engineSettings.installation_base_charge || 1500) + (engineSettings.installation_per_camera_charge || 500) * totalCameras).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(6)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(8)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                  >
                    <span>Review Full Bill of Materials (BOM)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 8: Review & Bill of Materials (BOM) */}
            {currentStep === 8 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-heading">Step 8: Final Review & Bill of Materials</h2>
                    <p className="text-xs text-slate-500">Review all system line items before generating quote or checking out.</p>
                  </div>

                  {calculationResult?.validation && (
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        calculationResult.validation.is_compatible
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : 'bg-rose-50 border border-rose-200 text-rose-700'
                      }`}
                    >
                      {calculationResult.validation.is_compatible ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      <span>{calculationResult.validation.is_compatible ? 'System Compatible' : 'Conflicts Found'}</span>
                    </div>
                  )}
                </div>

                {/* BOM Items Table */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                        <th className="py-3 px-4">Component</th>
                        <th className="py-3 px-4">Qty</th>
                        <th className="py-3 px-4">Unit Price</th>
                        <th className="py-3 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {calculationResult?.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.product_name_snapshot}</div>
                            <div className="text-[10px] text-slate-400 font-mono">SKU: {item.product_sku_snapshot}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold">{item.quantity} {item.unit}</td>
                          <td className="py-3 px-4 font-mono">৳{Number(item.unit_price_snapshot).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                            ৳{Number(item.subtotal_price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Final Price Breakdown */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Hardware Subtotal</span>
                    <span className="font-bold text-slate-900">৳{Number(calculationResult?.subtotal_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Accessories Subtotal</span>
                    <span className="font-bold text-slate-900">৳{Number(calculationResult?.accessory_amount || 0).toLocaleString()}</span>
                  </div>
                  {requireInstallation && (
                    <div className="flex justify-between text-slate-600">
                      <span>Installation Service</span>
                      <span className="font-bold text-slate-900">৳{Number(calculationResult?.installation_amount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black pt-2 border-t border-slate-200 text-slate-900">
                    <span>Grand Total Estimate</span>
                    <span className="text-emerald-600">৳{Number(calculationResult?.grand_total || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(7)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsQuoteModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Tag className="w-4 h-4" />
                      <span>Request Official Quote</span>
                    </button>

                    <button
                      type="button"
                      disabled={cartAdding || (calculationResult?.validation && !calculationResult.validation.is_compatible)}
                      onClick={handleAddToCart}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{cartAdding ? 'Verifying & Adding...' : 'Add Complete System to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Persistent Bill of Materials (BOM) & Total Sidebar */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">System Bill of Materials</h3>
                </div>
                {calculating && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
              </div>

              {/* Status Indicator */}
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  calculationResult?.validation?.is_compatible
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {calculationResult?.validation?.is_compatible ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>
                  {calculationResult?.validation?.is_compatible
                    ? 'Configuration Valid & Verified'
                    : 'Adjust parameters or camera count'}
                </span>
              </div>

              {/* Selected Hardware Items List with 1-Click Replace and Spec Links */}
              <div className="space-y-3 text-xs">
                {/* Cameras */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cameras</span>
                    <button
                      type="button"
                      onClick={() => setReplacementModal({ open: true, type: 'camera' })}
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      Change
                    </button>
                  </div>
                  <div className="font-bold text-slate-900">
                    {currentSelectedCameraCount} of {totalCameras} Cameras Configured
                  </div>
                  {selectedCameras.map((c) => (
                    <div key={c.id} className="text-[11px] text-slate-600 truncate flex items-center justify-between">
                      <span className="truncate">{c.quantity}x {c.title}</span>
                    </div>
                  ))}
                </div>

                {/* Recorder */}
                {selectedRecorder && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Video Recorder</span>
                      <button
                        type="button"
                        onClick={() => setReplacementModal({ open: true, type: 'recorder' })}
                        className="text-[10px] text-blue-600 hover:underline font-bold"
                      >
                        Change
                      </button>
                    </div>
                    <div className="font-bold text-slate-900 truncate">{selectedRecorder.title}</div>
                    <div className="text-[11px] text-slate-500">{selectedRecorder.channel_count} Channels • {selectedRecorder.product_type}</div>
                  </div>
                )}

                {/* Storage */}
                {calculationResult?.storage_metrics && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Capacity</span>
                      <button
                        type="button"
                        onClick={() => setReplacementModal({ open: true, type: 'storage' })}
                        className="text-[10px] text-blue-600 hover:underline font-bold"
                      >
                        Change
                      </button>
                    </div>
                    <div className="font-bold text-slate-900">
                      {calculationResult.storage_metrics.recommended_hdd_capacity_tb} TB Surveillance HDD
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {recordingDays} Days Retention @ {preferredCodec}
                    </div>
                  </div>
                )}

                {/* Cabling */}
                {calculationResult?.cable_metrics && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transmission Cable</span>
                      <button
                        type="button"
                        onClick={() => setReplacementModal({ open: true, type: 'cable' })}
                        className="text-[10px] text-blue-600 hover:underline font-bold"
                      >
                        Change
                      </button>
                    </div>
                    <div className="font-bold text-slate-900">
                      {calculationResult.cable_metrics.recommended_rolls_count} x {calculationResult.cable_metrics.recommended_cable_package_type}
                    </div>
                    <div className="text-[11px] text-slate-500">~{calculationResult.cable_metrics.gross_total_cable_meters}m total run</div>
                  </div>
                )}
              </div>

              {/* Total Financials */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-baseline font-mono">
                  <span className="text-xs font-bold text-slate-600">Estimated Total:</span>
                  <span className="text-2xl font-black text-emerald-600">
                    ৳{Number(calculationResult?.grand_total || 0).toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={cartAdding || (calculationResult?.validation && !calculationResult.validation.is_compatible)}
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{cartAdding ? 'Processing...' : 'Add Complete System to Cart'}</span>
                </button>
              </div>

              {/* Session Timeline Feed */}
              <div className="pt-3 border-t border-slate-100 space-y-1 text-[11px]">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <History className="w-3 h-3" />
                  <span>Session Timeline</span>
                </div>
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-500">
                    <span className="truncate">{evt.text}</span>
                    <span className="font-mono text-[9px] text-slate-400 shrink-0 ml-2">{evt.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Strategy Preset Comparison Matrix */}
        {isPresetComparisonOpen && presetData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Compare CCTV System Strategy Presets</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPresetComparisonOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(presetData).map(([key, preset]) => (
                  <div
                    key={key}
                    className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                      activePreset === key ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                          {preset.badge}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 font-mono">
                          {preset.recommendation?.recommended_storage_tb} TB Storage
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{preset.name}</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{preset.description}</p>
                    </div>

                    <div className="space-y-2 text-xs border-t border-slate-200/60 pt-3">
                      <div className="text-slate-600 font-medium">Standard: <span className="text-slate-900 font-bold">{preset.resolution}</span></div>
                      <div className="text-slate-600 font-medium">Recorder: <span className="text-slate-900 font-bold">{preset.recommendation?.recommended_channel_count} Ch Hub</span></div>
                      <div className="text-slate-600 font-medium">Cabling: <span className="text-slate-900 font-bold">{preset.recommendation?.recommended_cable_rolls} Rolls</span></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset(key)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        activePreset === key
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {activePreset === key ? 'Currently Active' : 'Apply This Strategy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Replacement Drawer / Compatible Products Picker */}
        {replacementModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Replace {replacementModal.type?.toUpperCase()} with Compatible Model
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setReplacementModal({ open: false, type: null })}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {(replacementModal.type === 'camera' ? filteredCameras : replacementModal.type === 'recorder' ? filteredRecorders : replacementModal.type === 'storage' ? catalogStorage : catalogCables).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-600 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        SKU: {item.sku} • ৳{item.price.toLocaleString()}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReplaceComponent(item)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Select Model
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Grouped Technical Specification View */}
        {specModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900 truncate max-w-xs">{specModalProduct.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSpecModalProduct(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-500">SKU / Model</span>
                    <span className="font-bold text-slate-900">{specModalProduct.sku}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-500">Official Price</span>
                    <span className="font-bold text-emerald-600">৳{specModalProduct.price?.toLocaleString()}</span>
                  </div>
                  {specModalProduct.resolution_mp && (
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500">Resolution</span>
                      <span className="font-bold text-slate-900">{specModalProduct.resolution_mp} MP</span>
                    </div>
                  )}
                  {specModalProduct.channel_count && (
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500">Channel Capacity</span>
                      <span className="font-bold text-slate-900">{specModalProduct.channel_count} Channels</span>
                    </div>
                  )}
                  {specModalProduct.capacity_tb && (
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500">Storage Capacity</span>
                      <span className="font-bold text-slate-900">{specModalProduct.capacity_tb} TB</span>
                    </div>
                  )}
                  {specModalProduct.environment && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Environment Rating</span>
                      <span className="font-bold text-slate-900 uppercase">{specModalProduct.environment}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Request Commercial Quotation / Expert Review */}
        {isQuoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Commercial Proposal & Expert Review</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {quoteSuccessData ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Official Quote Issued Successfully!</h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1">
                    <div>Quote #: <span className="font-bold text-blue-600">{quoteSuccessData.quote_number}</span></div>
                    <div>Grand Total: <span className="font-bold text-emerald-600">৳{Number(quoteSuccessData.grand_total).toLocaleString()}</span></div>
                    <div>Valid Until: <span>{new Date(quoteSuccessData.valid_until).toLocaleDateString()}</span></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuoteModalOpen(false);
                      setQuoteSuccessData(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuote} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Proposal Request Type</label>
                    <select
                      value={quoteRequestType}
                      onChange={(e) => setQuoteRequestType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                    >
                      <option value="standard_quote">Standard Commercial Quotation</option>
                      <option value="expert_review">Free Engineering Review by Surveillance Specialist</option>
                      <option value="site_survey">Request On-Site Premises Technical Survey</option>
                      <option value="corporate_proposal">Corporate / Institutional Tender Proposal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Customer / Contact Person <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mr. Rafiqul Islam"
                      value={quoteCustomerName}
                      onChange={(e) => setQuoteCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 01711000000"
                      value={quoteCustomerPhone}
                      onChange={(e) => setQuoteCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. rafiq@example.com"
                      value={quoteCustomerEmail}
                      onChange={(e) => setQuoteCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Organization / Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. TechCorp BD Ltd."
                      value={quoteCompanyName}
                      onChange={(e) => setQuoteCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsQuoteModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={quoteSubmitting}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
                    >
                      {quoteSubmitting ? 'Submitting...' : 'Submit & Issue Proposal'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
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
