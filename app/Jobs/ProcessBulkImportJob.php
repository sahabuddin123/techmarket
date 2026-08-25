<?php

namespace App\Jobs;

use App\Models\BulkImport;
use App\Services\BulkData\BulkImportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessBulkImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600; // 10 minutes

    public function __construct(public BulkImport $bulkImport)
    {
    }

    public function handle(BulkImportService $importService): void
    {
        try {
            $importService->executeImport($this->bulkImport);
        } catch (\Throwable $e) {
            Log::error("Bulk Import Job Failed for Import #{$this->bulkImport->id}: " . $e->getMessage(), [
                'exception' => $e,
            ]);

            $this->bulkImport->update([
                'status' => 'failed',
                'error_summary' => [['row' => 0, 'key' => 'System', 'error' => $e->getMessage()]],
                'completed_at' => now(),
            ]);
        }
    }
}
