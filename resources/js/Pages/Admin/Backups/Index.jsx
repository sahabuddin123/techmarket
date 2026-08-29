import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { 
  Database, HardDriveDownload, Download, Trash2, Clock, Calendar, 
  ShieldCheck, RefreshCw, Plus, FileArchive, CheckCircle2, AlertTriangle, 
  Settings, Layers, Terminal, Sparkles, Filter, Search, X, Check, ArrowDownToLine,
  Zap, Info, FileCode, Archive
} from 'lucide-react';

export default function AdminBackupsIndex({ 
  backups = { data: [], links: [] }, 
  stats = {}, 
  filters = {} 
}) {
  const [activeTab, setActiveTab] = useState('archives'); // 'archives' | 'schedule' | 'guide'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedFormat, setSelectedFormat] = useState(filters.format || '');
  const [selectedType, setSelectedType] = useState(filters.type || '');
  const [deletingId, setDeletingId] = useState(null);

  // Manual Backup Creation Form
  const createForm = useForm({
    format: 'both', // 'sqlite' | 'sql' | 'both'
    compress: true,
    notes: '',
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

  // Handle Schedule Settings Submit
  const handleSaveSchedule = (e) => {
    e.preventDefault();
    scheduleForm.post(route('admin.backups.schedule'), {
      preserveScroll: true,
    });
  };

  // Handle Filter Change
  const handleFilter = (newFilters) => {
    router.get(route('admin.backups'), {
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
      router.delete(route('admin.backups.delete', backup.id), {
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
    <AdminShell title="Database Backups & Schedule">
      <Head title="Database Backups & Schedule - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Database Backups & Disaster Recovery"
          subtitle="Generate instant SQLite database snapshots (.sqlite) and SQL dumps (.sql) with automated scheduling, compression, and retention policies."
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
              <span>Test Scheduled Run</span>
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
            color="blue"
          />

          <AdminKpiCard
            title="Auto-Scheduler"
            value={scheduleSettings.enabled ? 'Active (Enabled)' : 'Disabled'}
            description={
              scheduleSettings.enabled 
                ? `Runs ${scheduleSettings.frequency} at ${scheduleSettings.time}` 
                : 'Automated backups paused'
            }
            icon={Clock}
            color={scheduleSettings.enabled ? 'emerald' : 'slate'}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('archives')}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center space-x-2 ${
              activeTab === 'archives'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Backup Archives ({backups.total || backups.data?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center space-x-2 ${
              activeTab === 'schedule'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Automated Schedule Settings</span>
            {scheduleSettings.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center space-x-2 ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>CLI & Disaster Recovery Guide</span>
          </button>
        </div>

        {/* TAB 1: BACKUP ARCHIVES */}
        {activeTab === 'archives' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search input */}
                <div className="relative min-w-[240px] max-w-sm flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search backup filename, notes... (Press Enter)"
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); handleFilter({ search: '' }); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Format Filter */}
                <select
                  value={selectedFormat}
                  onChange={(e) => { setSelectedFormat(e.target.value); handleFilter({ format: e.target.value }); }}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">All Formats (.sqlite & .sql)</option>
                  <option value="sqlite">SQLite Snapshots (.sqlite)</option>
                  <option value="sql">SQL Dumps (.sql)</option>
                </select>

                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => { setSelectedType(e.target.value); handleFilter({ type: e.target.value }); }}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">All Types (Manual & Scheduled)</option>
                  <option value="manual">Manual On-Demand</option>
                  <option value="scheduled">Scheduled Automated</option>
                </select>
              </div>

              {(filters.search || filters.format || filters.type) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFormat('');
                    setSelectedType('');
                    router.get(route('admin.backups'));
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Backups Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Backup File & Format</th>
                      <th className="py-3 px-4">Size & Compression</th>
                      <th className="py-3 px-4">Type & Trigger</th>
                      <th className="py-3 px-4">Tables / Records</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {(!backups.data || backups.data.length === 0) ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Archive className="w-10 h-10 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                            <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">No backup files found</p>
                            <p className="text-xs">Click "Create Backup Now" above to generate your first database backup snapshot.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      backups.data.map((backup) => (
                        <tr key={backup.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Filename & Format */}
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                            <div className="flex items-center space-x-2.5">
                              <div className={`p-2 rounded-xl shrink-0 ${
                                backup.format === 'sqlite'
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
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
                              <a
                                href={route('admin.backups.download', backup.id)}
                                className="p-2 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-400 rounded-xl transition-colors shadow-2xs"
                                title="Download backup file"
                              >
                                <Download className="w-4 h-4" />
                              </a>

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
                        onClick={() => link.url && router.get(link.url)}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                          link.active
                            ? 'bg-indigo-600 text-white'
                            : link.url
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                            : 'opacity-40 cursor-not-allowed text-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AUTOMATED SCHEDULE SETTINGS */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2 font-heading">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Automated Database Backup Schedule</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure recurring background cron backup jobs to automatically secure your store's database snapshots without manual intervention.
                </p>
              </div>

              <form onSubmit={handleSaveSchedule} className="space-y-5">
                {/* Enabled Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Enable Automated Recurring Backups
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      When enabled, Laravel Scheduler will automatically execute backup creation according to the frequency and time specified.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleForm.data.enabled}
                      onChange={(e) => scheduleForm.setData('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Backup Format */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Backup Archive Format
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'both', label: 'Both (.sqlite & .sql)', desc: 'Full redundancy (Recommended)' },
                      { id: 'sqlite', label: 'SQLite Snapshot (.sqlite)', desc: 'Instant binary database file copy' },
                      { id: 'sql', label: 'SQL Dump (.sql)', desc: 'Standard SQL DDL + INSERT statements' },
                    ].map((fmt) => (
                      <label
                        key={fmt.id}
                        onClick={() => scheduleForm.setData('format', fmt.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          scheduleForm.data.format === fmt.id
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-600 ring-1 ring-indigo-500'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{fmt.label}</span>
                          {scheduleForm.data.format === fmt.id && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{fmt.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Frequency & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Backup Frequency
                    </label>
                    <select
                      value={scheduleForm.data.frequency}
                      onChange={(e) => scheduleForm.setData('frequency', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                    >
                      <option value="daily">Daily (Every night)</option>
                      <option value="weekly">Weekly (Every Sunday)</option>
                      <option value="monthly">Monthly (1st of each month)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Execution Time (24-Hour Format)
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.data.time}
                      onChange={(e) => scheduleForm.setData('time', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                    />
                    <p className="text-[10px] text-slate-400">Low-traffic off-peak hours (e.g. 02:00 AM) recommended.</p>
                  </div>
                </div>

                {/* Retention & Compression */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Retention Policy (Days to Keep)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={scheduleForm.data.retention_days}
                        onChange={(e) => scheduleForm.setData('retention_days', parseInt(e.target.value) || 7)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">days</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Older backups will be automatically pruned to save disk space.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Storage Optimization
                    </label>
                    <label className="flex items-center space-x-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleForm.data.compression}
                        onChange={(e) => scheduleForm.setData('compression', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Enable GZIP Compression</span>
                        <p className="text-[10px] text-slate-400">Saves ~85% disk storage capacity (.gz)</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={scheduleForm.processing}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Schedule Configuration</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Schedule Status Sidebar Card */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduler Telemetry</h4>
                
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-500">Cron Scheduler</span>
                    <span className={`font-bold ${scheduleSettings.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {scheduleSettings.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-500">Next Estimated Run</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {stats.next_scheduled_run 
                        ? new Date(stats.next_scheduled_run).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-500">Retention Cutoff</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {scheduleSettings.retention_days || 7} Days
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Server Cron Requirement</span>
                  </div>
                  <p>
                    Ensure your server's crontab has the standard Laravel scheduler entry configured:
                  </p>
                  <code className="block p-1.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                    * * * * * cd /path-to-app && php artisan schedule:run &gt;&gt; /dev/null 2&gt;&amp;1
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CLI & DISASTER RECOVERY GUIDE */}
        {activeTab === 'guide' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2 font-heading">
                <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Working with SQLite Snapshots (.sqlite)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                SQLite snapshot backups are exact point-in-time binary copies of your database. They can be inspected using any SQLite viewer (e.g. DB Browser for SQLite, DBeaver) or restored directly.
              </p>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">How to restore an SQLite snapshot:</span>
                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <li>Download the <code className="font-mono text-indigo-600 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.sqlite</code> (or decompress <code className="font-mono">.sqlite.gz</code>) file.</li>
                  <li>Put your app into maintenance mode: <code className="font-mono text-slate-800 dark:text-slate-200">php artisan down</code></li>
                  <li>Replace <code className="font-mono text-slate-800 dark:text-slate-200">database/database.sqlite</code> with the backup file.</li>
                  <li>Bring app back online: <code className="font-mono text-slate-800 dark:text-slate-200">php artisan up</code></li>
                </ol>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2 font-heading">
                <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Working with SQL Dumps (.sql)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                SQL dump files contain standard SQL DDL schema statements and table data inserts. They can be restored using SQLite CLI or imported into MySQL / PostgreSQL with minimal adjustment.
              </p>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">How to restore from SQL dump:</span>
                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <li>Decompress if gzipped: <code className="font-mono">gzip -d backup_file.sql.gz</code></li>
                  <li>Import into SQLite via terminal:</li>
                  <code className="block p-2 rounded bg-slate-950 text-slate-100 font-mono text-[11px]">
                    sqlite3 database/database.sqlite &lt; backup_file.sql
                  </code>
                  <li>Clear application caches: <code className="font-mono text-slate-800 dark:text-slate-200">php artisan optimize:clear</code></li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE MANUAL BACKUP */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2 font-heading">
                  <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Create Database Backup</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBackup} className="space-y-4">
                {/* Format Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Select Backup Format
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'both', label: 'Both (.sqlite & .sql)', desc: 'Generate both binary snapshot and SQL dump file' },
                      { id: 'sqlite', label: 'SQLite Snapshot (.sqlite)', desc: 'Direct database binary file snapshot' },
                      { id: 'sql', label: 'SQL Script (.sql)', desc: 'Standard schema DDL and table row inserts' },
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
      </div>
    </AdminShell>
  );
}
