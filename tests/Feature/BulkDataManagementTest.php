<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\BulkExport;
use App\Models\BulkImport;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use App\Services\BulkData\BulkExportService;
use App\Services\BulkData\BulkImportService;
use App\Services\BulkData\TemplateGeneratorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BulkDataManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UnitSeeder::class);
        $this->seed(\Database\Seeders\BulkDataPermissionSeeder::class);

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin_bulk@techmarket.com',
        ]);

        $this->customer = User::factory()->create([
            'role' => 'customer',
            'email' => 'customer_bulk@techmarket.com',
        ]);
    }

    public function test_unauthorized_users_cannot_access_data_management_routes(): void
    {
        $this->actingAs($this->customer)
            ->get(route('admin.data-management'))
            ->assertForbidden();

        $this->actingAs($this->customer)
            ->get(route('admin.units'))
            ->assertForbidden();
    }

    public function test_admin_can_access_data_management_dashboard_and_units(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.data-management'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/DataManagement/Index'));

        $this->actingAs($this->admin)
            ->get(route('admin.units'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Units/Index'));
    }

    public function test_unit_crud_management(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.units.store'), [
                'name' => 'Custom Box 24',
                'short_code' => 'box24',
                'symbol' => 'bx24',
                'type' => 'quantity',
                'conversion_factor' => 24.0,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('units', [
            'short_code' => 'box24',
            'conversion_factor' => 24.0,
        ]);

        $unit = Unit::where('short_code', 'box24')->first();

        $this->actingAs($this->admin)
            ->put(route('admin.units.update', $unit->id), [
                'name' => 'Custom Box 24 Upgraded',
                'short_code' => 'box24',
                'type' => 'quantity',
                'conversion_factor' => 24.0,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('units', [
            'name' => 'Custom Box 24 Upgraded',
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.units.delete', $unit->id))
            ->assertRedirect();

        $this->assertDatabaseMissing('units', [
            'short_code' => 'box24',
        ]);
    }

    public function test_product_bulk_import_creates_new_products_with_relation_resolution(): void
    {
        $cat = Category::create(['name' => 'Monitors', 'slug' => 'monitors']);
        $brand = Brand::create(['name' => 'Gigabyte', 'slug' => 'gigabyte']);
        $unit = Unit::where('short_code', 'pcs')->first();

        $csvContent = "SKU,Product Title,Category,Brand,Unit,Selling Price,Regular Price,Cost Price,Stock Quantity,Status\n"
            . "MON-GIGA-M27Q,Gigabyte M27Q 27-inch 170Hz Gaming Monitor,Monitors,Gigabyte,pcs,38500,42000,32000,20,Active\n"
            . "MON-GIGA-G24F,Gigabyte G24F-2 24-inch 180Hz Monitor,monitors,gigabyte,pcs,22000,24500,18500,15,Active\n";

        Storage::fake('local');
        $file = UploadedFile::fake()->createWithContent('products.csv', $csvContent);

        // Upload and auto-map
        $uploadRes = $this->actingAs($this->admin)
            ->postJson(route('admin.data-management.import.upload'), [
                'entity_type' => 'products',
                'mode' => 'create_or_update',
                'file' => $file,
            ])
            ->assertOk();

        $importId = $uploadRes->json('import_id');
        $this->assertNotNull($importId);

        // Validation Preview
        $previewRes = $this->actingAs($this->admin)
            ->postJson(route('admin.data-management.import.preview', $importId), [
                'column_mapping' => $uploadRes->json('auto_mapping'),
            ])
            ->assertOk();

        $this->assertEquals(2, $previewRes->json('results.valid_count'));
        $this->assertEquals(0, $previewRes->json('results.error_count'));

        // Execute Import
        $execRes = $this->actingAs($this->admin)
            ->postJson(route('admin.data-management.import.execute', $importId), [
                'is_dry_run' => false,
            ])
            ->assertOk();

        $this->assertEquals(2, $execRes->json('import.created_rows'));
        $this->assertEquals('completed', $execRes->json('import.status'));

        $this->assertDatabaseHas('products', [
            'sku' => 'MON-GIGA-M27Q',
            'category_id' => $cat->id,
            'brand_id' => $brand->id,
            'price' => 38500.00,
            'stock' => 20,
        ]);
    }

    public function test_product_bulk_import_updates_existing_product_and_handles_errors(): void
    {
        $cat = Category::create(['name' => 'Processors', 'slug' => 'processors']);
        $brand = Brand::create(['name' => 'AMD', 'slug' => 'amd']);

        $existingProduct = Product::create([
            'title' => 'AMD Ryzen 7 7800X3D',
            'slug' => 'amd-ryzen-7-7800x3d',
            'sku' => 'CPU-AMD-7800X3D',
            'category_id' => $cat->id,
            'brand_id' => $brand->id,
            'price' => 45000,
            'stock' => 10,
        ]);

        $csvContent = "SKU,Product Title,Category,Brand,Unit,Selling Price,Stock Quantity\n"
            . "CPU-AMD-7800X3D,AMD Ryzen 7 7800X3D Gaming Processor,Processors,AMD,pcs,48000,25\n"
            . "INVALID-ROW,,NonExistentCat,UnknownBrand,pcs,-500,-10\n";

        Storage::fake('local');
        $file = UploadedFile::fake()->createWithContent('products_update.csv', $csvContent);

        $uploadRes = $this->actingAs($this->admin)
            ->postJson(route('admin.data-management.import.upload'), [
                'entity_type' => 'products',
                'mode' => 'create_or_update',
                'file' => $file,
            ])
            ->assertOk();

        $importId = $uploadRes->json('import_id');

        $execRes = $this->actingAs($this->admin)
            ->postJson(route('admin.data-management.import.execute', $importId), [
                'is_dry_run' => false,
            ])
            ->assertOk();

        $this->assertEquals(1, $execRes->json('import.updated_rows'));
        $this->assertEquals(1, $execRes->json('import.failed_rows'));
        $this->assertEquals('completed_with_errors', $execRes->json('import.status'));

        $this->assertDatabaseHas('products', [
            'sku' => 'CPU-AMD-7800X3D',
            'price' => 48000.00,
            'stock' => 25,
        ]);
    }

    public function test_category_bulk_import_with_parent_hierarchy(): void
    {
        $csvContent = "Category Name,URL Slug,Parent Category,Description\n"
            . "Computer Hardware,computer-hardware,,Core hardware components\n"
            . "Graphics Cards,graphics-cards,Computer Hardware,Discrete GPUs\n"
            . "NVIDIA GeForce,nvidia-geforce,graphics-cards,RTX Series GPUs\n";

        Storage::fake('local');
        $file = UploadedFile::fake()->createWithContent('categories.csv', $csvContent);

        $uploadRes = $this->actingAs($this->admin)
            ->postJson(route('admin.data-management.import.upload'), [
                'entity_type' => 'categories',
                'mode' => 'create_or_update',
                'file' => $file,
            ])
            ->assertOk();

        $importId = $uploadRes->json('import_id');

        $execRes = $this->actingAs($this->admin)
            ->postJson(route('admin.data-management.import.execute', $importId), [
                'is_dry_run' => false,
            ])
            ->assertOk();

        $this->assertEquals(3, $execRes->json('import.created_rows'));

        $parent = Category::where('slug', 'computer-hardware')->first();
        $child = Category::where('slug', 'graphics-cards')->first();
        $grandchild = Category::where('slug', 'nvidia-geforce')->first();

        $this->assertNotNull($parent);
        $this->assertNotNull($child);
        $this->assertNotNull($grandchild);

        $this->assertEquals($parent->id, $child->parent_id);
        $this->assertEquals($child->id, $grandchild->parent_id);
    }

    public function test_brand_bulk_import_and_export(): void
    {
        $csvContent = "Brand Name,URL Slug,Official Website URL,Brand Description\n"
            . "Corsair,corsair,https://www.corsair.com,Premium gaming peripherals and power supplies\n"
            . "Noctua,noctua,https://noctua.at,Austrian CPU cooling specialists\n";

        Storage::fake('local');
        $file = UploadedFile::fake()->createWithContent('brands.csv', $csvContent);

        $uploadRes = $this->actingAs($this->admin)
            ->postJson(route('admin.data-management.import.upload'), [
                'entity_type' => 'brands',
                'mode' => 'create_or_update',
                'file' => $file,
            ])
            ->assertOk();

        $this->actingAs($this->admin)
            ->postJson(route('admin.data-management.import.execute', $uploadRes->json('import_id')), [
                'is_dry_run' => false,
            ])
            ->assertOk();

        $this->assertDatabaseHas('brands', ['name' => 'Corsair']);
        $this->assertDatabaseHas('brands', ['name' => 'Noctua']);

        // Test Export
        $exportRes = $this->actingAs($this->admin)
            ->post(route('admin.data-management.export.execute'), [
                'entity_type' => 'brands',
                'format' => 'csv',
                'columns' => ['name', 'slug', 'website_url'],
            ]);

        $exportRes->assertOk();
    }

    public function test_template_downloads_generate_clean_csv_and_xlsx_workbooks(): void
    {
        $csvRes = $this->actingAs($this->admin)
            ->get(route('admin.data-management.template', ['entity' => 'products', 'format' => 'csv']));
        $csvRes->assertOk();

        $xlsxRes = $this->actingAs($this->admin)
            ->get(route('admin.data-management.template', ['entity' => 'products', 'format' => 'xlsx']));
        $xlsxRes->assertOk();
    }
}
