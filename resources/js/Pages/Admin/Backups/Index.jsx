import React, { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { 
  Database, HardDriveDownload, Download, Trash2, Clock, Calendar, 
  ShieldCheck, RefreshCw, Plus, FileArchive, CheckCircle2, AlertTriangle, 
  Settings, Layers, Terminal, Sparkles, Filter, Search, X, Check, ArrowDownToLine,
  Zap, Info, FileCode, Archive, RotateCcw, UploadCloud, AlertOctagon, History
} from 'lucide-react';

export default function AdminBackupsIndex({ 
  backups = { data: [], links: [] }, 
  stats = {}, 
  filters = {} 
}) {
  const [activeTab, setActiveTab] = useState('archives'); // 'archives' | 'schedule' | 'guide'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [backupToRestore, setBackupToRestore] = useState(null);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedFormat, setSelectedFormat] = useState(filters.format || '');
  const [selectedType, setSelectedType] = useState(filters.type || '');
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  // Manual Backup Creation Form
  const createForm = useForm({
    format: 'both', // 'sqlite' | 'sql' | 'both'
    compress: true,
    notes: '',
  });

  // Restore Form for existing backup
  const restoreForm = useForm({
    create_safety: true,
  });

  // Upload & Restore Form
  const uploadForm = useForm({
    backup_file: null,
    create_safety: true,
  });

  // Schedule Settings Form
  const scheduleSettings = stats.schedule_settings || {};
  const scheduleForm = useForm({
    enabled: Boolean(scheduleSettings.enabled),
    frequency: scheduleSettings.frequency || 'daily',
    time: scheduleSettings.time || '02:00',
    format: scheduleSettings.format || 'both',
    retention_days: scheduleSettings.retention_days || 7,
    compression: Boolean(scheduleSettings.compression ?? true),
    notify_email: scheduleSettings.notify_email || '',
  });

  // Handle Create Backup Submit
  const handleCreateBackup = (e) => {
    e.preventDefault();
    createForm.post(route('admin.backups.store'), {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        createForm.reset();
      },
    });
  };

  // Open Restore Confirmation Modal
  const handleOpenRestoreModal = (backup) => {
    setBackupToRestore(backup);
    setIsRestoreModalOpen(true);
  };

  // Execute Restore on existing backup
  const handleConfirmRestore = (e) => {
    e.preventDefault();
    if (!backupToRestore) return;

    restoreForm.post(route('admin.backups.restore', backupToRestore.id), {
      onSuccess: () => {
        setIsRestoreModalOpen(false);
        setBackupToRestore(null);
      },
    });
  };

  // Execute Upload and Restore
  const handleUploadRestore = (e) => {
    e.preventDefault();
    uploadForm.post(route('admin.backups.uploadRestore'), {
      onSuccess: () => {
        setIsUploadModalOpen(false);
        uploadForm.reset();
      },
    });
  };

  // Handle Schedule Settings Submit
  const handleSaveSchedule = (e) => {
    e.preventDefault();
    scheduleForm.post(route('admin.backups.schedule.update'), {
      preserveScroll: true,
    });
  };

  // Handle Filter Change
  const handleFilter = (newFilters) => {
    router.get(route('admin.backups.index'), {
      ...filters,
      ...newFilters,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Handle Search Keydown
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFilter({ search: searchQuery });
    }
  };

  // Delete Backup
  const handleDeleteBackup = (backup) => {
    if (confirm(`Are you sure you want to delete backup '${backup.filename}' permanently?`)) {
      setDeletingId(backup.id);
      router.delete(route('admin.backups.destroy', backup.id), {
        onFinish: () => setDeletingId(null),
      });
    }
  };

  // Run Scheduled Backup Test
  const handleRunScheduledNow = () => {
    if (confirm('Execute automated scheduled backup process now?')) {
      router.post(route('admin.backups.runScheduledNow'));
    }
  };

  // Prune Expired Backups
  const handlePruneExpired = () => {
    if (confirm(`Prune all backups older than ${scheduleSettings.retention_days || 7} days based on retention policy?`)) {
      router.post(route('admin.backups.prune'));
    }
  };

  return (
    <AdminShell title="Database Backups & Restore">
      <Head title="Database Backups & Restore - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Database Backups & Disaster Recovery"
          subtitle="Generate instant SQLite database snapshots (.sqlite) and MySQL-compliant SQL dumps (.sql) with automated scheduling, compression, 1-click restore, and retention policies."
          badge={`${stats.database_driver ? stats.database_driver.toUpperCase() : 'SQLITE'} DATABASE`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePruneExpired}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
              title="Prune backups exceeding retention policy"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Prune Expired</span>
            </button>

            <button
              type="button"
              onClick={handleRunScheduledNow}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
              title="Execute scheduled backup immediately"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Test Scheduled</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all cursor-pointer"
              title="Upload an external backup file and restore database"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload & Restore</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Backup Now</span>
            </button>
          </div>
        </AdminPageHeader>

        {/* Database Migration Alert if Table Missing */}
        {stats.table_migrated === false && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-amber-800 dark:text-amber-300 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold">Database Migration Pending:</span> The backup metadata table has not been created on the database yet. Please run <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200">php artisan migrate</code> on your server terminal.
              </div>
            </div>
          </div>
        )}

        {/* Telemetry KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            title="Total Backups"
            value={`${stats.total_backups ?? 0} Archives`}
            description="Available snapshots in storage"
            icon={Archive}
            color="indigo"
          />

          <AdminKpiCard
            title="Backup Storage Used"
            value={stats.total_size_formatted || '0 B'}
            description="Local disk space utilized"
            icon={HardDriveDownload}
            color="emerald"
          />

          <AdminKpiCard
            title="Active Database"
            value={`${stats.total_tables ?? 0} Tables`}
            description={`Driver: ${stats.database_driver ? stats.database_driver.toUpperCase() : 'SQLite'}`}
            icon={Database}
            color="amber"
          />

          <AdminKpiCard
            title="Automated Schedule"
            value={scheduleSettings.enabled ? 'Active / Scheduled' : 'Disabled'}
            description={
              scheduleSettings.enabled
                ? `${scheduleSettings.frequency ? scheduleSettings.frequency.toUpperCase() : 'DAILY'} at ${scheduleSettings.time || '02:00'}`
                : 'Configure in settings tab'
            }
            icon={Clock}
            color={scheduleSettings.enabled ? 'purple' : 'slate'}
          />
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('archives')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'archives'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Backup Archives ({stats.total_backups ?? 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Automated Schedule & Retention</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Disaster Recovery & CLI Guide</span>
          </button>
        </div>

        {/* TAB 1: BACKUP ARCHIVES */}
        {activeTab === 'archives' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search backups by name or notes (Enter)..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); handleFilter({ search: '' }); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Format Filter */}
                <select
                  value={selectedFormat}
                  onChange={(e) => {
                    setSelectedFormat(e.target.value);
                    handleFilter({ format: e.target.value });
                  }}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 dark:text-slate-200"
                >
                  <option value="">All Formats (.sqlite, .sql)</option>
                  <option value="sqlite">SQLite Snapshots (.sqlite)</option>
                  <option value="sql">SQL Dumps (.sql / phpMyAdmin)</option>
                </select>

                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    handleFilter({ type: e.target.value });
                  }}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 dark:text-slate-200"
                >
                  <option value="">All Trigger Types</option>
                  <option value="manual">Manual Snapshots</option>
                  <option value="scheduled">Scheduled Backups</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(searchQuery || selectedFormat || selectedType) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFormat('');
                    setSelectedType('');
                    handleFilter({ search: '', format: '', type: '' });
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Backups Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Backup Archive</th>
                      <th className="py-3 px-4">Size & Compression</th>
                      <th className="py-3 px-4">Trigger & User</th>
                      <th className="py-3 px-4">Tables / Rows</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {backups.data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                          <Archive className="w-10 h-10 mx-auto mb-2 opacity-40 stroke-[1.5]" />
                          <div className="font-semibold text-slate-600 dark:text-slate-300">No database backup archives found</div>
                          <p className="text-[11px] mt-1">Click "Create Backup Now" or "Upload & Restore" to get started.</p>
                        </td>
                      </tr>
                    ) : (
                      backups.data.map((backup) => (
                        <tr key={backup.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                          {/* File Name & Format Icon */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3 font-mono">
                              <div className={`p-2 rounded-xl shrink-0 ${
                                backup.format === 'sqlite'
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                              }`}>
                                {backup.format === 'sqlite' ? (
                                  <Database className="w-4 h-4" />
                                ) : (
                                  <FileCode className="w-4 h-4" />
                                )}
                              </div>
                              <div className="truncate max-w-xs md:max-w-md">
                                <div className="font-bold truncate text-[12.5px]">{backup.filename}</div>
                                {backup.notes && (
                                  <div className="text-[10.5px] text-slate-400 font-sans truncate">{backup.notes}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Size & Compression */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {backup.formatted_size}
                              </div>
                              <div className="flex items-center space-x-1.5">
                                {backup.compression === 'gzip' ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 font-mono">
                                    GZIP
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                                    RAW
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 uppercase font-mono">
                                  .{backup.format}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Type & Status */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                backup.type === 'scheduled'
                                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/60'
                                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60'
                              }`}>
                                {backup.type === 'scheduled' ? 'Scheduled Cron' : 'Manual Trigger'}
                              </span>
                              {backup.creator && (
                                <div className="text-[10px] text-slate-400">By {backup.creator.name}</div>
                              )}
                            </div>
                          </td>

                          {/* Tables & Records */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            <div>{backup.tables_count ?? 0} Tables</div>
                            <div className="text-[10px] text-slate-400">{Number(backup.records_count ?? 0).toLocaleString()} Rows ({backup.duration_seconds}s)</div>
                          </td>

                          {/* Created Date */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                            <div>{new Date(backup.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{new Date(backup.created_at).toLocaleTimeString()}</div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Download Button */}
                              <a
                                href={route('admin.backups.download', backup.id)}
                                className="p-2 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-400 rounded-xl transition-colors shadow-2xs"
                                title="Download backup file"
                              >
                                <Download className="w-4 h-4" />
                              </a>

                              {/* Restore Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenRestoreModal(backup)}
                                className="p-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-400 rounded-xl transition-colors shadow-2xs cursor-pointer"
                                title="Restore database from this backup snapshot"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteBackup(backup)}
                                disabled={deletingId === backup.id}
                                className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-400 rounded-xl transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                                title="Delete backup"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {backups.links && backups.links.length > 3 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Showing <span className="font-bold">{backups.from || 0}</span> to <span className="font-bold">{backups.to || 0}</span> of <span className="font-bold">{backups.total || 0}</span> backups
                  </div>
                  <div className="flex items-center space-x-1">
                    {backups.links.map((link, idx) => (
                      <button
                        key={idx}
                        disabled={!link.url || link.active}
                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                          link.active
                            ? 'bg-indigo-600 text-white font-bold'
                            : !link.url
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AUTOMATED SCHEDULE & RETENTION */}
        {activeTab === 'schedule' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 max-w-3xl">
            <form onSubmit={handleSaveSchedule} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Automated Recurring Backup Scheduler
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure automatic point-in-time database backups without requiring external cron daemons.
                </p>
              </div>

              {/* Enable Switch */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Enable Automated Database Backups
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Runs in background via Laravel Task Scheduler (<code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[10px]">php artisan schedule:run</code>).
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleForm.data.enabled}
                    onChange={(e) => scheduleForm.setData('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frequency */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Execution Frequency
                  </label>
                  <select
                    value={scheduleForm.data.frequency}
                    onChange={(e) => scheduleForm.setData('frequency', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="daily">Daily (Every Day)</option>
                    <option value="weekly">Weekly (Every Sunday)</option>
                    <option value="monthly">Monthly (1st Day of Month)</option>
                  </select>
                </div>

                {/* Execution Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Execution Time (24h)
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.data.time}
                    onChange={(e) => scheduleForm.setData('time', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>

                {/* Backup Format */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Scheduled Backup Format
                  </label>
                  <select
                    value={scheduleForm.data.format}
                    onChange={(e) => scheduleForm.setData('format', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="both">Both Formats (.sqlite & .sql)</option>
                    <option value="sqlite">SQLite Snapshots Only (.sqlite)</option>
                    <option value="sql">SQL Dumps Only (.sql / phpMyAdmin)</option>
                  </select>
                </div>

                {/* Retention Period */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Retention Policy (Keep For Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={scheduleForm.data.retention_days}
                    onChange={(e) => scheduleForm.setData('retention_days', parseInt(e.target.value) || 7)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Backups older than this will be auto-purged to save disk.</span>
                </div>
              </div>

              {/* Gzip Compression Toggle */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleForm.data.compression}
                    onChange={(e) => scheduleForm.setData('compression', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Enable GZIP Compression (.gz) for Scheduled Backups
                    </span>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                      Compresses files by ~85% to save disk space and accelerate transfers.
                    </p>
                  </div>
                </label>
              </div>

              {/* Notification Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Notification Alert Email (Optional)
                </label>
                <input
                  type="email"
                  value={scheduleForm.data.notify_email}
                  onChange={(e) => scheduleForm.setData('notify_email', e.target.value)}
                  placeholder="admin@techmarket.com.bd"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={scheduleForm.processing}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  {scheduleForm.processing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Settings...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Schedule Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: DISASTER RECOVERY GUIDE */}
        {activeTab === 'guide' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guide Card 1: Point in Time Recovery */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">1-Click In-App Restore</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Restore directly from Admin Panel</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <p>You can restore any backup directly from the archives table:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[11.5px]">
                  <li>Click the green <strong className="text-emerald-600">Restore</strong> icon next to any backup file.</li>
                  <li>Review the confirmation dialog. An automatic safety snapshot will be taken before restoring.</li>
                  <li>Click <strong>Confirm & Restore</strong>. The application will restore data and flush caches.</li>
                </ol>
              </div>
            </div>

            {/* Guide Card 2: Terminal & CLI Restore */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">CLI Terminal Restoration</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Artisan commands for system administrators</p>
                </div>
              </div>

              <div className="space-y-3 font-mono text-[11px]">
                <div className="p-3 bg-slate-950 text-slate-200 rounded-xl">
                  <div className="text-slate-500 text-[10px]">// Interactive restore menu</div>
                  <div>php artisan db:restore</div>
                </div>

                <div className="p-3 bg-slate-950 text-slate-200 rounded-xl">
                  <div className="text-slate-500 text-[10px]">// Restore by backup ID or path</div>
                  <div>php artisan db:restore 1</div>
                  <div>php artisan db:restore storage/app/backups/backup.sql</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: CREATE BACKUP */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create Database Backup</h3>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Generate on-demand database snapshot</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBackup} className="space-y-4">
                {/* Format Radio Cards */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Backup Format
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'both', label: 'Both Formats (.sqlite & .sql)', desc: 'Full SQLite file copy & MySQL-compatible SQL dump' },
                      { id: 'sqlite', label: 'SQLite Snapshot (.sqlite)', desc: 'Binary copy of SQLite database file' },
                      { id: 'sql', label: 'SQL Dump (.sql / phpMyAdmin)', desc: 'Standard DDL & INSERT scripts for MySQL/MariaDB' },
                    ].map((f) => (
                      <label
                        key={f.id}
                        onClick={() => createForm.setData('format', f.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          createForm.data.format === f.id
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-600 ring-1 ring-indigo-500'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{f.label}</div>
                          <div className="text-[10.5px] text-slate-500 dark:text-slate-400">{f.desc}</div>
                        </div>
                        {createForm.data.format === f.id && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Compression Checkbox */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createForm.data.compress}
                      onChange={(e) => createForm.setData('compress', e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Enable GZIP Compression (.gz)
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Compresses backup files by ~85% for rapid download and space savings.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Notes Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Backup Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={createForm.data.notes}
                    onChange={(e) => createForm.setData('notes', e.target.value)}
                    placeholder="e.g. Pre-upgrade backup, manual archive"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createForm.processing}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {createForm.processing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Backup...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Generate Backup</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: RESTORE CONFIRMATION */}
        {isRestoreModalOpen && backupToRestore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Restore Database Snapshot</h3>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Overwrites current database with backup</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsRestoreModalOpen(false); setBackupToRestore(null); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmRestore} className="space-y-4">
                {/* Warning Banner */}
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start space-x-3">
                  <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    <strong className="block font-bold">Important Notice:</strong>
                    Restoring this snapshot will replace current database tables and data.
                  </div>
                </div>

                {/* Target Details */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Backup File:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{backupToRestore.filename}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Size:</span>
                    <span className="text-slate-700 dark:text-slate-300">{backupToRestore.formatted_size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Format:</span>
                    <span className="uppercase text-slate-700 dark:text-slate-300">{backupToRestore.format}</span>
                  </div>
                </div>

                {/* Pre-Restore Safety Checkbox */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restoreForm.data.create_safety}
                      onChange={(e) => restoreForm.setData('create_safety', e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Create Pre-Restore Safety Backup
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Automatically captures a snapshot before restoring so you can revert anytime.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => { setIsRestoreModalOpen(false); setBackupToRestore(null); }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={restoreForm.processing}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {restoreForm.processing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Restoring Database...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        <span>Confirm & Restore</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: UPLOAD & RESTORE */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Upload & Restore Database</h3>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Upload external backup file (.sqlite, .sql, .gz)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsUploadModalOpen(false); uploadForm.reset(); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadRestore} className="space-y-4">
                {/* File Dropzone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => uploadForm.setData('backup_file', e.target.files[0] || null)}
                    accept=".sqlite,.sql,.db,.gz"
                    className="hidden"
                  />
                  <UploadCloud className="w-8 h-8 mx-auto mb-2 text-indigo-500 opacity-80" />
                  {uploadForm.data.backup_file ? (
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100 font-mono">
                        {uploadForm.data.backup_file.name}
                      </div>
                      <div className="text-[10.5px] text-slate-400">
                        {(uploadForm.data.backup_file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Click to select or drag & drop backup file
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Supported formats: .sqlite, .sql, .sqlite.gz, .sql.gz (Up to 500MB)
                      </div>
                    </div>
                  )}
                </div>

                {uploadForm.errors.backup_file && (
                  <p className="text-xs text-rose-500">{uploadForm.errors.backup_file}</p>
                )}

                {/* Pre-Restore Safety Checkbox */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadForm.data.create_safety}
                      onChange={(e) => uploadForm.setData('create_safety', e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Create Pre-Restore Safety Backup
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Automatically captures a snapshot before restoring so you can revert anytime.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => { setIsUploadModalOpen(false); uploadForm.reset(); }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadForm.processing || !uploadForm.data.backup_file}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploadForm.processing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading & Restoring...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        <span>Upload & Restore</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
