<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SanitizeUtf8Command extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:sanitize-utf8 {--dry-run : Inspect only without modifying records}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan and clean malformed UTF-8 characters across database tables to prevent JSON encoding errors';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');

        $this->info("Scanning database tables for malformed UTF-8 characters" . ($isDryRun ? " (DRY-RUN)" : "") . "...");

        $driver = DB::getDriverName();
        $tables = [];

        if ($driver === 'sqlite') {
            $results = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
            foreach ($results as $row) {
                $tables[] = $row->name;
            }
        } elseif ($driver === 'mysql') {
            $databaseName = DB::getDatabaseName();
            $results = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = ?", [$databaseName]);
            foreach ($results as $row) {
                $tables[] = $row->TABLE_NAME ?? $row->table_name;
            }
        } else {
            $tables = [
                'products', 'categories', 'brands', 'units', 'product_specification_values', 
                'specification_groups', 'specification_attributes', 'product_reviews', 
                'product_questions', 'settings', 'navigations', 'landing_pages'
            ];
        }

        $totalCleanedRows = 0;
        $totalCleanedFields = 0;

        foreach ($tables as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            try {
                $columns = Schema::getColumnListing($table);
                $primaryKey = 'id';
                $hasId = in_array('id', $columns);

                $rows = DB::table($table)->get();

                foreach ($rows as $row) {
                    $rowArray = (array)$row;
                    $updates = [];

                    foreach ($rowArray as $col => $val) {
                        if (is_string($val) && strlen($val) > 0) {
                            if (!mb_check_encoding($val, 'UTF-8') || json_encode($val) === false) {
                                $cleanVal = mb_convert_encoding($val, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252, ASCII');
                                $updates[$col] = $cleanVal;
                                $totalCleanedFields++;
                                $this->warn("Table '{$table}' (Row ID: " . ($hasId ? $row->id : 'N/A') . ") Column '{$col}' fixed malformed UTF-8 string.");
                            }
                        }
                    }

                    if (!empty($updates) && !$isDryRun && $hasId && isset($row->id)) {
                        DB::table($table)->where('id', $row->id)->update($updates);
                        $totalCleanedRows++;
                    }
                }
            } catch (\Throwable $e) {
                $this->error("Error inspecting table '{$table}': " . $e->getMessage());
            }
        }

        if ($isDryRun) {
            $this->info("Scan completed. Found {$totalCleanedFields} fields across rows needing sanitization.");
        } else {
            $this->info("Sanitization completed successfully! Fixed {$totalCleanedFields} fields across {$totalCleanedRows} rows.");
        }

        return Command::SUCCESS;
    }
}
