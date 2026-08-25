import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminModal from '../../../Components/Admin/AdminModal';
import InvoicePrintTemplate from '../../../Components/Admin/InvoicePrintTemplate';
import {
  Search, Barcode, ShoppingCart, Plus, Minus, Trash2, PauseCircle,
  PlayCircle, RefreshCw, Printer, User, UserPlus, CreditCard, Banknote,
  Smartphone, Building, CheckCircle2, AlertCircle, X, ChevronRight,
  ChevronDown, Package, Tag, Layers, ArrowRight, DollarSign, Split, Truck, Clock,
  Coins, Info, ShieldCheck, Edit3, Eye, Phone, Mail, MapPin, Check,
  AlertTriangle, ArrowLeftRight
} from 'lucide-react';

export default function AdminPos({
  products = [],
  categories = [],
  brands = [],
  warehouse = null,
  financialAccounts = [],
  heldSales = [],
  defaultCustomer = null,
  customers = [],
  filters = {}
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category_id || null);
  const [selectedBrand, setSelectedBrand] = useState(filters.brand_id || null);

  // POS Cart State
  const [cart, setCart] = useState([]);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' | 'percent'
  const [taxPercent, setTaxPercent] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [orderNote, setOrderNote] = useState('');

  // Canonical & Selected Customer State
  const canonicalWalkIn = defaultCustomer || {
    id: null,
    name: 'Walk-in Customer',
    phone: '',
    email: 'walkin@pos.internal',
    is_walk_in: true,
    current_due: 0,
    credit_limit: 0,
    available_credit: 0,
    address: 'Counter / In-store',
    city: '',
    status: 'active'
  };

  const [selectedCustomer, setSelectedCustomer] = useState(canonicalWalkIn);
  const [customerList, setCustomerList] = useState(customers.length > 0 ? customers : [canonicalWalkIn]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Customer Management Modals
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [isCustomerDetailsDrawerOpen, setIsCustomerDetailsDrawerOpen] = useState(false);
  const [detailedCustomerInfo, setDetailedCustomerInfo] = useState(null);
  const [isLoadingCustomerDetails, setIsLoadingCustomerDetails] = useState(false);

  // Customer Form State
  const initialCustomerFormData = {
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Bangladesh',
    credit_limit: '',
    opening_balance: '',
    opening_balance_type: 'receivable',
    customer_code: '',
    tax_number: '',
    notes: '',
    status: 'active'
  };

  const [customerFormData, setCustomerFormData] = useState(initialCustomerFormData);
  const [customerFormErrors, setCustomerFormErrors] = useState({});
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Payment Settlement State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'cod' | 'multiple' | 'due'
  
  // Single Cash state
  const [cashReceived, setCashReceived] = useState(0);
  const [singleReference, setSingleReference] = useState('');
  const [selectedFinancialAccount, setSelectedFinancialAccount] = useState('');

  // Single Due state
  const [duePaidNow, setDuePaidNow] = useState(0);
  const [dueMethod, setDueMethod] = useState('cash');
  const [dueReference, setDueReference] = useState('');

  // Multiple / Split Payment Rows state
  const [multiplePayments, setMultiplePayments] = useState([
    { id: 1, payment_method: 'cash', amount: 0, reference_number: '', financial_account_id: '' }
  ]);

  // Held Cart Modal
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);

  // Success & Receipt Print Modal
  const [completedSale, setCompletedSale] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Processing & Toast
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const searchInputRef = useRef(null);
  const customerDropdownRef = useRef(null);
  const customerSearchInputRef = useRef(null);

  // Auto focus search on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter products locally or via query
  const filteredProducts = products.filter(p => {
    if (selectedCategory && p.category_id !== Number(selectedCategory)) return false;
    if (selectedBrand && p.brand_id !== Number(selectedBrand)) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
    }
    return true;
  });

  // Cart Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity) - (item.lineDiscount || 0), 0);
  const discountAmount = discountType === 'percent' ? (subtotal * (overallDiscount / 100)) : Number(overallDiscount || 0);
  const taxAmount = (subtotal - discountAmount) * (taxPercent / 100);
  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount + Number(shippingCharge || 0));

  // Initialize payment state on modal open
  useEffect(() => {
    if (isPaymentModalOpen) {
      setCashReceived(grandTotal);
      setDuePaidNow(0);
      setMultiplePayments([
        { id: Date.now(), payment_method: 'cash', amount: grandTotal, reference_number: '', financial_account_id: '' }
      ]);
      setErrorMessage('');
    }
  }, [isPaymentModalOpen, grandTotal]);

  // Debounced Server-Backed Customer Search
  useEffect(() => {
    if (!isCustomerDropdownOpen) return;

    const timer = setTimeout(async () => {
      setIsSearchingCustomers(true);
      try {
        const res = await axios.get('/admin/pos/customers/search', {
          params: { q: customerSearchQuery }
        });
        if (res.data?.success) {
          setCustomerList(res.data.customers || []);
          setHighlightedIndex(0);
        }
      } catch (err) {
        console.error('Customer search error', err);
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [customerSearchQuery, isCustomerDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isCustomerDropdownOpen && customerSearchInputRef.current) {
      customerSearchInputRef.current.focus();
    }
  }, [isCustomerDropdownOpen]);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDropdownOpen(false);
    setCustomerSearchQuery('');
    showToast('success', `Customer set to: ${customer.name}`);
  };

  const handleResetToWalkIn = () => {
    setSelectedCustomer(canonicalWalkIn);
    setIsCustomerDropdownOpen(false);
    showToast('success', 'Reset to Walk-in Customer');
  };

  // Keyboard navigation inside customer search dropdown
  const handleCustomerKeyDown = (e) => {
    if (!isCustomerDropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < customerList.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (customerList.length > 0 && customerList[highlightedIndex]) {
        handleSelectCustomer(customerList[highlightedIndex]);
      } else {
        openAddCustomerModal();
      }
    } else if (e.key === 'Escape') {
      setIsCustomerDropdownOpen(false);
    }
  };

  // Open Add Customer Modal
  const openAddCustomerModal = () => {
    setIsCustomerDropdownOpen(false);
    setCustomerFormData({
      ...initialCustomerFormData,
      name: customerSearchQuery.trim() || '',
    });
    setCustomerFormErrors({});
    setIsAddCustomerModalOpen(true);
  };

  // Open Edit Customer Modal
  const openEditCustomerModal = () => {
    if (!selectedCustomer || selectedCustomer.is_walk_in) {
      showToast('error', 'Cannot edit Walk-in Customer.');
      return;
    }
    setCustomerFormData({
      name: selectedCustomer.name || '',
      phone: selectedCustomer.phone || '',
      email: selectedCustomer.email || '',
      address: selectedCustomer.address || '',
      city: selectedCustomer.city || '',
      state: selectedCustomer.state || '',
      postal_code: selectedCustomer.postal_code || '',
      country: selectedCustomer.country || 'Bangladesh',
      credit_limit: selectedCustomer.credit_limit || '',
      opening_balance: selectedCustomer.opening_balance || '',
      opening_balance_type: selectedCustomer.opening_balance_type || 'receivable',
      customer_code: selectedCustomer.customer_code || '',
      tax_number: selectedCustomer.tax_number || '',
      notes: selectedCustomer.notes || '',
      status: selectedCustomer.status || 'active',
    });
    setCustomerFormErrors({});
    setIsEditCustomerModalOpen(true);
  };

  // Fetch Detailed Customer History & Drawer
  const openCustomerDetailsDrawer = async () => {
    if (!selectedCustomer || selectedCustomer.is_walk_in || !selectedCustomer.id) {
      showToast('info', 'Walk-in Customer has no persistent ledger.');
      return;
    }

    setIsLoadingCustomerDetails(true);
    setIsCustomerDetailsDrawerOpen(true);

    try {
      const res = await axios.get(`/admin/pos/customers/${selectedCustomer.id}`);
      if (res.data?.success) {
        setDetailedCustomerInfo(res.data.customer);
      }
    } catch (err) {
      showToast('error', 'Failed to load customer profile details.');
    } finally {
      setIsLoadingCustomerDetails(false);
    }
  };

  // Save New Customer
  const handleSaveNewCustomer = async (e) => {
    e.preventDefault();
    if (!customerFormData.name.trim()) {
      setCustomerFormErrors({ name: 'Customer name is required.' });
      return;
    }

    setIsSavingCustomer(true);
    setCustomerFormErrors({});

    try {
      const res = await axios.post('/admin/pos/customers', customerFormData);

      if (res.data?.success && res.data.customer) {
        const createdCustomer = res.data.customer;
        setSelectedCustomer(createdCustomer);
        setCustomerList(prev => [createdCustomer, ...prev.filter(c => c.id !== createdCustomer.id)]);
        setIsAddCustomerModalOpen(false);
        setCustomerFormData(initialCustomerFormData);
        showToast('success', res.data.message || `Customer '${createdCustomer.name}' created & selected!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create customer.';
      setCustomerFormErrors({ general: msg });
      if (err.response?.data?.errors) {
        setCustomerFormErrors(err.response.data.errors);
      }
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // Update Customer
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!selectedCustomer?.id) return;

    setIsSavingCustomer(true);
    setCustomerFormErrors({});

    try {
      const res = await axios.put(`/admin/pos/customers/${selectedCustomer.id}`, customerFormData);

      if (res.data?.success && res.data.customer) {
        const updatedCustomer = res.data.customer;
        setSelectedCustomer(updatedCustomer);
        setCustomerList(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        setIsEditCustomerModalOpen(false);
        showToast('success', res.data.message || `Customer '${updatedCustomer.name}' updated!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update customer.';
      setCustomerFormErrors({ general: msg });
      if (err.response?.data?.errors) {
        setCustomerFormErrors(err.response.data.errors);
      }
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      showToast('error', `Cannot add '${product.title}' — Out of Stock.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast('error', `Maximum available stock (${product.stock}) reached.`);
          return prev;
        }
        return prev.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        title: product.title,
        sku: product.sku,
        price: Number(product.price),
        regular_price: Number(product.regular_price || product.price),
        stock: product.stock,
        image: product.image,
        quantity: 1,
        lineDiscount: 0,
      }];
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        if (newQty > item.stock) {
          showToast('error', `Only ${item.stock} units available in stock.`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Clear all items from current POS cart?')) {
      setCart([]);
      setOverallDiscount(0);
      setShippingCharge(0);
      setOrderNote('');
    }
  };

  const handleHoldCart = async () => {
    if (cart.length === 0) {
      showToast('error', 'Cart is empty. Nothing to hold.');
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || 'Walk-in Customer',
        customer_phone: selectedCustomer?.phone || '',
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        notes: orderNote,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
          line_discount: item.lineDiscount,
        })),
      };

      const res = await axios.post('/admin/pos/hold', payload);
      if (res.data?.success) {
        showToast('success', res.data.message);
        setCart([]);
        setOrderNote('');
        router.reload({ only: ['heldSales'] });
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to hold cart.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeHeldCart = (held) => {
    const loadedItems = (held.items || []).map(item => ({
      product_id: item.product_id,
      title: item.product_title || item.product?.title,
      sku: item.sku || item.product?.sku,
      price: Number(item.unit_price),
      regular_price: Number(item.unit_price),
      stock: item.product?.stock ?? 50,
      image: item.product?.image,
      quantity: item.quantity,
      lineDiscount: Number(item.line_discount || 0),
    }));

    setCart(loadedItems);

    // Resolve customer
    if (held.customer_id) {
      const matched = customerList.find(c => c.id === held.customer_id);
      if (matched) {
        setSelectedCustomer(matched);
      } else {
        setSelectedCustomer({
          id: held.customer_id,
          name: held.customer_name || 'Registered Customer',
          phone: held.customer_phone || '',
          email: held.customer_email || '',
          is_walk_in: false,
          current_due: 0,
          credit_limit: 0,
          available_credit: 0
        });
      }
    } else {
      setSelectedCustomer({
        id: null,
        name: held.customer_name || 'Walk-in Customer',
        phone: held.customer_phone || '',
        email: '',
        is_walk_in: true,
        current_due: 0,
        credit_limit: 0,
        available_credit: 0
      });
    }

    setOverallDiscount(Number(held.discount_amount || 0));
    setOrderNote(held.notes || '');
    setIsHeldModalOpen(false);

    // Delete held record so it's resumed
    router.delete(`/admin/pos/held/${held.id}`, { preserveState: true });
    showToast('success', `Retrieved held cart #${held.sale_number}`);
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      showToast('error', 'Cart is empty.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      let payments = [];

      if (paymentMode === 'cash') {
        const received = Number(cashReceived || 0);
        if (received <= 0) throw new Error('Please enter a valid cash amount.');
        if (received < grandTotal) throw new Error(`Cash (৳${received.toLocaleString()}) < total (৳${grandTotal.toLocaleString()}). Use partial/due mode.`);
        payments.push({
          payment_method: 'cash',
          amount: received,
          financial_account_id: selectedFinancialAccount || null,
          reference_number: singleReference || null,
        });
      } else if (paymentMode === 'cod') {
        payments.push({
          payment_method: 'cod',
          amount: 0,
          notes: 'Cash on Delivery — Unpaid at POS',
        });
      } else if (paymentMode === 'due') {
        if (selectedCustomer?.is_walk_in) {
          throw new Error('Due / Credit sales are not permitted for Walk-in Customer.');
        }

        const paidNow = Number(duePaidNow || 0);
        if (paidNow < 0) throw new Error('Paid amount cannot be negative.');
        if (paidNow > grandTotal) throw new Error(`Paid now exceeds grand total.`);

        if (paidNow > 0) {
          payments.push({ payment_method: dueMethod, amount: paidNow, reference_number: dueReference.trim() || null });
        } else {
          payments.push({ payment_method: 'due', amount: 0, notes: 'Full Credit Sale' });
        }
      } else if (paymentMode === 'multiple') {
        let allocated = 0;
        for (let row of multiplePayments) {
          if (row.amount > 0) {
            payments.push({ payment_method: row.payment_method, amount: row.amount, reference_number: row.reference_number?.trim() || null });
            allocated += row.amount;
          }
        }
        if (allocated > grandTotal) throw new Error(`Total payment allocation exceeds grand total.`);
        if (allocated < grandTotal && selectedCustomer?.is_walk_in) throw new Error('Partial payments not allowed for Walk-in.');
        
        if (payments.length === 0) {
          if (selectedCustomer?.is_walk_in) throw new Error('Due sale not allowed for Walk-in.');
          payments.push({ payment_method: 'due', amount: 0 });
        }
      }

      const totalPaid = payments.reduce((acc, p) => acc + (p.payment_method === 'cod' || p.payment_method === 'due' ? 0 : Number(p.amount || 0)), 0);

      const payload = {
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || 'Walk-in Customer',
        customer_phone: selectedCustomer?.phone || null,
        customer_email: selectedCustomer?.email || null,
        warehouse_id: warehouse?.id || null,
        subtotal,
        discount_amount: discountAmount,
        discount_type: discountType,
        tax_amount: taxAmount,
        shipping_charge: Number(shippingCharge || 0),
        grand_total: grandTotal,
        paid_amount: totalPaid,
        notes: orderNote,
        items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity, unit_price: item.price, line_discount: item.lineDiscount })),
        payments,
      };

      const res = await axios.post('/admin/pos/checkout', payload);
      if (res.data?.success) {
        setCompletedSale(res.data.sale);
        setIsPaymentModalOpen(false);
        setIsReceiptModalOpen(true);
        setCart([]);
        showToast('success', res.data.message);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Transaction failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminShell title="POS Cashier Terminal">
      <Head title="POS Terminal - TechMarket BD" />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-3 duration-200 ${
          toastMessage.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
            : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* POS WORKSPACE 12-COLUMN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-140px)] min-h-[680px]">
        {/* LEFT / PRODUCT CATALOG PANEL (7 Cols) */}
        <div className="xl:col-span-7 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          {/* Catalog Top Search & Filters Bar */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Scan barcode, SKU, or search hardware..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Warehouse Terminal Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                <Building className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="truncate max-w-[130px]">{warehouse?.name || 'Central WH'}</span>
              </div>
            </div>

            {/* Category Quick Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] shrink-0 transition ${
                  selectedCategory === null ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                  className={`px-3 py-1 rounded-lg font-medium text-[11px] shrink-0 transition ${
                    selectedCategory === cat.id ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Package className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300 dark:text-slate-600" />
                <div className="font-bold text-sm text-slate-600 dark:text-slate-300">No hardware found</div>
                <div className="text-xs">Adjust your search or category filter.</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProducts.map((p) => {
                  const inCartItem = cart.find(c => c.product_id === p.id);
                  const isOutOfStock = p.stock <= 0;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p)}
                      disabled={isOutOfStock}
                      className={`relative flex flex-col text-left p-2.5 rounded-xl border transition-all duration-150 group cursor-pointer ${
                        inCartItem
                          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                          : isOutOfStock
                            ? 'opacity-50 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-not-allowed'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-full h-24 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-2 mb-2 overflow-hidden border border-slate-100 dark:border-slate-800">
                        {p.image ? (
                          <img src={p.image} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                        ) : (
                          <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>

                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight mb-1">
                        {p.title}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mb-2">
                        SKU: {p.sku || 'N/A'}
                      </div>

                      <div className="mt-auto pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isOutOfStock
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                            : p.stock <= 5
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {p.stock} In
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                          ৳{Number(p.price).toLocaleString()}
                        </span>
                      </div>

                      {inCartItem && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                          {inCartItem.quantity}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT / CART & CHECKOUT PANEL (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          
          {/* ========================================================================= */}
          {/* REDESIGNED POS CUSTOMER SECTION WITH SELECTOR, SEARCH & DETAILS PANEL     */}
          {/* ========================================================================= */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 space-y-2.5 shrink-0 bg-slate-50/70 dark:bg-slate-900/70">
            {/* Header controls: Title, Held Sales, Clear Cart */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Customer
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsHeldModalOpen(true)}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 hover:bg-amber-100 flex items-center gap-1 transition cursor-pointer"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Held ({heldSales.length})</span>
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-40 cursor-pointer"
                  title="Clear Cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Clickable Customer Selector Container */}
            <div className="relative" ref={customerDropdownRef}>
              <div
                onClick={() => setIsCustomerDropdownOpen(prev => !prev)}
                className={`p-2.5 rounded-xl border bg-white dark:bg-slate-800/90 shadow-xs cursor-pointer transition-all duration-150 select-none ${
                  isCustomerDropdownOpen
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedCustomer?.is_walk_in
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {selectedCustomer?.name || 'Walk-in Customer'}
                        </span>
                        {selectedCustomer?.is_walk_in ? (
                          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                            Default
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            Registered
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-2">
                        {selectedCustomer?.phone && <span>{selectedCustomer.phone}</span>}
                        {selectedCustomer?.city && <span>• {selectedCustomer.city}</span>}
                        {selectedCustomer?.is_walk_in && <span>In-store Counter Customer</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!selectedCustomer?.is_walk_in && (
                      <div className="text-right">
                        <div className="text-[9px] uppercase font-bold text-slate-400">Due</div>
                        <div className={`font-mono text-xs font-black ${
                          Number(selectedCustomer?.current_due) > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          ৳{Number(selectedCustomer?.current_due || 0).toLocaleString()}
                        </div>
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isCustomerDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                    }`} />
                  </div>
                </div>
              </div>

              {/* SEARCHABLE CUSTOMER DROPDOWN / POPOVER */}
              {isCustomerDropdownOpen && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  onKeyDown={handleCustomerKeyDown}
                >
                  {/* Search Input Bar */}
                  <div className="p-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        ref={customerSearchInputRef}
                        type="text"
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        placeholder="Search by name, phone, email, or customer code..."
                        className="w-full pl-8 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100"
                      />
                      {isSearchingCustomers ? (
                        <RefreshCw className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                      ) : customerSearchQuery ? (
                        <button
                          type="button"
                          onClick={() => setCustomerSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Customer Results List */}
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 scrollbar-thin">
                    {customerList.length === 0 ? (
                      <div className="p-4 text-center space-y-2">
                        <div className="text-xs text-slate-500 font-medium">No customer found matching "{customerSearchQuery}"</div>
                        <button
                          type="button"
                          onClick={openAddCustomerModal}
                          className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Add New Customer "{customerSearchQuery}"</span>
                        </button>
                      </div>
                    ) : (
                      customerList.map((c, idx) => {
                        const isSelected = selectedCustomer?.id === c.id || (c.is_walk_in && selectedCustomer?.is_walk_in);
                        const isHighlighted = idx === highlightedIndex;

                        return (
                          <div
                            key={c.id || 'walkin'}
                            onClick={() => handleSelectCustomer(c)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition text-xs ${
                              isSelected
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/50 font-bold'
                                : isHighlighted
                                ? 'bg-slate-100/70 dark:bg-slate-700/60'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{c.name}</span>
                                {c.is_walk_in && (
                                  <span className="text-[9px] font-black px-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    DEFAULT
                                  </span>
                                )}
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-2 mt-0.5">
                                {c.phone && <span>{c.phone}</span>}
                                {c.email && c.email !== 'walkin@pos.internal' && <span>• {c.email}</span>}
                                {c.city && <span>• {c.city}</span>}
                              </div>
                            </div>

                            <div className="text-right shrink-0 font-mono">
                              {!c.is_walk_in ? (
                                <>
                                  <div className={`text-[11px] font-bold ${
                                    Number(c.current_due) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                                  }`}>
                                    Due: ৳{Number(c.current_due || 0).toLocaleString()}
                                  </div>
                                  {Number(c.credit_limit) > 0 && (
                                    <div className="text-[9px] text-slate-400">
                                      Limit: ৳{Number(c.credit_limit).toLocaleString()}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-sans">Counter Sale</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add New Customer Action Footer */}
                  <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleResetToWalkIn}
                      className="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold transition cursor-pointer"
                    >
                      Reset to Walk-in
                    </button>

                    <button
                      type="button"
                      onClick={openAddCustomerModal}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add New Customer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CUSTOMER SUMMARY CHIPS / DETAILS (When Registered Customer Selected) */}
            {!selectedCustomer?.is_walk_in && (
              <div className="p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 text-indigo-950 dark:text-indigo-200 font-bold truncate">
                    <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{selectedCustomer.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={openCustomerDetailsDrawer}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                      title="View Customer Ledger & History"
                    >
                      <Eye className="w-3 h-3 text-indigo-600" />
                      <span>Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={openEditCustomerModal}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                      title="Edit Customer"
                    >
                      <Edit3 className="w-3 h-3 text-indigo-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetToWalkIn}
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Switch back to Walk-in Customer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Financial Summary Badges */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center font-mono text-[11px]">
                  <div className="p-1 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                    <div className="text-[9px] uppercase font-bold text-slate-400 font-sans">Current Due</div>
                    <div className={`font-black ${
                      Number(selectedCustomer.current_due) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                    }`}>
                      ৳{Number(selectedCustomer.current_due || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-1 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                    <div className="text-[9px] uppercase font-bold text-slate-400 font-sans">Credit Limit</div>
                    <div className="font-black text-slate-800 dark:text-slate-200">
                      {Number(selectedCustomer.credit_limit) > 0
                        ? `৳${Number(selectedCustomer.credit_limit).toLocaleString()}`
                        : 'No Limit'}
                    </div>
                  </div>

                  <div className="p-1 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                    <div className="text-[9px] uppercase font-bold text-slate-400 font-sans">Avail. Credit</div>
                    <div className="font-black text-indigo-600 dark:text-indigo-400">
                      {Number(selectedCustomer.credit_limit) > 0
                        ? `৳${Number(selectedCustomer.available_credit || 0).toLocaleString()}`
                        : 'Unlimited'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-3.5 divide-y divide-slate-100 dark:divide-slate-800 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <ShoppingCart className="w-10 h-10 stroke-[1.5] mb-2 text-slate-300 dark:text-slate-600" />
                <div className="font-bold text-xs text-slate-600 dark:text-slate-300">POS Cart is Empty</div>
                <div className="text-[11px]">Click items to add to sale.</div>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.title}</div>
                    <div className="text-[10px] font-mono text-slate-400">৳{item.price.toLocaleString()} each</div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[70px] shrink-0 font-mono font-bold text-slate-900 dark:text-slate-100">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </div>

                  {/* Remove Action */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product_id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Pricing & Quick Checkout Bar */}
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 space-y-2 shrink-0">
            {/* Calculation rows */}
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-mono font-bold">৳{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span>Discount</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={overallDiscount || ''}
                    onChange={(e) => setOverallDiscount(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-20 px-2 py-0.5 text-right font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setDiscountType(prev => prev === 'fixed' ? 'percent' : 'fixed')}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    {discountType === 'fixed' ? '৳' : '%'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between font-mono font-bold text-sm text-slate-900 dark:text-slate-100 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                <span className="font-heading">Grand Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleHoldCart}
                disabled={cart.length === 0 || isProcessing}
                className="py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-100 transition disabled:opacity-40 cursor-pointer"
              >
                <PauseCircle className="w-4 h-4" />
                <span>Hold Sale</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={cart.length === 0 || isProcessing}
                className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition disabled:opacity-40 cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                <span>Pay ৳{grandTotal.toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADD NEW CUSTOMER MODAL (Fast POS Drawer/Modal)                        */}
      {/* ========================================================================= */}
      <AdminModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        title="Add New Customer"
        subtitle="Register customer profile for sales tracking and store credit"
        icon={UserPlus}
        size="lg"
      >
        <form onSubmit={handleSaveNewCustomer} className="space-y-4 text-xs">
          {customerFormErrors.general && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{customerFormErrors.general}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Basic Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerFormData.name}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                  placeholder="e.g. Naim Ahsan"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
                />
                {customerFormErrors.name && (
                  <p className="text-rose-500 text-[10px] mt-1">{customerFormErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={customerFormData.phone}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                  placeholder="017xxxxxxxx"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerFormData.email}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                  placeholder="customer@email.com"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Financial & Accounting Settings */}
          <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
            <div className="font-bold text-indigo-900 dark:text-indigo-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Financial & Credit Limit</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Integrates with Double-Entry Ledger</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Credit Limit (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={customerFormData.credit_limit}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, credit_limit: e.target.value })}
                  placeholder="0.00 (0 = No limit)"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Opening Balance (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customerFormData.opening_balance}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, opening_balance: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Balance Type
                </label>
                <select
                  value={customerFormData.opening_balance_type}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, opening_balance_type: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                >
                  <option value="receivable">Receivable (Customer owes us)</option>
                  <option value="payable">Payable (We owe customer)</option>
                  <option value="neutral">Neutral / Zero</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address & ERP Details */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Address & Tax Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={customerFormData.address}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                  placeholder="e.g. House 12, Road 4, Dhanmondi"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City / District
                </label>
                <input
                  type="text"
                  value={customerFormData.city}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, city: e.target.value })}
                  placeholder="Dhaka"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setIsAddCustomerModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSavingCustomer}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              {isSavingCustomer ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving & Selecting...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save & Auto-Select Customer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ========================================================================= */}
      {/* 2. EDIT CUSTOMER MODAL                                                    */}
      {/* ========================================================================= */}
      <AdminModal
        isOpen={isEditCustomerModalOpen}
        onClose={() => setIsEditCustomerModalOpen(false)}
        title={`Edit Customer: ${selectedCustomer?.name}`}
        subtitle="Update customer profile details and credit limit"
        icon={Edit3}
        size="lg"
      >
        <form onSubmit={handleUpdateCustomer} className="space-y-4 text-xs">
          {customerFormErrors.general && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{customerFormErrors.general}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerFormData.name}
                onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={customerFormData.phone}
                onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={customerFormData.email}
                onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Credit Limit (৳)</label>
              <input
                type="number"
                min="0"
                value={customerFormData.credit_limit}
                onChange={(e) => setCustomerFormData({ ...customerFormData, credit_limit: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={customerFormData.address}
                onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setIsEditCustomerModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSavingCustomer}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 cursor-pointer"
            >
              {isSavingCustomer ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Update Customer</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ========================================================================= */}
      {/* 3. CUSTOMER DETAILS PROFILE DRAWER                                       */}
      {/* ========================================================================= */}
      <AdminModal
        isOpen={isCustomerDetailsDrawerOpen}
        onClose={() => setIsCustomerDetailsDrawerOpen(false)}
        title={`Customer Profile: ${selectedCustomer?.name}`}
        subtitle="Customer analytics, contact info, and recent transaction history"
        icon={User}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          {isLoadingCustomerDetails ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
              <div>Loading customer analytics & ledger...</div>
            </div>
          ) : detailedCustomerInfo ? (
            <>
              {/* Financial Snapshot */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total Spent</div>
                  <div className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                    ৳{Number(detailedCustomerInfo.total_purchases || 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total Sales</div>
                  <div className="font-mono font-black text-sm text-slate-800 dark:text-slate-100 mt-1">
                    {detailedCustomerInfo.sales_count || 0}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Current Due</div>
                  <div className={`font-mono font-black text-sm mt-1 ${
                    Number(detailedCustomerInfo.current_due) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                  }`}>
                    ৳{Number(detailedCustomerInfo.current_due || 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Avail. Credit</div>
                  <div className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    ৳{Number(detailedCustomerInfo.available_credit || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-slate-300">Contact & Address</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                  <div><strong>Phone:</strong> {detailedCustomerInfo.phone || 'N/A'}</div>
                  <div><strong>Email:</strong> {detailedCustomerInfo.email || 'N/A'}</div>
                  <div className="col-span-2"><strong>Address:</strong> {detailedCustomerInfo.address || 'N/A'} {detailedCustomerInfo.city ? `(${detailedCustomerInfo.city})` : ''}</div>
                </div>
              </div>

              {/* Recent Sales Table */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200">Recent POS Invoices</div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  {detailedCustomerInfo.recent_sales?.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No prior sales recorded.</div>
                  ) : (
                    detailedCustomerInfo.recent_sales?.map((s) => (
                      <div key={s.id} className="p-2.5 flex items-center justify-between text-xs bg-white dark:bg-slate-900">
                        <div>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{s.sale_number}</span>
                          <span className="text-[10px] text-slate-400 ml-2">{new Date(s.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            s.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {s.payment_status}
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            ৳{Number(s.grand_total).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsCustomerDetailsDrawerOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      </AdminModal>

      {/* ========================================================================= */}
      {/* 4. POS PAYMENT SETTLEMENT MODAL                                           */}
      {/* ========================================================================= */}
      <AdminModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="POS Payment Settlement"
        subtitle={`Order total: ৳${grandTotal.toLocaleString()} • Customer: ${selectedCustomer?.name || 'Walk-in'}`}
        icon={CreditCard}
        size="xl"
      >
        <div className="space-y-4 text-xs">
          {/* Header Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2 pb-2 border-b border-slate-800 text-[11px]">
              <div className="flex items-center gap-4 text-slate-300">
                <span>Subtotal: <strong className="text-white font-mono">৳{subtotal.toLocaleString()}</strong></span>
                {discountAmount > 0 && (
                  <span>Discount: <strong className="text-amber-400 font-mono">-৳{discountAmount.toLocaleString()}</strong></span>
                )}
                {taxAmount > 0 && (
                  <span>Tax: <strong className="text-slate-200 font-mono">+৳{taxAmount.toLocaleString()}</strong></span>
                )}
                {shippingCharge > 0 && (
                  <span>Shipping: <strong className="text-slate-200 font-mono">+৳{Number(shippingCharge).toLocaleString()}</strong></span>
                )}
              </div>
              <div className="text-slate-400 font-medium">
                Customer: <strong className="text-indigo-300">{selectedCustomer?.name || 'Walk-in Customer'}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Payable Amount:</span>
              <span className="font-mono font-black text-2xl text-emerald-400">৳ {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Error Message banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Payment Mode Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setPaymentMode('cash'); setErrorMessage(''); }}
              className={`px-3 py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMode === 'cash'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Cash</span>
            </button>

            <button
              type="button"
              onClick={() => { setPaymentMode('cod'); setErrorMessage(''); }}
              className={`px-3 py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMode === 'cod'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>COD</span>
            </button>

            <button
              type="button"
              onClick={() => { setPaymentMode('multiple'); setErrorMessage(''); }}
              className={`px-3 py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMode === 'multiple'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Split className="w-4 h-4" />
              <span>Partial / Split</span>
            </button>

            <button
              type="button"
              onClick={() => { setPaymentMode('due'); setErrorMessage(''); }}
              className={`px-3 py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMode === 'due'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Due Sale</span>
            </button>
          </div>

          {/* MODE 1: SINGLE CASH SETTLEMENT */}
          {paymentMode === 'cash' && (
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Cash Received Tender</span>
                <span className="text-[11px] text-slate-500">Quick presets:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCashReceived(grandTotal)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-[11px] hover:bg-indigo-100 cursor-pointer"
                >
                  Exact (৳{grandTotal.toLocaleString()})
                </button>
                {[500, 1000, 2000, 5000].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setCashReceived(prev => (Number(prev) || 0) + step)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    +৳{step.toLocaleString()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCashReceived(0)}
                  className="px-2 py-1 rounded-lg text-slate-400 hover:text-rose-500 text-[11px] font-bold cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Cash Amount (৳)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-black text-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Change Due to Customer
                  </label>
                  <div className={`p-2.5 rounded-xl border font-mono font-black text-lg flex items-center justify-between ${
                    Number(cashReceived) >= grandTotal
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                  }`}>
                    <span>Change:</span>
                    <span>৳ {Math.max(0, Number(cashReceived || 0) - grandTotal).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: COD SETTLEMENT */}
          {paymentMode === 'cod' && (
            <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <Truck className="w-5 h-5" />
                <span>Cash on Delivery (COD) Confirmation</span>
              </div>
              <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                The order will be created with payment status <strong>DUE / UNPAID</strong>. No cash is collected at the POS counter now. The full balance of <strong>৳{grandTotal.toLocaleString()}</strong> will remain outstanding in Accounts Receivable until courier delivery settlement.
              </p>
            </div>
          )}

          {/* MODE 3: DUE SALE (CUSTOMER CREDIT) */}
          {paymentMode === 'due' && (
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 animate-in fade-in duration-150">
              {selectedCustomer?.is_walk_in ? (
                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Due Sales Disabled for Walk-in Customer</span>
                  </div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300">
                    To record a credit/due sale, please select or create a registered customer account above.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Customer Credit / Due Settlement</span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                      Outstanding Due: ৳{Math.max(0, grandTotal - Number(duePaidNow || 0)).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Initial Payment (Paid Now)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={grandTotal}
                        value={duePaidNow}
                        onChange={(e) => setDuePaidNow(Math.min(grandTotal, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={dueMethod}
                        onChange={(e) => setDueMethod(e.target.value)}
                        disabled={Number(duePaidNow) <= 0}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold disabled:opacity-50"
                      >
                        <option value="cash">Cash in Hand</option>
                        <option value="bkash">bKash Merchant</option>
                        <option value="nagad">Nagad Merchant</option>
                        <option value="card">POS Card Swipe</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        TrxID / Reference {['card', 'pos_card', 'bkash', 'nagad', 'bank_transfer'].includes(dueMethod) && Number(duePaidNow) > 0 && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={dueReference}
                        onChange={(e) => setDueReference(e.target.value)}
                        disabled={Number(duePaidNow) <= 0}
                        placeholder="e.g. TR-998811"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs disabled:opacity-50"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* MODE 4: MULTIPLE / SPLIT PAYMENTS */}
          {paymentMode === 'multiple' && (
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Payment Breakdown Rows</span>
                <button
                  type="button"
                  onClick={() => {
                    const allocated = multiplePayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
                    const remaining = Math.max(0, grandTotal - allocated);
                    setMultiplePayments(prev => [
                      ...prev,
                      { id: Date.now(), payment_method: 'bkash', amount: remaining, reference_number: '', financial_account_id: '' }
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] flex items-center gap-1 hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Payment</span>
                </button>
              </div>

              {/* Rows List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {multiplePayments.map((row, idx) => (
                  <div key={row.id} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <select
                        value={row.payment_method}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiplePayments(prev => prev.map((p, i) => i === idx ? { ...p, payment_method: val } : p));
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs"
                      >
                        <option value="cash">Cash in Hand</option>
                        <option value="card">POS Card Swipe</option>
                        <option value="bkash">bKash Merchant</option>
                        <option value="nagad">Nagad Merchant</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount"
                        value={row.amount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMultiplePayments(prev => prev.map((p, i) => i === idx ? { ...p, amount: val } : p));
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-xs text-right"
                      />
                    </div>

                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Ref (Optional)"
                        value={row.reference_number || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiplePayments(prev => prev.map((p, i) => i === idx ? { ...p, reference_number: val } : p));
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                      />
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (multiplePayments.length > 1) {
                            setMultiplePayments(prev => prev.filter((_, i) => i !== idx));
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                        title="Remove row"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REAL-TIME SETTLEMENT SUMMARY BAR */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold">
            <span>Total Payable: <strong className="font-mono text-slate-900 dark:text-slate-100">৳{grandTotal.toLocaleString()}</strong></span>
            <button
              type="button"
              onClick={handleCompleteSale}
              disabled={isProcessing}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Complete Sale</span>}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* HELD SALES RETRIEVAL MODAL */}
      <AdminModal
        isOpen={isHeldModalOpen}
        onClose={() => setIsHeldModalOpen(false)}
        title="Retrieve Held Carts"
        subtitle="Resume or checkout previously parked POS sales"
        icon={PauseCircle}
        size="md"
      >
        <div className="space-y-3 text-xs">
          {heldSales.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <PauseCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <div className="font-bold">No held sales found</div>
            </div>
          ) : (
            heldSales.map((held) => (
              <div key={held.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="font-bold font-mono text-slate-900 dark:text-slate-100">{held.sale_number}</div>
                  <div className="text-slate-500 text-[11px]">Customer: {held.customer_name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleResumeHeldCart(held)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 cursor-pointer"
                >
                  Resume
                </button>
              </div>
            ))
          )}
        </div>
      </AdminModal>

      {/* THERMAL / INVOICE PRINT RECEIPT MODAL */}
      <AdminModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Sale Completed — Invoice & Receipt"
        subtitle={`Invoice #${completedSale?.sale_number || ''} generated successfully`}
        icon={Printer}
        size="xl"
      >
        {completedSale && (
          <InvoicePrintTemplate
            sale={completedSale}
            initialFormat="58mm"
            showFormatSelector={true}
            onClose={() => setIsReceiptModalOpen(false)}
          />
        )}
      </AdminModal>
    </AdminShell>
  );
}
