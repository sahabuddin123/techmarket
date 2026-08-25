import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import PageHeader from '@/Components/Admin/PageHeader';
import { 
  FileText, Plus, Trash2, ArrowLeft, Save, Sparkles, 
  ExternalLink, Layers, CheckCircle2, ChevronRight, AlignLeft, Globe 
} from 'lucide-react';

export default function PageForm({ page = null }) {
  const isEdit = !!page;

  const initialSections = Array.isArray(page?.sections) && page.sections.length > 0
    ? page.sections
    : [
        {
          badge: 'Section Heading / Badge',
          paragraphs: ['Enter your detailed policy paragraph or guidelines here.']
        }
      ];

  const { data, setData, post, put, processing, errors } = useForm({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    sections: initialSections,
    meta_title: page?.meta_title || '',
    meta_description: page?.meta_description || '',
    is_published: page?.is_published ?? true,
  });

  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'seo' | 'html'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(`/admin/pages/${page.id}`);
    } else {
      post('/admin/pages');
    }
  };

  // Section Management
  const addSection = () => {
    setData('sections', [
      ...data.sections,
      {
        badge: 'New Policy Section',
        paragraphs: ['Enter policy content here...']
      }
    ]);
  };

  const removeSection = (index) => {
    const updated = data.sections.filter((_, i) => i !== index);
    setData('sections', updated);
  };

  const updateSectionBadge = (index, value) => {
    const updated = [...data.sections];
    updated[index].badge = value;
    setData('sections', updated);
  };

  const addParagraph = (sectionIndex) => {
    const updated = [...data.sections];
    if (!Array.isArray(updated[sectionIndex].paragraphs)) {
      updated[sectionIndex].paragraphs = [];
    }
    updated[sectionIndex].paragraphs.push('');
    setData('sections', updated);
  };

  const updateParagraph = (sectionIndex, pIndex, value) => {
    const updated = [...data.sections];
    updated[sectionIndex].paragraphs[pIndex] = value;
    setData('sections', updated);
  };

  const removeParagraph = (sectionIndex, pIndex) => {
    const updated = [...data.sections];
    updated[sectionIndex].paragraphs = updated[sectionIndex].paragraphs.filter((_, i) => i !== pIndex);
    setData('sections', updated);
  };

  const publicUrl = data.slug === 'privacy-policy' 
    ? '/privacy-policy' 
    : data.slug === 'warranty-policy' 
    ? '/warranty-policy' 
    : `/page/${data.slug || 'slug'}`;

  return (
    <AdminLayout>
      <Head title={`${isEdit ? `Edit ${data.title}` : 'Create Page'} - Admin Panel`} />

      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-none pb-12">
        <PageHeader
          title={isEdit ? `Edit Policy: ${data.title}` : 'Create New CMS Page'}
          description="Customize policy clauses, terms, guidelines, dark navy badges, and SEO metadata."
          breadcrumbs={[
            { label: 'Content & Media' },
            { label: 'CMS & Policies', href: '/admin/pages' },
            { label: isEdit ? 'Edit Page' : 'Create Page' }
          ]}
          actions={
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/pages"
                className="px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Pages</span>
              </Link>

              {isEdit && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </a>
              )}

              <button
                type="submit"
                disabled={processing}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? 'Saving...' : 'Save Page'}</span>
              </button>
            </div>
          }
        />

        {/* Basic Settings Card */}
        <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Core Page Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-6">
              <label className="block text-slate-300 font-bold text-xs mb-1.5">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="e.g. Privacy Policy, Warranty Policy, Terms & Conditions"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-4 py-2.5 border border-slate-200/80 dark:border-slate-800/80 focus:outline-none focus:border-amber-500 font-medium"
              />
              {errors.title && <p className="text-red-400 text-[11px] mt-1">{errors.title}</p>}
            </div>

            <div className="md:col-span-4">
              <label className="block text-slate-300 font-bold text-xs mb-1.5">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={data.slug}
                onChange={(e) => setData('slug', e.target.value)}
                placeholder="e.g. privacy-policy, warranty-policy"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-4 py-2.5 border border-slate-200/80 dark:border-slate-800/80 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
              />
              {errors.slug && <p className="text-red-400 text-[11px] mt-1">{errors.slug}</p>}
            </div>

            <div className="md:col-span-2 flex flex-col justify-end">
              <label className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_published}
                  onChange={(e) => setData('is_published', e.target.checked)}
                  className="rounded border-slate-200 dark:border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
                />
                <span className="text-xs font-bold text-slate-200">Published</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'sections'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Structured Clause Sections ({data.sections.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'seo'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SEO Metadata & Social Previews</span>
          </button>
        </div>

        {/* Tab 1: Structured Sections Builder */}
        {activeTab === 'sections' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-extrabold text-sm">Policy Clauses & Section Badges</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Each clause renders with a dark navy badge on the customer-facing storefront.
                </p>
              </div>

              <button
                type="button"
                onClick={addSection}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add New Section</span>
              </button>
            </div>

            {data.sections.map((section, sIdx) => (
              <div 
                key={sIdx}
                className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4 relative group"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                  <div className="flex-1 flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {sIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={section.badge || ''}
                      onChange={(e) => updateSectionBadge(sIdx, e.target.value)}
                      placeholder="Badge Heading (e.g. Information Collection, ওয়ারেন্টি সেবা গ্রহণে জানুন)"
                      className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2 border border-slate-200/80 dark:border-slate-800/80 focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSection(sIdx)}
                    disabled={data.sections.length <= 1}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Paragraphs List */}
                <div className="space-y-3 pl-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Content Paragraphs & Bullet Points:
                  </span>

                  {(section.paragraphs || []).map((pText, pIdx) => (
                    <div key={pIdx} className="flex items-start space-x-2">
                      <span className="text-slate-500 text-xs font-mono pt-2.5">
                        {pIdx + 1}.
                      </span>
                      <textarea
                        rows={2}
                        value={pText}
                        onChange={(e) => updateParagraph(sIdx, pIdx, e.target.value)}
                        placeholder="Enter paragraph or numbered policy clause..."
                        className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl p-3 border border-slate-200/80 dark:border-slate-800/80 focus:outline-none focus:border-amber-500 leading-relaxed"
                      />
                      <button
                        type="button"
                        onClick={() => removeParagraph(sIdx, pIdx)}
                        disabled={(section.paragraphs || []).length <= 1}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-30 cursor-pointer mt-1"
                        title="Remove Paragraph"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addParagraph(sIdx)}
                    className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Paragraph to Section {sIdx + 1}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: SEO Settings */}
        {activeTab === 'seo' && (
          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
            <h4 className="text-white font-extrabold text-sm">Search Engine Optimization (SEO)</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold text-xs mb-1.5">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={data.meta_title}
                  onChange={(e) => setData('meta_title', e.target.value)}
                  placeholder="e.g. Warranty Policy - TechMarket BD"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-4 py-2.5 border border-slate-200/80 dark:border-slate-800/80 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold text-xs mb-1.5">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={data.meta_description}
                  onChange={(e) => setData('meta_description', e.target.value)}
                  placeholder="Short description for Google Search snippets..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-100 placeholder-slate-500 text-xs rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800/80 focus:outline-none focus:border-amber-500 leading-relaxed font-medium"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </AdminLayout>
  );
}
