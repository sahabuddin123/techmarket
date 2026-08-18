<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\Category;
use App\Models\Product;
use App\Services\AnalyticsService;
use App\Services\AnalyticsCacheService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AnalyticsCacheTest extends TestCase
{
    use RefreshDatabase;

    public function test_analytics_caching_and_invalidation_lifecycle(): void
    {
        $category = Category::create(['name' => 'RAM', 'slug' => 'ram']);
        Product::create([
            'title' => 'Corsair Vengeance 32GB DDR5',
            'slug' => 'corsair-32gb-ddr5',
            'sku' => 'RAM-32GB',
            'category_id' => $category->id,
            'price' => 14000,
            'stock' => 20,
        ]);

        Order::create([
            'order_number' => 'ORD-CACHE-1',
            'customer_name' => 'Cache Tester',
            'customer_email' => 'cache@test.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'paid',
            'subtotal' => 14000,
            'total' => 14000,
            'status' => 'Delivered',
        ]);

        // First calculation
        $metrics1 = AnalyticsService::getDashboardMetrics('last_30_days');
        $this->assertEquals(14000.0, $metrics1['kpis']['gross_revenue']['current']);

        // Create second order without invalidating cache yet
        Order::create([
            'order_number' => 'ORD-CACHE-2',
            'customer_name' => 'Cache Tester 2',
            'customer_email' => 'cache2@test.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'paid',
            'subtotal' => 14000,
            'total' => 14000,
            'status' => 'Delivered',
        ]);

        // Invalidate cache
        AnalyticsCacheService::invalidateSales();

        // Second calculation after invalidation
        $metrics2 = AnalyticsService::getDashboardMetrics('last_30_days');
        $this->assertEquals(28000.0, $metrics2['kpis']['gross_revenue']['current']);
        $this->assertEquals(2, $metrics2['kpis']['total_orders']['current']);
    }
}
