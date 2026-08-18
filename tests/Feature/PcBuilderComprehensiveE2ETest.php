<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\SavedPcBuild;
use App\Models\User;
use App\Services\PcBuilderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PcBuilderComprehensiveE2ETest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $otherCustomer;
    protected array $categories = [];
    protected array $brands = [];
    protected array $products = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::factory()->create([
            'email' => 'customer@techmarket.com',
            'name' => 'Tanvir Ahmed',
            'phone' => '01711223344',
        ]);

        $this->otherCustomer = User::factory()->create([
            'email' => 'hacker@example.com',
            'name' => 'Unauthorized User',
        ]);

        // Create categories matching PC builder slots
        $slotCategories = [
            'processor' => 'Processor',
            'motherboard' => 'Motherboard',
            'ram' => 'Desktop RAM',
            'storage' => 'SSD',
            'graphics-card' => 'Graphics Card',
            'power-supply' => 'Power Supply',
            'cpu-cooler' => 'CPU Cooler',
            'casing' => 'Casing',
            'monitor' => 'Monitor',
            'case-fan' => 'Casing Cooler',
            'ups' => 'UPS',
            'software' => 'Operating System',
            'mouse' => 'Mouse',
            'keyboard' => 'Keyboard',
            'headphone' => 'Headphone',
        ];

        foreach ($slotCategories as $slug => $name) {
            $this->categories[$slug] = Category::create([
                'name' => $name,
                'slug' => $slug,
                'is_active' => true,
            ]);
        }

        // Create brands
        $this->brands['intel'] = Brand::create(['name' => 'Intel', 'slug' => 'intel']);
        $this->brands['amd'] = Brand::create(['name' => 'AMD', 'slug' => 'amd']);
        $this->brands['asus'] = Brand::create(['name' => 'ASUS', 'slug' => 'asus']);
        $this->brands['corsair'] = Brand::create(['name' => 'Corsair', 'slug' => 'corsair']);
        $this->brands['samsung'] = Brand::create(['name' => 'Samsung', 'slug' => 'samsung']);

        // Create hardware products across all 15 slots
        $this->products['processor'] = Product::create([
            'title' => 'AMD Ryzen 7 7800X3D Gaming Processor AM5',
            'slug' => 'amd-ryzen-7-7800x3d',
            'sku' => 'CPU-7800X3D',
            'category_id' => $this->categories['processor']->id,
            'brand_id' => $this->brands['amd']->id,
            'price' => 45000,
            'regular_price' => 48000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $this->products['motherboard'] = Product::create([
            'title' => 'ASUS ROG STRIX B650E-F GAMING WIFI AM5 DDR5 Motherboard',
            'slug' => 'asus-rog-strix-b650e-f',
            'sku' => 'MB-B650E-F',
            'category_id' => $this->categories['motherboard']->id,
            'brand_id' => $this->brands['asus']->id,
            'price' => 32000,
            'regular_price' => 35000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $this->products['ram'] = Product::create([
            'title' => 'Corsair Vengeance RGB 32GB DDR5 6000MHz RAM',
            'slug' => 'corsair-vengeance-rgb-32gb-ddr5',
            'sku' => 'RAM-32GB-D5',
            'category_id' => $this->categories['ram']->id,
            'brand_id' => $this->brands['corsair']->id,
            'price' => 14500,
            'regular_price' => 16000,
            'stock' => 12,
            'is_active' => true,
        ]);

        $this->products['storage'] = Product::create([
            'title' => 'Samsung 990 PRO 2TB PCIe 4.0 NVMe SSD',
            'slug' => 'samsung-990-pro-2tb',
            'sku' => 'SSD-990P-2TB',
            'category_id' => $this->categories['storage']->id,
            'brand_id' => $this->brands['samsung']->id,
            'price' => 22000,
            'regular_price' => 24000,
            'stock' => 8,
            'is_active' => true,
        ]);

        $this->products['graphics-card'] = Product::create([
            'title' => 'ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X',
            'slug' => 'asus-tuf-rtx-4080-super',
            'sku' => 'GPU-4080S',
            'category_id' => $this->categories['graphics-card']->id,
            'brand_id' => $this->brands['asus']->id,
            'price' => 142000,
            'regular_price' => 150000,
            'stock' => 4,
            'is_active' => true,
        ]);

        $this->products['power-supply'] = Product::create([
            'title' => 'Corsair RM850x 850W 80 Plus Gold Fully Modular PSU',
            'slug' => 'corsair-rm850x-850w',
            'sku' => 'PSU-RM850X',
            'category_id' => $this->categories['power-supply']->id,
            'brand_id' => $this->brands['corsair']->id,
            'price' => 16500,
            'regular_price' => 18000,
            'stock' => 6,
            'is_active' => true,
        ]);

        $this->products['cpu-cooler'] = Product::create([
            'title' => 'Corsair iCUE H150i ELITE CAPELLIX XT 360mm Liquid Cooler',
            'slug' => 'corsair-icue-h150i-elite',
            'sku' => 'CLR-H150I',
            'category_id' => $this->categories['cpu-cooler']->id,
            'brand_id' => $this->brands['corsair']->id,
            'price' => 21000,
            'regular_price' => 23000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $this->products['casing'] = Product::create([
            'title' => 'Corsair 4000D AIRFLOW Tempered Glass Mid-Tower Case',
            'slug' => 'corsair-4000d-airflow',
            'sku' => 'CAS-4000D',
            'category_id' => $this->categories['casing']->id,
            'brand_id' => $this->brands['corsair']->id,
            'price' => 8800,
            'regular_price' => 9500,
            'stock' => 7,
            'is_active' => true,
        ]);

        $this->products['monitor'] = Product::create([
            'title' => 'ASUS TUF Gaming VG27AQ 27 inch 165Hz 2K IPS Monitor',
            'slug' => 'asus-tuf-vg27aq',
            'sku' => 'MON-VG27AQ',
            'category_id' => $this->categories['monitor']->id,
            'brand_id' => $this->brands['asus']->id,
            'price' => 38500,
            'regular_price' => 41000,
            'stock' => 3,
            'is_active' => true,
        ]);

        $this->products['case-fan'] = Product::create([
            'title' => 'Corsair AF120 RGB ELITE 120mm Triple Fan Pack',
            'slug' => 'corsair-af120-rgb-triple',
            'sku' => 'FAN-AF120-3PK',
            'category_id' => $this->categories['case-fan']->id,
            'brand_id' => $this->brands['corsair']->id,
            'price' => 6500,
            'regular_price' => 7200,
            'stock' => 15,
            'is_active' => true,
        ]);

        $this->products['ups'] = Product::create([
            'title' => 'MaxGreen 1200VA Offline UPS with Metal Body',
            'slug' => 'maxgreen-1200va-ups',
            'sku' => 'UPS-MG-1200VA',
            'category_id' => $this->categories['ups']->id,
            'price' => 8500,
            'regular_price' => 9200,
            'stock' => 10,
            'is_active' => true,
        ]);

        $this->products['software'] = Product::create([
            'title' => 'Microsoft Windows 11 Pro 64-Bit OEM DVD',
            'slug' => 'microsoft-windows-11-pro-oem',
            'sku' => 'SFT-WIN11-PRO',
            'category_id' => $this->categories['software']->id,
            'price' => 16500,
            'regular_price' => 18000,
            'stock' => 20,
            'is_active' => true,
        ]);

        $this->products['mouse'] = Product::create([
            'title' => 'Logitech G502 HERO High Performance Gaming Mouse',
            'slug' => 'logitech-g502-hero',
            'sku' => 'MSE-G502-HERO',
            'category_id' => $this->categories['mouse']->id,
            'price' => 5200,
            'regular_price' => 5800,
            'stock' => 25,
            'is_active' => true,
        ]);

        $this->products['keyboard'] = Product::create([
            'title' => 'Corsair K70 RGB PRO Mechanical Gaming Keyboard',
            'slug' => 'corsair-k70-rgb-pro',
            'sku' => 'KBD-K70-PRO',
            'category_id' => $this->categories['keyboard']->id,
            'brand_id' => $this->brands['corsair']->id,
            'price' => 14500,
            'regular_price' => 16000,
            'stock' => 8,
            'is_active' => true,
        ]);

        $this->products['headphone'] = Product::create([
            'title' => 'Corsair HS80 RGB WIRELESS Premium Gaming Headset',
            'slug' => 'corsair-hs80-wireless',
            'sku' => 'HDP-HS80-WL',
            'category_id' => $this->categories['headphone']->id,
            'brand_id' => $this->brands['corsair']->id,
            'price' => 16500,
            'regular_price' => 18000,
            'stock' => 6,
            'is_active' => true,
        ]);
    }

    public function test_complete_15_component_selection_and_totals(): void
    {
        $expectedTotal = 0;
        $expectedRegular = 0;

        foreach ($this->products as $slotKey => $product) {
            $response = $this->post("/pc-builder/add/{$slotKey}/{$product->id}");
            $response->assertRedirect('/pc-builder');
            $expectedTotal += (int)$product->price;
            $expectedRegular += (int)($product->regular_price ?: $product->price);
        }

        $dashboard = $this->get('/pc-builder');
        $dashboard->assertStatus(200);
        $dashboard->assertInertia(fn ($page) => $page
            ->component('PcBuilder')
            ->where('summary.configured_count', 15)
            ->where('summary.total_price', fn ($val) => (float)$val == (float)$expectedTotal)
            ->where('summary.regular_price', fn ($val) => (float)$val == (float)$expectedRegular)
            ->where('summary.is_complete', true)
            ->where('summary.missing_required', [])
        );
    }

    public function test_high_draw_psu_wattage_warning(): void
    {
        // 450W PSU with 7800X3D + RTX 4080 Super (estimated draw ~600W)
        $lowPsu = Product::create([
            'title' => 'Antec Atom V450 450W Non-Modular PSU',
            'slug' => 'antec-atom-v450',
            'sku' => 'PSU-ANT-450W',
            'category_id' => $this->categories['power-supply']->id,
            'price' => 3200,
            'stock' => 10,
            'is_active' => true,
        ]);

        $compatibility = PcBuilderService::checkCompatibility([
            'processor' => $this->products['processor']->id,
            'graphics-card' => $this->products['graphics-card']->id,
            'power-supply' => $lowPsu->id,
        ]);

        $this->assertNotEmpty($compatibility['warnings']);
        $this->assertStringContainsString('Power Alert: Estimated total draw', $compatibility['warnings'][0]);
        $this->assertStringContainsString('450W Power Supply may be under-powered', $compatibility['warnings'][0]);
    }

    public function test_component_choose_filters_and_sorting_scenarios(): void
    {
        // Test price range filtering
        $response = $this->get('/pc-builder/build/component/choose/processor?min_price=40000&max_price=50000');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.id', $this->products['processor']->id)
        );

        // Test sorting price high to low
        $responseSort = $this->get('/pc-builder/build/component/choose/ram?sort=price_high_low');
        $responseSort->assertStatus(200);
        $responseSort->assertInertia(fn ($page) => $page
            ->has('products.data')
        );
    }

    public function test_add_to_cart_and_complete_checkout_journey(): void
    {
        $this->actingAs($this->customer);

        // Select required components in session
        $this->withSession([
            'pc_build' => [
                'processor' => $this->products['processor']->id,
                'motherboard' => $this->products['motherboard']->id,
                'ram' => $this->products['ram']->id,
                'storage' => $this->products['storage']->id,
                'power-supply' => $this->products['power-supply']->id,
                'casing' => $this->products['casing']->id,
            ]
        ]);

        // Transfer to Cart
        $cartTransfer = $this->post('/pc-builder/add-to-cart');
        $cartTransfer->assertRedirect('/cart');

        $cart = session('cart');
        $this->assertCount(6, $cart);

        $orderPayload = [
            'customer_name' => 'Tanvir Ahmed',
            'customer_email' => 'customer@techmarket.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'House 12, Road 4, Dhanmondi, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
        ];

        $checkoutResponse = $this->withSession(['cart' => $cart])->post('/checkout', $orderPayload);
        $checkoutResponse->assertRedirect();

        // Verify order created in database with 6 items
        $this->assertDatabaseHas('orders', [
            'customer_email' => 'customer@techmarket.com',
            'payment_method' => 'cod',
            'payment_status' => 'Pending',
            'status' => 'Pending',
        ]);

        $order = Order::where('customer_email', 'customer@techmarket.com')->latest()->first();
        $this->assertNotNull($order);
        $this->assertCount(6, $order->items);
    }

    public function test_saved_pc_build_lifecycle_and_account_view(): void
    {
        $this->actingAs($this->customer);

        $this->withSession([
            'pc_build' => [
                'processor' => $this->products['processor']->id,
                'motherboard' => $this->products['motherboard']->id,
                'ram' => $this->products['ram']->id,
            ]
        ]);

        // Save build
        $saveResponse = $this->post('/pc-builder/save', [
            'name' => 'My Dream Gaming PC 2026',
        ]);
        $saveResponse->assertSessionHas('success');

        $saved = SavedPcBuild::where('user_id', $this->customer->id)->first();
        $this->assertNotNull($saved);
        $this->assertEquals('My Dream Gaming PC 2026', $saved->name);
        $this->assertEquals(91500.00, $saved->total_price);

        // View account saved builds page
        $accountPage = $this->get('/account/saved-pc-builds');
        $accountPage->assertStatus(200);
        $accountPage->assertInertia(fn ($page) => $page
            ->component('Account/SavedPcBuilds')
            ->has('builds', 1)
            ->where('builds.0.name', 'My Dream Gaming PC 2026')
            ->where('builds.0.component_count', 3)
        );

        // Load build back into builder
        $loadResponse = $this->post("/pc-builder/load/{$saved->id}");
        $loadResponse->assertRedirect('/pc-builder');
        $this->assertEquals($this->products['processor']->id, session('pc_build.processor'));

        // Delete build
        $deleteResponse = $this->delete("/pc-builder/builds/{$saved->id}");
        $deleteResponse->assertSessionHas('success');
        $this->assertDatabaseMissing('saved_pc_builds', ['id' => $saved->id]);
    }

    public function test_edge_case_stale_product_in_session_is_handled(): void
    {
        // Session has a deleted/non-existent product ID
        $this->withSession([
            'pc_build' => [
                'processor' => 9999999, // Stale ID
                'motherboard' => $this->products['motherboard']->id,
            ]
        ]);

        $dashboard = $this->get('/pc-builder');
        $dashboard->assertStatus(200);
        $dashboard->assertInertia(fn ($page) => $page
            ->component('PcBuilder')
            ->where('summary.configured_count', 1)
            ->where('selectedBuild.processor', null)
            ->where('selectedBuild.motherboard.id', $this->products['motherboard']->id)
        );
    }
}
