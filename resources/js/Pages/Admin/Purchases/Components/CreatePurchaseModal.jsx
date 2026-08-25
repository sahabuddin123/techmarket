import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShoppingCart, Building2, Package, Plus, Trash2, 
  Calendar, Warehouse, DollarSign, X, Search, Check, 
  ChevronDown, AlertCircle, Sparkles, FileText, CheckCircle2
} from 'lucide-react';
import AddSupplierModal from './AddSupplierModal';

export default function CreatePurchaseModal({
  isOpen,
  onClose,
  suppliers = [],
  warehouses = [],
  products = [],
  onSubmitPurchase,
  processing = false,
}) {
  // Local list of suppliers (can be updated when a new supplier is added on-the-fly)
  const [supplierList, setSupplierList] = useState(suppliers);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');

  // Line items state
  const [items, setItems] = useState([
    { product_id: '', quantity_ordered: 1, unit_cost: 0, tax_percent: 0, line_discount: 0 }
  ]);

  // Supplier Search Popover State
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [supplierQuery, setSupplierQuery] = useState('');
  const [isSearchingSupplier, setIsSearchingSupplier] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const supplierDropdownRef = useRef(null);

  // Sync prop suppliers if updated
  useEffect(() => {
    if (suppliers.length > 0) {
      setSupplierList(suppliers);
    }
  }, [suppliers]);

  // Handle outside click for supplier popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(e.target)) {
        setIsSupplierOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isAddSupplierModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAddSupplierModalOpen, onClose]);

  // Filtered suppliers based on search query
  const filteredSuppliers = useMemo(() => {
    if (!supplierQuery.trim()) return supplierList;
    const q = supplierQuery.toLowerCase();
    return supplierList.filter(
      (s) =>
        s.company_name?.toLowerCase().includes(q) ||
        s.contact_person?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.supplier_code?.toLowerCase().includes(q)
    );
  }, [supplierList, supplierQuery]);

  const currentSelectedSupplier = useMemo(() => {
    return supplierList.find((s) => s.id === Number(selectedSupplierId));
  }, [supplierList, selectedSupplierId]);

  // Server-side debounced search when typing
  useEffect(() => {
    if (!supplierQuery.trim()) return;
    const timeoutId = setTimeout(async () => {
      try {
        setIsSearchingSupplier(true);
        const res = await fetch(`/admin/suppliers/search?query=${encodeURIComponent(supplierQuery)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.suppliers)) {
          // Merge unique into supplierList
          setSupplierList((prev) => {
            const map = new Map(prev.map((s) => [s.id, s]));
            json.suppliers.forEach((s) => map.set(s.id, s));
            return Array.from(map.values());
          });
        }
      } catch {
        // Fallback to local filter
      } finally {
        setIsSearchingSupplier(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [supplierQuery]);

  // Handle Line Items
  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      { product_id: '', quantity_ordered: 1, unit_cost: 0, tax_percent: 0, line_discount: 0 }
    ]);
  };

  const handleRemoveItemRow = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, val) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };

      if (field === 'product_id') {
        const prod = products.find((p) => p.id === Number(val));
        if (prod) {
          const cost = prod.cost_price > 0 ? prod.cost_price : prod.regular_price || prod.price || 0;
          updated[idx].unit_cost = cost;
        }
      }

      return updated;
    });
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => {
      const qty = Math.max(0, Number(it.quantity_ordered) || 0);
      const cost = Math.max(0, Number(it.unit_cost) || 0);
      return acc + (qty * cost);
    }, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    const rate = Math.max(0, Number(taxPercent) || 0);
    return (subtotal * rate) / 100;
  }, [subtotal, taxPercent]);

  const totalAmount = useMemo(() => {
    const disc = Math.max(0, Number(discount) || 0);
    const ship = Math.max(0, Number(shippingCost) || 0);
    return Math.max(0, subtotal + taxAmount - disc + ship);
  }, [subtotal, taxAmount, discount, shippingCost]);

  // Validation
  const isValid = useMemo(() => {
    if (!selectedSupplierId) return false;
    if (items.length === 0) return false;
    return items.every(
      (it) => it.product_id && Number(it.quantity_ordered) > 0 && Number(it.unit_cost) >= 0
    );
  }, [selectedSupplierId, items]);

  const handleSupplierCreated = (newSupplier) => {
    setSupplierList((prev) => [newSupplier, ...prev.filter((s) => s.id !== newSupplier.id)]);
    setSelectedSupplierId(newSupplier.id);
    setToastMessage('Supplier created and selected.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || processing) return;

    onSubmitPurchase({
      supplier_id: selectedSupplierId,
      warehouse_id: warehouseId,
      purchase_date: purchaseDate,
      expected_delivery_date: expectedDeliveryDate || null,
      subtotal,
      tax: taxAmount,
      tax_percent: taxPercent,
      discount: Number(discount) || 0,
      shipping_cost: Number(shippingCost) || 0,
      total: totalAmount,
      paid_amount: Number(paidAmount) || 0,
      notes,
      items: items.map((it) => ({
        product_id: it.product_id,
        quantity_ordered: Number(it.quantity_ordered),
        unit_cost: Number(it.unit_cost),
        tax_percent: Number(it.tax_percent) || 0,
        line_discount: Number(it.line_discount) || 0,
      })),
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 select-none">
        <div 
          className="w-full max-w-[800px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[var(--admin-radius,16px)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
          style={{ fontFamily: 'var(--admin-font-family, inherit)' }}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--admin-primary-light,rgba(79,70,229,0.08))] text-[var(--admin-primary,#4f46e5)] flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                  Create Supplier Purchase Order
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  Create a new purchase order for your supplier
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success Toast Banner */}
          {toastMessage && (
            <div className="mx-5 mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar flex-1 p-5 space-y-4 text-xs">
            {/* Top Metadata Row: Supplier Selector & Warehousing */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
              {/* Supplier Search Popover */}
              <div className="md:col-span-6 space-y-1" ref={supplierDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Supplier / Vendor <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddSupplierModalOpen(true)}
                    className="text-[11px] font-bold text-[var(--admin-primary,#4f46e5)] hover:underline cursor-pointer flex items-center space-x-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New Supplier</span>
                  </button>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSupplierOpen((prev) => !prev)}
                    className={`w-full px-3 py-2 text-left rounded-xl border transition-colors flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 cursor-pointer ${
                      currentSelectedSupplier
                        ? 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-semibold">
                        {currentSelectedSupplier ? currentSelectedSupplier.company_name : 'Select supplier / vendor...'}
                      </span>
                      {currentSelectedSupplier?.supplier_code && (
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                          {currentSelectedSupplier.supplier_code}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                  </button>

                  {/* Searchable Dropdown Popover */}
                  {isSupplierOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-full z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search by name, phone, code..."
                            value={supplierQuery}
                            onChange={(e) => setSupplierQuery(e.target.value)}
                            autoFocus
                            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-medium"
                          />
                        </div>
                      </div>

                      <div className="max-h-52 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredSuppliers.length === 0 ? (
                          <div className="p-4 text-center space-y-2">
                            <p className="text-xs text-slate-400">No supplier found</p>
                            <button
                              type="button"
                              onClick={() => {
                                setIsSupplierOpen(false);
                                setIsAddSupplierModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[var(--admin-primary-light,rgba(79,70,229,0.08))] text-[var(--admin-primary,#4f46e5)] font-bold text-xs hover:bg-[var(--admin-primary,#4f46e5)] hover:text-white transition-colors cursor-pointer inline-flex items-center space-x-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add New Supplier</span>
                            </button>
                          </div>
                        ) : (
                          filteredSuppliers.map((s) => {
                            const isSelected = s.id === Number(selectedSupplierId);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setSelectedSupplierId(s.id);
                                  setIsSupplierOpen(false);
                                  setSupplierQuery('');
                                }}
                                className={`w-full p-2.5 text-left flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                                  isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''
                                }`}
                              >
                                <div className="min-w-0 flex-1 pr-2">
                                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                                    <span className="truncate">{s.company_name}</span>
                                    {s.supplier_code && (
                                      <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded shrink-0">
                                        {s.supplier_code}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                    {s.phone || s.email || 'No contact specified'}
                                    {s.contact_person && ` • ${s.contact_person}`}
                                  </div>
                                </div>

                                <div className="text-right shrink-0 space-y-0.5">
                                  {Number(s.current_balance) > 0 ? (
                                    <div className="text-[10px] font-mono font-bold text-rose-500">
                                      Due: ৳{Number(s.current_balance).toLocaleString()}
                                    </div>
                                  ) : (
                                    <div className="text-[10px] font-mono text-slate-400">
                                      Payable: ৳0.00
                                    </div>
                                  )}
                                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 inline" />}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Warehouse Selection */}
              <div className="md:col-span-3 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Target Warehouse <span className="text-rose-500">*</span>
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-medium text-xs text-slate-900 dark:text-slate-100 cursor-pointer"
                  required
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchase Date */}
              <div className="md:col-span-3 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  PO Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-mono text-xs text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-heading">
                    Order Line Items
                  </h4>
                  <p className="text-[10.5px] text-slate-400">
                    Add hardware products, restock quantities, and unit purchase costs
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--admin-primary-light,rgba(79,70,229,0.08))] hover:bg-[var(--admin-primary,#4f46e5)] text-[var(--admin-primary,#4f46e5)] hover:text-white font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Responsive Line Items Table / Stacked Cards */}
              <div className="space-y-2">
                {items.map((row, idx) => {
                  const lineSubtotal = (Number(row.quantity_ordered) || 0) * (Number(row.unit_cost) || 0);

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center"
                    >
                      {/* Product Selector */}
                      <div className="sm:col-span-5">
                        <select
                          value={row.product_id}
                          onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-slate-900 dark:text-slate-100 cursor-pointer"
                          required
                        >
                          <option value="">Select Hardware Product...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} (Stock: {p.stock})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center space-x-2 sm:col-span-2">
                        <span className="sm:hidden text-[10.5px] font-bold text-slate-500 w-14">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={row.quantity_ordered}
                          onChange={(e) => handleItemChange(idx, 'quantity_ordered', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-center text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Unit Cost */}
                      <div className="flex items-center space-x-2 sm:col-span-2">
                        <span className="sm:hidden text-[10.5px] font-bold text-slate-500 w-14">Cost:</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="৳ Cost"
                          value={row.unit_cost}
                          onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-right text-xs focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Line Subtotal */}
                      <div className="flex items-center justify-between sm:justify-end sm:col-span-2 font-mono font-bold text-xs text-slate-900 dark:text-slate-100 pr-1">
                        <span className="sm:hidden text-slate-500 font-sans font-normal text-[10.5px]">Subtotal:</span>
                        <span>৳ {lineSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      {/* Delete Action */}
                      <div className="flex items-center justify-end sm:col-span-1 text-right">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Remove product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Section: Order Summary & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {/* Left: Notes & Delivery */}
              <div className="md:col-span-7 space-y-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Add special instructions, shipment tracking, or supplier remarks..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Expected Delivery</label>
                    <input
                      type="date"
                      value={expectedDeliveryDate}
                      onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Upfront Advance Paid</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="৳ 0.00"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Clean Financial Summary */}
              <div className="md:col-span-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold">
                    ৳ {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Tax Amount</span>
                  <span className="font-mono font-semibold">
                    ৳ {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Discount</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-20 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-right text-xs"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Shipping Cost</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="w-20 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-right text-xs"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
                  <span>Total Amount</span>
                  <span className="text-base text-[var(--admin-primary,#4f46e5)] font-mono">
                    ৳ {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Sticky/Clean Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isValid || processing}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--admin-primary,#4f46e5)] hover:bg-[var(--admin-primary-hover,#4338ca)] transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{processing ? 'Issuing Order...' : 'Issue Purchase Order →'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Sub-Modal for Creating Supplier on the Fly */}
      <AddSupplierModal
        isOpen={isAddSupplierModalOpen}
        onClose={() => setIsAddSupplierModalOpen(false)}
        onSupplierCreated={handleSupplierCreated}
      />
    </>
  );
}
