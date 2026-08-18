<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Order;
use App\Models\Address;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_access_account_profile()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/account/profile');

        $response->assertOk();
    }

    public function test_customer_can_access_account_notifications()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/account/notifications');

        $response->assertOk();
    }

    public function test_customer_can_access_account_order_history()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/account/orders/history');

        $response->assertOk();
    }

    public function test_customer_can_access_account_change_password()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/account/password/change');

        $response->assertOk();
    }

    public function test_guest_is_redirected_to_login_from_account_routes()
    {
        $this->get('/account/profile')->assertRedirect('/login');
        $this->get('/account/notifications')->assertRedirect('/login');
        $this->get('/account/orders/history')->assertRedirect('/login');
        $this->get('/account/password/change')->assertRedirect('/login');
    }
}
