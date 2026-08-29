<?php

namespace App\Services\Backup;

use App\Models\DatabaseBackup;
use App\Models\Setting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupService
{
    protected string $disk = 'local';
    protected string $backupDir = 'backups';

    /**
     * Create a database backup.
     *
     * @param string $format 'sqlite', 'sql', or 'both'
     * @param bool $compress Whether to compress with gzip
     * @param string $type 'manual' or 'scheduled'
     * @param int|null $userId User ID initiating the backup
     * @param string|null $notes Optional notes
     * @return array<DatabaseBackup>
     */
    public function createBackup(
        string $format = 'sqlite',
        bool $compress = false,
        string $type = 'manual',
        ?int $userId = null,
        ?string $notes = null
    ): array {
        $createdBackups = [];

        if ($format === 'both') {
            $createdBackups[] = $this->executeBackup('sqlite', $compress, $type, $userId, $notes);
            $createdBackups[] = $this->executeBackup('sql', $compress, $type, $userId, $notes);
        } else {
            $createdBackups[] = $this->executeBackup($format, $compress, $type, $userId, $notes);
        }

        // Auto prune expired backups after creating new ones
        try {
            $this->pruneOldBackups();
        } catch (\Throwable $e) {
            Log::warning('Backup auto-prune warning: ' . $e->getMessage());
        }

        return $createdBackups;
    }

    /**
     * Execute single backup generation.
     */
    protected function executeBackup(
        string $format,
        bool $compress,
        string $type,
        ?int $userId,
        ?string $notes
    ): DatabaseBackup {
        $startTime = microtime(true);
        $timestamp = date('Y-m-d_H-i-s');
        $appName = str_replace(' ', '_', strtolower(config('app.name', 'techmarket')));
        $extension = $format === 'sqlite' ? 'sqlite' : 'sql';
        $compressionType = $compress ? 'gzip' : 'none';

        if ($compress) {
            $extension .= '.gz';
        }

        $filename = "backup_{$appName}_{$format}_{$timestamp}.{$extension}";
        $storagePath = "{$this->backupDir}/{$filename}";

        // Ensure backup directory exists
        Storage::disk($this->disk)->makeDirectory($this->backupDir);

        $tablesCount = 0;
        $recordsCount = 0;
        $errorMessage = null;
        $status = 'completed';

        try {
            if ($format === 'sqlite') {
                $meta = $this->generateSqliteBackup($storagePath, $compress);
                $tablesCount = $meta['tables_count'];
                $recordsCount = $meta['records_count'];
            } else {
                $meta = $this->generateSqlDump($storagePath, $compress);
                $tablesCount = $meta['tables_count'];
                $recordsCount = $meta['records_count'];
            }
        } catch (\Throwable $e) {
            $status = 'failed';
            $errorMessage = $e->getMessage();
            Log::error("Database backup failed for format [{$format}]: " . $e->getMessage(), [
                'exception' => $e
            ]);
        }

        $duration = round(microtime(true) - $startTime, 2);
        $fileSize = Storage::disk($this->disk)->exists($storagePath)
            ? Storage::disk($this->disk)->size($storagePath)
            : 0;

        return DatabaseBackup::create([
            'filename' => $filename,
            'disk' => $this->disk,
            'path' => $storagePath,
            'format' => $format,
            'compression' => $compressionType,
            'file_size_bytes' => $fileSize,
            'type' => $type,
            'status' => $status,
            'error_message' => $errorMessage,
            'tables_count' => $tablesCount,
            'records_count' => $recordsCount,
            'duration_seconds' => $duration,
            'created_by' => $userId,
            'notes' => $notes,
        ]);
    }

    /**
     * Generate SQLite snapshot backup.
     */
    protected function generateSqliteBackup(string $targetPath, bool $compress): array
    {
        $connection = config('database.default');
        $dbConfig = config("database.connections.{$connection}");
        $tables = $this->getAllTables();
        $tablesCount = count($tables);
        $recordsCount = $this->countTotalRecords($tables);

        $fullTargetPath = Storage::disk($this->disk)->path($targetPath);

        if ($connection === 'sqlite' && !empty($dbConfig['database']) && file_exists($dbConfig['database'])) {
            // Checkpoint WAL if present
            try {
                DB::statement('PRAGMA wal_checkpoint(TRUNCATE)');
            } catch (\Throwable $e) {
                // Ignore checkpoint if unsupported
            }

            $sourceDbPath = $dbConfig['database'];

            if ($compress) {
                $src = fopen($sourceDbPath, 'rb');
                $dest = gzopen($fullTargetPath, 'wb9');
                while (!feof($src)) {
                    gzwrite($dest, fread($src, 1024 * 512));
                }
                fclose($src);
                gzclose($dest);
            } else {
                copy($sourceDbPath, $fullTargetPath);
            }
        } else {
            // Non-sqlite database connection (e.g. MySQL) - export into standalone SQLite database file
            $tempSqlite = tempnam(sys_get_temp_dir(), 'tm_sqlite_');
            $tempPdo = new \PDO("sqlite:{$tempSqlite}");
            $tempPdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

            foreach ($tables as $table) {
                $rows = DB::table($table)->get();
                if ($rows->isEmpty()) continue;

                $firstRow = (array)$rows->first();
                $columns = array_keys($firstRow);

                $colsSql = implode(', ', array_map(fn($c) => "\"{$c}\" TEXT", $columns));
                $tempPdo->exec("CREATE TABLE IF NOT EXISTS \"{$table}\" ({$colsSql})");

                $placeholders = implode(', ', array_fill(0, count($columns), '?'));
                $insertSql = "INSERT INTO \"{$table}\" (" . implode(', ', array_map(fn($c) => "\"{$c}\"", $columns)) . ") VALUES ({$placeholders})";
                $stmt = $tempPdo->prepare($insertSql);

                $tempPdo->beginTransaction();
                foreach ($rows as $row) {
                    $vals = array_values((array)$row);
                    $stmt->execute($vals);
                }
                $tempPdo->commit();
            }

            unset($tempPdo);

            if ($compress) {
                $src = fopen($tempSqlite, 'rb');
                $dest = gzopen($fullTargetPath, 'wb9');
                while (!feof($src)) {
                    gzwrite($dest, fread($src, 1024 * 512));
                }
                fclose($src);
                gzclose($dest);
                @unlink($tempSqlite);
            } else {
                rename($tempSqlite, $fullTargetPath);
            }
        }

        return [
            'tables_count' => $tablesCount,
            'records_count' => $recordsCount,
        ];
    }

    /**
     * Generate SQL dump backup.
     */
    protected function generateSqlDump(string $targetPath, bool $compress): array
    {
        $tables = $this->getAllTables();
        $tablesCount = count($tables);
        $recordsCount = 0;
        $fullTargetPath = Storage::disk($this->disk)->path($targetPath);

        $handle = $compress ? gzopen($fullTargetPath, 'wb9') : fopen($fullTargetPath, 'wb');

        $writer = function (string $text) use ($handle, $compress) {
            if ($compress) {
                gzwrite($handle, $text);
            } else {
                fwrite($handle, $text);
            }
        };

        // phpMyAdmin / MySQL / MariaDB Header
        $appName = config('app.name', 'TechMarket BD');
        $now = Carbon::now()->format('Y-m-d H:i:s');
        $dbDriver = DB::getDriverName();

        $writer("-- phpMyAdmin SQL Dump\n");
        $writer("-- version 5.2.1\n");
        $writer("-- Host: localhost\n");
        $writer("-- Generation Time: {$now}\n");
        $writer("-- Application: {$appName}\n");
        $writer("-- Source Driver: {$dbDriver}\n");
        $writer("-- Total Tables: {$tablesCount}\n\n");

        $writer("SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n");
        $writer("START TRANSACTION;\n");
        $writer("SET time_zone = \"+00:00\";\n\n");
        $writer("/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;\n");
        $writer("/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;\n");
        $writer("/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;\n");
        $writer("/*!40101 SET NAMES utf8mb4 */;\n");
        $writer("SET FOREIGN_KEY_CHECKS = 0;\n");
        $writer("SET UNIQUE_CHECKS = 0;\n\n");

        foreach ($tables as $table) {
            if ($table === 'sqlite_sequence') continue;

            $writer("-- --------------------------------------------------------\n");
            $writer("-- Table structure for table `{$table}`\n");
            $writer("-- --------------------------------------------------------\n\n");
            $writer("DROP TABLE IF EXISTS `{$table}`;\n");

            // Generate clean MySQL DDL statement
            $createTableSql = $this->getCreateTableSql($table);
            if ($createTableSql) {
                $writer("{$createTableSql}\n\n");
            }

            // Skip volatile table data (keep schema only)
            if (in_array($table, ['sessions', 'cache', 'cache_locks', 'jobs', 'job_batches'])) {
                continue;
            }

            // Dump Table Data
            $rows = DB::table($table)->get();
            $tableRowCount = $rows->count();
            $recordsCount += $tableRowCount;

            if ($tableRowCount > 0) {
                $writer("-- Dumping data for table `{$table}`\n\n");
                $firstRow = (array)$rows->first();
                $columns = array_keys($firstRow);
                $escapedColumns = implode(', ', array_map(fn($c) => "`{$c}`", $columns));

                $chunks = $rows->chunk(100);
                foreach ($chunks as $chunk) {
                    $insertValues = [];
                    foreach ($chunk as $row) {
                        $values = [];
                        foreach ((array)$row as $val) {
                            if (is_null($val)) {
                                $values[] = 'NULL';
                            } elseif (is_int($val) || is_float($val)) {
                                $values[] = $val;
                            } elseif (is_bool($val)) {
                                $values[] = $val ? '1' : '0';
                            } else {
                                $valStr = (string)$val;
                                if (!mb_check_encoding($valStr, 'UTF-8')) {
                                    $valStr = mb_convert_encoding($valStr, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252');
                                }
                                // Standard ANSI SQL escaping: double single quotes (accepted by MySQL, MariaDB, SQLite, PostgreSQL)
                                $escapedVal = str_replace("'", "''", $valStr);
                                $values[] = "'{$escapedVal}'";
                            }
                        }
                        $insertValues[] = '(' . implode(', ', $values) . ')';
                    }

                    if (!empty($insertValues)) {
                        $writer("INSERT INTO `{$table}` ({$escapedColumns}) VALUES\n  " . implode(",\n  ", $insertValues) . ";\n\n");
                    }
                }
            }

            $writer("\n");
        }

        $writer("SET FOREIGN_KEY_CHECKS = 1;\n");
        $writer("SET UNIQUE_CHECKS = 1;\n");
        $writer("COMMIT;\n\n");
        $writer("/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;\n");
        $writer("/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;\n");
        $writer("/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;\n");

        if ($compress) {
            gzclose($handle);
        } else {
            fclose($handle);
        }

        return [
            'tables_count' => $tablesCount,
            'records_count' => $recordsCount,
        ];
    }

    /**
     * Get MySQL / MariaDB / phpMyAdmin compliant CREATE TABLE statement for a table.
     */
    protected function getCreateTableSql(string $table): ?string
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            $res = DB::select("SHOW CREATE TABLE `{$table}`");
            $arr = (array)($res[0] ?? []);
            return ($arr['Create Table'] ?? '') . ';';
        }

        // For SQLite or generic driver: Convert schema into clean MySQL / MariaDB DDL
        try {
            $columns = Schema::getColumns($table);
            $indexes = Schema::getIndexes($table);

            $lines = [];
            $primaryKeys = [];
            $uniqueKeys = [];
            $normalIndexes = [];

            foreach ($columns as $col) {
                $name = $col['name'];
                $typeName = strtolower($col['type_name'] ?? '');
                $nullable = !empty($col['nullable']) ? 'NULL' : 'NOT NULL';
                $default = $col['default'] ?? null;
                $autoInc = !empty($col['auto_increment']);

                // Map types to clean standard MySQL types
                $mysqlType = 'varchar(255)';
                $isNumericType = false;
                $isDateTimeType = false;

                if ($autoInc || ($name === 'id' && in_array($typeName, ['integer', 'bigint', 'int']))) {
                    $mysqlType = 'bigint(20) UNSIGNED';
                    $autoInc = true;
                    $isNumericType = true;
                } elseif (in_array($typeName, ['integer', 'bigint', 'int'])) {
                    $mysqlType = str_ends_with($name, '_id') ? 'bigint(20) UNSIGNED' : 'bigint(20)';
                    $isNumericType = true;
                } elseif ($typeName === 'tinyint' || $typeName === 'boolean') {
                    $mysqlType = 'tinyint(1)';
                    $isNumericType = true;
                } elseif ($typeName === 'numeric' || $typeName === 'decimal') {
                    $mysqlType = 'decimal(12,2)';
                    $isNumericType = true;
                } elseif ($typeName === 'float' || $typeName === 'double' || $typeName === 'real') {
                    $mysqlType = 'double';
                    $isNumericType = true;
                } elseif ($typeName === 'text' || $typeName === 'json' || $typeName === 'longtext') {
                    $mysqlType = 'longtext';
                } elseif ($typeName === 'mediumtext') {
                    $mysqlType = 'mediumtext';
                } elseif ($typeName === 'datetime' || $typeName === 'timestamp') {
                    $mysqlType = 'timestamp';
                    $isDateTimeType = true;
                } elseif ($typeName === 'date') {
                    $mysqlType = 'date';
                    $isDateTimeType = true;
                } elseif ($typeName === 'time') {
                    $mysqlType = 'time';
                    $isDateTimeType = true;
                } elseif (str_contains($typeName, 'varchar') || str_contains($typeName, 'string')) {
                    $mysqlType = 'varchar(255)';
                }

                // Default clause
                $defaultClause = '';
                if (!$autoInc) {
                    if ($default !== null) {
                        $cleanDefault = trim($default, "'\"");
                        $upperDefault = strtoupper($cleanDefault);

                        if ($upperDefault === 'NULL') {
                            $defaultClause = ' DEFAULT NULL';
                        } elseif (in_array($upperDefault, ['CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP()', 'NOW()'])) {
                            $defaultClause = ' DEFAULT CURRENT_TIMESTAMP';
                        } elseif ($isNumericType && is_numeric($cleanDefault)) {
                            $defaultClause = " DEFAULT {$cleanDefault}";
                        } else {
                            $escapedDefault = str_replace(["\\", "'"], ["\\\\", "\\'"], $cleanDefault);
                            $defaultClause = " DEFAULT '{$escapedDefault}'";
                        }
                    } elseif (!empty($col['nullable'])) {
                        $defaultClause = ' DEFAULT NULL';
                    }
                }

                $autoIncClause = $autoInc ? ' AUTO_INCREMENT' : '';

                $lines[] = "  `{$name}` {$mysqlType} {$nullable}{$defaultClause}{$autoIncClause}";
            }

            // Indexes
            foreach ($indexes as $idx) {
                $idxCols = implode(', ', array_map(fn($c) => "`{$c}`", $idx['columns']));
                if (!empty($idx['primary'])) {
                    $primaryKeys[] = "  PRIMARY KEY ({$idxCols})";
                } elseif (!empty($idx['unique'])) {
                    $uniqueKeys[] = "  UNIQUE KEY `{$idx['name']}` ({$idxCols})";
                } else {
                    $normalIndexes[] = "  KEY `{$idx['name']}` ({$idxCols})";
                }
            }

            $allDefs = array_merge($lines, $primaryKeys, $uniqueKeys, $normalIndexes);

            return "CREATE TABLE IF NOT EXISTS `{$table}` (\n" . implode(",\n", $allDefs) . "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Get list of all user tables in the database.
     */
    public function getAllTables(): array
    {
        $driver = DB::getDriverName();
        $tables = [];

        if ($driver === 'sqlite') {
            $results = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC");
            foreach ($results as $row) {
                $tables[] = $row->name;
            }
        } elseif ($driver === 'mysql') {
            $databaseName = DB::getDatabaseName();
            $results = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name ASC", [$databaseName]);
            foreach ($results as $row) {
                $tables[] = $row->TABLE_NAME ?? $row->table_name;
            }
        } else {
            $tables = Schema::getTableListing();
        }

        return $tables;
    }

    /**
     * Count total records across all tables.
     */
    protected function countTotalRecords(array $tables): int
    {
        $count = 0;
        foreach ($tables as $table) {
            try {
                $count += DB::table($table)->count();
            } catch (\Throwable $e) {
                // Ignore table if read fails
            }
        }
        return $count;
    }

    /**
     * Stream download backup file.
     */
    public function downloadBackup(DatabaseBackup $backup): StreamedResponse
    {
        if (!Storage::disk($backup->disk)->exists($backup->path)) {
            abort(404, 'The requested backup file was not found on disk.');
        }

        return Storage::disk($backup->disk)->download($backup->path, $backup->filename);
    }

    /**
     * Delete backup record and physical file.
     */
    public function deleteBackup(DatabaseBackup $backup): bool
    {
        if (Storage::disk($backup->disk)->exists($backup->path)) {
            Storage::disk($backup->disk)->delete($backup->path);
        }

        return (bool)$backup->delete();
    }

    /**
     * Prune backups older than retention policy.
     */
    public function pruneOldBackups(): int
    {
        $retentionDays = (int)Setting::get('backup_retention_days', 7);
        if ($retentionDays <= 0) {
            $retentionDays = 7;
        }

        $cutoffDate = Carbon::now()->subDays($retentionDays);
        $oldBackups = DatabaseBackup::where('created_at', '<', $cutoffDate)->get();
        $prunedCount = 0;

        foreach ($oldBackups as $backup) {
            if ($this->deleteBackup($backup)) {
                $prunedCount++;
            }
        }

        return $prunedCount;
    }

    /**
     * Get Schedule Settings.
     */
    public function getScheduleSettings(): array
    {
        return [
            'enabled' => Setting::getBool('backup_schedule_enabled', false),
            'frequency' => Setting::get('backup_schedule_frequency', 'daily'), // daily, weekly, monthly
            'time' => Setting::get('backup_schedule_time', '02:00'), // 24-hour format
            'format' => Setting::get('backup_schedule_format', 'both'), // sqlite, sql, both
            'retention_days' => (int)Setting::get('backup_retention_days', 7),
            'compression' => Setting::getBool('backup_compression', true),
            'notify_email' => Setting::get('backup_notify_email', config('mail.from.address', 'admin@techmarket.com.bd')),
        ];
    }

    /**
     * Save Schedule Settings.
     */
    public function updateScheduleSettings(array $validated): array
    {
        Setting::set('backup_schedule_enabled', !empty($validated['enabled']) ? '1' : '0', 'backup');
        Setting::set('backup_schedule_frequency', $validated['frequency'] ?? 'daily', 'backup');
        Setting::set('backup_schedule_time', $validated['time'] ?? '02:00', 'backup');
        Setting::set('backup_schedule_format', $validated['format'] ?? 'both', 'backup');
        Setting::set('backup_retention_days', (string)($validated['retention_days'] ?? 7), 'backup');
        Setting::set('backup_compression', !empty($validated['compression']) ? '1' : '0', 'backup');
        Setting::set('backup_notify_email', $validated['notify_email'] ?? '', 'backup');

        return $this->getScheduleSettings();
    }

    /**
     * Calculate Telemetry / Stats for the dashboard.
     */
    public function getBackupStats(): array
    {
        $hasBackupTable = Schema::hasTable('database_backups');
        $totalBytes = $hasBackupTable ? (int)DatabaseBackup::where('status', 'completed')->sum('file_size_bytes') : 0;
        $lastBackup = $hasBackupTable ? DatabaseBackup::where('status', 'completed')->latest()->first() : null;
        $totalBackups = $hasBackupTable ? DatabaseBackup::count() : 0;
        $schedule = $this->getScheduleSettings();

        // Format total size
        $formattedTotalSize = '0 B';
        if ($totalBytes >= 1073741824) {
            $formattedTotalSize = number_format($totalBytes / 1073741824, 2) . ' GB';
        } elseif ($totalBytes >= 1048576) {
            $formattedTotalSize = number_format($totalBytes / 1048576, 2) . ' MB';
        } elseif ($totalBytes >= 1024) {
            $formattedTotalSize = number_format($totalBytes / 1024, 2) . ' KB';
        }

        // Calculate next scheduled backup estimate
        $nextRun = null;
        if (!empty($schedule['enabled'])) {
            $timeParts = explode(':', $schedule['time'] ?? '02:00');
            $hour = (int)($timeParts[0] ?? 2);
            $minute = (int)($timeParts[1] ?? 0);

            $target = Carbon::today()->setTime($hour, $minute);
            if ($target->isPast()) {
                if (($schedule['frequency'] ?? 'daily') === 'weekly') {
                    $target = Carbon::now()->next(Carbon::SUNDAY)->setTime($hour, $minute);
                } elseif (($schedule['frequency'] ?? 'daily') === 'monthly') {
                    $target = Carbon::now()->startOfMonth()->addMonth()->setTime($hour, $minute);
                } else {
                    $target->addDay();
                }
            }
            $nextRun = $target->toIso8601String();
        }

        return [
            'total_backups' => $totalBackups,
            'total_size_bytes' => $totalBytes,
            'total_size_formatted' => $formattedTotalSize,
            'last_backup' => $lastBackup,
            'next_scheduled_run' => $nextRun,
            'schedule_settings' => $schedule,
            'database_driver' => DB::getDriverName(),
            'total_tables' => count($this->getAllTables()),
            'table_migrated' => $hasBackupTable,
        ];
    }

    /**
     * Restore database from an existing DatabaseBackup record.
     *
     * @param DatabaseBackup $backup
     * @param bool $createSafetyBackup
     * @return array
     */
    public function restoreBackup(DatabaseBackup $backup, bool $createSafetyBackup = true): array
    {
        if (!Storage::disk($backup->disk)->exists($backup->path)) {
            throw new \Exception("Backup file does not exist on disk at: {$backup->path}");
        }

        $fullPath = Storage::disk($backup->disk)->path($backup->path);
        return $this->restoreFromFilePath($fullPath, $backup->filename, $createSafetyBackup);
    }

    /**
     * Restore database from an uploaded backup file.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param bool $createSafetyBackup
     * @return array
     */
    public function restoreFromUploadedFile(\Illuminate\Http\UploadedFile $file, bool $createSafetyBackup = true): array
    {
        $originalName = $file->getClientOriginalName();
        $tempPath = $file->getRealPath();

        return $this->restoreFromFilePath($tempPath, $originalName, $createSafetyBackup);
    }

    /**
     * Core restore execution from file path.
     *
     * @param string $filePath
     * @param string $originalName
     * @param bool $createSafetyBackup
     * @return array
     */
    public function restoreFromFilePath(string $filePath, string $originalName = '', bool $createSafetyBackup = true): array
    {
        $startTime = microtime(true);
        $safetyBackup = null;

        // 1. Create Pre-Restore Safety Snapshot if enabled
        if ($createSafetyBackup) {
            try {
                $safetyBackups = $this->createBackup(
                    format: 'both',
                    compress: true,
                    type: 'manual',
                    userId: auth()->id(),
                    notes: 'Auto Pre-Restore Safety Snapshot before restoring ' . ($originalName ?: basename($filePath))
                );
                $safetyBackup = $safetyBackups[0] ?? null;
            } catch (\Throwable $e) {
                Log::warning('Pre-restore safety backup creation error: ' . $e->getMessage());
            }
        }

        // 2. Identify format and compression
        $filename = strtolower($originalName ?: basename($filePath));
        $isGzipped = str_ends_with($filename, '.gz');
        $uncompressedPath = $filePath;

        // Decompress if needed
        $tempDecompressed = null;
        if ($isGzipped) {
            $tempDecompressed = tempnam(sys_get_temp_dir(), 'tm_restore_');
            $this->decompressGzip($filePath, $tempDecompressed);
            $uncompressedPath = $tempDecompressed;
            $filename = preg_replace('/\.gz$/i', '', $filename);
        }

        $isSqlite = str_ends_with($filename, '.sqlite') || str_ends_with($filename, '.db');
        $isSql = str_ends_with($filename, '.sql') || str_ends_with($filename, '.txt');

        if (!$isSqlite && !$isSql) {
            // Check file header if extension is ambiguous
            $header = file_get_contents($uncompressedPath, false, null, 0, 16);
            if (str_starts_with($header, 'SQLite format 3')) {
                $isSqlite = true;
            } else {
                $isSql = true;
            }
        }

        // 3. Execute Restore
        try {
            if ($isSqlite) {
                $this->executeSqliteRestore($uncompressedPath);
            } else {
                $this->executeSqlDumpRestore($uncompressedPath);
            }
        } finally {
            if ($tempDecompressed && file_exists($tempDecompressed)) {
                @unlink($tempDecompressed);
            }
        }

        // 4. Post-restore cache flush
        $this->postRestoreFlush();

        $duration = round(microtime(true) - $startTime, 2);

        return [
            'success' => true,
            'duration_seconds' => $duration,
            'safety_backup' => $safetyBackup,
            'tables_count' => count($this->getAllTables()),
        ];
    }

    /**
     * Decompress a .gz file.
     */
    protected function decompressGzip(string $srcPath, string $destPath): void
    {
        $gz = gzopen($srcPath, 'rb');
        if (!$gz) {
            throw new \Exception("Failed to open compressed file for reading: {$srcPath}");
        }

        $dest = fopen($destPath, 'wb');
        if (!$dest) {
            gzclose($gz);
            throw new \Exception("Failed to create temporary destination file: {$destPath}");
        }

        while (!gzeof($gz)) {
            fwrite($dest, gzread($gz, 1024 * 512));
        }

        gzclose($gz);
        fclose($dest);
    }

    /**
     * Execute SQLite database restore.
     */
    protected function executeSqliteRestore(string $sqliteFilePath): void
    {
        $connection = config('database.default');
        $dbConfig = config("database.connections.{$connection}");

        if ($connection === 'sqlite' && !empty($dbConfig['database'])) {
            $targetDbPath = $dbConfig['database'];

            // Validate SQLite integrity before replacing
            $tempPdo = new \PDO("sqlite:{$sqliteFilePath}");
            $stmt = $tempPdo->query('PRAGMA integrity_check');
            $res = $stmt ? $stmt->fetchColumn() : false;
            unset($tempPdo);

            if ($res !== 'ok') {
                throw new \Exception("The SQLite file failed integrity validation (Result: {$res}). Restore aborted for safety.");
            }

            // Close existing PDO connection
            DB::purge('sqlite');

            // Copy file over database.sqlite
            copy($sqliteFilePath, $targetDbPath);

            // Reconnect
            DB::reconnect('sqlite');
        } else {
            // Non-sqlite database connection (e.g. MySQL) - import tables from SQLite file into active DB
            $srcPdo = new \PDO("sqlite:{$sqliteFilePath}");
            $tablesStmt = $srcPdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
            $tables = $tablesStmt->fetchAll(\PDO::FETCH_COLUMN);

            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            foreach ($tables as $table) {
                $rowsStmt = $srcPdo->query("SELECT * FROM \"{$table}\"");
                $rows = $rowsStmt->fetchAll(\PDO::FETCH_ASSOC);

                if (!empty($rows)) {
                    DB::table($table)->truncate();
                    $chunks = array_chunk($rows, 100);
                    foreach ($chunks as $chunk) {
                        DB::table($table)->insert($chunk);
                    }
                }
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            unset($srcPdo);
        }
    }

    /**
     * Execute SQL Dump restore.
     */
    protected function executeSqlDumpRestore(string $sqlFilePath): void
    {
        $driver = DB::getDriverName();
        $sqlContent = file_get_contents($sqlFilePath);

        if (empty($sqlContent)) {
            throw new \Exception('The SQL file is empty.');
        }

        // Ensure valid UTF-8
        if (!mb_check_encoding($sqlContent, 'UTF-8')) {
            $sqlContent = mb_convert_encoding($sqlContent, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252');
        }

        if ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
            
            $cleanSql = $this->convertMysqlSqlToSqlite($sqlContent);
            
            // Split statements using SQL string literal tokenizer
            $statements = $this->splitSqlStatements($cleanSql);

            DB::beginTransaction();
            try {
                foreach ($statements as $stmt) {
                    $cleanStmt = trim($stmt);
                    // Remove leading comment lines
                    $cleanStmt = preg_replace('/^--.*$/m', '', $cleanStmt);
                    $cleanStmt = trim($cleanStmt, "; \t\n\r");
                    if (empty($cleanStmt) || strtoupper($cleanStmt) === 'BEGIN TRANSACTION' || strtoupper($cleanStmt) === 'COMMIT') {
                        continue;
                    }
                    DB::statement($cleanStmt);
                }
                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                throw $e;
            } finally {
                DB::statement('PRAGMA foreign_keys = ON;');
            }
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            DB::statement('SET UNIQUE_CHECKS=0;');

            DB::unprepared($sqlContent);

            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            DB::statement('SET UNIQUE_CHECKS=1;');
        }
    }

    /**
     * Parse and split SQL file into individual statements while respecting single/double quoted strings and escape sequences.
     */
    protected function splitSqlStatements(string $sql): array
    {
        $len = strlen($sql);
        $inString = false;
        $stmt = '';
        $statements = [];

        for ($i = 0; $i < $len; $i++) {
            $char = $sql[$i];
            $stmt .= $char;

            if ($inString) {
                if ($char === '\\') {
                    if ($i + 1 < $len) {
                        $stmt .= $sql[$i + 1];
                        $i++;
                    }
                } elseif ($char === "'") {
                    if ($i + 1 < $len && $sql[$i + 1] === "'") {
                        $stmt .= "'";
                        $i++;
                    } else {
                        $inString = false;
                    }
                }
            } else {
                if ($char === "'") {
                    $inString = true;
                } elseif ($char === ';') {
                    $statements[] = trim($stmt);
                    $stmt = '';
                }
            }
        }

        if (!empty(trim($stmt))) {
            $statements[] = trim($stmt);
        }

        return $statements;
    }

    /**
     * Convert MySQL/MariaDB SQL Dump syntax into SQLite compatible statements.
     */
    protected function convertMysqlSqlToSqlite(string $sql): string
    {
        // Clean headers, conditional MySQL comments & variables
        $cleanSql = preg_replace('/START\s+TRANSACTION\s*;/i', 'BEGIN TRANSACTION;', $sql);
        $cleanSql = preg_replace('/\/\*![0-9]+[^*]*\*\//s', '', $cleanSql);
        $cleanSql = preg_replace('/SET\s+[^;]+;/i', '', $cleanSql);

        // Convert CREATE TABLE statements (strictly matching indented body)
        $cleanSql = preg_replace_callback('/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([A-Za-z0-9_]+)`?\s*\(\n((?:[ \t]+[^\n]+\n)+)\)\s*(?:ENGINE=[A-Za-z0-9_]+)?\s*(?:DEFAULT\s+CHARSET=[A-Za-z0-9_]+)?\s*(?:COLLATE=[A-Za-z0-9_]+)?\s*;/i', function($matches) {
            $table = $matches[1];
            $body = $matches[2];

            $lines = explode("\n", $body);
            $newLines = [];
            $createIndexStatements = [];

            foreach ($lines as $line) {
                $trimmed = trim($line, " \t\r\n,");
                if (empty($trimmed)) continue;

                // Check if inline KEY
                if (preg_match('/^PRIMARY\s+KEY\s*\((.+?)\)/i', $trimmed, $m)) {
                    continue;
                } elseif (preg_match('/^UNIQUE\s+KEY\s+`?([A-Za-z0-9_]+)`?\s*\((.+?)\)/i', $trimmed, $m)) {
                    $createIndexStatements[] = "CREATE UNIQUE INDEX IF NOT EXISTS `{$m[1]}` ON `{$table}` ({$m[2]});";
                    continue;
                } elseif (preg_match('/^KEY\s+`?([A-Za-z0-9_]+)`?\s*\((.+?)\)/i', $trimmed, $m)) {
                    $createIndexStatements[] = "CREATE INDEX IF NOT EXISTS `{$m[1]}` ON `{$table}` ({$m[2]});";
                    continue;
                }

                // Convert column definitions (specific types first)
                $convLine = $trimmed;
                if (preg_match('/^`?id`?\s+bigint\([0-9]+\)\s+UNSIGNED\s+NOT\s+NULL\s+AUTO_INCREMENT/i', $convLine)) {
                    $convLine = "`id` INTEGER PRIMARY KEY AUTOINCREMENT";
                } else {
                    $convLine = preg_replace('/tinyint\([0-9]+\)/i', 'INTEGER', $convLine);
                    $convLine = preg_replace('/bigint\([0-9]+\)\s+UNSIGNED/i', 'INTEGER', $convLine);
                    $convLine = preg_replace('/bigint\([0-9]+\)/i', 'INTEGER', $convLine);
                    $convLine = preg_replace('/int\([0-9]+\)/i', 'INTEGER', $convLine);
                    $convLine = preg_replace('/AUTO_INCREMENT/i', '', $convLine);
                    $convLine = preg_replace('/UNSIGNED/i', '', $convLine);
                    $convLine = preg_replace('/longtext/i', 'TEXT', $convLine);
                    $convLine = preg_replace('/mediumtext/i', 'TEXT', $convLine);
                    $convLine = preg_replace('/varchar\([0-9]+\)/i', 'TEXT', $convLine);
                    $convLine = preg_replace('/decimal\([0-9]+,[0-9]+\)/i', 'NUMERIC', $convLine);
                    $convLine = preg_replace('/timestamp/i', 'DATETIME', $convLine);
                }

                $newLines[] = "  " . trim($convLine);
            }

            $createTableSql = "CREATE TABLE IF NOT EXISTS `{$table}` (\n" . implode(",\n", $newLines) . "\n);";
            if (!empty($createIndexStatements)) {
                $createTableSql .= "\n" . implode("\n", $createIndexStatements);
            }

            return $createTableSql;
        }, $cleanSql);

        return $cleanSql;
    }

    /**
     * Flush application caches and views after database restoration.
     */
    protected function postRestoreFlush(): void
    {
        try {
            \Illuminate\Support\Facades\Artisan::call('optimize:clear');
            \Illuminate\Support\Facades\Cache::flush();
        } catch (\Throwable $e) {
            Log::warning('Post-restore cache flush notice: ' . $e->getMessage());
        }
    }
}
