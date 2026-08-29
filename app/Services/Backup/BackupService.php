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
                                // MySQL standard escape
                                $escapedVal = str_replace(
                                    ['\\', "\0", "\n", "\r", "'", '"', "\x1a"],
                                    ['\\\\', '\\0', '\\n', '\\r', "\\'", '\\"', '\\Z'],
                                    $valStr
                                );
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
                if ($autoInc || ($name === 'id' && in_array($typeName, ['integer', 'bigint', 'int']))) {
                    $mysqlType = 'bigint(20) UNSIGNED';
                    $autoInc = true;
                } elseif (in_array($typeName, ['integer', 'bigint', 'int'])) {
                    $mysqlType = str_ends_with($name, '_id') ? 'bigint(20) UNSIGNED' : 'bigint(20)';
                } elseif ($typeName === 'tinyint' || $typeName === 'boolean') {
                    $mysqlType = 'tinyint(1)';
                } elseif ($typeName === 'numeric' || $typeName === 'decimal') {
                    $mysqlType = 'decimal(12,2)';
                } elseif ($typeName === 'float' || $typeName === 'double' || $typeName === 'real') {
                    $mysqlType = 'double';
                } elseif ($typeName === 'text' || $typeName === 'json' || $typeName === 'longtext') {
                    $mysqlType = 'longtext';
                } elseif ($typeName === 'mediumtext') {
                    $mysqlType = 'mediumtext';
                } elseif ($typeName === 'datetime' || $typeName === 'timestamp') {
                    $mysqlType = 'datetime';
                } elseif ($typeName === 'date') {
                    $mysqlType = 'date';
                } elseif ($typeName === 'time') {
                    $mysqlType = 'time';
                } elseif (str_contains($typeName, 'varchar') || str_contains($typeName, 'string')) {
                    $mysqlType = 'varchar(255)';
                }

                // Default clause
                $defaultClause = '';
                if (!$autoInc) {
                    if ($default !== null) {
                        $cleanDefault = trim($default, "'\"");
                        if (strtoupper($cleanDefault) === 'NULL') {
                            $defaultClause = ' DEFAULT NULL';
                        } elseif (is_numeric($cleanDefault)) {
                            $defaultClause = " DEFAULT {$cleanDefault}";
                        } else {
                            $defaultClause = " DEFAULT '{$cleanDefault}'";
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
}
