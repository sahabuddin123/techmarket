<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Address;
use Illuminate\Foundation\Testing\RefreshDatabase;

class IdorSecurityBoundariesTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_modify_or_delete_another_customers_address(): void
    {
        $customerA = User::create(['name' => 'Customer A', 'email' => 'custA@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);
        $customerB = User::create(['name' => 'Customer B', 'email' => 'custB@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);

        $addressA = Address::create([
            'user_id' => $customerA->id,
            'name' => 'Customer A',
            'phone' => '01700000001',
            'address' => 'Dhaka 1205',
            'district' => 'Dhaka',
            'is_default' => true,
        ]);

        $this->actingAs($customerB);

        // Customer B attempts to delete Customer A's address
        $response = $this->delete("/addresses/{$addressA->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('addresses', ['id' => $addressA->id]);
    }
}
