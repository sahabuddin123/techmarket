import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Image as ImageIcon, Upload, Grid, List, Search, Filter, 
  Trash2, Copy, Check, ExternalLink, Info, AlertTriangle, 
  Folder, X, Sparkles, RefreshCw, Layers, CheckCircle2,
  FileText, ShieldCheck, ArrowUpDown
} from 'lucide-react';

export default function MediaLibrary(props) {
  // Defensive prop normalization
  const media = props?.media || { data: [], links: [] };
  const folders = props?.folders || {
    all: 0,
    products: 0,
    categories: 0,
    brands: 0,
    banners: 0,
    blog: 0,
    cms: 0,
    general: 0,
  };
  const total_size = props?.total_size || '0 B';
  const filters = props?.filters || {};

  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState(filters?.search || '');
  const [selectedFolder, setSelectedFolder] = useState(filters?.folder || 'all');
  const [selectedType, setSelectedType] = useState(filters?.type || 'all');
  const [selectedSort, setSelectedSort] = useState(filters?.sort || 'latest');
  
  // Modal / Detail state
  const [activeMedia, setActiveMedia] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isUpdatingMeta, setIsUpdatingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({
    title: '',
    alt_text: '',
    caption: '',
    folder: 'general'
  });

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState(selectedFolder !== 'all' ? selectedFolder : 'general');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFilter = (folderVal = selectedFolder, typeVal = selectedType, sortVal = selectedSort, searchVal = search) => {
    router.get('/admin/media', {
      search: searchVal || undefined,
      folder: folderVal !== 'all' ? folderVal : undefined,
      type: typeVal !== 'all' ? typeVal : undefined,
      sort: sortVal !== 'latest' ? sortVal : undefined,
    }, { preserveState: true });
  };

  const handleOpenDetail = (item) => {
    if (!item) return;
    setActiveMedia(item);
    setMetaForm({
      title: item.title || '',
      alt_text: item.alt_text || '',
      caption: item.caption || '',
      folder: item.folder || 'general',
    });
    setCopiedUrl(false);
  };

  const handleCopyUrl = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleUpdateMeta = (e) => {
    e.preventDefault();
    if (!activeMedia?.id) return;
    setIsUpdatingMeta(true);

    router.put(`/admin/media/${activeMedia.id}`, metaForm, {
      preserveScroll: true,
      onSuccess: () => {
        setIsUpdatingMeta(false);
        setActiveMedia(prev => ({ ...prev, ...metaForm }));
      },
      onError: () => setIsUpdatingMeta(false),
    });
  };

  const handleDelete = (item, force = false) => {
    if (!item?.id) return;
    const usages = item.usages || [];
    if (usages.length > 0 && !force) {
      if (!confirm(`Warning: This media item is actively referenced in your store:\n\n${usages.join('\n')}\n\nAre you sure you want to FORCE delete it? This may break image displays on public storefront.`)) {
        return;
      }
      force = true;
    } else {
      if (!confirm(`Are you sure you want to delete "${item.original_name}"?`)) {
        return;
      }
    }

    router.delete(`/admin/media/${item.id}${force ? '?force=1' : ''}`, {
      preserveScroll: true,
      onSuccess: () => {
        if (activeMedia?.id === item.id) {
          setActiveMedia(null);
        }
      }
    });
  };

  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files[]', files[i]);
    }
    formData.append('folder', uploadFolder);

    router.post('/admin/media/upload', formData, {
      preserveScroll: true,
      onSuccess: () => {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: (err) => {
        setIsUploading(false);
        alert(err?.file || err?.files || 'Upload failed. Please verify file type and size (Max 10MB).');
      }
    });
  };

  const folderKeys = [
    { key: 'all', label: 'All Media Assets' },
    { key: 'products', label: 'Hardware Products' },
    { key: 'categories', label: 'Categories' },
    { key: 'brands', label: 'Brands & Vendors' },
    { key: 'banners', label: 'Promotional Banners' },
    { key: 'blog', label: 'Blog & Articles' },
    { key: 'cms', label: 'CMS Pages' },
    { key: 'general', label: 'General / Icons' },
  ];

  const mediaList = Array.isArray(media?.data) ? media.data : [];

  return (
    <AdminLayout title="Central Media Library">
      <Head title="Central Media Library - TechMarket Admin" />

      <div className="space-y-5 text-xs">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              <span>CENTRAL ASSET & MEDIA LIBRARY</span>
            </h1>
            <p className="text-slate-400 text-[11px]">
              Upload, organize, search, and reuse high-resolution assets across products, banners, and storefront.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-300 font-bold text-[11px] flex items-center space-x-2">
              <span className="text-slate-500">Storage:</span>
              <span className="text-emerald-400">{total_size}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400">{folders?.all || 0} Assets</span>
            </span>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>UPLOAD ASSETS</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>
        </div>

        {/* DRAG & DROP UPLOAD DROPZONE */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            dragOver ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shadow">
              <Upload className={`w-5 h-5 ${isUploading ? 'animate-bounce' : ''}`} />
            </div>
            <div className="text-left">
              <div className="font-bold text-white text-xs">
                {isUploading ? 'Processing and uploading assets to storage disk...' : 'Drag & drop image assets here or click to browse'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Supports WEBP, PNG, JPG, JPEG, SVG up to 10MB per file with automatic metadata indexing
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-2 sm:mt-0 sm:ml-auto">
              <span className="text-slate-400 font-bold text-[10px] uppercase">Folder:</span>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 font-bold focus:border-amber-500 focus:outline-none"
              >
                <option value="general">General</option>
                <option value="products">Products</option>
                <option value="categories">Categories</option>
                <option value="brands">Brands</option>
                <option value="banners">Banners</option>
                <option value="blog">Blog</option>
                <option value="cms">CMS</option>
              </select>
            </div>
          </div>
        </div>

        {/* FOLDERS & TOOLBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          
          {/* FOLDERS SIDEBAR */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 h-fit shadow-sm">
            <div className="font-bold text-white uppercase tracking-wider text-[11px] px-2 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Logical Folders</span>
              <Folder className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <div className="space-y-1">
              {folderKeys.map((f) => {
                const count = folders?.[f.key] || 0;
                const isActive = selectedFolder === f.key;

                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      setSelectedFolder(f.key);
                      handleFilter(f.key, selectedType, selectedSort, search);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="capitalize">{f.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-950 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN MEDIA BROWSER */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* SEARCH & FILTERS BAR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search assets by filename, title, alt text..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter(selectedFolder, selectedType, selectedSort, search)}
                  className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-2.5 pr-9 border border-slate-800 focus:border-amber-500 focus:outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleFilter(selectedFolder, selectedType, selectedSort, search)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-amber-400 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    handleFilter(selectedFolder, e.target.value, selectedSort, search);
                  }}
                  className="bg-slate-950 text-slate-300 text-xs rounded-xl p-2.5 border border-slate-800 focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="image">Bitmaps (JPG/PNG/WEBP)</option>
                  <option value="svg">Vector SVGs</option>
                </select>

                <select
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    handleFilter(selectedFolder, selectedType, e.target.value, search);
                  }}
                  className="bg-slate-950 text-slate-300 text-xs rounded-xl p-2.5 border border-slate-800 focus:border-amber-500 focus:outline-none"
                >
                  <option value="latest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="size_desc">Size (Large → Small)</option>
                  <option value="name_asc">Name (A → Z)</option>
                </select>

                <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* MEDIA ITEMS CONTAINER */}
            {mediaList.length > 0 ? (
              viewMode === 'grid' ? (
                /* GRID VIEW */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5">
                  {mediaList.map((item) => {
                    const hasUsages = item.usages && item.usages.length > 0;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleOpenDetail(item)}
                        className="group relative bg-slate-900 border border-slate-800 hover:border-amber-500/80 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-md hover:shadow-xl flex flex-col"
                      >
                        {/* Thumbnail Container */}
                        <div className="aspect-square bg-slate-950 p-2.5 flex items-center justify-center relative overflow-hidden">
                          <img
                            src={item.url}
                            alt={item.alt_text || item.original_name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                          
                          {/* Folder badge */}
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[9px] font-bold text-slate-300 uppercase">
                            {item.folder}
                          </span>

                          {/* Usage indicator */}
                          {hasUsages && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" title="In Active Store Use" />
                          )}
                        </div>

                        {/* Caption & Metadata */}
                        <div className="p-2.5 border-t border-slate-800/80 space-y-1 flex-1 flex flex-col justify-between">
                          <div className="font-bold text-slate-200 truncate text-[11px]" title={item.original_name}>
                            {item.title || item.original_name}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>{item.formatted_size}</span>
                            {item.width && item.height && <span>{item.width}×{item.height}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW */
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                        <th className="p-3">Asset</th>
                        <th className="p-3">Folder</th>
                        <th className="p-3">Dimensions</th>
                        <th className="p-3">File Size</th>
                        <th className="p-3">References</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-medium">
                      {mediaList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-bold text-white flex items-center space-x-3">
                            <img src={item.url} alt="" className="w-9 h-9 object-contain rounded-lg bg-slate-950 border border-slate-800 shrink-0" />
                            <div className="truncate max-w-xs">
                              <div className="truncate text-slate-200">{item.original_name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{item.mime_type}</div>
                            </div>
                          </td>
                          <td className="p-3 text-slate-400 capitalize">{item.folder}</td>
                          <td className="p-3 font-mono text-slate-400">{item.width && item.height ? `${item.width}×${item.height}` : '—'}</td>
                          <td className="p-3 font-mono text-slate-400">{item.formatted_size}</td>
                          <td className="p-3">
                            {item.usages && item.usages.length > 0 ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                                Active ({item.usages.length})
                              </span>
                            ) : (
                              <span className="text-slate-600 text-[10px]">Unreferenced</span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenDetail(item)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Edit / Info
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                <ImageIcon className="w-10 h-10 mx-auto text-slate-600" />
                <div className="font-bold text-slate-400 text-sm">No media assets found in this folder</div>
                <div className="text-xs">Upload photos, banners, and product imagery or adjust your search filter</div>
              </div>
            )}

            {/* PAGINATION */}
            {media?.links && media.links.length > 3 && (
              <div className="flex items-center justify-center space-x-1 pt-4">
                {media.links.map((link, idx) => (
                  <button
                    key={idx}
                    disabled={!link.url || link.active}
                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      link.active 
                        ? 'bg-amber-500 text-slate-950 font-black' 
                        : link.url 
                        ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' 
                        : 'bg-slate-950 text-slate-700 opacity-50 cursor-not-allowed'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ASSET DETAIL / METADATA MODAL */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-xs">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="font-bold text-white uppercase tracking-tight flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Media Asset Details: {activeMedia.original_name}</span>
              </div>
              <button
                onClick={() => setActiveMedia(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Preview Column */}
              <div className="space-y-3">
                <div className="aspect-square bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={activeMedia.url}
                    alt={activeMedia.alt_text || ''}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Direct Link & Copy */}
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold text-[10.5px]">Public Direct Asset URL</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={activeMedia.url}
                      className="flex-1 bg-slate-950 text-slate-300 font-mono text-[10px] p-2.5 rounded-xl border border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(activeMedia.url)}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
                      title="Copy URL to Clipboard"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={activeMedia.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Reference / Usage Notification */}
                {activeMedia.usages && activeMedia.usages.length > 0 ? (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center space-x-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Active Storefront References Detected</span>
                    </div>
                    <ul className="list-disc list-inside text-[10.5px] text-emerald-400/90">
                      {activeMedia.usages.map((u, i) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 text-[10.5px]">
                    No active store references detected. Safe to remove.
                  </div>
                )}
              </div>

              {/* Metadata Edit Form Column */}
              <form onSubmit={handleUpdateMeta} className="space-y-3.5">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[10.5px] text-slate-400">
                  <div><span className="text-slate-500">File Name:</span> {activeMedia.filename}</div>
                  <div><span className="text-slate-500">MIME Type:</span> {activeMedia.mime_type}</div>
                  <div><span className="text-slate-500">File Size:</span> {activeMedia.formatted_size}</div>
                  {activeMedia.width && activeMedia.height && (
                    <div><span className="text-slate-500">Dimensions:</span> {activeMedia.width} × {activeMedia.height} px</div>
                  )}
                  <div><span className="text-slate-500">Uploaded:</span> {new Date(activeMedia.created_at).toLocaleDateString()}</div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Display Title</label>
                  <input
                    type="text"
                    value={metaForm.title}
                    onChange={(e) => setMetaForm({ ...metaForm, title: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Alt Text (Accessibility & SEO)</label>
                  <input
                    type="text"
                    value={metaForm.alt_text}
                    onChange={(e) => setMetaForm({ ...metaForm, alt_text: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Logical Folder</label>
                  <select
                    value={metaForm.folder}
                    onChange={(e) => setMetaForm({ ...metaForm, folder: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="products">Products</option>
                    <option value="categories">Categories</option>
                    <option value="brands">Brands</option>
                    <option value="banners">Banners</option>
                    <option value="blog">Blog</option>
                    <option value="cms">CMS</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">Caption / Notes</label>
                  <textarea
                    rows={2}
                    value={metaForm.caption}
                    onChange={(e) => setMetaForm({ ...metaForm, caption: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDelete(activeMedia)}
                    className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Delete Media
                  </button>

                  <button
                    type="submit"
                    disabled={isUpdatingMeta}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition-all cursor-pointer shadow"
                  >
                    {isUpdatingMeta ? 'Saving...' : 'Update Metadata'}
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
