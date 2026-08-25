<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessBulkImportJob;
use App\Models\Brand;
use App\Models\BulkExport;
use App\Models\BulkImport;
use App\Models\Category;
use App\Models\Unit;
use App\Services\BulkData\BulkExportService;
use App\Services\BulkData\BulkImportService;
use App\Services\BulkData\TemplateGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BulkDataController extends Controller
{
    public function __construct(
        protected BulkImportService $importService,
        protected BulkExportService $exportService,
        protected TemplateGeneratorService $templateService
    ) {}

    /**
     * Data Management Overview Dashboard.
     */
    public function index(): Response
    {
        $stats = [
            'total_imports' => BulkImport::count(),
            'total_exports' => BulkExport::count(),
            'successful_imports' => BulkImport::whereIn('status', ['completed', 'completed_with_errors'])->count(),
            'total_rows_imported' => (int) BulkImport::sum('created_rows') + (int) BulkImport::sum('updated_rows'),
            'total_rows_exported' => (int) BulkExport::sum('total_rows'),
        ];

        $recentImports = BulkImport::with('user')
            ->latest('id')
            ->take(5)
            ->get();

        $recentExports = BulkExport::with('user')
            ->latest('id')
            ->take(5)
            ->get();

        return Inertia::render('Admin/DataManagement/Index', [
            'stats' => $stats,
            'recentImports' => $recentImports,
            'recentExports' => $recentExports,
            'supportedEntities' => $this->importService->getSupportedEntities(),
        ]);
    }

    /**
     * Import Wizard Page.
     */
    public function importWizard(): Response
    {
        return Inertia::render('Admin/DataManagement/ImportWizard', [
            'supportedEntities' => $this->importService->getSupportedEntities(),
        ]);
    }

    /**
     * Upload import file and return auto-mapping.
     */
    public function uploadFile(Request $request): JsonResponse
    {
        $request->validate([
            'entity_type' => 'required|string|in:products,categories,brands,units',
            'file' => 'required|file|mimes:csv,txt,xlsx|max:51200', // max 50MB
            'mode' => 'nullable|string|in:create_only,update_only,create_or_update',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $format = $extension === 'xlsx' ? 'xlsx' : 'csv';
        $originalName = $file->getClientOriginalName();

        $path = $file->storeAs('imports/uploads', uniqid('import_') . '.' . $extension);

        $processor = $this->importService->getProcessor($request->entity_type);
        $fileDetails = $this->importService->inspectUploadedFile($path, $format);
        $autoMapping = $this->importService->autoMapColumns($fileDetails['headers'], $processor);

        $bulkImport = BulkImport::create([
            'entity_type' => $request->entity_type,
            'file_path' => $path,
            'file_name' => $originalName,
            'file_format' => $format,
            'mode' => $request->mode ?? 'create_or_update',
            'status' => 'pending',
            'total_rows' => $fileDetails['total_rows'],
            'column_mapping' => $autoMapping,
            'user_id' => auth()->id() ?? 1,
        ]);

        return response()->json([
            'import_id' => $bulkImport->id,
            'headers' => $fileDetails['headers'],
            'sample_rows' => $fileDetails['sample_rows'],
            'total_rows' => $fileDetails['total_rows'],
            'auto_mapping' => $autoMapping,
            'system_columns' => $processor->getTemplateColumns(),
        ]);
    }

    /**
     * Preview and Validate an import before execution.
     */
    public function previewAndValidate(Request $request, int $id): JsonResponse
    {
        $bulkImport = BulkImport::findOrFail($id);

        if ($request->has('column_mapping')) {
            $bulkImport->update(['column_mapping' => $request->column_mapping]);
        }

        if ($request->has('mode')) {
            $bulkImport->update(['mode' => $request->mode]);
        }

        $results = $this->importService->previewAndValidate($bulkImport);

        return response()->json([
            'import_id' => $bulkImport->id,
            'results' => $results,
        ]);
    }

    /**
     * Execute Import (or Dry-Run).
     */
    public function execute(Request $request, int $id): JsonResponse
    {
        $bulkImport = BulkImport::findOrFail($id);

        $isDryRun = $request->boolean('is_dry_run', false);
        $runAsync = $request->boolean('run_async', false);

        $bulkImport->update([
            'is_dry_run' => $isDryRun,
            'status' => 'queued',
        ]);

        if ($runAsync) {
            ProcessBulkImportJob::dispatch($bulkImport);
            return response()->json([
                'status' => 'queued',
                'message' => 'Import job queued successfully. Tracking real-time progress.',
                'import' => $bulkImport->fresh(),
            ]);
        }

        // Synchronous execution
        $completed = $this->importService->executeImport($bulkImport);

        return response()->json([
            'status' => $completed->status,
            'message' => 'Import processed successfully.',
            'import' => $completed,
        ]);
    }

    /**
     * Poll import progress and status.
     */
    public function status(int $id): JsonResponse
    {
        $bulkImport = BulkImport::findOrFail($id);
        return response()->json([
            'import' => $bulkImport,
        ]);
    }

    /**
     * Cancel an import in progress.
     */
    public function cancel(int $id): JsonResponse
    {
        $bulkImport = BulkImport::findOrFail($id);

        if (in_array($bulkImport->status, ['pending', 'validating', 'queued'])) {
            $bulkImport->update([
                'status' => 'cancelled',
                'completed_at' => now(),
            ]);
            return response()->json(['message' => 'Import cancelled successfully.']);
        }

        return response()->json(['message' => 'Import cannot be cancelled in its current status.'], 422);
    }

    /**
     * Export Studio Page.
     */
    public function exportStudio(): Response
    {
        return Inertia::render('Admin/DataManagement/ExportStudio', [
            'supportedEntities' => $this->importService->getSupportedEntities(),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'units' => Unit::orderBy('name')->get(['id', 'name', 'short_code']),
            'exportColumns' => [
                'products' => $this->exportService->getProcessor('products')->getAvailableColumns(),
                'categories' => $this->exportService->getProcessor('categories')->getAvailableColumns(),
                'brands' => $this->exportService->getProcessor('brands')->getAvailableColumns(),
                'units' => $this->exportService->getProcessor('units')->getAvailableColumns(),
            ],
        ]);
    }

    /**
     * Execute Export stream.
     */
    public function executeExport(Request $request): StreamedResponse
    {
        $request->validate([
            'entity_type' => 'required|string|in:products,categories,brands,units',
            'format' => 'required|string|in:csv,xlsx,json',
            'columns' => 'nullable|array',
            'filters' => 'nullable|array',
        ]);

        return $this->exportService->export(
            entityType: $request->entity_type,
            format: $request->format,
            filters: $request->filters ?? [],
            selectedColumns: $request->columns ?? []
        );
    }

    /**
     * History Page (Imports & Exports).
     */
    public function history(Request $request): Response
    {
        $imports = BulkImport::with('user')
            ->when($request->entity, fn($q, $e) => $q->where('entity_type', $e))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $exports = BulkExport::with('user')
            ->when($request->entity, fn($q, $e) => $q->where('entity_type', $e))
            ->latest('id')
            ->paginate(15, ['*'], 'exports_page')
            ->withQueryString();

        return Inertia::render('Admin/DataManagement/History', [
            'imports' => $imports,
            'exports' => $exports,
            'filters' => $request->only(['entity', 'status']),
            'supportedEntities' => $this->importService->getSupportedEntities(),
        ]);
    }

    /**
     * Download CSV / XLSX template.
     */
    public function downloadTemplate(string $entity, string $format = 'csv'): StreamedResponse
    {
        $processor = $this->importService->getProcessor($entity);

        if ($format === 'xlsx') {
            return $this->templateService->generateXlsx($processor);
        }

        return $this->templateService->generateCsv($processor);
    }

    /**
     * Download Error CSV.
     */
    public function downloadErrors(int $id): StreamedResponse
    {
        $bulkImport = BulkImport::findOrFail($id);
        return $this->importService->downloadErrorCsv($bulkImport);
    }
}
