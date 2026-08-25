import React, { useState } from 'react';
import { 
  Building2, User, Phone, Mail, Hash, Globe, 
  MapPin, DollarSign, FileText, X, CheckCircle2, 
  AlertCircle, ShieldCheck, Sparkles, Plus
} from 'lucide-react';

export default function AddSupplierModal({
  isOpen,
  onClose,
  onSupplierCreated,
}) {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    supplier_code: '',
    tax_number: '',
    website: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Bangladesh',
    credit_limit: '',
    opening_balance: '',
    opening_balance_type: 'payable',
    payment_terms: 'due_on_receipt',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!formData.company_name.trim()) {
      setFieldErrors({ company_name: 'Supplier name is required.' });
      return;
    }
    if (!formData.phone.trim()) {
      setFieldErrors({ phone: 'Phone number is required.' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/admin/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          ...formData,
          credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : 0,
          opening_balance: formData.opening_balance ? parseFloat(formData.opening_balance) : 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          setFieldErrors(data.errors);
          setError('Please resolve the validation errors below.');
        } else {
          setError(data.message || 'Failed to create supplier.');
        }
        setLoading(false);
        return;
      }

      if (data.success && data.supplier) {
        onSupplierCreated(data.supplier);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div 
        className="w-full max-w-[620px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[var(--admin-radius,16px)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        style={{ fontFamily: 'var(--admin-font-family, inherit)' }}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--admin-primary-light,rgba(79,70,229,0.08))] text-[var(--admin-primary,#4f46e5)] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                Add Supplier / Vendor
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                Create a supplier profile for purchasing and accounts payable.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar flex-1 p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Basic Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Supplier / Vendor Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Star Tech Distributors Ltd"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-medium text-xs text-slate-900 dark:text-slate-100"
                />
                {fieldErrors.company_name && (
                  <p className="text-[10px] text-rose-500 font-medium">{fieldErrors.company_name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tanvir Ahmed (Account Mgr)"
                  value={formData.contact_person}
                  onChange={(e) => handleChange('contact_person', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-medium text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01711223344"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-medium text-xs font-mono text-slate-900 dark:text-slate-100"
                />
                {fieldErrors.phone && (
                  <p className="text-[10px] text-rose-500 font-medium">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="orders@startechdist.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-medium text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Supplier Code</span>
                  <span className="text-[10px] font-normal text-slate-400">Leave blank to auto-generate</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SUP-STAR01"
                  value={formData.supplier_code}
                  onChange={(e) => handleChange('supplier_code', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-mono text-xs uppercase text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Tax / BIN / VAT Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. BIN-99228811"
                  value={formData.tax_number}
                  onChange={(e) => handleChange('tax_number', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-mono text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Location */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Address & Location
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Street Address
              </label>
              <input
                type="text"
                placeholder="e.g. Suite 402, Multiplan Center, Elephant Road"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">City / District</label>
                <input
                  type="text"
                  placeholder="Dhaka"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Postal Code</label>
                <input
                  type="text"
                  placeholder="1205"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Country</label>
                <input
                  type="text"
                  placeholder="Bangladesh"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Credit Information */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Financial Terms & Opening Balance
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Credit Limit (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={formData.credit_limit}
                  onChange={(e) => handleChange('credit_limit', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-mono text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Payment Terms
                </label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => handleChange('payment_terms', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer"
                >
                  <option value="due_on_receipt">Due on Receipt</option>
                  <option value="7_days">Net 7 Days</option>
                  <option value="15_days">Net 15 Days</option>
                  <option value="30_days">Net 30 Days</option>
                  <option value="45_days">Net 45 Days</option>
                  <option value="60_days">Net 60 Days</option>
                  <option value="custom">Custom Arrangement</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Opening Balance (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={formData.opening_balance}
                    onChange={(e) => handleChange('opening_balance', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden font-mono font-bold text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Balance Type</label>
                  <div className="flex items-center space-x-3 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="opening_balance_type"
                        value="payable"
                        checked={formData.opening_balance_type === 'payable'}
                        onChange={() => handleChange('opening_balance_type', 'payable')}
                        className="text-[var(--admin-primary,#4f46e5)] focus:ring-0"
                      />
                      <span>Payable (We owe)</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="opening_balance_type"
                        value="advance"
                        checked={formData.opening_balance_type === 'advance'}
                        onChange={() => handleChange('opening_balance_type', 'advance')}
                        className="text-[var(--admin-primary,#4f46e5)] focus:ring-0"
                      />
                      <span>Advance (Credit)</span>
                    </label>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Opening balances automatically post double-entry general ledger journal transactions with Accounts Payable (2001).
              </p>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="space-y-1 pt-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Notes & Procurement Terms</label>
            <textarea
              rows="2"
              placeholder="Add any vendor notes, warranty handling details, or bank account instructions..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:outline-hidden text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--admin-primary,#4f46e5)] hover:bg-[var(--admin-primary-hover,#4338ca)] transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving Supplier...' : 'Save Supplier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
