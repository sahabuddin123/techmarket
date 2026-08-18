<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Navigation;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DynamicNavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_and_delete_dynamic_navigation_menu_links(): void
    {
        $admin = User::create(['name' => 'Nav Admin', 'email' => 'admin.nav@test.com', 'password' => bcrypt('password'), 'role' => 'admin']);

        $this->actingAs($admin);

        $response = $this->post('/admin/navigation', [
            'title' => 'Weekly Deals',
            'url' => '/catalog?deal=weekly',
            'location' => 'header',
            'sort_order' => 1,
            'is_visible' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('navigations', ['title' => 'Weekly Deals']);

        $nav = Navigation::where('title', 'Weekly Deals')->first();
        $delRes = $this->delete("/admin/navigation/{$nav->id}");
        $delRes->assertRedirect();
        $this->assertDatabaseMissing('navigations', ['id' => $nav->id]);
    }
}
