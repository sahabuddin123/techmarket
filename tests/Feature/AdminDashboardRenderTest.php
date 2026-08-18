<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

class AdminDashboardRenderTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_renders_successfully(): void
    {
        $role = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $admin->roles()->attach($role);

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('metrics')
            ->has('analytics')
            ->has('recentOrders')
        );

        // Verify Storefront Home
        $homeRes = $this->get('/');
        $homeRes->assertStatus(200);
        $homeRes->assertInertia(fn (Assert $page) => $page->component('Home'));

        // Verify Admin Products
        $prodRes = $this->actingAs($admin)->get('/admin/products');
        $prodRes->assertStatus(200);
        $prodRes->assertInertia(fn (Assert $page) => $page->component('Admin/Products/Index'));

        // Verify Admin Orders
        $orderRes = $this->actingAs($admin)->get('/admin/orders');
        $orderRes->assertStatus(200);
        $orderRes->assertInertia(fn (Assert $page) => $page->component('Admin/Orders/Index'));
    }
}
