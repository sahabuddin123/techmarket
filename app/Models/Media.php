<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';

    protected $fillable = [
        'filename',
        'original_name',
        'path',
        'disk',
        'mime_type',
        'size',
        'width',
        'height',
        'folder',
        'title',
        'alt_text',
        'caption',
        'user_id',
    ];

    protected $appends = ['url', 'formatted_size'];

    protected $casts = [
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://')) {
            return $this->path;
        }

        if ($this->disk === 'public') {
            return '/storage/' . ltrim($this->path, '/');
        }

        return Storage::disk($this->disk)->url($this->path);
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 1) . ' KB';
        }
        return $bytes . ' B';
    }

    /**
     * Check if this media file is referenced by active models in the store.
     * Returns an array of usage descriptions or empty if unreferenced.
     */
    public function getUsage(): array
    {
        $usages = [];
        $url = $this->url;
        $path = $this->path;

        // Check products (main image & gallery)
        $productMatches = Product::where('image', 'like', "%{$this->filename}%")
            ->orWhere('image', $url)
            ->orWhere('image', $path)
            ->orWhereJsonContains('gallery', $url)
            ->orWhereJsonContains('gallery', $path)
            ->pluck('title')
            ->take(5)
            ->toArray();

        if (!empty($productMatches)) {
            $usages[] = 'Used in ' . count($productMatches) . ' Product(s): ' . implode(', ', $productMatches);
        }

        // Check categories
        $categoryCount = Category::where('image', 'like', "%{$this->filename}%")
            ->orWhere('image', $url)
            ->count();
        if ($categoryCount > 0) {
            $usages[] = "Used in {$categoryCount} Category thumbnail(s)";
        }

        // Check banners
        $bannerCount = Banner::where('image', 'like', "%{$this->filename}%")
            ->orWhere('image', $url)
            ->count();
        if ($bannerCount > 0) {
            $usages[] = "Used in {$bannerCount} Homepage Banner(s)";
        }

        // Check brands
        $brandCount = Brand::where('logo', 'like', "%{$this->filename}%")
            ->orWhere('logo', $url)
            ->count();
        if ($brandCount > 0) {
            $usages[] = "Used in {$brandCount} Brand logo(s)";
        }

        // Check settings (logo, favicon)
        $settingMatches = Setting::where('value', 'like', "%{$this->filename}%")
            ->orWhere('value', $url)
            ->pluck('key')
            ->toArray();
        if (!empty($settingMatches)) {
            $usages[] = 'Used in System Setting(s): ' . implode(', ', $settingMatches);
        }

        return $usages;
    }
}
