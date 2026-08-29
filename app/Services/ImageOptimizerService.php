<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Banner;
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ImageOptimizerService
{
    /**
     * Default optimization settings.
     */
    public const DEFAULT_QUALITY = 85;
    public const DEFAULT_MAX_WIDTH = 1920;
    public const DEFAULT_MAX_HEIGHT = 1920;

    /**
     * Check if the system has GD with WebP support.
     */
    public static function isWebPSupported(): bool
    {
        return extension_loaded('gd') && function_exists('imagewebp');
    }

    /**
     * Get system optimization capabilities and engine driver info.
     */
    public static function getDriverInfo(): array
    {
        $gdLoaded = extension_loaded('gd');
        $webpSupported = function_exists('imagewebp');
        $imagickLoaded = extension_loaded('imagick');

        return [
            'driver' => $gdLoaded ? 'GD Library' : ($imagickLoaded ? 'Imagick' : 'None'),
            'gd_loaded' => $gdLoaded,
            'webp_supported' => $webpSupported,
            'imagick_loaded' => $imagickLoaded,
            'max_upload_size' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size'),
            'memory_limit' => ini_get('memory_limit'),
        ];
    }

    /**
     * Get current image library statistics and compression metrics.
     */
    public static function getStats(): array
    {
        $totalMedia = Media::count();
        $totalBytes = Media::sum('size') ?: 0;

        $webpQuery = Media::where('mime_type', 'image/webp')
            ->orWhere('path', 'like', '%.webp')
            ->orWhere('filename', 'like', '%.webp');

        $webpCount = $webpQuery->count();
        $webpBytes = $webpQuery->sum('size') ?: 0;

        $nonWebpQuery = Media::where(function ($q) {
            $q->where('mime_type', 'like', 'image/%')
              ->where('mime_type', '!=', 'image/webp')
              ->where('mime_type', 'not like', '%svg%');
        })->where('path', 'not like', '%.webp')
          ->where('filename', 'not like', '%.webp');

        $nonWebpCount = $nonWebpQuery->count();
        $nonWebpBytes = $nonWebpQuery->sum('size') ?: 0;

        // Estimate potential savings (average 65% reduction on unoptimized images)
        $potentialSavedBytes = (int) ($nonWebpBytes * 0.65);

        return [
            'total_items' => $totalMedia,
            'total_size_bytes' => $totalBytes,
            'total_size_formatted' => self::formatBytes($totalBytes),
            'webp_count' => $webpCount,
            'webp_bytes' => $webpBytes,
            'webp_formatted' => self::formatBytes($webpBytes),
            'webp_percentage' => $totalMedia > 0 ? round(($webpCount / $totalMedia) * 100, 1) : 0,
            'unoptimized_count' => $nonWebpCount,
            'unoptimized_bytes' => $nonWebpBytes,
            'unoptimized_formatted' => self::formatBytes($nonWebpBytes),
            'estimated_savings_bytes' => $potentialSavedBytes,
            'estimated_savings_formatted' => self::formatBytes($potentialSavedBytes),
            'driver_info' => self::getDriverInfo(),
            'auto_convert_enabled' => Setting::get('image_optimizer_auto_webp', '1') === '1',
            'quality_setting' => (int) Setting::get('image_optimizer_quality', self::DEFAULT_QUALITY),
            'max_width_setting' => (int) Setting::get('image_optimizer_max_width', self::DEFAULT_MAX_WIDTH),
        ];
    }

    /**
     * Optimize an image file on disk and convert it to WebP format.
     *
     * @param string $sourcePath Absolute file path to the source image
     * @param string|null $destinationPath Target file path (if null, will create a .webp sibling or replace)
     * @param int $quality Compression quality (1 - 100)
     * @param int $maxWidth Max width to resize if oversized
     * @param int $maxHeight Max height to resize if oversized
     * @return array Result metadata
     */
    public static function optimizeAndConvertToWebP(
        string $sourcePath,
        ?string $destinationPath = null,
        int $quality = self::DEFAULT_QUALITY,
        int $maxWidth = self::DEFAULT_MAX_WIDTH,
        int $maxHeight = self::DEFAULT_MAX_HEIGHT
    ): array {
        if (!file_exists($sourcePath) || !is_readable($sourcePath)) {
            return [
                'success' => false,
                'error' => 'Source image file not found or unreadable: ' . $sourcePath,
            ];
        }

        // Dynamically elevate memory limit and execution time for large image raster processing
        @ini_set('memory_limit', '1024M');
        @set_time_limit(120);

        if (!self::isWebPSupported()) {
            return [
                'success' => false,
                'error' => 'GD extension with WebP support is not available on this server.',
            ];
        }

        $originalSize = filesize($sourcePath);
        $imageInfo = @getimagesize($sourcePath);

        if (!$imageInfo) {
            return [
                'success' => false,
                'error' => 'Invalid or unsupported image file structure.',
            ];
        }

        [$srcWidth, $srcHeight, $imageType] = $imageInfo;
        $mimeType = $imageInfo['mime'] ?? '';

        // Load image resource based on MIME/type
        $image = null;
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                $image = @imagecreatefromjpeg($sourcePath);
                // Handle EXIF orientation auto-rotation
                if ($image && function_exists('exif_read_data')) {
                    $image = self::autoRotateExif($image, $sourcePath);
                    $srcWidth = imagesx($image);
                    $srcHeight = imagesy($image);
                }
                break;
            case IMAGETYPE_PNG:
                $image = @imagecreatefrompng($sourcePath);
                break;
            case IMAGETYPE_WEBP:
                $image = @imagecreatefromwebp($sourcePath);
                break;
            case IMAGETYPE_GIF:
                $image = @imagecreatefromgif($sourcePath);
                break;
            case IMAGETYPE_BMP:
                if (function_exists('imagecreatefrombmp')) {
                    $image = @imagecreatefrombmp($sourcePath);
                }
                break;
            default:
                break;
        }

        if (!$image) {
            return [
                'success' => false,
                'error' => 'Failed to initialize GD image resource from type: ' . $mimeType,
            ];
        }

        // Calculate proportional dimensions
        $targetWidth = $srcWidth;
        $targetHeight = $srcHeight;

        if ($srcWidth > $maxWidth || $srcHeight > $maxHeight) {
            $ratio = min($maxWidth / $srcWidth, $maxHeight / $srcHeight);
            $targetWidth = max(1, (int) round($srcWidth * $ratio));
            $targetHeight = max(1, (int) round($srcHeight * $ratio));
        }

        // Create canvas with alpha channel preservation
        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);

        // Turn off alpha blending and set alpha flag
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);

        // Fill with transparent background
        $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
        imagefilledrectangle($canvas, 0, 0, $targetWidth, $targetHeight, $transparent);

        // High quality bicubic resampling
        imagecopyresampled(
            $canvas,
            $image,
            0, 0, 0, 0,
            $targetWidth,
            $targetHeight,
            $srcWidth,
            $srcHeight
        );

        // Determine destination path
        if (!$destinationPath) {
            $pathParts = pathinfo($sourcePath);
            $destinationPath = $pathParts['dirname'] . '/' . $pathParts['filename'] . '.webp';
        }

        // Ensure target directory exists
        $destDir = dirname($destinationPath);
        if (!is_dir($destDir)) {
            @mkdir($destDir, 0755, true);
        }

        // Write WebP
        $saved = @imagewebp($canvas, $destinationPath, max(1, min(100, $quality)));

        // Free memory
        imagedestroy($image);
        imagedestroy($canvas);

        if (!$saved || !file_exists($destinationPath)) {
            return [
                'success' => false,
                'error' => 'Failed writing WebP image to destination: ' . $destinationPath,
            ];
        }

        $optimizedSize = filesize($destinationPath);
        $savedBytes = max(0, $originalSize - $optimizedSize);
        $savedPercent = $originalSize > 0 ? round(($savedBytes / $originalSize) * 100, 1) : 0;

        return [
            'success' => true,
            'original_size' => $originalSize,
            'optimized_size' => $optimizedSize,
            'saved_bytes' => $savedBytes,
            'saved_percent' => $savedPercent,
            'original_size_formatted' => self::formatBytes($originalSize),
            'optimized_size_formatted' => self::formatBytes($optimizedSize),
            'saved_size_formatted' => self::formatBytes($savedBytes),
            'width' => $targetWidth,
            'height' => $targetHeight,
            'mime_type' => 'image/webp',
            'destination_path' => $destinationPath,
        ];
    }

    /**
     * Optimize an existing Media record from the database and storage.
     */
    public static function optimizeMediaRecord(Media $media, array $options = []): array
    {
        $quality = $options['quality'] ?? (int) Setting::get('image_optimizer_quality', self::DEFAULT_QUALITY);
        $maxWidth = $options['max_width'] ?? (int) Setting::get('image_optimizer_max_width', self::DEFAULT_MAX_WIDTH);
        $maxHeight = $options['max_height'] ?? (int) Setting::get('image_optimizer_max_height', self::DEFAULT_MAX_HEIGHT);
        $disk = $media->disk ?: 'public';

        $localPath = Storage::disk($disk)->path($media->path);
        $isTemporaryDownload = false;

        // 1. Check if file exists at standard storage path
        if (!file_exists($localPath)) {
            $altPaths = [
                public_path($media->path),
                public_path('storage/' . ltrim($media->path, '/')),
                storage_path('app/public/' . ltrim($media->path, '/')),
                base_path($media->path),
            ];

            foreach ($altPaths as $alt) {
                if (file_exists($alt)) {
                    $localPath = $alt;
                    break;
                }
            }
        }

        // 2. If still not found locally, check if it's a remote URL or Unsplash seeded image
        if (!file_exists($localPath)) {
            $remoteUrl = null;
            if (str_starts_with($media->path, 'http://') || str_starts_with($media->path, 'https://')) {
                $remoteUrl = $media->path;
            } elseif (str_starts_with($media->filename, 'photo-') || str_contains($media->path, 'unsplash')) {
                $photoId = pathinfo($media->filename, PATHINFO_FILENAME);
                $remoteUrl = "https://images.unsplash.com/{$photoId}?auto=format&fit=crop&w=1920&q=85";
            }

            if ($remoteUrl) {
                $ctx = stream_context_create([
                    'http' => [
                        'timeout' => 15,
                        'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TechMarketOptimizer/1.0',
                        'follow_location' => 1,
                    ],
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                    ]
                ]);
                $content = @file_get_contents($remoteUrl, false, $ctx);
                if ($content && strlen($content) > 200) {
                    $tmpDir = storage_path('app/temp_optimizer');
                    if (!is_dir($tmpDir)) {
                        @mkdir($tmpDir, 0755, true);
                    }
                    $tmpFile = $tmpDir . '/' . uniqid('remote_') . '.jpg';
                    file_put_contents($tmpFile, $content);
                    $localPath = $tmpFile;
                    $isTemporaryDownload = true;
                }
            }
        }

        if (!file_exists($localPath)) {
            return [
                'success' => false,
                'media_id' => $media->id,
                'error' => "File not found locally or remotely: {$media->path}",
            ];
        }

        // SVG files cannot and should not be converted to WebP
        if (str_contains($media->mime_type, 'svg') || str_ends_with(strtolower($media->path), '.svg')) {
            return [
                'success' => false,
                'media_id' => $media->id,
                'skipped' => true,
                'reason' => 'SVG vectors are already optimized text formats.',
            ];
        }

        $oldPath = $media->path;
        $oldUrl = $media->url;
        $folder = $media->folder ?: 'general';

        if (str_starts_with($oldPath, 'http://') || str_starts_with($oldPath, 'https://') || !str_starts_with($oldPath, 'media/')) {
            $subPath = "media/{$folder}/" . date('Y/m');
            $safeName = date('Ymd_His') . '_' . \Illuminate\Support\Str::random(8) . '.webp';
            $newRelativePath = "{$subPath}/{$safeName}";
        } else {
            $pathInfo = pathinfo($oldPath);
            $newRelativePath = ($pathInfo['dirname'] !== '.' ? $pathInfo['dirname'] . '/' : '') . $pathInfo['filename'] . '.webp';
        }
        $newLocalPath = Storage::disk($disk)->path($newRelativePath);

        $result = self::optimizeAndConvertToWebP($localPath, $newLocalPath, $quality, $maxWidth, $maxHeight);

        // If localPath was a temporary download file, remove it
        if ($isTemporaryDownload && file_exists($localPath)) {
            @unlink($localPath);
        }

        if (!$result['success']) {
            return array_merge($result, ['media_id' => $media->id]);
        }

        // If the path changed (e.g. from .jpg/.png to .webp), delete the old file if it's different and not a remote URL
        if (!$isTemporaryDownload && $localPath !== $newLocalPath && file_exists($localPath)) {
            @unlink($localPath);
        }

        $newFilename = pathinfo($newRelativePath, PATHINFO_BASENAME);
        $newUrl = Storage::disk($disk)->url($newRelativePath);

        // Update Media Model record
        $media->update([
            'path' => $newRelativePath,
            'filename' => $newFilename,
            'mime_type' => 'image/webp',
            'size' => $result['optimized_size'],
            'width' => $result['width'],
            'height' => $result['height'],
        ]);

        // Sync references in other database tables if URL/path changed
        if ($oldUrl !== $newUrl) {
            self::syncDatabaseImageReferences($oldUrl, $newUrl, $oldPath, $newRelativePath);
        }

        return array_merge($result, [
            'media_id' => $media->id,
            'filename' => $newFilename,
            'old_path' => $oldPath,
            'new_path' => $newRelativePath,
            'new_url' => $newUrl,
        ]);
    }

    /**
     * Batch optimize all unoptimized media items in storage.
     */
    public static function bulkOptimizeAll(array $options = []): array
    {
        $limit = $options['limit'] ?? 100;
        $folder = $options['folder'] ?? 'all';

        $query = Media::where(function ($q) {
            $q->where('mime_type', '!=', 'image/webp')
              ->orWhere('path', 'not like', '%.webp');
        })->where('mime_type', 'not like', '%svg%');

        if ($folder !== 'all') {
            $query->where('folder', $folder);
        }

        $items = $query->limit($limit)->get();

        $processed = 0;
        $successCount = 0;
        $failedCount = 0;
        $totalOriginalBytes = 0;
        $totalOptimizedBytes = 0;
        $logs = [];

        foreach ($items as $media) {
            $processed++;
            $res = self::optimizeMediaRecord($media, $options);

            if ($res['success']) {
                $successCount++;
                $totalOriginalBytes += $res['original_size'];
                $totalOptimizedBytes += $res['optimized_size'];
                $logs[] = [
                    'id' => $media->id,
                    'status' => 'success',
                    'filename' => $res['filename'],
                    'saved' => $res['saved_size_formatted'],
                    'percent' => $res['saved_percent'] . '%',
                ];
            } else {
                $failedCount++;
                $logs[] = [
                    'id' => $media->id,
                    'status' => 'failed',
                    'filename' => $media->filename,
                    'error' => $res['error'] ?? 'Optimization failed',
                ];
            }
        }

        $totalSavedBytes = max(0, $totalOriginalBytes - $totalOptimizedBytes);
        $totalPercent = $totalOriginalBytes > 0 ? round(($totalSavedBytes / $totalOriginalBytes) * 100, 1) : 0;

        return [
            'processed' => $processed,
            'success_count' => $successCount,
            'failed_count' => $failedCount,
            'total_original_bytes' => $totalOriginalBytes,
            'total_optimized_bytes' => $totalOptimizedBytes,
            'total_saved_bytes' => $totalSavedBytes,
            'total_saved_formatted' => self::formatBytes($totalSavedBytes),
            'total_percent' => $totalPercent,
            'logs' => $logs,
            'remaining_unoptimized' => Media::where(function ($q) {
                $q->where('mime_type', '!=', 'image/webp')
                  ->orWhere('path', 'not like', '%.webp');
            })->where('mime_type', 'not like', '%svg%')->count(),
        ];
    }

    /**
     * Synchronize database columns across products, categories, banners, settings when an image URL changes.
     */
    protected static function syncDatabaseImageReferences(string $oldUrl, string $newUrl, string $oldPath, string $newPath): void
    {
        try {
            $oldUrlVariants = [
                $oldUrl,
                '/' . ltrim($oldUrl, '/'),
                '/storage/' . ltrim($oldPath, '/'),
            ];

            // 1. Products main image & gallery
            foreach ($oldUrlVariants as $v) {
                Product::where('image', $v)->update(['image' => $newUrl]);
                // Gallery JSON updates
                Product::where('gallery', 'like', "%{$v}%")->get()->each(function ($p) use ($v, $newUrl) {
                    $gallery = $p->gallery;
                    if (is_array($gallery)) {
                        $updated = array_map(fn($img) => $img === $v ? $newUrl : $img, $gallery);
                        $p->update(['gallery' => $updated]);
                    }
                });
            }

            // 2. Categories image
            foreach ($oldUrlVariants as $v) {
                Category::where('image', $v)->update(['image' => $newUrl]);
            }

            // 3. Brands logo
            foreach ($oldUrlVariants as $v) {
                Brand::where('logo', $v)->update(['logo' => $newUrl]);
            }

            // 4. Banners
            foreach ($oldUrlVariants as $v) {
                Banner::where('image', $v)->update(['image' => $newUrl]);
                Banner::where('mobile_image', $v)->update(['mobile_image' => $newUrl]);
            }

            // 5. Settings table
            foreach ($oldUrlVariants as $v) {
                Setting::where('value', $v)->update(['value' => $newUrl]);
            }
        } catch (\Throwable $e) {
            Log::warning('ImageOptimizer reference sync warning: ' . $e->getMessage());
        }
    }

    /**
     * Automatically rotate image based on EXIF orientation header.
     */
    protected static function autoRotateExif($image, string $path)
    {
        try {
            $exif = @exif_read_data($path);
            if (!empty($exif['Orientation'])) {
                switch ($exif['Orientation']) {
                    case 3:
                        $image = imagerotate($image, 180, 0);
                        break;
                    case 6:
                        $image = imagerotate($image, -90, 0);
                        break;
                    case 8:
                        $image = imagerotate($image, 90, 0);
                        break;
                }
            }
        } catch (\Throwable $e) {
            // Ignore EXIF read errors
        }

        return $image;
    }

    /**
     * Helper to format bytes into readable units.
     */
    public static function formatBytes(int $bytes, int $precision = 2): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $base = log($bytes, 1024);
        $pow = floor($base);

        return round(pow(1024, $base - $pow), $precision) . ' ' . ($units[$pow] ?? 'B');
    }
}
