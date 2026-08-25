<?php

namespace App\Services\BulkData\Processors;

use App\Models\Brand;
use App\Services\BulkData\Contracts\ExportProcessorInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class BrandExportProcessor implements ExportProcessorInterface
{
    public function getEntityType(): string
    {
        return 'brands';
    }

    public function getEntityLabel(): string
    {
        return 'Brands & Manufacturers';
    }

    public function getAvailableColumns(): array
    {
        return [
            ['key' => 'id', 'label' => 'ID', 'default' => false],
            ['key' => 'name', 'label' => 'Brand Name', 'default' => true],
            ['key' => 'slug', 'label' => 'URL Slug', 'default' => true],
            ['key' => 'website_url', 'label' => 'Website URL', 'default' => true],
            ['key' => 'description', 'label' => 'Description', 'default' => true],
            ['key' => 'logo', 'label' => 'Logo URL', 'default' => true],
            ['key' => 'banner', 'label' => 'Banner URL', 'default' => false],
            ['key' => 'is_featured', 'label' => 'Featured (1/0)', 'default' => true],
            ['key' => 'is_active', 'label' => 'Active Status (1/0)', 'default' => true],
            ['key' => 'sort_order', 'label' => 'Sort Order', 'default' => true],
            ['key' => 'meta_title', 'label' => 'SEO Title', 'default' => false],
            ['key' => 'meta_description', 'label' => 'SEO Meta Description', 'default' => false],
            ['key' => 'products_count', 'label' => 'Total Products', 'default' => true],
            ['key' => 'created_at', 'label' => 'Created Date', 'default' => false],
        ];
    }

    public function getDefaultColumns(): array
    {
        return array_column(array_filter($this->getAvailableColumns(), fn($col) => $col['default']), 'key');
    }

    public function buildQuery(array $filters = []): Builder
    {
        $query = Brand::withCount('products');

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_featured']) && $filters['is_featured'] !== '') {
            $query->where('is_featured', (bool)$filters['is_featured']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool)$filters['is_active']);
        }

        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function transformRow(Model $model, array $selectedColumns = []): array
    {
        /** @var Brand $brand */
        $brand = $model;
        $allData = [
            'id' => (string)$brand->id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'website_url' => $brand->website_url ?? '',
            'description' => $brand->description ?? '',
            'logo' => $brand->logo ?? '',
            'banner' => $brand->banner ?? '',
            'is_featured' => $brand->is_featured ? '1' : '0',
            'is_active' => $brand->is_active ? '1' : '0',
            'sort_order' => (string)$brand->sort_order,
            'meta_title' => $brand->meta_title ?? '',
            'meta_description' => $brand->meta_description ?? '',
            'products_count' => (string)($brand->products_count ?? 0),
            'created_at' => $brand->created_at?->toIso8601String() ?? '',
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
