<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['name' => 'Piece', 'short_code' => 'pcs', 'symbol' => 'pc', 'type' => 'quantity', 'conversion_factor' => 1.0, 'is_active' => true],
            ['name' => 'Box', 'short_code' => 'box', 'symbol' => 'bx', 'type' => 'quantity', 'conversion_factor' => 10.0, 'is_active' => true],
            ['name' => 'Pack', 'short_code' => 'pack', 'symbol' => 'pk', 'type' => 'quantity', 'conversion_factor' => 5.0, 'is_active' => true],
            ['name' => 'Set', 'short_code' => 'set', 'symbol' => 'st', 'type' => 'quantity', 'conversion_factor' => 1.0, 'is_active' => true],
            ['name' => 'Meter', 'short_code' => 'meter', 'symbol' => 'm', 'type' => 'length', 'conversion_factor' => 1.0, 'is_active' => true],
            ['name' => 'Feet', 'short_code' => 'feet', 'symbol' => 'ft', 'type' => 'length', 'conversion_factor' => 0.3048, 'is_active' => true],
            ['name' => 'Roll', 'short_code' => 'roll', 'symbol' => 'rl', 'type' => 'length', 'conversion_factor' => 100.0, 'is_active' => true],
            ['name' => 'Kilogram', 'short_code' => 'kg', 'symbol' => 'kg', 'type' => 'weight', 'conversion_factor' => 1.0, 'is_active' => true],
            ['name' => 'Gram', 'short_code' => 'gram', 'symbol' => 'g', 'type' => 'weight', 'conversion_factor' => 0.001, 'is_active' => true],
            ['name' => 'Liter', 'short_code' => 'liter', 'symbol' => 'l', 'type' => 'volume', 'conversion_factor' => 1.0, 'is_active' => true],
        ];

        foreach ($units as $unitData) {
            Unit::updateOrCreate(
                ['short_code' => $unitData['short_code']],
                $unitData
            );
        }
    }
}
