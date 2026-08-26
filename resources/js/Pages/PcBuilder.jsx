import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { 
  Cpu, CircuitBoard, MemoryStick, HardDrive, 
  Tv, Zap, Fan, Box, Monitor, BatteryCharging, 
  Package, Mouse, Keyboard, Headphones,
  ShoppingCart, ChevronDown, Check, X, AlertTriangle, 
  Trash2, RefreshCw, BookmarkPlus, Printer, Share2, Eye, EyeOff
} from 'lucide-react';

export default function PcBuilder({ slots = [], selectedBuild = {}, summary = {}, compatibility = {} }) {
  const { auth = {}, flash = {} } = usePage().props;
  const user = auth?.user;

  const [cartOpen, setCartOpen] = useState(false);
  const [hideUnconfigured, setHideUnconfigured] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [buildName, setBuildName] = useState('Custom Gaming Rig - ' + new Date().toLocaleDateString('en-GB'));
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

  // Slot icon helper
  const getSlotIcon = (key) => {
    const iconClass = "w-7 h-7 text-[#64748b]";
    switch (key) {
      case 'processor': return <Cpu className={iconClass} />;
      case 'motherboard': return <CircuitBoard className={iconClass} />;
      case 'ram': return <MemoryStick className={iconClass} />;
      case 'storage': return <HardDrive className={iconClass} />;
      case 'graphics-card': return <Tv className={iconClass} />;
      case 'power-supply': return <Zap className={iconClass} />;
      case 'cpu-cooler': return <Fan className={iconClass} />;
      case 'casing': return <Box className={iconClass} />;
      case 'monitor': return <Monitor className={iconClass} />;
      case 'case-fan': return <Fan className={iconClass} />;
      case 'ups': return <BatteryCharging className={iconClass} />;
      case 'software': return <Package className={iconClass} />;
      case 'mouse': return <Mouse className={iconClass} />;
      case 'keyboard': return <Keyboard className={iconClass} />;
      case 'headphone': return <Headphones className={iconClass} />;
      default: return <Cpu className={iconClass} />;
    }
  };

  // Group slots into 3 sections
  const coreSlots = slots.filter(s => s.group === 'core');
  const peripheralSlots = slots.filter(s => s.group === 'peripherals');
  const accessorySlots = slots.filter(s => s.group === 'accessories');

  const handleClearAll = () => {
    if (summary.configured_count === 0) return;
    if (confirm('Are you sure you want to remove all components from this PC build?')) {
      router.post('/pc-builder/clear');
    }
  };

  const handleRemoveComponent = (key) => {
    router.post(`/pc-builder/remove/${key}`);
  };

  const handleAddToCart = () => {
    if (summary.configured_count === 0) return;
    router.post('/pc-builder/add-to-cart');
  };

  const handleSaveBuildSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      router.get('/login');
      return;
    }
    router.post('/pc-builder/save', { name: buildName }, {
      onSuccess: () => setSaveModalOpen(false)
    });
  };

  const handlePrint = () => {
    setActionsMenuOpen(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const todayDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#1e293b] font-sans flex flex-col antialiased print:bg-white print:text-black">
      <Head title="TECHMARKET Build your own PC - Custom PC Builder" />

      {/* Screen Navigation */}
      <div className="print:hidden">
        <Navbar onOpenCart={() => setCartOpen(true)} />
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 py-6 space-y-4 print:p-0 print:m-0 print:max-w-full">
        
        {/* PRINT-ONLY OFFICIAL HEADER */}
        <div className="hidden print:block border-b-2 border-[#1e293b] pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-[#002a5c] tracking-tight">
                TECH<span className="text-[#0088cc]">MARKET</span>
              </h1>
              <p className="text-xs font-semibold text-gray-700">Custom PC Build Official Quotation</p>
              <p className="text-[10px] text-gray-500">
                Hotline: (+88) 09613828201 | Email: info@techmarketbd.com | Web: www.techmarketbd.com
              </p>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div><span className="font-bold">Quotation Date:</span> {todayDate}</div>
              <div><span className="font-bold">Customer:</span> {user?.name || 'Valued Customer'}</div>
              <div><span className="font-bold">Phone:</span> {user?.phone || 'N/A'}</div>
              <div><span className="font-bold">Est. Power Draw:</span> ~{summary.estimated_wattage || 100}W</div>
            </div>
          </div>
        </div>

        {/* Flash Messages (Screen Only) */}
        {flash?.success && (
          <div className="print:hidden bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-[6px] flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{flash.success}</span>
          </div>
        )}
        {flash?.error && (
          <div className="print:hidden bg-red-50 border border-red-200 text-red-800 text-xs font-semibold px-4 py-3 rounded-[6px] flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{flash.error}</span>
          </div>
        )}

        {/* Compatibility Warnings & Errors (Screen Only) */}
        {compatibility?.errors && compatibility.errors.length > 0 && (
          <div className="print:hidden bg-red-50 border border-red-300 text-red-900 rounded-[6px] p-4 text-xs space-y-1.5 shadow-sm">
            <div className="flex items-center space-x-2 font-bold text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Compatibility Conflicts Detected:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-red-800">
              {compatibility.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        {compatibility?.warnings && compatibility.warnings.length > 0 && (
          <div className="print:hidden bg-amber-50 border border-amber-300 text-amber-900 rounded-[6px] p-4 text-xs space-y-1.5 shadow-sm">
            <div className="flex items-center space-x-2 font-bold text-amber-700">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Compatibility & Power Suggestions:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-amber-800">
              {compatibility.warnings.map((warn, idx) => (
                <li key={idx}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* TOP BUILDER HEADER CARD */}
        <div className="bg-white border border-[#d9dde3] rounded-[8px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6 print:border-none print:shadow-none print:p-0 print:space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="print:hidden">
              <div className="flex items-center space-x-2">
                <h1 className="text-[24px] font-black tracking-tight text-[#1e293b]">
                  <span className="text-[#002a5c]">TECH</span>
                  <span className="text-[#0088cc]">MARKET</span>
                </h1>
              </div>
              <p className="text-[15px] font-bold text-[#475569]">Build your own PC</p>
            </div>

            {/* Top Action Buttons (Screen Only) */}
            <div className="print:hidden flex items-center space-x-2.5">
              <button
                onClick={handleAddToCart}
                disabled={summary.configured_count === 0}
                className={`text-[12.5px] font-bold px-5 py-2.5 rounded-[4px] shadow-sm flex items-center space-x-2 transition-all ${
                  summary.configured_count > 0 
                    ? 'bg-[#274a7d] hover:bg-[#1d375d] text-white cursor-pointer' 
                    : 'bg-[#94a3b8] text-white cursor-not-allowed opacity-75'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
                  className="bg-white border border-[#cbd5e1] hover:border-[#94a3b8] text-[#334155] text-[12.5px] font-semibold px-3.5 py-2.5 rounded-[4px] flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <span>Actions</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
                </button>

                {actionsMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#e2e8f0] rounded-[6px] shadow-lg py-1.5 z-20 text-xs text-[#334155]">
                    <button
                      onClick={() => { setActionsMenuOpen(false); setSaveModalOpen(true); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#f1f5f9] flex items-center space-x-2"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 text-[#274a7d]" />
                      <span>Save PC Build</span>
                    </button>
                    <Link
                      href="/account/saved-pc-builds"
                      className="w-full text-left px-4 py-2 hover:bg-[#f1f5f9] flex items-center space-x-2 block"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#0088cc]" />
                      <span>View Saved Builds</span>
                    </Link>
                    <button
                      onClick={handlePrint}
                      className="w-full text-left px-4 py-2 hover:bg-[#f1f5f9] flex items-center space-x-2"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#475569]" />
                      <span>Print Configuration</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subheader Counters and Checkbox */}
          <div className="pt-2 border-t border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-none print:pt-0">
            <label className="print:hidden inline-flex items-center space-x-2 text-[12.5px] font-medium text-[#64748b] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideUnconfigured}
                onChange={(e) => setHideUnconfigured(e.target.checked)}
                className="w-4 h-4 rounded text-[#274a7d] focus:ring-[#274a7d] border-[#cbd5e1]"
              />
              <span>Hide Unconfigured Components</span>
            </label>

            <div className="flex items-center space-x-8 text-right print:space-x-4 print:w-full print:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[#8b95a5] print:text-black">Selected Items</div>
                <div className="text-[18px] font-black text-[#1e293b] print:text-black leading-tight">
                  {summary.configured_count || 0}
                </div>
              </div>
              <div className="pl-6 border-l border-[#e2e8f0] print:border-gray-300">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[#8b95a5] print:text-black">Total Price</div>
                <div className="text-[20px] font-black text-[#1e293b] print:text-black leading-tight">
                  ৳{(summary.total_price || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COMPONENT SECTIONS */}
        <div className="space-y-4 print:space-y-3">
          {/* SECTION 1: CORE COMPONENTS */}
          <ComponentGroupSection
            title="Core Components"
            slots={coreSlots}
            selectedBuild={selectedBuild}
            hideUnconfigured={hideUnconfigured}
            getSlotIcon={getSlotIcon}
            onRemove={handleRemoveComponent}
            showClearAll={true}
            onClearAll={handleClearAll}
          />

          {/* SECTION 2: PERIPHERALS & OTHERS */}
          <ComponentGroupSection
            title="Peripherals & Others"
            slots={peripheralSlots}
            selectedBuild={selectedBuild}
            hideUnconfigured={hideUnconfigured}
            getSlotIcon={getSlotIcon}
            onRemove={handleRemoveComponent}
          />

          {/* SECTION 3: ACCESSORIES */}
          <ComponentGroupSection
            title="Accessories"
            slots={accessorySlots}
            selectedBuild={selectedBuild}
            hideUnconfigured={hideUnconfigured}
            getSlotIcon={getSlotIcon}
            onRemove={handleRemoveComponent}
          />
        </div>

        {/* PRINT-ONLY FOOTER TERMS & SIGNATURE */}
        <div className="hidden print:block pt-6 border-t border-gray-300 mt-6 text-xs text-gray-600">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="font-bold text-gray-800">Terms & Conditions:</p>
              <p>• Prices and stock availability are subject to market change and valid for 3 days.</p>
              <p>• Official manufacturer warranty applies on eligible hardware.</p>
            </div>

            <div className="text-center pt-8 border-t border-gray-400 w-48">
              <p className="font-bold text-gray-800">Authorized Signature</p>
              <p className="text-[10px] text-gray-500">TechMarket BD</p>
            </div>
          </div>
        </div>
      </main>

      {/* SAVE BUILD MODAL */}
      {saveModalOpen && (
        <div className="print:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <h2 className="text-[15px] font-bold text-[#1e293b] flex items-center space-x-2">
                <BookmarkPlus className="w-4 h-4 text-[#274a7d]" />
                <span>Save PC Build Configuration</span>
              </h2>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="text-[#94a3b8] hover:text-[#475569]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBuildSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Build Name / Reference
                </label>
                <input
                  type="text"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  placeholder="e.g. Budget Gaming Rig, 4K Video Editing Rig"
                  className="w-full text-xs px-3 py-2 border border-[#cbd5e1] rounded-[4px] focus:ring-1 focus:ring-[#274a7d] focus:border-[#274a7d]"
                  required
                />
              </div>

              <div className="bg-[#f8fafc] p-3 rounded-[6px] border border-[#e2e8f0] text-xs text-[#64748b] space-y-1">
                <div className="flex justify-between">
                  <span>Selected Components:</span>
                  <span className="font-bold text-[#1e293b]">{summary.configured_count} Items</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Total Price:</span>
                  <span className="font-bold text-[#274a7d]">৳{(summary.total_price || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Power Draw:</span>
                  <span className="font-bold text-[#1e293b]">~{summary.estimated_wattage}W</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2 border border-[#cbd5e1] text-[#475569] text-xs font-semibold rounded-[4px] hover:bg-[#f1f5f9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#274a7d] hover:bg-[#1d375d] text-white text-xs font-bold rounded-[4px] shadow-sm"
                >
                  Save to Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screen Footer */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

/**
 * Component Group Card matching TechLand design
 */
function ComponentGroupSection({
  title,
  slots = [],
  selectedBuild = {},
  hideUnconfigured = false,
  getSlotIcon,
  onRemove,
  showClearAll = false,
  onClearAll
}) {
  // Filter slots if hideUnconfigured is active
  const visibleSlots = hideUnconfigured
    ? slots.filter(slot => selectedBuild[slot.key])
    : slots;

  if (hideUnconfigured && visibleSlots.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-[#d9dde3] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden print:border print:border-gray-300 print:shadow-none print:mb-3">
      {/* Blue Header Bar */}
      <div className="bg-[#274a7d] px-5 py-3 flex items-center justify-between text-white print:bg-gray-800 print:py-1.5 print:px-3">
        <h2 className="text-[14px] font-bold tracking-wide print:text-xs">
          {title}
        </h2>

        {showClearAll && (
          <button
            onClick={onClearAll}
            className="print:hidden bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-[11.5px] font-bold px-3 py-1 rounded-[3px] flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Slots List */}
      <div className="divide-y divide-[#edf0f5] print:divide-gray-200">
        {visibleSlots.map((slot) => {
          const product = selectedBuild[slot.key];

          return (
            <div 
              key={slot.key} 
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fbfcfd] transition-colors print:p-2 print:flex-row"
            >
              {/* Left Slot Details */}
              <div className="flex items-start sm:items-center space-x-4 min-w-0 flex-1 print:space-x-3">
                {/* Slot Icon Box or Product Thumbnail */}
                <div className="w-12 h-12 rounded-[6px] bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center shrink-0 overflow-hidden print:w-8 print:h-8 print:border-gray-200">
                  {product ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    getSlotIcon(slot.key)
                  )}
                </div>

                {/* Info Text */}
                <div className="space-y-1 min-w-0 flex-1 print:space-y-0.5">
                  <div className="flex items-center flex-wrap gap-2 print:gap-1">
                    <span className="text-[13.5px] font-bold text-[#1e293b] print:text-xs print:text-black">
                      {slot.title}
                    </span>

                    {/* Badges */}
                    {slot.required && (
                      <span className="bg-[#1e293b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider print:hidden">
                        Required
                      </span>
                    )}
                    {slot.depends_on && (
                      <span className="bg-[#fee2e2] text-[#dc2626] text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] print:hidden">
                        * {slot.depends_on}
                      </span>
                    )}
                  </div>

                  {product ? (
                    <div className="space-y-0.5">
                      <Link
                        href={`/product/${product.slug}`}
                        className="text-[13px] font-semibold text-[#002a5c] hover:underline block truncate print:text-xs print:text-black print:no-underline"
                        title={product.title}
                      >
                        {product.title}
                      </Link>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="text-[13px] font-bold text-[#d32f2f] print:text-xs print:text-black">
                          ৳{product.price.toLocaleString()}
                        </span>
                        {product.regular_price > product.price && (
                          <span className="text-[11.5px] text-[#94a3b8] line-through print:hidden">
                            ৳{product.regular_price.toLocaleString()}
                          </span>
                        )}
                        {!product.in_stock && (
                          <span className="text-[11px] font-semibold text-amber-600 print:hidden">
                            (Pre-Order / Low Stock)
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12.5px] text-[#8b95a5] print:text-xs print:text-gray-400">
                      No product selected
                    </p>
                  )}
                </div>
              </div>

              {/* Right Action Buttons (Screen Only) */}
              <div className="print:hidden flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {product ? (
                  <>
                    <Link
                      href={`/pc-builder/build/component/change/${slot.key}`}
                      className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-[12px] font-semibold px-4 py-1.5 rounded-[4px] transition-colors shadow-xs"
                    >
                      Change
                    </Link>
                    <button
                      onClick={() => onRemove(slot.key)}
                      className="p-1.5 text-[#94a3b8] hover:text-[#d32f2f] hover:bg-red-50 rounded-[4px] transition-colors"
                      title={`Remove ${product.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Link
                    href={`/pc-builder/build/component/choose/${slot.key}`}
                    className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-[12px] font-semibold px-5 py-1.5 rounded-[4px] transition-colors shadow-xs"
                  >
                    Choose
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
