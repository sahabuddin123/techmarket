<?php

namespace App\Services\BulkData\Processors;

use App\Models\Category;
use App\Services\BulkData\Contracts\ImportProcessorInterface;
use Illuminate\Support\Str;

class CategoryImportProcessor implements ImportProcessorInterface
{
    protected ?array $categoryCache = null;

    public function getEntityType(): string
    {
        return 'categories';
    }

    public function getEntityLabel(): string
    {
        return 'Product Categories';
    }

    public function getUniqueKeyField(): string
    {
        return 'slug';
    }

    public function getTemplateColumns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Category Name', 'required' => true, 'description' => 'Display name of the category', 'example' => 'Graphics Cards'],
            ['key' => 'slug', 'label' => 'URL Slug', 'required' => false, 'description' => 'Unique URL identifier (auto-generated if empty)', 'example' => 'graphics-cards'],
            ['key' => 'parent_category', 'label' => 'Parent Category', 'required' => false, 'description' => 'Parent Category Name or Slug for nested hierarchy', 'example' => 'Components'],
            ['key' => 'description', 'label' => 'Description / Overview', 'required' => false, 'description' => 'Category banner text or intro description', 'example' => 'Explore the latest NVIDIA GeForce & AMD Radeon graphics cards.'],
            ['key' => 'icon', 'label' => 'Icon Code / Class', 'required' => false, 'description' => 'Lucide icon name (e.g. Cpu, Monitor, HardDrive)', 'example' => 'Cpu'],
            ['key' => 'is_featured', 'label' => 'Featured on Homepage', 'required' => false, 'description' => '1 for Featured, 0 otherwise', 'example' => '1'],
            ['key' => 'is_nav_visible', 'label' => 'Show in Navigation', 'required' => false, 'description' => '1 for Visible in Header/Mega Menu, 0 otherwise', 'example' => '1'],
            ['key' => 'sort_order', 'label' => 'Sort Order', 'required' => false, 'description' => 'Position rank in menus (Integer)', 'example' => '1'],
            ['key' => 'image', 'label' => 'Category Thumbnail URL', 'required' => false, 'description' => 'Public image URL for category card', 'example' => 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45'],
            ['key' => 'seo_title', 'label' => 'SEO Title', 'required' => false, 'description' => 'Custom search engine title', 'example' => 'Buy Graphics Cards at Best Price in BD | TechMarket'],
            ['key' => 'meta_description', 'label' => 'SEO Meta Description', 'required' => false, 'description' => 'Meta description for Google search', 'example' => 'Shop authentic GPU models from ASUS, MSI, Gigabyte, and ZOTAC with warranty.'],
        ];
    }

    public function getInstructions(): array
    {
        return [
            'Parent Category can be the name or slug of an existing category.',
            'For nested subcategories, make sure the parent category appears earlier in your file or already exists in the database.',
            'Slug is automatically generated from the Category Name if left blank.',
            'Featured and Navigation fields accept: "1", "0", "true", "false", "yes", "no".',
        ];
    }

    public function getAllowedValues(): array
    {
        return [
            'Existing Categories' => Category::orderBy('name')->pluck('name')->toArray(),
            'Boolean Flags' => ['1 (Yes)', '0 (No)'],
        ];
    }

    protected function resolveParent(?string $parentInput): ?Category
    {
        if (empty($parentInput)) return null;
        if ($this->categoryCache === null) {
            $this->categoryCache = [];
            foreach (Category::all() as $c) {
                $this->categoryCache[mb_strtolower(trim($c->name))] = $c;
                $this->categoryCache[mb_strtolower(trim($c->slug))] = $c;
            }
        }
        $key = mb_strtolower(trim($parentInput));
        return $this->categoryCache[$key] ?? null;
    }

    public function validateRow(array $row, int $rowNumber, array $options = []): array
    {
        $errors = [];
        $warnings = [];
        $normalized = [];

        $name = trim((string)($row['name'] ?? $row['Category Name'] ?? ''));
        if (empty($name)) {
            $errors[] = "Row {$rowNumber}: Category Name is required.";
        } else {
            $normalized['name'] = $name;
        }

        $slug = trim((string)($row['slug'] ?? $row['URL Slug'] ?? ''));
        $normalized['slug'] = $slug ?: Str::slug($name);

        $parentInput = trim((string)($row['parent_category'] ?? $row['Parent Category'] ?? ''));
        if (!empty($parentInput)) {
            $parent = $this->resolveParent($parentInput);
            if (!$parent) {
                $warnings[] = "Row {$rowNumber}: Parent category '{$parentInput}' not found; created as top-level category.";
                $normalized['parent_id'] = null;
            } else {
                $normalized['parent_id'] = $parent->id;
            }
        } else {
            $normalized['parent_id'] = null;
        }

        $normalized['description'] = trim((string)($row['description'] ?? $row['Description'] ?? ''));
        $normalized['icon'] = trim((string)($row['icon'] ?? $row['Icon'] ?? ''));
        $normalized['image'] = trim((string)($row['image'] ?? $row['Image'] ?? ''));

        $feat = mb_strtolower(trim((string)($row['is_featured'] ?? $row['Featured'] ?? '0')));
        $normalized['is_featured'] = in_array($feat, ['1', 'true', 'yes'], true);

        $nav = mb_strtolower(trim((string)($row['is_nav_visible'] ?? $row['Navigation'] ?? '1')));
        $normalized['is_nav_visible'] = in_array($nav, ['1', 'true', 'yes'], true);

        $sort = trim((string)($row['sort_order'] ?? $row['Sort Order'] ?? '0'));
        $normalized['sort_order'] = is_numeric($sort) ? (int)$sort : 0;

        $normalized['seo_title'] = trim((string)($row['seo_title'] ?? $row['SEO Title'] ?? ''));
        $normalized['meta_description'] = trim((string)($row['meta_description'] ?? $row['SEO Meta Description'] ?? ''));

        return [
            'is_valid' => count($errors) === 0,
            'errors' => $errors,
            'warnings' => $warnings,
            'normalized_data' => $normalized,
        ];
    }

    public function processRow(array $normalizedData, string $mode, array $options = []): array
    {
        $slug = $normalizedData['slug'];
        $existing = Category::where('slug', $slug)
            ->orWhere('name', $normalizedData['name'])
            ->first();

        if ($existing) {
            if ($mode === 'create_only') {
                return ['action' => 'skipped', 'entity_id' => $existing->id, 'error' => null];
            }

            $existing->update($normalizedData);
            return ['action' => 'updated', 'entity_id' => $existing->id, 'error' => null];
        }

        if ($mode === 'update_only') {
            return ['action' => 'skipped', 'entity_id' => null, 'error' => null];
        }

        $category = Category::create($normalizedData);

        // Update local cache so child categories in the same batch can reference this parent
        if ($this->categoryCache !== null) {
            $this->categoryCache[mb_strtolower(trim($category->name))] = $category;
            $this->categoryCache[mb_strtolower(trim($category->slug))] = $category;
        }

        return ['action' => 'created', 'entity_id' => $category->id, 'error' => null];
    }
}
