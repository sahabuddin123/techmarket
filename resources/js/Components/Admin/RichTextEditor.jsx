import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Code, List, ListOrdered, 
  Heading1, Heading2, Heading3, Quote, Link as LinkIcon, Unlink,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo,
  RemoveFormatting, Minus, Maximize2, Minimize2, Eye, Code2, Sparkles,
  Table, Image as ImageIcon, Video, Upload, Search, X, Check,
  Folder, PlaySquare, Film, CheckCircle2, FileImage, Layers, Filter
} from 'lucide-react';

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write comprehensive product description with rich formatting, key specifications, and overview...',
  className = '',
  minHeight = '260px',
}) {
  const editorRef = useRef(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sourceCode, setSourceCode] = useState(value || '');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Link Modal
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // WP-style Image Media Modal State
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageTab, setImageTab] = useState('library'); // 'library' | 'upload' | 'url'
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState('center'); // 'center', 'left', 'right', 'none'
  const [imageSize, setImageSize] = useState('full'); // 'full', 'medium', 'thumbnail'
  const [externalUrl, setExternalUrl] = useState('');
  
  const [mediaList, setMediaList] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Video Modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');

  // Sync incoming value to editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!isSourceMode) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setSourceCode(value || '');
    updateCounts(value || '');
  }, [value]);

  const updateCounts = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';
    setCharCount(text.length);
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setSourceCode(html);
      updateCounts(html);
      if (onChange) {
        onChange(html);
      }
    }
  };

  const handleSourceChange = (e) => {
    const newHtml = e.target.value;
    setSourceCode(newHtml);
    updateCounts(newHtml);
    if (onChange) {
      onChange(newHtml);
    }
  };

  const exec = (command, val = null) => {
    if (isSourceMode) return;
    document.execCommand(command, false, val);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const formatBlock = (tag) => {
    if (isSourceMode) return;
    document.execCommand('formatBlock', false, tag);
    handleInput();
  };

  // Helper: Extract YouTube Video ID
  const parseYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Helper: Extract Vimeo ID
  const parseVimeoId = (url) => {
    const match = url.match(/(?:vimeo)\.com(?:\/channels\/(?:\w+\/)?|\/groups\/[^\/]*\/videos\/|\/(?:album\/[^\/]*\/video\/|video\/|))(\d+)/);
    return match ? match[1] : null;
  };

  // Link Insertion
  const handleInsertLink = () => {
    if (!linkUrl) return;
    const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') || linkUrl.startsWith('/')
      ? linkUrl
      : `https://${linkUrl}`;
    
    if (linkText) {
      const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-bold">${linkText}</a>`;
      exec('insertHTML', html);
    } else {
      exec('createLink', url);
    }
    setLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Fetch Media Library Images
  const fetchMediaLibrary = async (searchQuery = mediaSearch, folder = selectedFolder) => {
    setMediaLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (folder && folder !== 'all') params.append('folder', folder);
      params.append('per_page', '50');

      const res = await fetch(`/admin/api/media?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      const items = data.data || (Array.isArray(data) ? data : []);
      setMediaList(items);

      if (items.length > 0 && !selectedMedia) {
        setSelectedMedia(items[0]);
        setImageAlt(items[0].alt_text || items[0].title || '');
      }
    } catch (err) {
      console.error('Failed to load media library', err);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleOpenImageModal = () => {
    setImageModalOpen(true);
    setImageTab('library');
    fetchMediaLibrary();
  };

  const handleSelectMediaItem = (item) => {
    setSelectedMedia(item);
    setImageAlt(item.alt_text || item.title || '');
    setImageCaption(item.caption || '');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'products');

    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch('/admin/media/upload', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': token,
          'Accept': 'application/json',
        },
        body: formData,
      });
      const data = await res.json();
      const newMedia = data.media || data;

      if (newMedia?.url) {
        await fetchMediaLibrary('', 'all');
        setSelectedMedia(newMedia);
        setImageAlt(newMedia.alt_text || newMedia.title || '');
        setImageTab('library');
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  // Image Insertion into content
  const handleInsertImage = () => {
    const targetUrl = imageTab === 'url' ? externalUrl : selectedMedia?.url;
    if (!targetUrl) return;
    
    let alignClass = 'mx-auto block my-4 max-w-full rounded-2xl border border-slate-200 shadow-md';
    let sizeStyle = '';

    if (imageAlign === 'left') {
      alignClass = 'float-left mr-5 mb-4 rounded-xl border border-slate-200 shadow-sm';
    } else if (imageAlign === 'right') {
      alignClass = 'float-right ml-5 mb-4 rounded-xl border border-slate-200 shadow-sm';
    } else if (imageAlign === 'none') {
      alignClass = 'inline-block my-2 rounded-xl border border-slate-200';
    }

    if (imageSize === 'medium') {
      sizeStyle = 'max-width: 450px; width: 100%;';
    } else if (imageSize === 'thumbnail') {
      sizeStyle = 'max-width: 250px; width: 100%;';
    } else {
      sizeStyle = 'max-width: 100%; height: auto;';
    }

    let imgHtml = `<img src="${targetUrl}" alt="${imageAlt || 'Product Media'}" class="${alignClass}" style="${sizeStyle}" />`;

    if (imageCaption) {
      imgHtml = `
        <figure class="my-4 text-center">
          ${imgHtml}
          <figcaption class="text-xs text-slate-500 italic mt-1">${imageCaption}</figcaption>
        </figure>
      `;
    }

    imgHtml += '<p><br></p>';

    exec('insertHTML', imgHtml);
    setImageModalOpen(false);
    setExternalUrl('');
    setImageCaption('');
    setImageAlt('');
  };

  // Video Insertion
  const handleInsertVideo = () => {
    if (!videoUrl) return;

    const ytId = parseYouTubeId(videoUrl);
    const vimeoId = parseVimeoId(videoUrl);
    let videoHtml = '';

    if (ytId) {
      videoHtml = `
        <div class="my-4 aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-black">
          <iframe 
            src="https://www.youtube-nocookie.com/embed/${ytId}" 
            class="w-full h-full" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
        ${videoCaption ? `<p class="text-center text-xs text-slate-500 italic mb-3">${videoCaption}</p>` : ''}
        <p><br></p>
      `;
    } else if (vimeoId) {
      videoHtml = `
        <div class="my-4 aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-black">
          <iframe 
            src="https://player.vimeo.com/video/${vimeoId}" 
            class="w-full h-full" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
        ${videoCaption ? `<p class="text-center text-xs text-slate-500 italic mb-3">${videoCaption}</p>` : ''}
        <p><br></p>
      `;
    } else {
      videoHtml = `
        <div class="my-4 w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-black">
          <video controls class="w-full h-auto rounded-2xl">
            <source src="${videoUrl}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
        ${videoCaption ? `<p class="text-center text-xs text-slate-500 italic mb-3">${videoCaption}</p>` : ''}
        <p><br></p>
      `;
    }

    exec('insertHTML', videoHtml);
    setVideoModalOpen(false);
    setVideoUrl('');
    setVideoCaption('');
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table class="w-full my-3 border border-slate-200 text-xs">
        <thead>
          <tr class="bg-slate-100 text-slate-800">
            <th class="border border-slate-200 p-2 font-bold text-left">Feature / Specification</th>
            <th class="border border-slate-200 p-2 font-bold text-left">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-200 p-2 text-slate-700 font-medium">Model</td>
            <td class="border border-slate-200 p-2 text-slate-800">Specification value</td>
          </tr>
          <tr>
            <td class="border border-slate-200 p-2 text-slate-700 font-medium">Warranty</td>
            <td class="border border-slate-200 p-2 text-slate-800">Official Brand Warranty</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    exec('insertHTML', tableHtml);
  };

  return (
    <div className={`rounded-2xl border transition-all ${
      isFullscreen 
        ? 'fixed inset-4 z-50 bg-white/95 backdrop-blur-md border-indigo-500/50 shadow-2xl flex flex-col' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
    } ${className}`}>
      
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl select-none">
        
        {/* Left Toolbar Items */}
        <div className="flex flex-wrap items-center gap-0.5">
          
          {/* Headings Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                formatBlock(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden mr-1"
          >
            <option value="" disabled>Paragraph</option>
            <option value="<p>">Paragraph (Normal)</option>
            <option value="<h2>">Heading 2 (Section)</option>
            <option value="<h3>">Heading 3 (Subsection)</option>
            <option value="<h4>">Heading 4 (Feature)</option>
            <option value="<blockquote>">Blockquote</option>
            <option value="<pre>">Code Box</option>
          </select>

          {/* Group 1: Basic Inline Styles */}
          <div className="flex items-center space-x-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => exec('bold')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('italic')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('underline')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('strikeThrough')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Group 2: Lists & Structure */}
          <div className="flex items-center space-x-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => exec('insertUnorderedList')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Bulleted List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('insertOrderedList')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('insertHorizontalRule')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Horizontal Divider"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleInsertTable}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Insert Spec Table"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          {/* Group 3: MEDIA (IMAGE & VIDEO) */}
          <div className="flex items-center space-x-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleOpenImageModal}
              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center space-x-1 font-bold text-[11px]"
              title="Add Media from Library or Upload"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Media</span>
            </button>

            <button
              type="button"
              onClick={() => setVideoModalOpen(true)}
              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors flex items-center space-x-1 font-bold text-[11px]"
              title="Insert Video (YouTube, Vimeo, MP4)"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>
          </div>

          {/* Group 4: Alignment */}
          <div className="flex items-center space-x-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => exec('justifyLeft')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('justifyCenter')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('justifyRight')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Group 5: Links & Clean */}
          <div className="flex items-center space-x-0.5 px-1">
            <button
              type="button"
              onClick={() => setLinkModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Insert Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('unlink')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Remove Link"
            >
              <Unlink className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('removeFormat')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear Formatting"
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Toolbar Items: Mode Switchers & Fullscreen */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => exec('undo')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('redo')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>

          {/* Source Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsSourceMode(!isSourceMode)}
            className={`px-2 py-1 rounded-lg text-xs font-mono font-bold flex items-center space-x-1 transition-all ${
              isSourceMode 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle HTML Source Code View"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{isSourceMode ? 'Visual' : 'HTML'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-indigo-600" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* EDITOR CANVAS */}
      <div className={`p-4 flex-1 overflow-y-auto bg-white dark:bg-slate-900 ${isFullscreen ? 'h-full' : ''}`}>
        {isSourceMode ? (
          <textarea
            value={sourceCode}
            onChange={handleSourceChange}
            placeholder="Edit raw HTML description..."
            style={{ minHeight }}
            className="w-full h-full bg-slate-50 dark:bg-slate-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-hidden leading-relaxed"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="prose max-w-none text-slate-900 dark:text-slate-100 text-xs leading-relaxed outline-hidden focus:outline-hidden min-h-[240px] [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-slate-400 [&:empty:before]:pointer-events-none [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h2]:my-3 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-indigo-600 dark:[&_h3]:text-indigo-400 [&_h3]:my-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-2 [&_p]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-600 dark:[&_blockquote]:text-slate-400 [&_table]:border-collapse [&_img]:rounded-2xl [&_img]:my-3"
          />
        )}
      </div>

      {/* FOOTER STATUS BAR */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl text-[10px] font-mono text-slate-500">
        <div className="flex items-center space-x-3">
          <span>Words: <strong className="text-slate-800 dark:text-slate-200">{wordCount}</strong></span>
          <span>Characters: <strong className="text-slate-800 dark:text-slate-200">{charCount}</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1 text-slate-500">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>WYSIWYG & HTML Supported</span>
          </span>
        </div>
      </div>

      {/* 1. WORDPRESS-STYLE MEDIA MODAL */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm font-heading flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>Media Library & Attachment Details</span>
                </span>

                {/* Tab Selector */}
                <div className="flex items-center bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageTab('library')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      imageTab === 'library' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Media Library
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      imageTab === 'upload' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Upload Files
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      imageTab === 'url' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Insert from URL
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB: MEDIA LIBRARY */}
            {imageTab === 'library' && (
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* Left Side: Filter Bar + Media Grid */}
                <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-hidden">
                  
                  {/* Filters Header */}
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center space-x-2 flex-1 max-w-sm">
                      <div className="relative w-full">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={mediaSearch}
                          onChange={(e) => {
                            setMediaSearch(e.target.value);
                            fetchMediaLibrary(e.target.value, selectedFolder);
                          }}
                          placeholder="Search media by title or filename..."
                          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedFolder}
                        onChange={(e) => {
                          setSelectedFolder(e.target.value);
                          fetchMediaLibrary(mediaSearch, e.target.value);
                        }}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                      >
                        <option value="all">All Media Folders</option>
                        <option value="products">Products ({mediaList.filter(m => m.folder === 'products').length})</option>
                        <option value="categories">Categories ({mediaList.filter(m => m.folder === 'categories').length})</option>
                        <option value="brands">Brands ({mediaList.filter(m => m.folder === 'brands').length})</option>
                        <option value="banners">Banners ({mediaList.filter(m => m.folder === 'banners').length})</option>
                      </select>
                    </div>
                  </div>

                  {/* Media Grid */}
                  <div className="flex-1 p-4 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/60">
                    {mediaLoading ? (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                        Loading media catalog...
                      </div>
                    ) : mediaList.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
                        {mediaList.map((m) => {
                          const isSelected = selectedMedia?.id === m.id || selectedMedia?.url === m.url;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleSelectMediaItem(m)}
                              className={`aspect-square rounded-2xl bg-white dark:bg-slate-900 border p-2 flex flex-col items-center justify-center relative group transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-indigo-600 ring-4 ring-indigo-500/20 shadow-md' 
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <img src={m.url} alt={m.title} className="max-h-full max-w-full object-contain" />
                              
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}

                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1.5 inset-x-1.5 bg-white/95 dark:bg-slate-900/95 text-[10px] text-slate-700 dark:text-slate-300 font-mono truncate px-1.5 py-0.5 rounded text-center border border-slate-200 dark:border-slate-800 shadow-2xs">
                                {m.title || m.filename}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <FileImage className="w-10 h-10 text-slate-300" />
                        <span className="text-xs">No media files found matching your search.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: WordPress Attachment Details Panel */}
                <div className="w-full lg:w-80 bg-white dark:bg-slate-900 p-5 space-y-4 overflow-y-auto text-xs shrink-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 font-heading">
                    Attachment Details
                  </div>

                  {selectedMedia ? (
                    <div className="space-y-4">
                      {/* Image Preview Box */}
                      <div className="w-full h-36 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center">
                        <img src={selectedMedia.url} alt={selectedMedia.title} className="max-h-full max-w-full object-contain" />
                      </div>

                      {/* File Metadata */}
                      <div className="text-[11px] font-mono text-slate-500 space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="text-slate-900 dark:text-slate-100 font-bold truncate">{selectedMedia.title || selectedMedia.filename}</div>
                        <div>Folder: <span className="text-indigo-600 font-bold">{selectedMedia.folder || 'products'}</span></div>
                        {selectedMedia.formatted_size && <div>Size: {selectedMedia.formatted_size}</div>}
                      </div>

                      {/* Alt Text Input */}
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-[11px]">Alt Text (Alternative Text)</label>
                        <input
                          type="text"
                          value={imageAlt}
                          onChange={(e) => setImageAlt(e.target.value)}
                          placeholder="Describe the image for accessibility & SEO..."
                          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-xs"
                        />
                      </div>

                      {/* Caption Input */}
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-[11px]">Caption</label>
                        <textarea
                          rows={2}
                          value={imageCaption}
                          onChange={(e) => setImageCaption(e.target.value)}
                          placeholder="Image caption displayed below photo..."
                          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-xs"
                        />
                      </div>

                      {/* Alignment */}
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-[11px]">Alignment</label>
                        <select
                          value={imageAlign}
                          onChange={(e) => setImageAlign(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-xs"
                        >
                          <option value="center">Center (Full-Width Block)</option>
                          <option value="left">Left (Wrap text right)</option>
                          <option value="right">Right (Wrap text left)</option>
                          <option value="none">None (Inline)</option>
                        </select>
                      </div>

                      {/* Size */}
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-[11px]">Size</label>
                        <select
                          value={imageSize}
                          onChange={(e) => setImageSize(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-xs"
                        >
                          <option value="full">Full Size (Original resolution)</option>
                          <option value="medium">Medium (450px wide)</option>
                          <option value="thumbnail">Thumbnail (250px wide)</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Select an image from the library on the left to inspect its details.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: UPLOAD FILES */}
            {imageTab === 'upload' && (
              <div className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-3xl p-12 text-center max-w-lg w-full space-y-4 transition-colors bg-white dark:bg-slate-800 shadow-2xs">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">Upload New Media Asset</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload JPEG, PNG, WebP, or SVG images up to 10MB to save in the library.
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase cursor-pointer transition-all shadow-xs"
                    >
                      {uploading ? 'Uploading...' : 'Select File from Computer'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INSERT FROM URL */}
            {imageTab === 'url' && (
              <div className="flex-1 p-8 max-w-xl mx-auto w-full space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-heading">Insert External Image URL</h3>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Image Web Address (URL) *</label>
                  <input
                    type="text"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://example.com/assets/banner.jpg"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Describe image..."
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Modal Bottom Action Bar */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 font-mono">
                {selectedMedia ? (
                  <span>Selected: <strong className="text-slate-900 dark:text-slate-100">{selectedMedia.title || selectedMedia.filename}</strong></span>
                ) : (
                  <span>No media selected</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertImage}
                  disabled={imageTab === 'url' ? !externalUrl : !selectedMedia}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase flex items-center space-x-1.5 cursor-pointer disabled:opacity-40 transition-all shadow-xs"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Insert into Description</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. INSERT VIDEO MODAL */}
      {videoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm font-heading flex items-center space-x-2">
                <PlaySquare className="w-4 h-4 text-rose-600" />
                <span>Embed Product Video / Unboxing</span>
              </span>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed">
              Supports <strong>YouTube</strong>, <strong>Vimeo</strong>, or direct <strong>MP4</strong> video URLs. Generates responsive high-resolution video player.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Video URL *</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=XXXXX or https://youtu.be/XXXXX"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Video Caption / Title (Optional)</label>
                <input
                  type="text"
                  value={videoCaption}
                  onChange={(e) => setVideoCaption(e.target.value)}
                  placeholder="e.g. Official TechMarket Unboxing & Performance Review"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            {/* Video URL Preview indicator */}
            {videoUrl && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-mono flex items-center space-x-2 text-emerald-600">
                <PlaySquare className="w-4 h-4 text-rose-600" />
                <span>
                  {parseYouTubeId(videoUrl) ? `YouTube Video ID: ${parseYouTubeId(videoUrl)}` : (parseVimeoId(videoUrl) ? `Vimeo ID: ${parseVimeoId(videoUrl)}` : 'Direct Video URL')}
                </span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertVideo}
                disabled={!videoUrl}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-50 uppercase flex items-center space-x-1.5 shadow-xs"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Embed Video</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. INSERT LINK MODAL */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5 font-heading">
                <LinkIcon className="w-4 h-4 text-indigo-600" />
                <span>Insert Hyperlink</span>
              </span>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Target URL *</label>
              <input
                type="text"
                autoFocus
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://techmarket.com.bd/warranty or https://..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Link Display Text (Optional)</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Click here for warranty policy..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                disabled={!linkUrl}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-50 shadow-xs"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
