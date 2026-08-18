<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Refund;
use App\Services\AnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class AnalyticsServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_gross_revenue_net_revenue_and_cancelled_order_exclusion(): void
    {
        $category = Category::create(['name' => 'Monitors', 'slug' => 'monitors']);
        $product = Product::create([
            'title' => 'Gaming Monitor',
            'slug' => 'gaming-monitor',
            'sku' => 'MON-001',
            'category_id' => $category->id,
            'price' => 20000,
            'stock' => 10,
        ]);

        // Valid Completed Order: 20,000
        $order1 = Order::create([
            'order_number' => 'ORD-1001',
            'customer_name' => 'Alice',
            'customer_email' => 'alice@test.com',
            'customer_phone' => '01700000001',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'paid',
            'subtotal' => 20000,
            'total' => 20000,
            'status' => 'Delivered',
            'created_at' => Carbon::now(),
        ]);

        $payment1 = Payment::create([
            'order_id' => $order1->id,
            'payment_method' => 'bKash',
            'transaction_id' => 'TXN-1001',
            'amount' => 20000,
            'status' => 'paid',
        ]);

        // Valid Processing Order: 15,000
        $order2 = Order::create([
            'order_number' => 'ORD-1002',
            'customer_name' => 'Bob',
            'customer_email' => 'bob@test.com',
            'customer_phone' => '01700000002',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'COD',
            'payment_status' => 'pending',
            'subtotal' => 15000,
            'total' => 15000,
            'status' => 'Processing',
            'created_at' => Carbon::now(),
        ]);

        // Cancelled Order: 50,000 (must NOT be counted in gross or net revenue)
        $order3 = Order::create([
            'order_number' => 'ORD-1003',
            'customer_name' => 'Charlie',
            'customer_email' => 'charlie@test.com',
            'customer_phone' => '01700000003',
            'shipping_address' => 'Dhaka',
            'payment_method' => 'bKash',
            'payment_status' => 'cancelled',
            'subtotal' => 50000,
            'total' => 50000,
            'status' => 'Cancelled',
            'created_at' => Carbon::now(),
        ]);

        // Approved Refund on Order 1: 5,000
        Refund::create([
            'order_id' => $order1->id,
            'payment_id' => $payment1->id,
            'amount' => 5000,
            'status' => 'approved',
            'reason' => 'Partial return',
        ]);

        $dashboard = AnalyticsService::getDashboardMetrics('last_30_days');

        // Gross Revenue = 20,000 + 15,000 = 35,000 (Cancelled 50,000 is excluded)
        $this->assertEquals(35000.0, $dashboard['kpis']['gross_revenue']['current']);

        // Refunded Amount = 5,000
        $this->assertEquals(5000.0, $dashboard['kpis']['refunded_amount']['current']);

        // Net Revenue = 35,000 - 5,000 = 30,000
        $this->assertEquals(30000.0, $dashboard['kpis']['net_revenue']['current']);

        // Non-cancelled orders count = 2, AOV = 35,000 / 2 = 17,500
        $this->assertEquals(17500.0, $dashboard['kpis']['average_order_value']['current']);
    }

    public function test_previous_period_comparison_and_zero_division_safety(): void
    {
        // Zero division check
        $this->assertEquals(0.0, AnalyticsService::calculatePercentageChange(0.0, 0.0));
        $this->assertEquals(100.0, AnalyticsService::calculatePercentageChange(500.0, 0.0));
        $this->assertEquals(-100.0, AnalyticsService::calculatePercentageChange(-200.0, 0.0));
        $this->assertEquals(50.0, AnalyticsService::calculatePercentageChange(150.0, 100.0));
        $this->assertEquals(-25.0, AnalyticsService::calculatePercentageChange(75.0, 100.0));

        // Period resolution check
        $range = AnalyticsService::resolveDateRange('last_7_days');
        $this->assertNotNull($range['start']);
        $this->assertNotNull($range['end']);
        $this->assertNotNull($range['prev_start']);
        $this->assertNotNull($range['prev_end']);
        $this->assertTrue($range['start']->gt($range['prev_start']));
    }
}
