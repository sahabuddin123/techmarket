<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
    /**
     * Upload image with strict validation and safe storage naming.
     */
    public static function uploadImage(UploadedFile $file, string $directory = 'products'): string
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new \InvalidArgumentException("Invalid file type. Only JPEG, PNG, and WebP images are allowed.");
        }

        // 5MB limit check (5120 KB)
        if ($file->getSize() > 5120 * 1024) {
            throw new \InvalidArgumentException("File size exceeds maximum allowed limit of 5MB.");
        }

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("public/uploads/{$directory}", $filename);

        return Storage::url($path);
    }

    /**
     * Delete image file from public storage safely.
     */
    public static function deleteImage(?string $url): bool
    {
        if (!$url) {
            return false;
        }

        $path = str_replace('/storage/', 'public/', $url);
        if (Storage::exists($path)) {
            return Storage::delete($path);
        }

        return false;
    }
}
