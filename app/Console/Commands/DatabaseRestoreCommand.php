<?php

namespace App\Console\Commands;

use App\Models\DatabaseBackup;
use App\Services\Backup\BackupService;
use Illuminate\Console\Command;

class DatabaseRestoreCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:restore 
                            {target? : ID or filename of backup record, or absolute file path to .sqlite / .sql / .gz file}
                            {--no-safety : Skip creating automatic pre-restore safety backup}
                            {--force : Force restore without interactive confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Restore database from an existing backup archive or external backup file';

    /**
     * Execute the console command.
     */
    public function handle(BackupService $backupService): int
    {
        $target = $this->argument('target');
        $createSafety = !$this->option('no-safety');
        $force = $this->option('force');

        if (empty($target)) {
            // Display list of recent backups to pick
            $recentBackups = DatabaseBackup::where('status', 'completed')->latest()->take(10)->get();

            if ($recentBackups->isEmpty()) {
                $this->error('No completed backups found in system. Please specify a file path.');
                return Command::FAILURE;
            }

            $choices = [];
            foreach ($recentBackups as $b) {
                $choices[$b->id] = "[#{$b->id}] {$b->filename} ({$b->file_size_formatted}, {$b->created_at->diffForHumans()})";
            }

            $selected = $this->choice('Select a database backup to restore', $choices);
            // Extract ID
            preg_match('/\[#(\d+)\]/', $selected, $matches);
            $target = $matches[1] ?? null;
        }

        if (!$target) {
            $this->error('No valid backup target provided.');
            return Command::FAILURE;
        }

        // Check if target is 'latest', a backup ID or filename in DatabaseBackup
        $backupRecord = null;
        if ($target === 'latest') {
            $backupRecord = DatabaseBackup::where('status', 'completed')->orderBy('id', 'desc')->first();
        } elseif ($target === 'latest-sqlite') {
            $backupRecord = DatabaseBackup::where('status', 'completed')->where('format', 'sqlite')->orderBy('id', 'desc')->first();
        } elseif ($target === 'latest-sql') {
            $backupRecord = DatabaseBackup::where('status', 'completed')->where('format', 'sql')->orderBy('id', 'desc')->first();
        } elseif (is_numeric($target)) {
            $backupRecord = DatabaseBackup::find($target);
        } else {
            $backupRecord = DatabaseBackup::where('filename', $target)->first();
        }

        $targetDisplay = $backupRecord ? $backupRecord->filename : $target;

        $this->warn("⚠️  WARNING: Restoring the database will OVERWRITE current database data!");
        $this->info("Target: {$targetDisplay}");
        $this->info("Pre-Restore Safety Backup: " . ($createSafety ? 'YES (Enabled)' : 'NO (Disabled)'));

        if (!$force && !$this->confirm('Are you absolutely sure you want to proceed with database restoration?', false)) {
            $this->info('Restoration cancelled.');
            return Command::SUCCESS;
        }

        $this->info('Initiating database restoration...');

        try {
            if ($backupRecord) {
                $result = $backupService->restoreBackup($backupRecord, $createSafety);
            } elseif (file_exists($target)) {
                $result = $backupService->restoreFromFilePath($target, basename($target), $createSafety);
            } else {
                $this->error("Target backup or file not found: {$target}");
                return Command::FAILURE;
            }

            $this->newLine();
            $this->info("✅ Database restored successfully in {$result['duration_seconds']} seconds!");
            $this->info("Total tables in database: {$result['tables_count']}");

            if (!empty($result['safety_backup'])) {
                $this->info("🛡️ Pre-restore safety snapshot created: {$result['safety_backup']->filename}");
            }

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("❌ Restore failed: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
