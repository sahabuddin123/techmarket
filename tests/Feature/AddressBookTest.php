<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Address;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AddressBookTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_manage_address_book(): void
    {
        $user = User::create([
            'name' => 'Address Owner',
            'email' => 'address@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $response = $this->actingAs($user)->post('/addresses', [
            'label' => 'Home',
            'name' => 'Address Owner',
            'phone' => '01799887766',
            'address' => 'House 42, Road 11, Banani',
            'district' => 'Dhaka',
            'is_default' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('addresses', [
            'user_id' => $user->id,
            'label' => 'Home',
            'district' => 'Dhaka',
            'is_default' => 1,
        ]);
    }

    public function test_customer_cannot_delete_another_customers_address(): void
    {
        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $attacker = User::create([
            'name' => 'Attacker',
            'email' => 'attacker@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        $address = Address::create([
            'user_id' => $owner->id,
            'label' => 'Secret Home',
            'name' => 'Owner',
            'phone' => '01700000000',
            'address' => 'Private Villa',
            'district' => 'Dhaka',
        ]);

        $response = $this->actingAs($attacker)->delete("/addresses/{$address->id}");
        $response->assertStatus(403);

        $this->assertDatabaseHas('addresses', ['id' => $address->id]);
    }
}
