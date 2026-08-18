<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RbacSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_rbac_roles_and_permissions_are_enforced_strictly(): void
    {
        $viewerRole = Role::create(['name' => 'Viewer', 'display_name' => 'Viewer']);
        $viewerPerm = Permission::create(['name' => 'products.view', 'group' => 'products', 'display_name' => 'View Products']);
        $viewerRole->permissions()->attach($viewerPerm);

        $viewerUser = User::create([
            'name' => 'Viewer User',
            'email' => 'viewer@test.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);
        $viewerUser->roles()->attach($viewerRole);

        $this->assertTrue($viewerUser->hasPermission('products.view'));
        $this->assertFalse($viewerUser->hasPermission('products.delete'));

        $superAdminRole = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $superUser = User::create([
            'name' => 'Super User',
            'email' => 'super@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        $superUser->roles()->attach($superAdminRole);

        // Super Admin has all permissions
        $this->assertTrue($superUser->hasPermission('products.delete'));
        $this->assertTrue($superUser->hasPermission('settings.manage'));
    }
}
