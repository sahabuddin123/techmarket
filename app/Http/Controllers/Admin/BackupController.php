<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DatabaseBackup;
use App\Services\AuditLogger;
use App\Services\Backup\BackupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    public function __construct(
        protected BackupService $backupService
    ) {}

    /**
     * Display Database Backups & Schedule Workspace.
     */
    public function index(Request $request): Response
    {
        // Auto-check table existence
        if (!\Illuminate\Support\Facades\Schema::hasTable('database_backups')) {
            try {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            } catch (\Throwable $e) {
                // Ignore if migration fails
            }
        }

        if (\Illuminate\Support\Facades\Schema::hasTable('database_backups')) {
            $query = DatabaseBackup::with('creator')->latest();

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('filename', 'like', "%{$search}%")
                      ->orWhere('notes', 'like', "%{$search}%");
                });
            }

            if ($request->filled('format')) {
                $query->where('format', $request->input('format'));
            }

            if ($request->filled('type')) {
                $query->where('type', $request->input('type'));
            }

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            $backups = $query->paginate(15)->withQueryString();
        } else {
            $backups = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15);
        }

        $stats = $this->backupService->getBackupStats();

        return Inertia::render('Admin/Backups/Index', [
            'backups' => $backups,
            'stats' => $stats,
            'filters' => $request->only(['search', 'format', 'type', 'status']),
        ]);
    }

    /**
     * Create a new on-demand database backup.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'format' => 'required|string|in:sqlite,sql,both',
            'compress' => 'nullable|boolean',
            'notes' => 'nullable|string|max:255',
        ]);

        $compress = !empty($validated['compress']);
        $format = $validated['format'];
        $notes = $validated['notes'] ?? null;

        $createdBackups = $this->backupService->createBackup(
            format: $format,
            compress: $compress,
            type: 'manual',
            userId: auth()->id(),
            notes: $notes
        );

        $hasError = false;
        foreach ($createdBackups as $b) {
            if ($b->status === 'failed') {
                $hasError = true;
            }
        }

        AuditLogger::log('database.backup.created', null, null, [
            'format' => $format,
            'compress' => $compress,
            'count' => count($createdBackups),
        ]);

        if ($hasError) {
            return redirect()->back()->with('error', 'One or more backup operations encountered an error. Check backup logs.');
        }

        return redirect()->back()->with('success', 'Database backup snapshot generated successfully!');
    }

    /**
     * Stream download a backup file.
     */
    public function download(DatabaseBackup $backup): StreamedResponse
    {
        AuditLogger::log('database.backup.downloaded', $backup, null, [
            'filename' => $backup->filename,
        ]);

        return $this->backupService->downloadBackup($backup);
    }

    /**
     * Delete a backup file and record.
     */
    public function destroy(DatabaseBackup $backup): RedirectResponse
    {
        $filename = $backup->filename;
        $this->backupService->deleteBackup($backup);

        AuditLogger::log('database.backup.deleted', null, null, [
            'filename' => $filename,
        ]);

        return redirect()->back()->with('success', "Backup file '{$filename}' was deleted permanently.");
    }

    /**
     * Update automated backup schedule configuration.
     */
    public function updateSchedule(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enabled' => 'nullable|boolean',
            'frequency' => 'required|string|in:daily,weekly,monthly',
            'time' => 'required|string|regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/',
            'format' => 'required|string|in:sqlite,sql,both',
            'retention_days' => 'required|integer|min:1|max:365',
            'compression' => 'nullable|boolean',
            'notify_email' => 'nullable|email|max:255',
        ]);

        $this->backupService->updateScheduleSettings($validated);

        AuditLogger::log('database.backup.schedule_updated', null, null, $validated);

        return redirect()->back()->with('success', 'Automated backup schedule configuration saved successfully!');
    }

    /**
     * Trigger scheduled backup job immediately for testing.
     */
    public function runScheduledNow(): RedirectResponse
    {
        $settings = $this->backupService->getScheduleSettings();

        $this->backupService->createBackup(
            format: $settings['format'],
            compress: $settings['compression'],
            type: 'scheduled',
            userId: auth()->id(),
            notes: 'Manually triggered scheduled test run'
        );

        return redirect()->back()->with('success', 'Scheduled backup executed successfully!');
    }

    /**
     * Trigger manual retention clean-up of expired backups.
     */
    public function pruneExpired(): RedirectResponse
    {
        $prunedCount = $this->backupService->pruneOldBackups();

        return redirect()->back()->with('success', "Pruned {$prunedCount} expired backups based on retention policy.");
    }
}
