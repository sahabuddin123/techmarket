<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            ['name' => 'cctv.view', 'group' => 'cctv', 'display_name' => 'View CCTV Dashboard & Estimates'],
            ['name' => 'cctv.manage_profiles', 'group' => 'cctv', 'display_name' => 'Manage CCTV Product Profiles'],
            ['name' => 'cctv.manage_rules', 'group' => 'cctv', 'display_name' => 'Manage CCTV Rule Engine'],
            ['name' => 'cctv.manage_compatibility', 'group' => 'cctv', 'display_name' => 'Manage CCTV Compatibility Rules'],
            ['name' => 'cctv.manage_calculations', 'group' => 'cctv', 'display_name' => 'Manage CCTV Calculation Parameters'],
            ['name' => 'cctv.manage_recommendations', 'group' => 'cctv', 'display_name' => 'Manage CCTV Recommendation Rules'],
            ['name' => 'cctv.manage_estimates', 'group' => 'cctv', 'display_name' => 'Manage CCTV Estimates'],
            ['name' => 'cctv.manage_quotes', 'group' => 'cctv', 'display_name' => 'Manage CCTV Quotes'],
        ];

        foreach ($permissions as $permData) {
            $perm = Permission::firstOrCreate(
                ['name' => $permData['name']],
                ['group' => $permData['group'], 'display_name' => $permData['display_name']]
            );

            // Assign to Super Admin and Admin roles
            $roles = Role::whereIn('name', ['Super Admin', 'Admin'])->get();
            foreach ($roles as $role) {
                if (!$role->permissions()->where('permissions.id', $perm->id)->exists()) {
                    $role->permissions()->attach($perm->id);
                }
            }
        }
    }

    public function down(): void
    {
        Permission::where('group', 'cctv')->delete();
    }
};
