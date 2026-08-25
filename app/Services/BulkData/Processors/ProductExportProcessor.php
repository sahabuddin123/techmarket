<?php

namespace App\Services\BulkData\Processors;

use App\Models\Product;
use App\Services\BulkData\Contracts\ExportProcessorInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ProductExportProcessor implements ExportProcessorInterface
{
    public function getEntityType(): string
    {
        return 'products';
    }

    public function getEntityLabel(): string
    {
        return 'Hardware Products';
    }

    public function getAvailableColumns(): array
    {
        return [
            ['key' => 'sku', 'label' => 'SKU', 'default' => true],
            ['key' => 'title', 'label' => 'Product Title', 'default' => true],
            ['key' => 'slug', 'label' => 'URL Slug', 'default' => true],
            ['key' => 'category', 'label' => 'Category', 'default' => true],
            ['key' => 'brand', 'label' => 'Brand', 'default' => true],
            ['key' => 'unit', 'label' => 'Unit', 'default' => true],
            ['key' => 'price', 'label' => 'Selling Price (BDT)', 'default' => true],
            ['key' => 'regular_price', 'label' => 'Regular Price (BDT)', 'default' => true],
            ['key' => 'cost_price', 'label' => 'Cost Price (BDT)', 'default' => false],
            ['key' => 'stock', 'label' => 'Stock Quantity', 'default' => true],
            ['key' => 'low_stock_threshold', 'label' => 'Low Stock Alert', 'default' => false],
            ['key' => 'status', 'label' => 'Status (Active/Draft)', 'default' => true],
            ['key' => 'is_featured', 'label' => 'Featured', 'default' => true],
            ['key' => 'is_deal_of_day', 'label' => 'Deal of Day', 'default' => false],
            ['key' => 'component_type', 'label' => 'PC Builder Component', 'default' => true],
            ['key' => 'warranty', 'label' => 'Warranty', 'default' => true],
            ['key' => 'short_description', 'label' => 'Short Summary', 'default' => false],
            ['key' => 'description', 'label' => 'Full Description HTML', 'default' => false],
            ['key' => 'image', 'label' => 'Primary Image URL', 'default' => true],
            ['key' => 'meta_title', 'label' => 'SEO Title', 'default' => false],
            ['key' => 'meta_description', 'label' => 'SEO Meta Description', 'default' => false],
            ['key' => 'focus_keyword', 'label' => 'SEO Focus Keyword', 'default' => false],
            ['key' => 'created_at', 'label' => 'Created Date', 'default' => false],
            ['key' => 'updated_at', 'label' => 'Last Updated', 'default' => false],
        ];
    }

    public function getDefaultColumns(): array
    {
        return array_column(array_filter($this->getAvailableColumns(), fn($col) => $col['default']), 'key');
    }

    public function buildQuery(array $filters = []): Builder
    {
        $query = Product::with(['category', 'brand', 'unit']);

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool)$filters['is_active']);
        }

        if (isset($filters['is_featured']) && $filters['is_featured'] !== '') {
            $query->where('is_featured', (bool)$filters['is_featured']);
        }

        if (!empty($filters['component_type'])) {
            $query->where('component_type', $filters['component_type']);
        }

        if (!empty($filters['stock_status'])) {
            if ($filters['stock_status'] === 'in_stock') {
                $query->where('stock', '>', 0);
            } elseif ($filters['stock_status'] === 'low_stock') {
                $query->where('stock', '>', 0)->whereColumn('stock', '<=', 'low_stock_threshold');
            } elseif ($filters['stock_status'] === 'out_of_stock') {
                $query->where('stock', '<=', 0);
            }
        }

        if (!empty($filters['price_min']) && is_numeric($filters['price_min'])) {
            $query->where('price', '>=', (float)$filters['price_min']);
        }

        if (!empty($filters['price_max']) && is_numeric($filters['price_max'])) {
            $query->where('price', '<=', (float)$filters['price_max']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->latest('id');
    }

    public function transformRow(Model $model, array $selectedColumns = []): array
    {
        /** @var Product $product */
        $product = $model;
        $allData = [
            'sku' => $product->sku,
            'title' => $product->title,
            'slug' => $product->slug,
            'category' => $product->category?->name ?? '',
            'brand' => $product->brand?->name ?? '',
            'unit' => $product->unit?->short_code ?? '',
            'price' => number_format((float)$product->price, 2, '.', ''),
            'regular_price' => $product->regular_price ? number_format((float)$product->regular_price, 2, '.', '') : '',
            'cost_price' => $product->cost_price ? number_format((float)$product->cost_price, 2, '.', '') : '',
            'stock' => (string)$product->stock,
            'low_stock_threshold' => (string)$product->low_stock_threshold,
            'status' => $product->is_active ? 'Active' : 'Draft',
            'is_featured' => $product->is_featured ? '1' : '0',
            'is_deal_of_day' => $product->is_deal_of_day ? '1' : '0',
            'component_type' => $product->component_type ?? '',
            'warranty' => $product->warranty ?? '',
            'short_description' => $product->short_description ?? '',
            'description' => $product->description ?? '',
            'image' => $product->image ?? '',
            'meta_title' => $product->seo_title ?: $product->meta_title ?: '',
            'meta_description' => $product->meta_description ?? '',
            'focus_keyword' => $product->focus_keyword ?? '',
            'created_at' => $product->created_at?->toIso8601String() ?? '',
            'updated_at' => $product->updated_at?->toIso8601String() ?? '',
        ];

        if (empty($selectedColumns)) {
            return $allData;
        }

        $row = [];
        foreach ($selectedColumns as $colKey) {
            $row[$colKey] = $allData[$colKey] ?? '';
        }
        return $row;
    }
}
