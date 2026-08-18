import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, Upload, Search, X, Check, 
  Folder, Plus, Trash2, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function MediaPicker({
  value = null, // string URL or array of string URLs
  onChange, // callback with new URL(s)
  multiple = false,
  folder = 'general',
  label = 'Select Image',
  buttonText = 'Choose from Library',
  previewSize = 'md', // 'sm', 'md', 'lg'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'upload'
  
  // Library state
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Selected media items inside modal
  const [tempSelected, setTempSelected] = useState(
    multiple 
      ? (Array.isArray(value) ? value : (value ? [value] : []))
      : (value ? [value] : [])
  );

  // Upload tab state
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState(folder);
  const fileInputRef = useRef(null);

  const fetchMedia = async (pageNumber = 1, searchQuery = search, folderQuery = selectedFolder) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNumber);
      if (searchQuery) params.append('search', searchQuery);
      if (folderQuery && folderQuery !== 'all') params.append('folder', folderQuery);

      const res = await fetch(`/admin/api/media?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      setMediaList(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
      setPage(data.current_page);
    } catch (err) {
      console.error('Failed to load media library', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTempSelected(
        multiple 
          ? (Array.isArray(value) ? [...value] : (value ? [value] : []))
          : (value ? [value] : [])
      );
      fetchMedia(1, search, selectedFolder);
    }
  }, [isOpen]);

  const handleToggleSelect = (url) => {
    if (multiple) {
      if (tempSelected.includes(url)) {
        setTempSelected(tempSelected.filter(u => u !== url));
      } else {
        setTempSelected([...tempSelected, url]);
      }
    } else {
      setTempSelected([url]);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
      onChange && onChange(tempSelected);
    } else {
      onChange && onChange(tempSelected[0] || '');
    }
    setIsOpen(false);
  };

  const handleUploadSubmit = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files[]', files[i]);
    }
    formData.append('folder', uploadFolder);

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const res = await fetch('/admin/media/upload', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        const uploaded = Array.isArray(json.media) ? json.media : [json.media];
        const newUrls = uploaded.map(m => m.url);

        if (multiple) {
          setTempSelected(prev => [...prev, ...newUrls]);
        } else {
          setTempSelected([newUrls[0]]);
        }

        // Switch to browse tab and refresh library
        setActiveTab('browse');
        fetchMedia(1, '', uploadFolder);
      } else {
        alert(json.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload request failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveSingle = () => {
    onChange && onChange('');
  };

  const handleRemoveGalleryItem = (urlToRemove) => {
    if (Array.isArray(value)) {
      onChange && onChange(value.filter(u => u !== urlToRemove));
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-slate-300 font-bold text-xs">{label}</label>}

      {/* SINGLE IMAGE MODE TRIGGER */}
      {!multiple && (
        <div className="flex items-center space-x-3">
          {value ? (
            <div className="relative group w-14 h-14 rounded-lg bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0">
              <img src={value} alt="Preview" className="w-full h-full object-contain rounded" />
              <button
                type="button"
                onClick={handleRemoveSingle}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove Image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-lg bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}

          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>{value ? 'Change Image' : buttonText}</span>
              </button>
              {value && (
                <button
                  type="button"
                  onClick={handleRemoveSingle}
                  className="px-2 py-1.5 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded text-xs transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            {value && <div className="text-[10px] text-slate-500 font-mono truncate max-w-sm">{value}</div>}
          </div>
        </div>
      )}

      {/* MULTIPLE IMAGES / GALLERY MODE TRIGGER */}
      {multiple && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add / Manage Gallery Images</span>
            </button>
            <span className="text-[11px] text-slate-500 font-bold">
              {Array.isArray(value) ? value.length : 0} Images Selected
            </span>
          </div>

          {Array.isArray(value) && value.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
              {value.map((imgUrl, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg bg-slate-900 border border-slate-800 p-1 flex items-center justify-center">
                  <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-contain rounded" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryItem(imgUrl)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from Gallery"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MEDIA PICKER MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span>Choose Media Asset</span>
                </div>

                {/* Tabs */}
                <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('browse')}
                    className={`px-3 py-1 rounded font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === 'browse' ? 'bg-[#1c4289] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Media Library
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`px-3 py-1 rounded font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === 'upload' ? 'bg-[#1c4289] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Upload New
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              
              {/* TAB 1: BROWSE LIBRARY */}
              {activeTab === 'browse' && (
                <div className="space-y-3">
                  
                  {/* Search & Folder Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Search media by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchMedia(1, search, selectedFolder)}
                        className="w-full bg-slate-900 text-slate-200 text-xs rounded p-1.5 pr-7 border border-slate-800 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => fetchMedia(1, search, selectedFolder)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-blue-400 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <select
                        value={selectedFolder}
                        onChange={(e) => {
                          setSelectedFolder(e.target.value);
                          fetchMedia(1, search, e.target.value);
                        }}
                        className="bg-slate-900 text-slate-300 text-xs rounded p-1.5 border border-slate-800 focus:border-blue-500 font-bold"
                      >
                        <option value="all">All Folders</option>
                        <option value="products">Products</option>
                        <option value="categories">Categories</option>
                        <option value="brands">Brands</option>
                        <option value="banners">Banners</option>
                        <option value="blog">Blog</option>
                        <option value="cms">CMS</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid */}
                  {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading library assets...</div>
                  ) : mediaList.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {mediaList.map((item) => {
                        const isSelected = tempSelected.includes(item.url);

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleSelect(item.url)}
                            className={`relative aspect-square rounded-xl bg-slate-950 border p-1.5 flex flex-col justify-between cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-blue-500 ring-2 ring-blue-500/50 bg-blue-950/20' 
                                : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex-1 flex items-center justify-center overflow-hidden">
                              <img src={item.url} alt="" className="max-h-full max-w-full object-contain" />
                            </div>

                            {/* Checkmark */}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3 h-3" />
                              </div>
                            )}

                            <div className="text-[9.5px] text-slate-400 truncate text-center pt-1 font-mono">
                              {item.original_name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-500 space-y-1">
                      <ImageIcon className="w-6 h-6 mx-auto text-slate-600" />
                      <div>No media found. Upload an asset to get started.</div>
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-center space-x-2 pt-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => fetchMedia(page - 1)}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span className="text-slate-400 font-mono text-xs">
                        Page {pagination.current_page} of {pagination.last_page}
                      </span>
                      <button
                        type="button"
                        disabled={page >= pagination.last_page}
                        onClick={() => fetchMedia(page + 1)}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: DIRECT UPLOAD */}
              {activeTab === 'upload' && (
                <div className="p-6 border-2 border-dashed border-slate-800 rounded-2xl text-center space-y-4 bg-slate-950/50">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-blue-400 flex items-center justify-center mx-auto">
                    <Upload className={`w-6 h-6 ${uploading ? 'animate-bounce' : ''}`} />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">Upload New Asset Without Leaving</h4>
                    <p className="text-slate-400 text-xs">
                      File will be securely saved into the Central Media Library and automatically selected
                    </p>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-slate-400 font-bold text-xs">Upload Folder:</span>
                    <select
                      value={uploadFolder}
                      onChange={(e) => setUploadFolder(e.target.value)}
                      className="bg-slate-900 text-slate-200 text-xs rounded p-1.5 border border-slate-800 font-bold focus:border-blue-500"
                    >
                      <option value="products">Products</option>
                      <option value="categories">Categories</option>
                      <option value="brands">Brands</option>
                      <option value="banners">Banners</option>
                      <option value="blog">Blog</option>
                      <option value="cms">CMS</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 bg-[#1c4289] hover:bg-blue-600 text-white rounded-lg font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      {uploading ? 'Uploading Asset...' : 'Browse & Upload Image'}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple={multiple}
                      accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                      className="hidden"
                      onChange={handleUploadSubmit}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <div className="text-slate-400 text-xs">
                Selected: <span className="text-white font-bold">{tempSelected.length}</span> item(s)
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-1.5 bg-[#1c4289] hover:bg-blue-600 text-white rounded font-extrabold shadow-md transition-colors cursor-pointer"
                >
                  Insert Selected Asset(s)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
