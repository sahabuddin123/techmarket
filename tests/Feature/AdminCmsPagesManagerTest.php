<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\CmsPage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminCmsPagesManagerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $adminRole = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $this->admin->roles()->sync([$adminRole->id]);
    }

    public function test_admin_can_view_cms_pages_list(): void
    {
        CmsPage::create([
            'title' => 'Custom Terms',
            'slug' => 'custom-terms',
            'content' => '',
            'is_published' => true,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/pages');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Pages/Index')
            ->has('pages.data')
        );
    }

    public function test_admin_can_create_cms_page_with_structured_sections(): void
    {
        $payload = [
            'title' => 'Return Policy',
            'slug' => 'return-policy',
            'sections' => [
                [
                    'badge' => '7-Day Return Window',
                    'paragraphs' => ['Customers can initiate returns within 7 calendar days of delivery.'],
                ],
            ],
            'meta_title' => 'Return Policy - TechMarket BD',
            'meta_description' => 'Official return and replacement policy at TechMarket BD.',
            'is_published' => true,
        ];

        $response = $this->actingAs($this->admin)->post('/admin/pages', $payload);

        $response->assertRedirect('/admin/pages');
        $this->assertDatabaseHas('cms_pages', ['slug' => 'return-policy', 'title' => 'Return Policy']);
    }

    public function test_admin_can_update_warranty_policy_and_change_clauses(): void
    {
        $page = CmsPage::create([
            'title' => 'Warranty Policy',
            'slug' => 'warranty-policy',
            'content' => '',
            'sections' => [
                [
                    'badge' => 'ওয়ারেন্টি নীতিমালা',
                    'paragraphs' => ['টেকমার্কেট অফিসিয়াল ওয়ারেন্টি সাপোর্ট প্রদান করে।'],
                ],
            ],
            'is_published' => true,
        ]);

        $updatePayload = [
            'title' => 'Warranty Policy Updated',
            'slug' => 'warranty-policy',
            'sections' => [
                [
                    'badge' => 'আপডেটেড ওয়ারেন্টি নীতিমালা',
                    'paragraphs' => ['টেকমার্কেট বিডি কর্তৃক প্রদত্ত অফিসিয়াল ওয়ারেন্টি শর্তাবলী।'],
                ],
            ],
            'meta_title' => 'Warranty Policy - TechMarket BD',
            'meta_description' => 'Updated warranty terms.',
            'is_published' => true,
        ];

        $response = $this->actingAs($this->admin)->put("/admin/pages/{$page->id}", $updatePayload);

        $response->assertRedirect('/admin/pages');
        $this->assertDatabaseHas('cms_pages', [
            'id' => $page->id,
            'title' => 'Warranty Policy Updated',
        ]);
    }

    public function test_system_page_cannot_be_deleted(): void
    {
        $page = CmsPage::create([
            'title' => 'Privacy Policy',
            'slug' => 'privacy-policy',
            'content' => '',
            'is_published' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/pages/{$page->id}");

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('cms_pages', ['id' => $page->id]);
    }
}
