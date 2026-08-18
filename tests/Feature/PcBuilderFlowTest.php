<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\SavedPcBuild;
use App\Models\User;
use App\Services\PcBuilderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PcBuilderFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $otherUser;
    protected Category $cpuCat;
    protected Category $mbCat;
    protected Category $ramCat;
    protected Category $storageCat;
    protected Category $gpuCat;
    protected Category $psuCat;
    protected Category $casingCat;
    protected Brand $intelBrand;
    protected Brand $amdBrand;
    protected Product $intelCpu;
    protected Product $amdCpu;
    protected Product $amdMotherboard;
    protected Product $intelMotherboard;
    protected Product $ddr4Ram;
    protected Product $ddr5Ram;
    protected Product $nvmeSsd;
    protected Product $goldPsu;
    protected Product $gamingCase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['email' => 'builder_user@example.com']);
        $this->otherUser = User::factory()->create(['email' => 'other_user@example.com']);

        $this->cpuCat = Category::create(['name' => 'Processor', 'slug' => 'processor']);
        $this->mbCat = Category::create(['name' => 'Motherboard', 'slug' => 'motherboard']);
        $this->ramCat = Category::create(['name' => 'RAM', 'slug' => 'ram']);
        $this->storageCat = Category::create(['name' => 'Storage', 'slug' => 'ssd']);
        $this->gpuCat = Category::create(['name' => 'Graphics Card', 'slug' => 'graphics-card']);
        $this->psuCat = Category::create(['name' => 'Power Supply', 'slug' => 'power-supply']);
        $this->casingCat = Category::create(['name' => 'Casing', 'slug' => 'casing']);

        $this->intelBrand = Brand::create(['name' => 'Intel', 'slug' => 'intel']);
        $this->amdBrand = Brand::create(['name' => 'AMD', 'slug' => 'amd']);

        $this->intelCpu = Product::create([
            'title' => 'Intel Core i5-10500 10th Gen LGA1200 Processor',
            'slug' => 'intel-core-i5-10500',
            'sku' => 'CPU-I5-10500',
            'category_id' => $this->cpuCat->id,
            'brand_id' => $this->intelBrand->id,
            'price' => 13900,
            'regular_price' => 15200,
            'stock' => 10,
            'is_active' => true,
        ]);

        $this->amdCpu = Product::create([
            'title' => 'AMD Ryzen 7 PRO 5750G AM4 Processor',
            'slug' => 'amd-ryzen-7-pro-5750g',
            'sku' => 'CPU-5750G',
            'category_id' => $this->cpuCat->id,
            'brand_id' => $this->amdBrand->id,
            'price' => 22500,
            'regular_price' => 23500,
            'stock' => 8,
            'is_active' => true,
        ]);

        $this->amdMotherboard = Product::create([
            'title' => 'MSI MAG B550 TOMAHAWK AM4 DDR4 Motherboard',
            'slug' => 'msi-mag-b550-tomahawk',
            'sku' => 'MB-MSI-B550',
            'category_id' => $this->mbCat->id,
            'brand_id' => $this->amdBrand->id,
            'price' => 16500,
            'regular_price' => 18000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $this->intelMotherboard = Product::create([
            'title' => 'ASUS PRIME Z790-P DDR5 LGA1700 ATX Motherboard',
            'slug' => 'asus-prime-z790-p-ddr5',
            'sku' => 'MB-ASUS-Z790P',
            'category_id' => $this->mbCat->id,
            'brand_id' => $this->intelBrand->id,
            'price' => 24500,
            'regular_price' => 26800,
            'stock' => 6,
            'is_active' => true,
        ]);

        $this->ddr4Ram = Product::create([
            'title' => 'Kingston FURY Beast 16GB DDR4 3200MHz RAM',
            'slug' => 'kingston-fury-beast-16gb-ddr4',
            'sku' => 'RAM-KNG-16D4',
            'category_id' => $this->ramCat->id,
            'price' => 4500,
            'regular_price' => 5200,
            'stock' => 20,
            'is_active' => true,
        ]);

        $this->ddr5Ram = Product::create([
            'title' => 'Corsair Vengeance RGB 32GB DDR5 6000MHz RAM',
            'slug' => 'corsair-vengeance-rgb-32gb-ddr5',
            'sku' => 'RAM-COR-32D5',
            'category_id' => $this->ramCat->id,
            'price' => 14500,
            'regular_price' => 16000,
            'stock' => 12,
            'is_active' => true,
        ]);

        $this->nvmeSsd = Product::create([
            'title' => 'Samsung 990 PRO 1TB PCIe 4.0 M.2 NVMe SSD',
            'slug' => 'samsung-990-pro-1tb-ssd',
            'sku' => 'SSD-SAM-990P',
            'category_id' => $this->storageCat->id,
            'price' => 15800,
            'regular_price' => 17500,
            'stock' => 15,
            'is_active' => true,
        ]);

        $this->goldPsu = Product::create([
            'title' => 'Corsair RM750e 750W 80 Plus Gold Modular PSU',
            'slug' => 'corsair-rm750e-750w-gold-psu',
            'sku' => 'PSU-COR-750W',
            'category_id' => $this->psuCat->id,
            'price' => 12800,
            'regular_price' => 14000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $this->gamingCase = Product::create([
            'title' => 'Antec NX410 Mid Tower ARGB Gaming Case',
            'slug' => 'antec-nx410-gaming-case',
            'sku' => 'CAS-ANT-NX410',
            'category_id' => $this->casingCat->id,
            'price' => 5200,
            'regular_price' => 5800,
            'stock' => 8,
            'is_active' => true,
        ]);
    }

    public function test_main_pc_builder_dashboard_renders_cleanly(): void
    {
        $response = $this->get('/pc-builder');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('PcBuilder')
            ->has('slots', 15)
            ->has('selectedBuild')
            ->has('summary')
            ->where('summary.configured_count', 0)
            ->where('summary.total_price', 0)
        );
    }

    public function test_component_category_page_loads_correct_products(): void
    {
        $response = $this->get('/pc-builder/build/component/choose/processor');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('PcBuilder/ComponentChoose')
            ->where('slot.key', 'processor')
            ->has('products.data', 2)
            ->has('availableBrands')
        );
    }

    public function test_invalid_component_slot_redirects_safely(): void
    {
        $response = $this->get('/pc-builder/build/component/choose/invalid-slot-key');
        $response->assertRedirect('/pc-builder');
        $response->assertSessionHas('error');
    }

    public function test_component_search_filters_by_product_name(): void
    {
        $response = $this->get('/pc-builder/build/component/choose/processor?search=Ryzen');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('PcBuilder/ComponentChoose')
            ->has('products.data', 1)
            ->where('products.data.0.title', 'AMD Ryzen 7 PRO 5750G AM4 Processor')
        );
    }

    public function test_component_brand_filter_works(): void
    {
        $response = $this->get('/pc-builder/build/component/choose/processor?brands=intel');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('PcBuilder/ComponentChoose')
            ->has('products.data', 1)
            ->where('products.data.0.title', 'Intel Core i5-10500 10th Gen LGA1200 Processor')
        );
    }

    public function test_component_sorting_price_low_to_high(): void
    {
        $response = $this->get('/pc-builder/build/component/choose/processor?sort=price_low_high');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('PcBuilder/ComponentChoose')
            ->where('products.data.0.price', 13900)
            ->where('products.data.1.price', 22500)
        );
    }

    public function test_add_component_to_builder_and_recalculate_totals(): void
    {
        $response = $this->post("/pc-builder/add/processor/{$this->amdCpu->id}");
        $response->assertRedirect('/pc-builder');
        $response->assertSessionHas('pc_build.processor', $this->amdCpu->id);

        $dashboard = $this->get('/pc-builder');
        $dashboard->assertInertia(fn ($page) => $page
            ->component('PcBuilder')
            ->where('summary.configured_count', 1)
            ->where('summary.total_price', 22500)
            ->where('selectedBuild.processor.id', $this->amdCpu->id)
        );
    }

    public function test_replacing_component_updates_slot_and_total(): void
    {
        $this->withSession(['pc_build' => ['processor' => $this->amdCpu->id]]);

        $response = $this->post("/pc-builder/add/processor/{$this->intelCpu->id}");
        $response->assertRedirect('/pc-builder');
        $this->assertEquals($this->intelCpu->id, session('pc_build.processor'));

        $dashboard = $this->get('/pc-builder');
        $dashboard->assertInertia(fn ($page) => $page
            ->where('summary.configured_count', 1)
            ->where('summary.total_price', 13900)
            ->where('selectedBuild.processor.id', $this->intelCpu->id)
        );
    }

    public function test_remove_component_from_builder(): void
    {
        $this->withSession(['pc_build' => ['processor' => $this->amdCpu->id, 'motherboard' => $this->amdMotherboard->id]]);

        $response = $this->post('/pc-builder/remove/processor');
        $response->assertRedirect('/pc-builder');
        $this->assertNull(session('pc_build.processor'));
        $this->assertEquals($this->amdMotherboard->id, session('pc_build.motherboard'));
    }

    public function test_clear_all_resets_the_entire_build(): void
    {
        $this->withSession([
            'pc_build' => [
                'processor' => $this->amdCpu->id,
                'motherboard' => $this->amdMotherboard->id,
                'ram' => $this->ddr4Ram->id,
            ]
        ]);

        $response = $this->post('/pc-builder/clear');
        $response->assertRedirect('/pc-builder');
        $this->assertEmpty(session('pc_build'));
    }

    public function test_hardware_compatibility_detects_socket_mismatch(): void
    {
        // AMD AM4 Processor paired with Intel LGA1700 Motherboard
        $compatibility = PcBuilderService::checkCompatibility([
            'processor' => $this->amdCpu->id,
            'motherboard' => $this->intelMotherboard->id,
        ]);

        $this->assertFalse($compatibility['is_compatible']);
        $this->assertNotEmpty($compatibility['errors']);
        $this->assertStringContainsString('Socket Mismatch', $compatibility['errors'][0]);
    }

    public function test_hardware_compatibility_detects_ram_generation_mismatch(): void
    {
        // DDR4 Motherboard paired with DDR5 RAM
        $compatibility = PcBuilderService::checkCompatibility([
            'motherboard' => $this->amdMotherboard->id,
            'ram' => $this->ddr5Ram->id,
        ]);

        $this->assertFalse($compatibility['is_compatible']);
        $this->assertNotEmpty($compatibility['errors']);
        $this->assertStringContainsString('Memory Type Mismatch', $compatibility['errors'][0]);
    }

    public function test_add_to_cart_transfers_all_configured_components(): void
    {
        $this->withSession([
            'pc_build' => [
                'processor' => $this->amdCpu->id,
                'motherboard' => $this->amdMotherboard->id,
                'ram' => $this->ddr4Ram->id,
                'storage' => $this->nvmeSsd->id,
                'power-supply' => $this->goldPsu->id,
                'casing' => $this->gamingCase->id,
            ]
        ]);

        $response = $this->post('/pc-builder/add-to-cart');
        $response->assertRedirect('/cart');

        $cart = session('cart');
        $this->assertCount(6, $cart);
        $this->assertArrayHasKey($this->amdCpu->id, $cart);
        $this->assertArrayHasKey($this->amdMotherboard->id, $cart);
        $this->assertArrayHasKey($this->ddr4Ram->id, $cart);
        $this->assertArrayHasKey($this->nvmeSsd->id, $cart);
        $this->assertArrayHasKey($this->goldPsu->id, $cart);
        $this->assertArrayHasKey($this->gamingCase->id, $cart);
    }

    public function test_authenticated_user_can_save_pc_build(): void
    {
        $this->actingAs($this->user);

        $this->withSession([
            'pc_build' => [
                'processor' => $this->amdCpu->id,
                'motherboard' => $this->amdMotherboard->id,
            ]
        ]);

        $response = $this->post('/pc-builder/save', [
            'name' => 'High-End Ryzen Gaming Build',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('saved_pc_builds', [
            'user_id' => $this->user->id,
            'name' => 'High-End Ryzen Gaming Build',
            'total_price' => 39000.00,
        ]);
    }

    public function test_user_can_load_saved_pc_build(): void
    {
        $this->actingAs($this->user);

        $savedBuild = SavedPcBuild::create([
            'user_id' => $this->user->id,
            'name' => 'My Workstation Rig',
            'components' => [
                'processor' => $this->intelCpu->id,
                'motherboard' => $this->intelMotherboard->id,
            ],
            'total_price' => 38400.00,
            'estimated_wattage' => 350,
        ]);

        $response = $this->post("/pc-builder/load/{$savedBuild->id}");
        $response->assertRedirect('/pc-builder');
        $this->assertEquals($this->intelCpu->id, session('pc_build.processor'));
        $this->assertEquals($this->intelMotherboard->id, session('pc_build.motherboard'));
    }

    public function test_unauthorized_user_cannot_load_or_delete_another_users_saved_build(): void
    {
        $savedBuild = SavedPcBuild::create([
            'user_id' => $this->user->id,
            'name' => 'Private Build',
            'components' => ['processor' => $this->intelCpu->id],
            'total_price' => 13900.00,
        ]);

        // Attempting to load as other user
        $this->actingAs($this->otherUser);
        $loadResponse = $this->post("/pc-builder/load/{$savedBuild->id}");
        $loadResponse->assertStatus(403);

        // Attempting to delete as other user
        $deleteResponse = $this->delete("/pc-builder/builds/{$savedBuild->id}");
        $deleteResponse->assertStatus(403);
    }
}
