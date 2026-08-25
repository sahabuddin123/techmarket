<?php

namespace App\Services\BulkData\Processors;

use App\Models\Brand;
use App\Services\BulkData\Contracts\ImportProcessorInterface;
use Illuminate\Support\Str;

class BrandImportProcessor implements ImportProcessorInterface
{
    public function getEntityType(): string
    {
        return 'brands';
    }

    public function getEntityLabel(): string
    {
        return 'Brands & Manufacturers';
    }

    public function getUniqueKeyField(): string
    {
        return 'slug';
    }

    public function getTemplateColumns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Brand Name', 'required' => true, 'description' => 'Manufacturer or Brand name', 'example' => 'ASUS'],
            ['key' => 'slug', 'label' => 'URL Slug', 'required' => false, 'description' => 'Unique brand URL slug (auto-generated if empty)', 'example' => 'asus'],
            ['key' => 'website_url', 'label' => 'Official Website URL', 'required' => false, 'description' => 'Official manufacturer website', 'example' => 'https://www.asus.com'],
            ['key' => 'description', 'label' => 'Brand Description', 'required' => false, 'description' => 'Overview and history of the brand', 'example' => 'ASUS is a multinational computer hardware and electronics company.'],
            ['key' => 'logo', 'label' => 'Brand Logo URL', 'required' => false, 'description' => 'Public image URL of brand logo', 'example' => 'https://images.unsplash.com/logo-asus.png'],
            ['key' => 'banner', 'label' => 'Brand Banner URL', 'required' => false, 'description' => 'Brand profile page header banner', 'example' => 'https://images.unsplash.com/banner-asus.png'],
            ['key' => 'is_featured', 'label' => 'Featured Brand', 'required' => false, 'description' => '1 for Featured on Brand Showcase, 0 otherwise', 'example' => '1'],
            ['key' => 'is_active', 'label' => 'Status Active', 'required' => false, 'description' => '1 for Active, 0 for Inactive', 'example' => '1'],
            ['key' => 'sort_order', 'label' => 'Sort Order', 'required' => false, 'description' => 'Display sort rank (Integer)', 'example' => '1'],
            ['key' => 'meta_title', 'label' => 'SEO Title Tag', 'required' => false, 'description' => 'SEO title for brand showroom page', 'example' => 'ASUS Products, Laptops & Components in Bangladesh | TechMarket'],
            ['key' => 'meta_description', 'label' => 'SEO Meta Description', 'required' => false, 'description' => 'SEO meta description snippet', 'example' => 'Explore authentic ASUS ROG, TUF Gaming, and ZenBook products in Bangladesh.'],
        ];
    }

    public function getInstructions(): array
    {
        return [
            'Brand Name is required and must be unique.',
            'If Slug is left empty, it will be automatically derived from Brand Name.',
            'Website URL and Logo URLs should be valid web links starting with http:// or https://.',
            'Featured and Active accept: "1", "0", "true", "false", "yes", "no".',
        ];
    }

    public function getAllowedValues(): array
    {
        return [
            'Existing Brands' => Brand::orderBy('name')->pluck('name')->toArray(),
            'Status' => ['1 (Active)', '0 (Inactive)'],
        ];
    }

    public function validateRow(array $row, int $rowNumber, array $options = []): array
    {
        $errors = [];
        $warnings = [];
        $normalized = [];

        $name = trim((string)($row['name'] ?? $row['Brand Name'] ?? ''));
        if (empty($name)) {
            $errors[] = "Row {$rowNumber}: Brand Name is required.";
        } else {
            $normalized['name'] = $name;
        }

        $slug = trim((string)($row['slug'] ?? $row['URL Slug'] ?? ''));
        $normalized['slug'] = $slug ?: Str::slug($name);

        $normalized['website_url'] = trim((string)($row['website_url'] ?? $row['Official Website URL'] ?? ''));
        $normalized['description'] = trim((string)($row['description'] ?? $row['Brand Description'] ?? ''));
        $normalized['logo'] = trim((string)($row['logo'] ?? $row['Brand Logo URL'] ?? ''));
        $normalized['banner'] = trim((string)($row['banner'] ?? $row['Brand Banner URL'] ?? ''));

        $feat = mb_strtolower(trim((string)($row['is_featured'] ?? $row['Featured Brand'] ?? '0')));
        $normalized['is_featured'] = in_array($feat, ['1', 'true', 'yes'], true);

        $act = mb_strtolower(trim((string)($row['is_active'] ?? $row['Status Active'] ?? '1')));
        $normalized['is_active'] = in_array($act, ['1', 'true', 'yes', 'active'], true);

        $sort = trim((string)($row['sort_order'] ?? $row['Sort Order'] ?? '0'));
        $normalized['sort_order'] = is_numeric($sort) ? (int)$sort : 0;

        $normalized['meta_title'] = trim((string)($row['meta_title'] ?? $row['SEO Title Tag'] ?? ''));
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
        $existing = Brand::where('slug', $slug)
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

        $brand = Brand::create($normalizedData);
        return ['action' => 'created', 'entity_id' => $brand->id, 'error' => null];
    }
}
