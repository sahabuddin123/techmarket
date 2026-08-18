<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Offer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

class OfferCampaignSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Product $product1;
    protected Product $product2;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $superAdminRole = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Administrator']);
        $perms = ['offers.manage', 'homepage.manage', 'settings.manage', 'products.view'];
        foreach ($perms as $permName) {
            $p = Permission::create(['name' => $permName, 'group' => 'admin', 'display_name' => $permName]);
            $superAdminRole->permissions()->attach($p);
        }

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@techmarketbd.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($superAdminRole);

        $this->customer = User::create([
            'name' => 'General Customer',
            'email' => 'customer@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $cat = Category::create(['name' => 'Laptops', 'slug' => 'laptops']);
        $brand = Brand::create(['name' => 'ASUS', 'slug' => 'asus']);

        $this->product1 = Product::create([
            'title' => 'ASUS ROG Strix G16 Gaming Laptop',
            'slug' => 'asus-rog-strix-g16',
            'sku' => 'LAP-ASUS-G16',
            'price' => 195000,
            'regular_price' => 210000,
            'stock' => 10,
            'category_id' => $cat->id,
            'brand_id' => $brand->id,
        ]);

        $this->product2 = Product::create([
            'title' => 'Lenovo Legion Pro 5',
            'slug' => 'lenovo-legion-pro-5',
            'sku' => 'LAP-LEN-PRO5',
            'price' => 180000,
            'regular_price' => 190000,
            'stock' => 5,
            'category_id' => $cat->id,
            'brand_id' => $brand->id,
        ]);
    }

    /** @test */
    public function admin_can_create_an_offer()
    {
        $response = $this->actingAs($this->admin)->post('/admin/offers', [
            'title' => 'Spider-Man Laptop Extravaganza',
            'slug' => 'spiderman-laptop-extravaganza',
            'short_description' => 'Get free movie tickets on all laptops.',
            'headline' => 'LAPTOP কিনলেই SPIDER-MAN MOVIE TICKET FREE!',
            'status' => 'active',
            'is_active' => true,
            'is_featured' => true,
            'display_order' => 1,
            'product_ids' => [$this->product1->id, $this->product2->id],
            'product_badges' => [
                $this->product1->id => 'FREE TICKET',
                $this->product2->id => 'HOT DEAL',
            ],
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('offers', [
            'slug' => 'spiderman-laptop-extravaganza',
            'status' => 'active',
            'is_active' => true,
        ]);

        $offer = Offer::where('slug', 'spiderman-laptop-extravaganza')->first();
        $this->assertCount(2, $offer->products);
        $this->assertEquals('FREE TICKET', $offer->products()->first()->pivot->badge);
    }

    /** @test */
    public function unauthorized_users_cannot_manage_offers()
    {
        $response = $this->actingAs($this->customer)->get('/admin/offers');
        $response->assertStatus(403);

        $postResponse = $this->actingAs($this->customer)->post('/admin/offers', [
            'title' => 'Hacker Offer',
            'status' => 'active',
        ]);
        $postResponse->assertStatus(403);
    }

    /** @test */
    public function admin_can_edit_offer_information()
    {
        $offer = Offer::create([
            'title' => 'Old Title',
            'slug' => 'old-title',
            'status' => 'active',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->put("/admin/offers/{$offer->id}", [
            'title' => 'Brand New Updated Offer Title',
            'slug' => 'brand-new-updated-offer-title',
            'short_description' => 'Updated summary text.',
            'status' => 'active',
            'is_active' => true,
            'display_order' => 5,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('offers', [
            'id' => $offer->id,
            'title' => 'Brand New Updated Offer Title',
            'slug' => 'brand-new-updated-offer-title',
            'display_order' => 5,
        ]);
    }

    /** @test */
    public function admin_can_attach_and_remove_products()
    {
        $offer = Offer::create([
            'title' => 'Monitor Fest',
            'slug' => 'monitor-fest',
            'status' => 'active',
            'is_active' => true,
        ]);

        // Attach product1
        $this->actingAs($this->admin)->put("/admin/offers/{$offer->id}", [
            'title' => 'Monitor Fest',
            'slug' => 'monitor-fest',
            'status' => 'active',
            'is_active' => true,
            'product_ids' => [$this->product1->id],
        ]);
        $this->assertCount(1, $offer->fresh()->products);

        // Remove product1 and attach product2
        $this->actingAs($this->admin)->put("/admin/offers/{$offer->id}", [
            'title' => 'Monitor Fest',
            'slug' => 'monitor-fest',
            'status' => 'active',
            'is_active' => true,
            'product_ids' => [$this->product2->id],
        ]);
        $this->assertCount(1, $offer->fresh()->products);
        $this->assertEquals($this->product2->id, $offer->fresh()->products->first()->id);
    }

    /** @test */
    public function offer_slug_uniqueness_works()
    {
        Offer::create([
            'title' => 'Mega Campaign',
            'slug' => 'mega-campaign',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->admin)->post('/admin/offers', [
            'title' => 'Another Campaign',
            'slug' => 'mega-campaign',
            'status' => 'active',
        ]);

        $response->assertSessionHasErrors('slug');
    }

    /** @test */
    public function offer_schedule_validation_works()
    {
        $response = $this->actingAs($this->admin)->post('/admin/offers', [
            'title' => 'Invalid Date Campaign',
            'slug' => 'invalid-date-campaign',
            'start_at' => now()->addDays(5)->toDateTimeString(),
            'end_at' => now()->addDays(2)->toDateTimeString(), // End before start
            'status' => 'active',
        ]);

        $response->assertSessionHasErrors('end_at');
    }

    /** @test */
    public function active_offer_appears_on_public_offers_page()
    {
        $offer = Offer::create([
            'title' => 'Public Active Deal',
            'slug' => 'public-active-deal',
            'status' => 'active',
            'is_active' => true,
            'display_order' => 1,
        ]);

        $response = $this->get('/offers');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Offers/Index')
            ->has('offers.data', 1)
            ->where('offers.data.0.title', 'Public Active Deal')
        );
    }

    /** @test */
    public function draft_or_disabled_offer_is_not_publicly_exposed()
    {
        Offer::create([
            'title' => 'Draft Secret Deal',
            'slug' => 'draft-secret-deal',
            'status' => 'draft',
            'is_active' => false,
        ]);

        $response = $this->get('/offers');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->has('offers.data', 0)
        );

        $showResponse = $this->get('/offers/draft-secret-deal');
        $showResponse->assertStatus(404);
    }

    /** @test */
    public function expired_offer_status_is_correctly_handled()
    {
        $expiredOffer = Offer::create([
            'title' => 'Expired Summer Sale',
            'slug' => 'expired-summer-sale',
            'start_at' => now()->subDays(10),
            'end_at' => now()->subDays(2),
            'status' => 'active',
            'is_active' => true,
        ]);

        $this->assertEquals('expired', $expiredOffer->computed_status);
        $this->assertTrue($expiredOffer->is_expired);
    }

    /** @test */
    public function scheduled_offer_status_is_correctly_handled()
    {
        $futureOffer = Offer::create([
            'title' => 'Upcoming Winter Sale',
            'slug' => 'upcoming-winter-sale',
            'start_at' => now()->addDays(5),
            'end_at' => now()->addDays(15),
            'status' => 'scheduled',
            'is_active' => true,
        ]);

        $this->assertEquals('scheduled', $futureOffer->computed_status);
        $this->assertTrue($futureOffer->is_scheduled);
    }

    /** @test */
    public function offer_detail_page_renders_cleanly_with_attached_products()
    {
        $offer = Offer::create([
            'title' => 'laptop spider-man',
            'slug' => 'laptop-spider-man',
            'headline' => 'LAPTOP কিনলেই SPIDER-MAN MOVIE TICKET FREE!',
            'status' => 'active',
            'is_active' => true,
        ]);

        $offer->products()->attach($this->product1->id, [
            'display_order' => 1,
            'badge' => 'FREE MOVIE TICKET',
        ]);

        $response = $this->get('/offers/laptop-spider-man');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Offers/Show')
            ->where('offer.title', 'laptop spider-man')
            ->has('products.data', 1)
            ->where('products.data.0.title', 'ASUS ROG Strix G16 Gaming Laptop')
        );
    }

    /** @test */
    public function admin_can_duplicate_an_offer()
    {
        $offer = Offer::create([
            'title' => 'Original Campaign',
            'slug' => 'original-campaign',
            'status' => 'active',
            'is_active' => true,
        ]);
        $offer->products()->attach($this->product1->id, ['badge' => 'SPECIAL']);

        $response = $this->actingAs($this->admin)->post("/admin/offers/{$offer->id}/duplicate");
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('offers', [
            'title' => 'Original Campaign (Copy)',
            'status' => 'draft',
            'is_active' => false,
        ]);

        $copy = Offer::where('title', 'Original Campaign (Copy)')->first();
        $this->assertCount(1, $copy->products);
    }

    /** @test */
    public function admin_can_delete_offer_safely()
    {
        $offer = Offer::create([
            'title' => 'Temporary Deal',
            'slug' => 'temporary-deal',
            'status' => 'active',
            'is_active' => true,
        ]);
        $offer->products()->attach($this->product1->id);

        $response = $this->actingAs($this->admin)->delete("/admin/offers/{$offer->id}");
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('offers', ['id' => $offer->id]);
        $this->assertDatabaseMissing('offer_products', ['offer_id' => $offer->id]);
    }
}
