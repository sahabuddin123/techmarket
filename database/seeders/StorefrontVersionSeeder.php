<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StorefrontVersion;
use App\Models\Setting;

class StorefrontVersionSeeder extends Seeder
{
    public function run(): void
    {
        $currentSettingVersion = Setting::where('key', 'storefront_version')->value('value') ?: 'v3';

        $versions = [
            [
                'key' => 'v1',
                'name' => 'TechLand Classic Computer & IT Store',
                'slug' => 'techland-classic-v1',
                'status' => 'published',
                'is_active' => $currentSettingVersion === 'v1',
                'description' => 'Classic IT & Computer hardware storefront with dark blue header (#002a5c), bright red primary accents (#e11b22), and multi-column mega menu.',
                'theme_config' => [
                    'primary_color' => '#e11b22',
                    'secondary_color' => '#002a5c',
                    'accent_color' => '#ff9800',
                    'background_color' => '#f1f5f9',
                    'surface_color' => '#ffffff',
                    'text_color' => '#1e293b',
                    'border_color' => '#e2e8f0',
                    'border_radius' => '8px',
                    'font_family' => 'Inter, sans-serif',
                ],
                'version_config' => [
                    'header_style' => 'classic_navy',
                    'footer_style' => 'classic_navy',
                    'banner_aspect_ratio' => '21:9',
                    'product_card_style' => 'classic_bordered',
                ],
            ],
            [
                'key' => 'v2',
                'name' => 'Modern Tech Superstore',
                'slug' => 'modern-tech-v2',
                'status' => 'published',
                'is_active' => $currentSettingVersion === 'v2',
                'description' => 'High-tech electronics and computer superstore with deep navy (#0b1a36), vivid electric blue (#2563eb), and rich service strips.',
                'theme_config' => [
                    'primary_color' => '#2563eb',
                    'secondary_color' => '#0b1a36',
                    'accent_color' => '#38bdf8',
                    'background_color' => '#f8fafc',
                    'surface_color' => '#ffffff',
                    'text_color' => '#0f172a',
                    'border_color' => '#cbd5e1',
                    'border_radius' => '12px',
                    'font_family' => 'Inter, sans-serif',
                ],
                'version_config' => [
                    'header_style' => 'tech_superstore',
                    'footer_style' => 'tech_superstore',
                    'banner_aspect_ratio' => '16:9',
                    'product_card_style' => 'modern_glass',
                ],
            ],
            [
                'key' => 'v3',
                'name' => 'TechMarket BD - Gadget Hub',
                'slug' => 'techmarket-gadget-hub-v3',
                'status' => 'published',
                'is_active' => $currentSettingVersion === 'v3',
                'description' => 'Clean, modern consumer gadget hub inspired by TechJhuli with pure white cards, royal blue accents (#0153FD), soft cyan glow (#CAE0FF), and drag-to-scroll filter pills.',
                'theme_config' => [
                    'primary_color' => '#0153FD',
                    'secondary_color' => '#002268',
                    'accent_color' => '#CAE0FF',
                    'background_color' => '#F4F7FC',
                    'surface_color' => '#ffffff',
                    'text_color' => '#0f172a',
                    'border_color' => '#8BB1FF',
                    'border_radius' => '22px',
                    'font_family' => 'Inter, sans-serif',
                ],
                'version_config' => [
                    'header_style' => 'gadget_hub_clean',
                    'footer_style' => 'gadget_hub_royal_blue',
                    'banner_aspect_ratio' => '16:9',
                    'product_card_style' => 'studio_gadget',
                ],
            ],
        ];

        foreach ($versions as $ver) {
            StorefrontVersion::updateOrCreate(
                ['key' => $ver['key']],
                $ver
            );
        }

        // Set global setting to match active version
        Setting::updateOrCreate(
            ['key' => 'storefront_version'],
            ['value' => $currentSettingVersion]
        );
    }
}
