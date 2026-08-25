import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import axios from 'axios';
import { 
  UploadCloud, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Package, 
  FolderTree, 
  Tag, 
  Ruler, 
  Download, 
  RefreshCw, 
  Layers, 
  Check, 
  X, 
  AlertTriangle,
  Play,
  FileText
} from 'lucide-react';

export default function ImportWizard({ supportedEntities }) {
  // Query param auto-select
  const urlParams = new URLSearchParams(window.location.search);
  const initialEntity = urlParams.get('entity') || 'products';

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState(initialEntity);
  const [importMode, setImportMode] = useState('create_or_update');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Wizard state from backend upload
  const [importId, setImportId] = useState(null);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [sampleRows, setSampleRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [columnMapping, setColumnMapping] = useState({});
  const [systemColumns, setSystemColumns] = useState([]);

  // Validation Preview state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [isDryRun, setIsDryRun] = useState(false);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [pollProgress, setPollProgress] = useState(0);

  const entityIcons = {
    products: Package,
    categories: FolderTree,
    brands: Tag,
    units: Ruler,
  };

  const steps = [
    { num: 1, label: 'Entity & Mode' },
    { num: 2, label: 'Upload File' },
    { num: 3, label: 'Column Mapping' },
    { num: 4, label: 'Validation Preview' },
    { num: 5, label: 'Import Execution' },
  ];

  // Handle file drop/selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload file and proceed to Step 3
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('entity_type', selectedEntity);
    formData.append('mode', importMode);
    formData.append('file', selectedFile);

    try {
      const res = await axios.post('/admin/data-management/import/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setImportId(res.data.import_id);
      setFileHeaders(res.data.headers);
      setSampleRows(res.data.sample_rows);
      setTotalRows(res.data.total_rows);
      setColumnMapping(res.data.auto_mapping);
      setSystemColumns(res.data.system_columns);
      setCurrentStep(3);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload and inspect file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Request Validation Preview
  const handleRequestValidation = async () => {
    if (!importId) return;

    setIsValidating(true);
    try {
      const res = await axios.post(`/admin/data-management/import/${importId}/preview`, {
        column_mapping: columnMapping,
        mode: importMode,
      });

      setValidationResults(res.data.results);
      setCurrentStep(4);
    } catch (err) {
      alert(err.response?.data?.message || 'Validation failed.');
    } finally {
      setIsValidating(false);
    }
  };

  // Start Execution
  const handleExecuteImport = async () => {
    if (!importId) return;

    setIsExecuting(true);
    setCurrentStep(5);

    try {
      const res = await axios.post(`/admin/data-management/import/${importId}/execute`, {
        is_dry_run: isDryRun,
        run_async: false,
      });

      setExecutionResult(res.data.import);
    } catch (err) {
      alert(err.response?.data?.message || 'Import execution failed.');
    } finally {
      setIsExecuting(false);
    }
  };

  const currentProcessor = supportedEntities[selectedEntity];

  return (
    <AdminLayout>
      <Head title="Bulk Import Wizard — Enterprise Data Management" />

      <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <Link href="/admin/data-management" className="hover:text-slate-800 transition">Data Management</Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Import Wizard</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <UploadCloud className="w-6 h-6 text-indigo-600" />
              Multi-Step Import Wizard
            </h1>
          </div>

          <Link
            href="/admin/data-management"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Wizard
          </Link>
        </div>

        {/* Wizard Step Progress Indicator */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <React.Fragment key={step.num}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : step.num}
                    </div>
                    <div className="hidden sm:block">
                      <div className={`text-xs font-bold ${isCurrent ? 'text-indigo-600' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                        Step {step.num}
                      </div>
                      <div className={`text-[11px] ${isCurrent ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                        {step.label}
                      </div>
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${isDone ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* STEP 1: ENTITY & MODE */}
        {/* ==================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">1. Select Target Data Type</h2>
              <p className="text-xs text-slate-500 mb-5">Choose the entity type you wish to import.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(supportedEntities).map(([key, entity]) => {
                  const Icon = entityIcons[key] || FileSpreadsheet;
                  const isSelected = selectedEntity === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedEntity(key)}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-100'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </div>
                      <div className="font-bold text-slate-900 text-base">{entity.label}</div>
                      <div className="text-xs text-slate-500 mt-1">Unique Key: <span className="font-mono font-bold text-slate-700">{entity.unique_key.toUpperCase()}</span></div>
                      <div className="text-[11px] text-slate-400 mt-2">{entity.columns.length} supported attributes</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">2. Choose Import Mode</h2>
              <p className="text-xs text-slate-500 mb-5">Configure how the system handles existing records matched by unique identifier.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'create_or_update',
                    title: 'Create + Update (Recommended)',
                    desc: 'Create new records if not found; update existing records if key matches.',
                    badge: 'UPSERT',
                  },
                  {
                    id: 'create_only',
                    title: 'Create Only',
                    desc: 'Only insert new records. If key exists in database, skip that row safely.',
                    badge: 'INSERT',
                  },
                  {
                    id: 'update_only',
                    title: 'Update Only',
                    desc: 'Only update existing records matched by key. Skip rows with unknown keys.',
                    badge: 'UPDATE',
                  },
                ].map((mode) => (
                  <label
                    key={mode.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                      importMode === mode.id
                        ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {mode.badge}
                        </span>
                        <input
                          type="radio"
                          name="importMode"
                          value={mode.id}
                          checked={importMode === mode.id}
                          onChange={(e) => setImportMode(e.target.value)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{mode.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{mode.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md"
              >
                Continue to Upload
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: UPLOAD FILE */}
        {/* ==================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Upload Data File ({currentProcessor?.label})</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Supports standard CSV and Microsoft Excel (.xlsx) files up to 50MB</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/admin/data-management/template/${selectedEntity}/csv`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    download
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Download CSV Template
                  </a>
                  <a
                    href={`/admin/data-management/template/${selectedEntity}/xlsx`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                    download
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    Download XLSX Template
                  </a>
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-10 text-center transition bg-slate-50/50">
                <input
                  type="file"
                  id="importFileInput"
                  accept=".csv,.xlsx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="max-w-md mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-inner">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  {selectedFile ? (
                    <div className="text-center">
                      <div className="font-bold text-slate-900 text-base">{selectedFile.name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Standard Sheet'}
                      </div>
                      <label
                        htmlFor="importFileInput"
                        className="inline-block mt-3 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Change File
                      </label>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="importFileInput"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-sm transition"
                      >
                        Browse Computer
                      </label>
                      <p className="text-xs text-slate-500 mt-3">
                        or drag and drop your CSV / XLSX file here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                disabled={!selectedFile || isUploading}
                onClick={handleUploadAndAnalyze}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-md"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Headers...
                  </>
                ) : (
                  <>
                    Analyze & Map Columns
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: COLUMN MAPPING */}
        {/* ==================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Map File Columns to System Fields</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We automatically matched column headers. Adjust any unmapped fields below.
                  </p>
                </div>
                <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">
                  Total File Rows: <span className="font-bold text-indigo-600">{totalRows.toLocaleString()}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                      <th className="py-3 px-4">Uploaded File Header</th>
                      <th className="py-3 px-4">Sample Value (Row 1)</th>
                      <th className="py-3 px-4">Matched System Field</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fileHeaders.map((header, idx) => {
                      const matchedKey = columnMapping[header] || '';
                      const sampleVal = sampleRows[0]?.[idx] ?? '';
                      const matchedColDef = systemColumns.find((c) => c.key === matchedKey);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-bold text-slate-800">{header}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono truncate max-w-xs">{sampleVal || '—'}</td>
                          <td className="py-3 px-4">
                            <select
                              value={matchedKey}
                              onChange={(e) => {
                                setColumnMapping({
                                  ...columnMapping,
                                  [header]: e.target.value || null,
                                });
                              }}
                              className="text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5 px-2.5 font-medium bg-white w-64"
                            >
                              <option value="">-- Ignore this column --</option>
                              {systemColumns.map((col) => (
                                <option key={col.key} value={col.key}>
                                  {col.label} {col.required ? '(Required)' : ''}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            {matchedKey ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                <Check className="w-3.5 h-3.5" />
                                Mapped to {matchedColDef?.label}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">Ignored</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                disabled={isValidating}
                onClick={handleRequestValidation}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-md"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Validating Rows...
                  </>
                ) : (
                  <>
                    Proceed to Validation Preview
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 4: VALIDATION PREVIEW & DRY RUN */}
        {/* ==================================================================== */}
        {currentStep === 4 && validationResults && (
          <div className="space-y-6">
            {/* Scorecard */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Rows Evaluated</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{validationResults.total_rows.toLocaleString()}</div>
              </div>
              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-200 shadow-sm">
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid Records
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-1">{validationResults.valid_count.toLocaleString()}</div>
              </div>
              <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200 shadow-sm">
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Warnings
                </div>
                <div className="text-2xl font-black text-amber-700 mt-1">{validationResults.warning_count.toLocaleString()}</div>
              </div>
              <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-200 shadow-sm">
                <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Error Rows
                </div>
                <div className="text-2xl font-black text-rose-700 mt-1">{validationResults.error_count.toLocaleString()}</div>
              </div>
            </div>

            {/* Top Errors Accordion if present */}
            {validationResults.top_errors.length > 0 && (
              <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Validation Issues Detected ({validationResults.error_count} rows with errors)
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                  {validationResults.top_errors.map((err, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-rose-200/80 text-xs text-rose-800 flex items-start gap-2 shadow-2xs">
                      <span className="font-bold shrink-0 bg-rose-100 px-2 py-0.5 rounded text-rose-900">Row {err.row} ({err.key})</span>
                      <span className="mt-0.5">{err.errors.join(' | ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dry Run Setting */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900">Test Dry Run (Safe Simulation)</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Simulates import and calculates final counts without making any changes to the live database.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDryRun}
                  onChange={(e) => setIsDryRun(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Mapping
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md"
              >
                <Play className="w-4 h-4" />
                {isDryRun ? 'Start Dry-Run Simulation' : `Confirm & Import ${validationResults.valid_count.toLocaleString()} Records`}
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 5: EXECUTION & RESULTS */}
        {/* ==================================================================== */}
        {currentStep === 5 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
            {isExecuting ? (
              <div className="max-w-md mx-auto py-8">
                <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4 animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Processing Batch Import...</h2>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  Running transactional chunk processing. Please do not close this window.
                </p>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-indigo-600 h-3 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            ) : executionResult ? (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {executionResult.is_dry_run ? 'Dry Run Simulation Completed!' : 'Import Successfully Executed!'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {executionResult.processed_rows.toLocaleString()} total rows processed for {currentProcessor?.label}.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Created</div>
                    <div className="text-xl font-extrabold text-emerald-600">+{executionResult.created_rows}</div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Updated</div>
                    <div className="text-xl font-extrabold text-indigo-600">~{executionResult.updated_rows}</div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Skipped</div>
                    <div className="text-xl font-extrabold text-slate-600">{executionResult.skipped_rows}</div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Failed</div>
                    <div className="text-xl font-extrabold text-rose-600">{executionResult.failed_rows}</div>
                  </div>
                </div>

                {executionResult.failed_rows > 0 && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-left flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-rose-900">{executionResult.failed_rows} row(s) failed validation or database constraints</div>
                      <div className="text-[11px] text-rose-700 mt-0.5">Download error CSV containing exact row numbers and failure reasons.</div>
                    </div>
                    <a
                      href={`/admin/data-management/import/${executionResult.id}/errors`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                      download
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Errors (CSV)
                    </a>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
                  <Link
                    href={`/admin/${selectedEntity}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
                  >
                    View {currentProcessor?.label} Catalog →
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setSelectedFile(null);
                      setValidationResults(null);
                      setExecutionResult(null);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
                  >
                    Run Another Import
                  </button>
                  <Link
                    href="/admin/data-management/history"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    View Import History
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
