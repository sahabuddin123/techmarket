import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Save, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AboutUsEditor({ page }) {
  const defaultSections = page.sections || {
    hero: {
      title: 'About TechMarket BD',
      subtitle: 'The Leading Trusted Computer & Hardware Retailer in Bangladesh',
    },
    story: {
      heading: 'Our Journey Since 2016',
      paragraphs: [
        'Founded with a passion for high-performance computing, TechMarket BD has grown from a specialized hardware boutique to one of Bangladesh’s most reputable retail tech destinations.',
      ],
    },
    mission_vision: {
      mission: 'To empower tech enthusiasts, gamers, and businesses across Bangladesh by delivering 100% original hardware at genuine pricing with zero-compromise warranty support.',
      vision: 'To be recognized as Bangladesh’s most reliable IT ecosystem where technology meets trust, seamless service, and innovative shopping experiences.',
    },
  };

  const { data, setData, post, processing, recentlySuccessful } = useForm({
    title: page.title || 'About TechMarket BD',
    meta_title: page.meta_title || 'About Us - TechMarket BD',
    meta_description: page.meta_description || 'Leading computer hardware retailer in Bangladesh.',
    sections: defaultSections,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/pages/about-us');
  };

  const updateSectionField = (section, field, value) => {
    setData('sections', {
      ...data.sections,
      [section]: {
        ...data.sections[section],
        [field]: value,
      },
    });
  };

  return (
    <AdminLayout>
      <Head title="About Us Page CMS - TechMarket BD Admin" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span>About Us Content Management</span>
            </h1>
            <p className="text-xs text-slate-400">Edit hero headlines, company story, mission, vision, and SEO metadata.</p>
          </div>

          {recentlySuccessful && (
            <div className="flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Successfully!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SEO & Meta Settings */}
          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-tight">SEO & Page Title</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400">Page Headline Title</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400">SEO Meta Title</label>
                <input
                  type="text"
                  value={data.meta_title}
                  onChange={(e) => setData('meta_title', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400">SEO Meta Description</label>
              <textarea
                rows={2}
                value={data.meta_description}
                onChange={(e) => setData('meta_description', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Hero Banner Section */}
          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-tight">Hero Section</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400">Hero Main Title</label>
                <input
                  type="text"
                  value={data.sections?.hero?.title || ''}
                  onChange={(e) => updateSectionField('hero', 'title', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400">Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={data.sections?.hero?.subtitle || ''}
                  onChange={(e) => updateSectionField('hero', 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Mission & Vision Section */}
          <div className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-tight">Mission & Vision</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400">Company Mission</label>
                <textarea
                  rows={4}
                  value={data.sections?.mission_vision?.mission || ''}
                  onChange={(e) => updateSectionField('mission_vision', 'mission', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400">Company Vision</label>
                <textarea
                  rows={4}
                  value={data.sections?.mission_vision?.vision || ''}
                  onChange={(e) => updateSectionField('mission_vision', 'vision', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{processing ? 'Saving Changes...' : 'Save About Us Page'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
