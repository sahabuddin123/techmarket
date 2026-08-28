<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MediaController extends Controller
{
    /**
     * Display the Media Library view or return JSON if requested via AJAX/API.
     */
    public function index(Request $request)
    {
        $query = Media::with('user');

        // Search
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('original_name', 'like', "%{$search}%")
                  ->orWhere('filename', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('alt_text', 'like', "%{$search}%");
            });
        }

        // Filter by folder
        if ($request->filled('folder') && $request->input('folder') !== 'all') {
            $query->where('folder', $request->input('folder'));
        }

        // Filter by MIME type
        if ($request->filled('type') && $request->input('type') !== 'all') {
            $type = $request->input('type');
            if ($type === 'image') {
                $query->where('mime_type', 'like', 'image/%')->where('mime_type', 'not like', '%svg%');
            } elseif ($type === 'svg') {
                $query->where('mime_type', 'like', '%svg%');
            }
        }

        // Sorting
        $sort = $request->input('sort', 'latest');
        switch ($sort) {
            case 'oldest':
                $query->oldest();
                break;
            case 'size_desc':
                $query->orderBy('size', 'desc');
                break;
            case 'size_asc':
                $query->orderBy('size', 'asc');
                break;
            case 'name_asc':
                $query->orderBy('original_name', 'asc');
                break;
            case 'latest':
            default:
                $query->latest();
                break;
        }

        $perPage = (int) $request->input('per_page', 24);
        $mediaItems = $query->paginate($perPage)->withQueryString();

        // Attach usage reference information for the current page
        $mediaItems->getCollection()->transform(function ($item) {
            $item->usages = $item->getUsage();
            return $item;
        });

        // Folder statistics
        $folders = [
            'all' => Media::count(),
            'products' => Media::where('folder', 'products')->count(),
            'categories' => Media::where('folder', 'categories')->count(),
            'brands' => Media::where('folder', 'brands')->count(),
            'banners' => Media::where('folder', 'banners')->count(),
            'blog' => Media::where('folder', 'blog')->count(),
            'cms' => Media::where('folder', 'cms')->count(),
            'general' => Media::where('folder', 'general')->count(),
        ];

        $totalBytes = Media::sum('size');
        $totalFormattedSize = $this->formatBytes($totalBytes);

        return Inertia::render('Admin/Media/Index', [
            'media' => $mediaItems,
            'folders' => $folders,
            'total_size' => $totalFormattedSize,
            'filters' => [
                'search' => (string)($request->input('search') ?? ''),
                'folder' => (string)($request->input('folder') ?? 'all'),
                'type' => (string)($request->input('type') ?? 'all'),
                'sort' => (string)($request->input('sort') ?? 'latest'),
            ],
        ]);
    }

    /**
     * JSON API Endpoint specifically for the Reusable MediaPicker component and async data fetching.
     */
    public function apiList(Request $request)
    {
        $query = Media::query();

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('original_name', 'like', "%{$search}%")
                  ->orWhere('filename', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        if ($request->filled('folder') && $request->input('folder') !== 'all') {
            $query->where('folder', $request->input('folder'));
        }

        $perPage = (int) $request->input('per_page', 24);
        $media = $query->latest()->paginate($perPage);

        return response()->json($media);
    }

    /**
     * JSON API Endpoint for folder counts and storage metrics.
     */
    public function folders(Request $request)
    {
        $folders = [
            'all' => Media::count(),
            'products' => Media::where('folder', 'products')->count(),
            'categories' => Media::where('folder', 'categories')->count(),
            'brands' => Media::where('folder', 'brands')->count(),
            'banners' => Media::where('folder', 'banners')->count(),
            'blog' => Media::where('folder', 'blog')->count(),
            'cms' => Media::where('folder', 'cms')->count(),
            'general' => Media::where('folder', 'general')->count(),
            'total_size' => $this->formatBytes(Media::sum('size')),
        ];

        return response()->json($folders);
    }

    /**
     * Upload single or multiple media files securely.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:jpeg,jpg,png,webp,svg,gif|max:10240', // Max 10MB
            'file' => 'nullable|file|mimes:jpeg,jpg,png,webp,svg,gif|max:10240',
            'folder' => 'nullable|string|in:products,categories,brands,banners,blog,cms,general',
            'alt_text' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
        ]);

        $uploadedFiles = [];
        if ($request->hasFile('files')) {
            $uploadedFiles = $request->file('files');
        } elseif ($request->hasFile('file')) {
            $uploadedFiles = [$request->file('file')];
        }

        if (empty($uploadedFiles)) {
            if (!$request->header('X-Inertia') && $request->wantsJson()) {
                return response()->json(['error' => 'No files were provided for upload.'], 422);
            }
            return back()->withErrors(['file' => 'No files were provided for upload.']);
        }

        $folder = $request->input('folder', 'general');
        $createdRecords = [];
        $disk = 'public';

        foreach ($uploadedFiles as $file) {
            $originalName = $file->getClientOriginalName();
            $extension = strtolower($file->getClientOriginalExtension());
            $safeName = date('Ymd_His') . '_' . Str::random(8) . '.' . $extension;
            $subPath = "media/{$folder}/" . date('Y/m');

            $storedPath = $file->storeAs($subPath, $safeName, $disk);
            $fileSize = $file->getSize();
            $mimeType = $file->getMimeType();

            $fullLocalPath = Storage::disk($disk)->path($storedPath);

            // If file is SVG, sanitize to neutralize any potential XSS vectors
            if ($extension === 'svg' || str_contains($mimeType, 'svg')) {
                if (file_exists($fullLocalPath)) {
                    $svgContent = file_get_contents($fullLocalPath);
                    $cleanedSvg = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $svgContent);
                    $cleanedSvg = preg_replace('/on\w+\s*=\s*(["\']).*?\1/is', '', $cleanedSvg);
                    $cleanedSvg = preg_replace('/javascript\s*:/is', '', $cleanedSvg);
                    $cleanedSvg = preg_replace('/<\/?(iframe|object|embed)\b[^>]*>/is', '', $cleanedSvg);
                    file_put_contents($fullLocalPath, $cleanedSvg);
                    $fileSize = filesize($fullLocalPath);
                }
            }

            // Attempt to determine image dimensions
            $width = null;
            $height = null;
            if (file_exists($fullLocalPath) && @getimagesize($fullLocalPath)) {
                [$w, $h] = getimagesize($fullLocalPath);
                $width = $w;
                $height = $h;
            }

            $media = Media::create([
                'filename' => $safeName,
                'original_name' => $originalName,
                'path' => $storedPath,
                'disk' => $disk,
                'mime_type' => $mimeType,
                'size' => $fileSize,
                'width' => $width,
                'height' => $height,
                'folder' => $folder,
                'title' => $request->input('title', pathinfo($originalName, PATHINFO_FILENAME)),
                'alt_text' => $request->input('alt_text', pathinfo($originalName, PATHINFO_FILENAME)),
                'user_id' => auth()->id(),
            ]);

            AuditLogger::log('media.uploaded', $media, null, [
                'filename' => $safeName,
                'size' => $fileSize,
                'folder' => $folder,
            ]);

            $createdRecords[] = $media;
        }

        if (!$request->header('X-Inertia') && ($request->wantsJson() || $request->ajax())) {
            return response()->json([
                'success' => true,
                'message' => count($createdRecords) . ' media item(s) uploaded successfully.',
                'media' => count($createdRecords) === 1 ? $createdRecords[0] : $createdRecords,
            ]);
        }

        return back()->with('success', count($createdRecords) . ' media file(s) uploaded successfully!');
    }

    /**
     * Update media metadata (title, alt_text, caption, folder).
     */
    public function update(Request $request, Media $media)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:1000',
            'folder' => 'required|string|in:products,categories,brands,banners,blog,cms,general',
        ]);

        $oldValues = $media->toArray();
        $media->update($validated);

        AuditLogger::log('media.updated', $media, $oldValues, $media->fresh()->toArray());

        if (!$request->header('X-Inertia') && ($request->wantsJson() || $request->ajax())) {
            return response()->json([
                'success' => true,
                'message' => 'Media metadata updated successfully.',
                'media' => $media,
            ]);
        }

        return back()->with('success', 'Media information updated!');
    }

    /**
     * Delete media safely with active reference validation.
     */
    public function destroy(Request $request, Media $media)
    {
        $usages = $media->getUsage();
        $force = $request->boolean('force');

        if (!empty($usages) && !$force) {
            $msg = 'Cannot delete media: It is currently active in the store (' . implode('; ', $usages) . '). Pass force=true to override.';
            if (!$request->header('X-Inertia') && ($request->wantsJson() || $request->ajax())) {
                return response()->json([
                    'error' => $msg,
                    'usages' => $usages,
                    'requires_confirmation' => true,
                ], 409);
            }
            return back()->withErrors(['media' => $msg]);
        }

        // Delete physical file from disk
        if (Storage::disk($media->disk)->exists($media->path)) {
            Storage::disk($media->disk)->delete($media->path);
        }

        AuditLogger::log('media.deleted', $media, $media->toArray(), null);
        $media->delete();

        if (!$request->header('X-Inertia') && ($request->wantsJson() || $request->ajax())) {
            return response()->json([
                'success' => true,
                'message' => 'Media removed successfully from library.',
            ]);
        }

        return back()->with('success', 'Media file removed from library.');
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 1) . ' KB';
        }
        return $bytes . ' B';
    }
}
