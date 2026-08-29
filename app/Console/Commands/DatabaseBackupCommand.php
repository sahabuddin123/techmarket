<?php

namespace App\Console\Commands;

use App\Services\Backup\BackupService;
use Illuminate\Console\Command;

class DatabaseBackupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup 
                            {--format= : Backup format: sqlite, sql, or both (defaults to setting/sqlite)}
                            {--compress : Whether to compress backup with gzip}
                            {--scheduled : Flag if invoked via background scheduler}
                            {--notes= : Optional notes to attach to backup}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a database backup snapshot (.sqlite) or SQL dump (.sql) with optional compression';

    /**
     * Execute the console command.
     */
    public function handle(BackupService $backupService): int
    {
        $isScheduled = (bool)$this->option('scheduled');
        $scheduleSettings = $backupService->getScheduleSettings();

        // If scheduled run but scheduling is disabled in settings, skip
        if ($isScheduled && !$scheduleSettings['enabled']) {
            $this->info('Scheduled backups are currently disabled in Settings. Skipping.');
            return Command::SUCCESS;
        }

        // Format resolution
        $format = $this->option('format');
        if (empty($format)) {
            $format = $isScheduled ? $scheduleSettings['format'] : 'sqlite';
        }
        $format = strtolower($format);
        if (!in_array($format, ['sqlite', 'sql', 'both'])) {
            $format = 'sqlite';
        }

        // Compression resolution
        $compress = $this->option('compress') || ($isScheduled && $scheduleSettings['compression']);

        $type = $isScheduled ? 'scheduled' : 'manual';
        $notes = $this->option('notes') ?: ($isScheduled ? 'Automated scheduled backup' : 'CLI manual backup');

        $this->info("Initiating database backup [Format: {$format}, Compress: " . ($compress ? 'YES' : 'NO') . ", Type: {$type}]...");

        $createdBackups = $backupService->createBackup(
            format: $format,
            compress: $compress,
            type: $type,
            userId: null,
            notes: $notes
        );

        $hasFailure = false;
        foreach ($createdBackups as $backup) {
            if ($backup->status === 'completed') {
                $this->info(" Backup created successfully: [{$backup->format}] {$backup->filename} ({$backup->formatted_size}) in {$backup->duration_seconds}s");
            } else {
                $hasFailure = true;
                $this->error(" Backup failed for [{$backup->format}]: {$backup->error_message}");
            }
        }

        return $hasFailure ? Command::FAILURE : Command::SUCCESS;
    }
}
