<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class BulkDataPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'bulk.import', 'group' => 'data_management', 'display_name' => 'Execute Bulk Data Import'],
            ['name' => 'bulk.export', 'group' => 'data_management', 'display_name' => 'Execute Bulk Data Export'],
            ['name' => 'products.import', 'group' => 'products', 'display_name' => 'Bulk Import Products'],
            ['name' => 'products.export', 'group' => 'products', 'display_name' => 'Bulk Export Products'],
            ['name' => 'units.manage', 'group' => 'units', 'display_name' => 'Manage Measurement Units'],
            ['name' => 'units.import', 'group' => 'units', 'display_name' => 'Bulk Import Units'],
            ['name' => 'units.export', 'group' => 'units', 'display_name' => 'Bulk Export Units'],
            ['name' => 'categories.import', 'group' => 'categories', 'display_name' => 'Bulk Import Categories'],
            ['name' => 'categories.export', 'group' => 'categories', 'display_name' => 'Bulk Export Categories'],
            ['name' => 'brands.import', 'group' => 'brands', 'display_name' => 'Bulk Import Brands'],
            ['name' => 'brands.export', 'group' => 'brands', 'display_name' => 'Bulk Export Brands'],
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
