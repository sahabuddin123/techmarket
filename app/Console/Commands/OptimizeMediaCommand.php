<?php

namespace App\Console\Commands;

use App\Models\Media;
use App\Services\ImageOptimizerService;
use Illuminate\Console\Command;

class OptimizeMediaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:optimize 
                            {--quality=85 : WebP compression quality (1-100)} 
                            {--max-width=1920 : Maximum image width in pixels} 
                            {--max-height=1920 : Maximum image height in pixels} 
                            {--folder=all : Filter media by folder} 
                            {--limit=500 : Maximum number of media files to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize images, resize oversized dimensions, and convert to high-performance WebP format';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('======================================================');
        $this->info('⚡ TechMarket Enterprise Image Optimizer & WebP Engine');
        $this->info('======================================================');

        if (!ImageOptimizerService::isWebPSupported()) {
            $this->error('Error: PHP GD extension with WebP support is missing on this server.');
            return 1;
        }

        $quality = (int) $this->option('quality');
        $maxWidth = (int) $this->option('max-width');
        $maxHeight = (int) $this->option('max-height');
        $folder = (string) $this->option('folder');
        $limit = (int) $this->option('limit');

        $driverInfo = ImageOptimizerService::getDriverInfo();
        $this->line("Engine Driver: <fg=green>{$driverInfo['driver']}</> (WebP: Supported)");
        $this->line("Target Quality: <fg=yellow>{$quality}%</> | Max Resolution: <fg=yellow>{$maxWidth}x{$maxHeight} px</>");
        $this->newLine();

        $query = Media::where(function ($q) {
            $q->where('mime_type', '!=', 'image/webp')
              ->orWhere('path', 'not like', '%.webp');
        })->where('mime_type', 'not like', '%svg%');

        if ($folder !== 'all') {
            $query->where('folder', $folder);
        }

        $totalFound = $query->count();
        if ($totalFound === 0) {
            $this->info('✓ All images in library are already optimized WebP format! No work needed.');
            return 0;
        }

        $items = $query->limit($limit)->get();
        $this->info("Found {$totalFound} unoptimized image(s). Processing batch of {$items->count()}...");

        $bar = $this->output->createProgressBar($items->count());
        $bar->start();

        $successCount = 0;
        $failedCount = 0;
        $totalOriginal = 0;
        $totalOptimized = 0;
        $results = [];

        foreach ($items as $media) {
            $res = ImageOptimizerService::optimizeMediaRecord($media, [
                'quality' => $quality,
                'max_width' => $maxWidth,
                'max_height' => $maxHeight,
            ]);

            if ($res['success']) {
                $successCount++;
                $totalOriginal += $res['original_size'];
                $totalOptimized += $res['optimized_size'];
                $results[] = [
                    $media->id,
                    substr($res['filename'], 0, 30),
                    $res['original_size_formatted'],
                    $res['optimized_size_formatted'],
                    $res['saved_size_formatted'] . " ({$res['saved_percent']}%)",
                    '<fg=green>✓ OK</>',
                ];
            } else {
                $failedCount++;
                $results[] = [
                    $media->id,
                    substr($media->filename, 0, 30),
                    '-',
                    '-',
                    '-',
                    '<fg=red>✗ ' . substr($res['error'] ?? 'Error', 0, 20) . '</>',
                ];
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['ID', 'Filename', 'Original', 'WebP Size', 'Saved Space', 'Status'],
            array_slice($results, 0, 15)
        );

        if (count($results) > 15) {
            $this->line('... and ' . (count($results) - 15) . ' more items.');
        }

        $totalSavedBytes = max(0, $totalOriginal - $totalOptimized);
        $totalSavedFormatted = ImageOptimizerService::formatBytes($totalSavedBytes);
        $savedPercent = $totalOriginal > 0 ? round(($totalSavedBytes / $totalOriginal) * 100, 1) : 0;

        $this->newLine();
        $this->info("======================================================");
        $this->info("✓ Optimization Complete!");
        $this->line("Processed: <fg=green>{$successCount} successful</>, <fg=red>{$failedCount} failed</>");
        $this->line("Original Size: <fg=white>" . ImageOptimizerService::formatBytes($totalOriginal) . "</>");
        $this->line("Optimized WebP Size: <fg=cyan>" . ImageOptimizerService::formatBytes($totalOptimized) . "</>");
        $this->line("Total Disk Saved: <fg=green;options=bold>{$totalSavedFormatted} ({$savedPercent}% reduction)</>");
        $this->info("======================================================");

        return 0;
    }
}
