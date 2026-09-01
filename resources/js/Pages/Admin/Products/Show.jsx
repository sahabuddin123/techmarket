import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DetailPageTemplate from '../Templates/DetailPageTemplate';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminEmptyState from '../../../Components/Admin/AdminEmptyState';
import { 
  Package, DollarSign, Boxes, TrendingUp, Layers, 
  ExternalLink, Edit2, Star, MessageSquare, Search, 
  Clock, ShieldCheck, CheckCircle2, AlertTriangle, Image as ImageIcon
} from 'lucide-react';

export default function ProductDetail({ 
  product = {}, 
  inventoryLedger = [], 
  salesSummary = {} 
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview & Media' },
    { id: 'specs', label: 'Specifications & Bullets', count: (product.key_specs || []).length },
    { id: 'inventory', label: 'Stock & Inventory Ledger', count: inventoryLedger.length },
    { id: 'reviews', label: 'Reviews & Q&A', count: (product.reviews || []).length + (product.questions || []).length },
    { id: 'seo', label: 'SEO & Search Engine Preview' },
  ];

  const fullSpecs = Array.isArray(product.full_specs) ? product.full_specs : [];
  const keySpecs = Array.isArray(product.key_specs) ? product.key_specs : [];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const questions = Array.isArray(product.questions) ? product.questions : [];

  return (
    <DetailPageTemplate
      title={product.title || 'Product Details'}
      subtitle={`SKU: ${product.sku || 'N/A'} • Category: ${product.category?.name || 'General'} • Brand: ${product.brand?.name || 'Unbranded'}`}
      badge={product.stock > 0 ? (product.stock <= 5 ? 'Low Stock' : 'In Stock') : 'Out of Stock'}
      backUrl="/admin/products"
      breadcrumbs={[
        { label: 'Products', href: '/admin/products' },
        { label: product.title || 'Details' }
      ]}
      headerActions={
        <div className="flex items-center space-x-2">
          {product.slug && (
            <a
              href={`/product/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </a>
          )}
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Product</span>
          </Link>
        </div>
      }
      kpis={[
        <AdminKpiCard
          key="kpi-price"
          title="Current Price"
          value={`৳ ${Number(product.price || 0).toLocaleString()}`}
          description={product.regular_price ? `Regular: ৳ ${Number(product.regular_price).toLocaleString()}` : 'Standard selling price'}
          icon={DollarSign}
          color="indigo"
        />,
        <AdminKpiCard
          key="kpi-stock"
          title="Inventory Balance"
          value={`${product.stock ?? 0} Units`}
          description={product.stock <= 5 ? 'Below safety threshold' : 'Optimal physical stock'}
          icon={Boxes}
          color={product.stock > 5 ? 'emerald' : product.stock > 0 ? 'amber' : 'rose'}
        />,
        <AdminKpiCard
          key="kpi-sold"
          title="Units Sold"
          value={`${salesSummary.total_units_sold ?? 0} Units`}
          description={`Across ${salesSummary.orders_count ?? 0} customer orders`}
          icon={TrendingUp}
          color="blue"
        />,
        <AdminKpiCard
          key="kpi-revenue"
          title="Lifetime Revenue"
          value={`৳ ${Number(salesSummary.total_revenue ?? 0).toLocaleString()}`}
          description="Realized checkout earnings"
          icon={ShieldCheck}
          color="purple"
        />
      ]}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <Head title={`${product.title || 'Product'} - TechMarket Admin`} />

      {/* =========================================================================
          TAB 1: OVERVIEW & MEDIA
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Descriptions & Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Gallery Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Product Media Assets</span>
              </h3>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-40 h-40 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center shrink-0">
                  {product.image ? (
                    <img src={product.image} alt="" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Package className="w-12 h-12 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Supplementary Gallery ({Array.isArray(product.gallery) ? product.gallery.length : 0} Images)
                  </div>
                  {Array.isArray(product.gallery) && product.gallery.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {product.gallery.map((imgUrl, i) => (
                        <div key={i} className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 flex items-center justify-center">
                          <img src={imgUrl} alt="" className="max-h-full max-w-full object-contain" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No supplementary gallery images attached.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description & Overview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                Detailed Product Overview
              </h3>

              {product.short_description && (
                <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {product.short_description}
                </div>
              )}

              {product.description ? (
                <div 
                  className="text-xs text-slate-600 dark:text-slate-300 space-y-2 prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-xs text-slate-400">No detailed description has been added yet.</p>
              )}
            </div>
          </div>

          {/* Right Col: Metadata & Identity */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                Product Details
              </h3>

              <dl className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Category</dt>
                  <dd className="font-bold text-slate-900 dark:text-slate-100">{product.category?.name || 'General'}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Brand</dt>
                  <dd className="font-bold text-slate-900 dark:text-slate-100">{product.brand?.name || 'Unbranded'}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Warranty</dt>
                  <dd className="font-bold text-slate-900 dark:text-slate-100">{product.warranty || <span className="text-slate-400 font-normal">None</span>}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Featured Status</dt>
                  <dd><AdminStatusBadge status={product.is_featured ? 'featured' : 'standard'} label={product.is_featured ? 'Featured' : 'Standard'} size="xs" /></dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Deal of the Day</dt>
                  <dd><AdminStatusBadge status={product.is_deal_of_day ? 'active' : 'inactive'} label={product.is_deal_of_day ? 'Yes' : 'No'} size="xs" /></dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Created On</dt>
                  <dd className="font-mono text-slate-600 dark:text-slate-400">{product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SPECIFICATIONS & BULLETS
          ========================================================================= */}
      {activeTab === 'specs' && (
        <div className="space-y-6">
          {/* Key Bullet Highlights */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Key Bullet Highlights</span>
            </h3>

            {keySpecs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {keySpecs.map((bullet, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No key bullet points specified for this item.</p>
            )}
          </div>

          {/* Full Technical Specifications Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
              Technical Specifications Matrix
            </h3>

            {fullSpecs.length > 0 ? (
              <div className="space-y-4">
                {fullSpecs.map((grp, gIdx) => (
                  <div key={gIdx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
                      {grp.group || 'General Specifications'}
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {(grp.attributes || []).map((attr, aIdx) => (
                        <div key={aIdx} className="px-4 py-2.5 grid grid-cols-1 sm:grid-cols-3 text-xs">
                          <span className="font-semibold text-slate-500">{attr.name}</span>
                          <span className="sm:col-span-2 font-medium text-slate-800 dark:text-slate-200">{attr.value || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No structured technical specifications matrix attached.</p>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STOCK & INVENTORY LEDGER
          ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
            <Boxes className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Inventory Transaction History</span>
          </h3>

          {inventoryLedger.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 dark:border-slate-800 pb-2 font-mono">
                    <th className="py-2.5">Date & Time</th>
                    <th className="py-2.5">Adjustment Type</th>
                    <th className="py-2.5 text-right">Quantity Delta</th>
                    <th className="py-2.5">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {inventoryLedger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-slate-500">
                        {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-2.5 capitalize font-semibold text-slate-800 dark:text-slate-200">
                        {tx.type || 'Adjustment'}
                      </td>
                      <td className={`py-2.5 text-right font-mono font-bold ${
                        tx.quantity_change > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {tx.quantity_change > 0 ? `+${tx.quantity_change}` : tx.quantity_change}
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">
                        {tx.notes || tx.reason || 'Manual inventory operation'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminEmptyState
              title="No Inventory Logs Recorded"
              description="Stock movements and adjustments will be logged automatically here."
            />
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: REVIEWS & Q&A
          ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reviews Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Customer Reviews ({reviews.length})</span>
            </h3>

            {reviews.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{rev.user?.name || 'Customer'}</span>
                      <span className="flex items-center text-amber-500 font-mono font-bold">
                        ★ {rev.rating || 5}.0
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-normal">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <AdminEmptyState
                title="No Customer Reviews"
                description="Verified buyer reviews will appear here once submitted."
              />
            )}
          </div>

          {/* Questions Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Pre-Sales Questions ({questions.length})</span>
            </h3>

            {questions.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {questions.map((q) => (
                  <div key={q.id} className="py-3 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-900 dark:text-slate-100">Q: {q.question}</div>
                    {q.answer ? (
                      <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 text-slate-700 dark:text-slate-300 font-medium">
                        A: {q.answer}
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-600 font-bold">Unanswered</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <AdminEmptyState
                title="No Pre-Sales Inquiries"
                description="Customer questions submitted from the storefront will be listed here."
              />
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: SEO & SEARCH ENGINE PREVIEW
          ========================================================================= */}
      {activeTab === 'seo' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
            <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Search Engine Optimization & SERP Preview</span>
          </h3>

          {/* Google SERP Card Preview */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 max-w-xl">
            <div className="text-xs text-slate-500 font-mono">
              https://techmarket.com.bd/product/{product.slug || 'product-slug'}
            </div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              {product.seo_title || product.title || 'Product Title | TechMarket BD'}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.meta_description || product.short_description || 'Buy authentic components at best prices in Bangladesh with official warranty.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <span className="font-semibold text-slate-500">Focus Keyword</span>
              <div className="font-bold text-slate-900 dark:text-slate-100">{product.focus_keyword || 'Not Specified'}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <span className="font-semibold text-slate-500">Robots Indexation</span>
              <div className="font-bold text-slate-900 dark:text-slate-100">{product.meta_robots || 'index, follow'}</div>
            </div>
          </div>
        </div>
      )}
    </DetailPageTemplate>
  );
}
