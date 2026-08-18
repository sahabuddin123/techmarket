<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SystemHealthWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_system_health_workspace(): void
    {
        $admin = User::create(['name' => 'Health Admin', 'email' => 'admin.health@test.com', 'password' => bcrypt('password'), 'role' => 'admin']);

        $this->actingAs($admin);

        $response = $this->get('/admin/system-health');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/SystemHealth/Index')->has('metrics'));
    }

    public function test_admin_can_access_dashboard_via_both_routes(): void
    {
        $admin = User::create(['name' => 'Admin Officer', 'email' => 'officer@test.com', 'password' => bcrypt('password'), 'role' => 'admin']);

        $this->actingAs($admin);

        $res1 = $this->get('/admin');
        $res1->assertStatus(200);
        $res1->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));

        $res2 = $this->get('/admin/dashboard');
        $res2->assertStatus(200);
        $res2->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));
    }
}
