<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class DatabaseBackupPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'backups.view', 'group' => 'system', 'display_name' => 'View Database Backups & Schedule'],
            ['name' => 'backups.manage', 'group' => 'system', 'display_name' => 'Create, Download & Manage Database Backups'],
        ];

        $superAdmin = Role::firstOrCreate(['name' => 'superadmin'], ['display_name' => 'Super Administrator']);
        $admin = Role::firstOrCreate(['name' => 'admin'], ['display_name' => 'Administrator']);

        foreach ($permissions as $pData) {
            $perm = Permission::firstOrCreate(['name' => $pData['name']], $pData);
            $superAdmin->permissions()->syncWithoutDetaching([$perm->id]);
            $admin->permissions()->syncWithoutDetaching([$perm->id]);
        }
    }
}
