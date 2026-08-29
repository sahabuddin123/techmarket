<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CleanInternalEventsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tracking:clean {--force : Force truncation without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean and truncate the bloated internal_events table to free database space';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (!Schema::hasTable('internal_events')) {
            $this->info('Table [internal_events] does not exist. Nothing to clean.');
            return self::SUCCESS;
        }

        $count = DB::table('internal_events')->count();
        $this->info("Found {$count} records in [internal_events] table.");

        if ($count === 0) {
            $this->info('Table is already empty.');
            return self::SUCCESS;
        }

        if (!$this->option('force') && !$this->confirm("Are you sure you want to permanently delete all {$count} internal tracking records?")) {
            $this->warn('Operation cancelled.');
            return self::FAILURE;
        }

        $this->info('Truncating [internal_events] table...');
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('internal_events')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->info("✓ Successfully purged {$count} tracking records! Database size has been reduced.");

        return self::SUCCESS;
    }
}
