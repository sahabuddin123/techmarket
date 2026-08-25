<?php

namespace App\Services\BulkData\Processors;

use App\Models\Category;
use App\Services\BulkData\Contracts\ExportProcessorInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class CategoryExportProcessor implements ExportProcessorInterface
{
    public function getEntityType(): string
    {
        return 'categories';
    }

    public function getEntityLabel(): string
    {
        return 'Product Categories';
    }

    public function getAvailableColumns(): array
    {
        return [
            ['key' => 'id', 'label' => 'ID', 'default' => false],
            ['key' => 'name', 'label' => 'Category Name', 'default' => true],
            ['key' => 'slug', 'label' => 'URL Slug', 'default' => true],
            ['key' => 'parent_category', 'label' => 'Parent Category', 'default' => true],
            ['key' => 'description', 'label' => 'Description', 'default' => true],
            ['key' => 'icon', 'label' => 'Icon Name', 'default' => false],
            ['key' => 'is_featured', 'label' => 'Featured (1/0)', 'default' => true],
            ['key' => 'is_nav_visible', 'label' => 'Navigation Visible (1/0)', 'default' => true],
            ['key' => 'sort_order', 'label' => 'Sort Order', 'default' => true],
            ['key' => 'image', 'label' => 'Image URL', 'default' => false],
            ['key' => 'seo_title', 'label' => 'SEO Title', 'default' => false],
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
        $query = Category::with('parent')->withCount('products');

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

        if (isset($filters['parent_id']) && $filters['parent_id'] !== '') {
            if ($filters['parent_id'] === 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $filters['parent_id']);
            }
        }

        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function transformRow(Model $model, array $selectedColumns = []): array
    {
        /** @var Category $category */
        $category = $model;
        $allData = [
            'id' => (string)$category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'parent_category' => $category->parent?->name ?? '',
            'description' => $category->description ?? '',
            'icon' => $category->icon ?? '',
            'is_featured' => $category->is_featured ? '1' : '0',
            'is_nav_visible' => $category->is_nav_visible ? '1' : '0',
            'sort_order' => (string)$category->sort_order,
            'image' => $category->image ?? '',
            'seo_title' => $category->seo_title ?? '',
            'meta_description' => $category->meta_description ?? '',
            'products_count' => (string)($category->products_count ?? 0),
            'created_at' => $category->created_at?->toIso8601String() ?? '',
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
