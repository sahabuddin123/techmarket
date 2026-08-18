<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CacheInvalidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_setting_model_caches_values_and_invalidates_on_update(): void
    {
        Setting::set('store_phone', '09612-888888', 'general');

        // First call caches value
        $val1 = Setting::getCached('store_phone');
        $this->assertEquals('09612-888888', $val1);

        // Update setting invalidates cache
        Setting::set('store_phone', '09612-999999', 'general');

        $val2 = Setting::getCached('store_phone');
        $this->assertEquals('09612-999999', $val2);
    }
}
