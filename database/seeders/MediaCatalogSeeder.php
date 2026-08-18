<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use Illuminate\Database\Seeder;

class MediaCatalogSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Product::whereNotNull('image')->get() as $p) {
            if (!empty($p->image)) {
                Media::firstOrCreate(
                    ['path' => $p->image],
                    [
                        'filename' => basename($p->image),
                        'original_name' => $p->title . '.jpg',
                        'disk' => 'public',
                        'mime_type' => 'image/jpeg',
                        'size' => 124000,
                        'folder' => 'products',
                        'title' => $p->title,
                        'alt_text' => $p->title,
                    ]
                );
            }
        }

        foreach (Category::whereNotNull('image')->get() as $c) {
            if (!empty($c->image)) {
                Media::firstOrCreate(
                    ['path' => $c->image],
                    [
                        'filename' => basename($c->image),
                        'original_name' => $c->name . '.jpg',
                        'disk' => 'public',
                        'mime_type' => 'image/jpeg',
                        'size' => 84000,
                        'folder' => 'categories',
                        'title' => $c->name,
                        'alt_text' => $c->name,
                    ]
                );
            }
        }

        foreach (Brand::whereNotNull('logo')->get() as $b) {
            if (!empty($b->logo)) {
                Media::firstOrCreate(
                    ['path' => $b->logo],
                    [
                        'filename' => basename($b->logo),
                        'original_name' => $b->name . '.png',
                        'disk' => 'public',
                        'mime_type' => 'image/png',
                        'size' => 45000,
                        'folder' => 'brands',
                        'title' => $b->name . ' Logo',
                        'alt_text' => $b->name,
                    ]
                );
            }
        }
    }
}
