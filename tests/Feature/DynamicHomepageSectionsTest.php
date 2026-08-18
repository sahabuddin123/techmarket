<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\HomepageSection;
use App\Services\HomepageService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DynamicHomepageSectionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_resolves_dynamic_homepage_sections_and_data(): void
    {
        HomepageSection::create([
            'section_key' => 'hero_slider',
            'title' => 'Hero Banner Slider',
            'subtitle' => 'Main homepage promotional slider',
            'sort_order' => 1,
            'is_enabled' => true,
        ]);

        $data = HomepageService::getHomepageData();

        $this->assertArrayHasKey('sections', $data);
        $this->assertArrayHasKey('banners', $data);
        $this->assertArrayHasKey('categories', $data);
        $this->assertArrayHasKey('featuredProducts', $data);
        $this->assertCount(1, $data['sections']);
    }
}
